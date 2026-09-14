// ---------------------------------------------------------------------------
// Expression parser & evaluator (shunting-yard → RPN)
// Supports: + - * / ^ (right assoc), unary minus, parentheses,
// functions: sin cos tan asin acos atan exp ln log sqrt abs floor ceil sign
// constants: pi, e, tau
// variables: single lowercase letters (x, t, a, b, c, ...)
//
// Precedence:  ^ (4) > unary − (3) > * / (2) > + − (1)
// so that -x^2 = -(x^2), matching mathematical convention.
// ---------------------------------------------------------------------------

export type Vars = Record<string, number>;

export interface ParsedExpr {
  vars: string[];
  eval: (v: Vars) => number;
  src: string;
  error?: string;
}

type Tok =
  | { k: 'num'; v: number }
  | { k: 'var'; v: string }
  | { k: 'op'; v: string }
  | { k: 'neg' }
  | { k: 'lp' }
  | { k: 'rp' }
  | { k: 'fn'; v: string };

const FUNCS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  sqrt: Math.sqrt,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  sign: Math.sign,
};

const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E, tau: 2 * Math.PI };

export function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const s = src.replace(/\s+/g, '');
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const raw = s.slice(i, j);
      if ((raw.match(/\./g) || []).length > 1) throw new Error(`Invalid number "${raw}"`);
      toks.push({ k: 'num', v: parseFloat(raw) });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      const name = s.slice(i, j).toLowerCase();
      if (FUNCS[name]) toks.push({ k: 'fn', v: name });
      else if (CONSTS[name] !== undefined) toks.push({ k: 'num', v: CONSTS[name] });
      else if (name.length === 1) toks.push({ k: 'var', v: name });
      else throw new Error(`Unknown identifier "${name}"`);
      i = j;
      continue;
    }
    if (c === '+') toks.push({ k: 'op', v: '+' });
    else if (c === '-') toks.push({ k: 'op', v: '-' });
    else if (c === '*' || c === '×' || c === '·') toks.push({ k: 'op', v: '*' });
    else if (c === '/' || c === '÷') toks.push({ k: 'op', v: '/' });
    else if (c === '^') toks.push({ k: 'op', v: '^' });
    else if (c === '(') toks.push({ k: 'lp' });
    else if (c === ')') toks.push({ k: 'rp' });
    else throw new Error(`Unexpected character "${c}"`);
    i++;
  }
  return toks;
}

// Implicit multiplication: 2x, x(x+1), 2sin(x), )( , )2, 2(
function applyImplicitMult(toks: Tok[]): Tok[] {
  const out: Tok[] = [];
  const valued = (t: Tok) => t.k === 'num' || t.k === 'var' || t.k === 'rp';
  const starter = (t: Tok) => t.k === 'num' || t.k === 'var' || t.k === 'lp' || t.k === 'fn';
  for (let i = 0; i < toks.length; i++) {
    out.push(toks[i]);
    const nxt = toks[i + 1];
    if (nxt && valued(toks[i]) && starter(nxt)) out.push({ k: 'op', v: '*' });
  }
  return out;
}

const PREC: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, neg: 3, '^': 4 };

export function toRPN(toksIn: Tok[]): Tok[] {
  const toks = applyImplicitMult(toksIn);
  const out: Tok[] = [];
  const stack: Tok[] = [];
  let prev: Tok | null = null;

  const emitValue = (t: Tok) => {
    out.push(t);
  };

  const pushOp = (t: Tok) => {
    const p = PREC[t.k === 'op' ? t.v : 'neg'];
    const rightAssoc = t.k === 'op' && t.v === '^';
    while (stack.length) {
      const top = stack[stack.length - 1];
      if (top.k !== 'op' && top.k !== 'neg') break;
      const tp = PREC[top.k === 'op' ? top.v : 'neg'];
      if (tp > p || (tp === p && !rightAssoc)) {
        out.push(stack.pop()!);
        continue;
      }
      break;
    }
    stack.push(t);
  };

  const flushNeg = () => {
    if (stack.length && stack[stack.length - 1].k === 'neg') {
      stack.pop();
      out.push({ k: 'neg' });
    }
  };

  for (const t of toks) {
    if (t.k === 'num' || t.k === 'var') {
      emitValue(t);
    } else if (t.k === 'fn') {
      stack.push(t);
    } else if (t.k === 'op') {
      const unaryCtx = prev === null || prev.k === 'op' || prev.k === 'lp' || prev.k === 'neg';
      if ((t.v === '-' || t.v === '+') && unaryCtx) {
        if (t.v === '-') stack.push({ k: 'neg' });
        // unary + is a no-op
      } else {
        if (prev && prev.k === 'op') throw new Error('Two operators in a row');
        pushOp(t);
      }
    } else if (t.k === 'lp') {
      stack.push(t);
    } else if (t.k === 'rp') {
      if (prev && (prev.k === 'op' || prev.k === 'neg')) throw new Error('Missing operand before ")"');
      while (stack.length && stack[stack.length - 1].k !== 'lp') out.push(stack.pop()!);
      if (!stack.length) throw new Error('Mismatched parentheses');
      stack.pop(); // discard (
      if (stack.length && stack[stack.length - 1].k === 'fn') out.push(stack.pop()!);
      flushNeg();
    }
    prev = t;
  }
  while (stack.length) {
    const top = stack.pop()!;
    if (top.k === 'lp') throw new Error('Mismatched parentheses');
    if (top.k === 'fn') throw new Error('Missing argument for function');
    out.push(top);
  }
  return out;
}

export function parseExpr(src: string): ParsedExpr {
  if (!src.trim()) return { vars: [], eval: () => NaN, src, error: 'Empty expression' };
  try {
    const rpn = toRPN(tokenize(src));
    const vars = new Set<string>();
    for (const t of rpn) if (t.k === 'var') vars.add(t.v);
    const evalRpn = (v: Vars): number => {
      const st: number[] = [];
      const pop = (what: string): number => {
        const val = st.pop();
        if (val === undefined) throw new Error(`Stack underflow at ${what}`);
        return val;
      };
      for (const t of rpn) {
        if (t.k === 'num') st.push(t.v);
        else if (t.k === 'var') st.push(v[t.v] ?? NaN);
        else if (t.k === 'neg') st.push(-pop('neg'));
        else if (t.k === 'op') {
          const b = pop(t.v);
          const a = pop(t.v);
          switch (t.v) {
            case '+': st.push(a + b); break;
            case '-': st.push(a - b); break;
            case '*': st.push(a * b); break;
            case '/': st.push(a / b); break;
            case '^': st.push(Math.pow(a, b)); break;
          }
        } else if (t.k === 'fn') {
          st.push(FUNCS[t.v](pop(t.v)));
        }
      }
      if (st.length !== 1) throw new Error('Malformed expression');
      return st[0];
    };
    // probe evaluation to catch structural underflows
    const probe: Record<string, number> = {};
    for (const vv of vars) probe[vv] = 1;
    try {
      evalRpn(probe);
    } catch {
      return { vars: [...vars], eval: () => NaN, src, error: 'Malformed expression' };
    }
    return { vars: [...vars], eval: evalRpn, src };
  } catch (e) {
    return { vars: [], eval: () => NaN, src, error: e instanceof Error ? e.message : 'Parse error' };
  }
}

// Sample a function over [x0, x1], returning segments broken at discontinuities.
export type Segment = { x: number; y: number }[];

export function sampleFunction(f: (x: number) => number, x0: number, x1: number, n = 480): Segment[] {
  const segs: Segment[] = [];
  let cur: Segment = [];
  const dx = (x1 - x0) / n;
  let prevY: number | null = null;
  let prevX = x0;
  for (let i = 0; i <= n; i++) {
    const x = x0 + i * dx;
    let y: number;
    try { y = f(x); } catch { y = NaN; }
    const ok = Number.isFinite(y);
    if (!ok) {
      if (cur.length) { segs.push(cur); cur = []; }
      prevY = null;
      prevX = x;
      continue;
    }
    if (prevY !== null) {
      const jump = Math.abs(y - prevY);
      const localScale = Math.max(Math.abs(y), Math.abs(prevY), 1);
      if (jump > 8 * localScale && isAsymptoteJump(f, prevX, x, prevY, y)) {
        segs.push(cur);
        cur = [];
      }
    }
    cur.push({ x, y });
    prevY = y;
    prevX = x;
  }
  if (cur.length) segs.push(cur);
  return segs;
}

function isAsymptoteJump(f: (x: number) => number, xa: number, xb: number, ya: number, yb: number): boolean {
  const xm = (xa + xb) / 2;
  let ym: number;
  try { ym = f(xm); } catch { return true; }
  if (!Number.isFinite(ym)) return true;
  const mid = (ya + yb) / 2;
  return Math.abs(ym - mid) > 0.4 * Math.abs(yb - ya) + 1e-9 &&
    Math.abs(ym) > Math.max(Math.abs(ya), Math.abs(yb)) * 1.3;
}

export const fmt = (x: number, digits = 4): string => {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '0';
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-4 || a >= 1e6)) return x.toExponential(3);
  return String(parseFloat(x.toFixed(digits)));
};
