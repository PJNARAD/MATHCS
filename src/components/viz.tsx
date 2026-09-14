import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  bfsSteps, dijkstraSteps, dfsSteps, kruskalSteps, topoSteps, coloringSteps,
} from '../lib/graph';
import type { Graph, GNode } from '../lib/graph';
import {
  euclidSteps, sieveSteps, factorize, primeFactorMap, isPrime, divisors, phi, numDivisorsFromFactors, rsaSetup,
} from '../lib/numbertheory';
import { InlineMath } from './TeX';

// ---------------------------------------------------------------------------
// Shared shells
// ---------------------------------------------------------------------------

function VizShell({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="my-5 border border-line bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-line bg-paper2/60 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="chip bg-bluel text-blue border-bluep">Interactive</span>
          <span className="text-sm font-medium text-ink">{title}</span>
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function usePlayer(total: number, speed = 850) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const idx = Math.min(i, Math.max(0, total - 1));

  useEffect(() => {
    if (!playing) return;
    if (idx >= total - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((x) => Math.min(x + 1, total - 1)), speed);
    return () => clearTimeout(t);
  }, [playing, idx, total, speed]);

  useEffect(() => {
    setI(0);
    setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  return {
    i: idx,
    atStart: idx === 0,
    atEnd: idx >= total - 1,
    next: () => { setPlaying(false); setI((x) => Math.min(x + 1, total - 1)); },
    prev: () => { setPlaying(false); setI((x) => Math.max(x - 1, 0)); },
    reset: () => { setPlaying(false); setI(0); },
    toggle: () => {
      if (idx >= total - 1) { setI(0); setPlaying(true); }
      else setPlaying((p) => !p);
    },
    playing,
  };
}

function Controls({ p, total }: { p: ReturnType<typeof usePlayer>; total: number }) {
  const btn = 'btn-secondary btn-sm';
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" className={btn} onClick={p.reset} title="Reset">
        ⏮
      </button>
      <button type="button" className={btn} onClick={p.prev} disabled={p.atStart} title="Previous step">
        ←
      </button>
      <button type="button" className={p.playing ? 'btn-primary btn-sm' : btn} onClick={p.toggle} title="Play / pause">
        {p.playing ? '⏸' : '▶'}
      </button>
      <button type="button" className={btn} onClick={p.next} disabled={p.atEnd} title="Next step">
        →
      </button>
      <span className="text-xs text-ink3 font-mono ml-1">
        step {total ? p.i + 1 : 0}/{total}
      </span>
    </div>
  );
}

function Message({ text, tone = 'normal' }: { text: string; tone?: 'normal' | 'good' | 'bad' }) {
  const cls =
    tone === 'good' ? 'bg-mossl text-moss' : tone === 'bad' ? 'bg-terracottal text-terracotta' : 'bg-paper2 text-ink2';
  return (
    <div className={`mt-3 px-3 py-2 text-sm leading-relaxed min-h-[2.4rem] ${cls}`}>{text}</div>
  );
}

function NumberInput({
  label, value, onChange, min = 1, max = 100000,
}: {
  label: string; value: number; onChange: (n: number) => void; min?: number; max?: number;
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-ink2">
      {label}
      <input
        type="number"
        className="input !w-20 !py-1"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
      />
    </label>
  );
}

// ---------------------------------------------------------------------------
// 1. Truth table
// ---------------------------------------------------------------------------

type TTNode =
  | { k: 'var'; v: string }
  | { k: 'not'; a: TTNode }
  | { k: 'bin'; op: 'AND' | 'OR' | 'IMPL' | 'XOR'; l: TTNode; r: TTNode };

function tokenizeTT(src: string): string[] {
  const s = src
    .toUpperCase()
    .replace(/&&/g, ' AND ')
    .replace(/\|\|/g, ' OR ')
    .replace(/=>/g, ' IMPL ')
    .replace(/->/g, ' IMPL ')
    .replace(/!=/g, ' XOR ')
    .replace(/!/g, ' NOT ')
    .replace(/~/g, ' NOT ')
    .replace(/\^/g, ' XOR ');
  const toks: string[] = [];
  const re = /[A-Z]+|[A-Z]|[()]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const t = m[0];
    if (t === '(' || t === ')') toks.push(t);
    else if (['AND', 'OR', 'IMPL', 'XOR', 'NOT'].includes(t)) toks.push(t);
    else if (t.length === 1) toks.push(t);
    else toks.push(t); // unknown word — parser will reject
  }
  return toks;
}

function parseTT(src: string): { node: TTNode | null; error?: string } {
  const toks = tokenizeTT(src);
  let pos = 0;
  const peek = () => toks[pos];
  const eat = () => toks[pos++];

  function parseAtom(): TTNode {
    const t = peek();
    if (t === '(') {
      eat();
      const n = parseImpl();
      if (peek() !== ')') throw new Error('expected )');
      eat();
      return n;
    }
    if (t === undefined) throw new Error('unexpected end of expression');
    eat();
    if (t.length === 1) return { k: 'var', v: t };
    throw new Error(`unknown token "${t}"`);
  }
  function parseNot(): TTNode {
    if (peek() === 'NOT') {
      eat();
      return { k: 'not', a: parseNot() };
    }
    return parseAtom();
  }
  function parseOr(): TTNode {
    let l = parseNot();
    while (peek() === 'OR') { eat(); l = { k: 'bin', op: 'OR', l, r: parseNot() }; }
    return l;
  }
  function parseAnd(): TTNode {
    let l = parseOr();
    while (peek() === 'AND') { eat(); l = { k: 'bin', op: 'AND', l, r: parseOr() }; }
    return l;
  }
  function parseXor(): TTNode {
    let l = parseAnd();
    while (peek() === 'XOR') { eat(); l = { k: 'bin', op: 'XOR', l, r: parseAnd() }; }
    return l;
  }
  function parseImpl(): TTNode {
    const l = parseXor();
    if (peek() === 'IMPL') {
      eat();
      const r = parseImpl();
      return { k: 'bin', op: 'IMPL', l, r };
    }
    return l;
  }

  try {
    const node = parseImpl();
    if (pos < toks.length) throw new Error(`unexpected "${toks[pos]}"`);
    return { node };
  } catch (err) {
    return { node: null, error: err instanceof Error ? err.message : 'Invalid expression' };
  }
}

function evalTT(n: TTNode, env: Record<string, boolean>): boolean {
  if (n.k === 'var') return env[n.v] === true;
  if (n.k === 'not') return !evalTT(n.a, env);
  const l = evalTT(n.l, env);
  const r = evalTT(n.r, env);
  switch (n.op) {
    case 'AND': return l && r;
    case 'OR': return l || r;
    case 'XOR': return l !== r;
    case 'IMPL': return !l || r;
  }
}

function varsOf(n: TTNode, out = new Set<string>()): Set<string> {
  if (n.k === 'var') out.add(n.v);
  else if (n.k === 'not') varsOf(n.a, out);
  else { varsOf(n.l, out); varsOf(n.r, out); }
  return out;
}

const TT_PRESET: Record<string, string> = {
  'p AND q': 'p AND q',
  'p OR q': 'p OR q',
  'p IMPL q': 'p IMPL q',
  'p XOR q': 'p XOR q',
  'NOT p': 'NOT p',
  'p AND (q OR NOT p)': 'p AND (q OR NOT p)',
  '(p IMPL q) IMPL p': '(p IMPL q) IMPL p',
};

function TruthTableViz({ props }: { props?: Record<string, unknown> }) {
  const defaults = (props?.defaultExprs as string[] | undefined) ?? ['p AND q', 'p OR q'];
  const [current, setCurrent] = useState(defaults[0] ?? 'p AND q');
  const [added, setAdded] = useState<string[]>([]);
  const [draft, setDraft] = useState('');

  const parsed = useMemo(() => parseTT(current), [current]);
  const vars = useMemo(() => (parsed.node ? [...varsOf(parsed.node)].sort() : []), [parsed]);

  const rows = useMemo(() => {
    if (!parsed.node) return [];
    const out: { env: Record<string, boolean>; val: boolean }[] = [];
    for (let mask = 0; mask < 1 << vars.length; mask++) {
      const env: Record<string, boolean> = {};
      vars.forEach((v, i) => { env[v] = !!((mask >> i) & 1); });
      out.push({ env, val: evalTT(parsed.node!, env) });
    }
    return out;
  }, [parsed, vars]);

  const trueCount = rows.filter((r) => r.val).length;

  return (
    <VizShell title="Truth table builder">
      <div className="flex flex-wrap gap-1.5">
        {[...defaults, ...Object.keys(TT_PRESET)].filter((e, i, a) => a.indexOf(e) === i)
          .map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setCurrent(TT_PRESET[e] ?? e)}
              className={`chip cursor-pointer ${current === (TT_PRESET[e] ?? e) ? 'bg-bluel text-blue border-bluep' : 'hover:bg-paper2'}`}
            >
              {e}
            </button>
          ))}
        {added.map((e) => (
          <button key={e} type="button" onClick={() => setCurrent(e)} className={`chip cursor-pointer ${current === e ? 'bg-bluel text-blue border-bluep' : 'hover:bg-paper2'}`}>
            {e}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <input
          className="input !w-auto flex-1 min-w-[12rem]"
          value={current}
          placeholder="e.g. (p IMPL q) AND r"
          onChange={(e) => setCurrent(e.target.value)}
        />
        <div className="flex gap-1">
          <input
            className="input !w-auto min-w-[8rem]"
            value={draft}
            placeholder="new expression…"
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              const t = draft.trim();
              if (t && parseTT(t).node) {
                if (!added.includes(t)) setAdded((a) => [...a, t]);
                setCurrent(t);
                setDraft('');
              }
            }}
          >
            Save
          </button>
        </div>
      </div>

      {parsed.error ? (
        <div className="mt-3 text-sm text-terracotta">Parse error: {parsed.error}</div>
      ) : (
        <>
          <div className="mt-3 overflow-x-auto slim-scroll">
            <table className="border-collapse text-sm">
              <thead>
                <tr>
                  {vars.map((v) => (
                    <th key={v} className="border border-line bg-paper2 px-2 py-1 font-mono font-semibold text-ink">
                      {v}
                    </th>
                  ))}
                  <th className="border border-line bg-bluel px-2 py-1 font-semibold text-blue">
                    <span className="font-mono text-xs">{current.toUpperCase()}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={r.val ? 'bg-bluel/50' : 'bg-white'}>
                    {vars.map((v) => (
                      <td key={v} className={`border border-line px-2 py-1 text-center font-mono ${r.env[v] ? 'text-blue font-semibold' : 'text-ink4'}`}>
                        {r.env[v] ? 'T' : 'F'}
                      </td>
                    ))}
                    <td className={`border border-line px-2 py-1 text-center font-mono font-semibold ${r.val ? 'text-blue' : 'text-ink4'}`}>
                      {r.val ? 'T' : 'F'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-ink3">
            True for {trueCount} of {rows.length} assignments —{' '}
            {trueCount === rows.length ? 'a tautology' : trueCount === 0 ? 'a contradiction' : 'sometimes true'}.
          </div>
        </>
      )}
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// 2. Venn diagram
// ---------------------------------------------------------------------------

type Region = 'a' | 'both' | 'b' | 'neither';

const VENN_OPS: { id: string; label: string; math: string; regions: Region[]; note?: string }[] = [
  { id: 'union', label: 'Union A ∪ B', math: 'A \\cup B', regions: ['a', 'both', 'b'] },
  { id: 'inter', label: 'Intersection A ∩ B', math: 'A \\cap B', regions: ['both'] },
  { id: 'aOnly', label: 'A only (A \\ B)', math: 'A \\setminus B', regions: ['a'] },
  { id: 'bOnly', label: 'B only (B \\ A)', math: 'B \\setminus A', regions: ['b'] },
  { id: 'aComp', label: 'Complement of A', math: 'A^{c}', regions: ['b', 'neither'] },
  { id: 'bComp', label: 'Complement of B', math: 'B^{c}', regions: ['a', 'neither'] },
  { id: 'interComp', label: 'Complement of A ∩ B', math: '(A \\cap B)^{c}', regions: ['a', 'b', 'neither'] },
  { id: 'unionComp', label: 'Complement of A ∪ B', math: '(A \\cup B)^{c}', regions: ['neither'] },
  { id: 'symDiff', label: 'Symmetric difference', math: 'A \\triangle B', regions: ['a', 'b'] },
];

const VENN_U = [1, 2, 3, 4, 5, 6, 7, 8];
const VENN_A = [1, 2, 4, 5, 6];
const VENN_B = [3, 5, 6, 7];

function vennRegionOf(x: number): Region {
  const inA = VENN_A.includes(x);
  const inB = VENN_B.includes(x);
  if (inA && inB) return 'both';
  if (inA) return 'a';
  if (inB) return 'b';
  return 'neither';
}

const VENN_POS: Record<number, [number, number]> = {
  1: [95, 85], 2: [75, 135], 4: [110, 170],
  3: [325, 80], 7: [345, 140],
  5: [195, 100], 6: [225, 145],
  8: [388, 210],
};

function VennViz({ props }: { props?: Record<string, unknown> }) {
  const preset = (props?.preset as string | undefined) ?? 'union';
  const [opId, setOpId] = useState(preset === 'de_morgan' ? 'unionComp' : preset);
  const op = VENN_OPS.find((o) => o.id === opId) ?? VENN_OPS[0];
  const active = new Set<Region>(op.regions);

  const fill = (r: Region) => (active.has(r) ? 'rgba(43, 92, 138, 0.55)' : 'transparent');

  return (
    <VizShell
      title={preset === 'de_morgan' ? 'Venn diagram — De Morgan’s laws' : 'Venn diagram — set operations'}
      right={
        <label className="flex items-center gap-1.5 text-xs text-ink2">
          Operation
          <select className="input !w-auto !py-1" value={opId} onChange={(e) => setOpId(e.target.value)}>
            {VENN_OPS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </label>
      }
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="grid-paper border border-line flex-1">
          <svg viewBox="0 0 420 240" className="w-full">
            <defs>
              <clipPath id="venn-clip-a"><circle cx="150" cy="120" r="82" /></clipPath>
              <clipPath id="venn-clip-b"><circle cx="270" cy="120" r="82" /></clipPath>
              <mask id="venn-mask-a">
                <circle cx="150" cy="120" r="82" fill="white" />
                <circle cx="270" cy="120" r="82" fill="black" />
              </mask>
              <mask id="venn-mask-b">
                <circle cx="270" cy="120" r="82" fill="white" />
                <circle cx="150" cy="120" r="82" fill="black" />
              </mask>
            </defs>
            <rect x="8" y="8" width="404" height="224" fill="none" stroke="#66718A" strokeWidth="1.5" />
            {/* neither */}
            <path
              d="M 8 8 H 412 V 232 H 8 Z M 150 38 a 82 82 0 1 0 0.001 0 Z M 270 38 a 82 82 0 1 0 0.001 0 Z"
              fillRule="evenodd"
              fill={fill('neither')}
            />
            {/* A only / B only */}
            <circle cx="150" cy="120" r="82" mask="url(#venn-mask-a)" fill={fill('a')} />
            <circle cx="270" cy="120" r="82" mask="url(#venn-mask-b)" fill={fill('b')} />
            {/* both */}
            <circle cx="150" cy="120" r="82" clipPath="url(#venn-clip-b)" fill={fill('both')} />
            <circle cx="150" cy="120" r="82" fill="none" stroke="#1B2A41" strokeWidth="1.5" />
            <circle cx="270" cy="120" r="82" fill="none" stroke="#1B2A41" strokeWidth="1.5" />
            <text x="105" y="120" fontSize="14" fontWeight="700" fill="#1B2A41">A</text>
            <text x="318" y="120" fontSize="14" fontWeight="700" fill="#1B2A41">B</text>
            {VENN_U.map((x) => {
              const [cx, cy] = VENN_POS[x] ?? [210, 120];
              const on = active.has(vennRegionOf(x));
              return (
                <g key={x}>
                  <circle cx={cx} cy={cy} r="10" fill={on ? '#2B5C8A' : '#F4F1EA'} stroke={on ? '#2B5C8A' : '#8A93A5'} strokeWidth="1" />
                  <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="10" fontWeight="600" fill={on ? '#fff' : '#66718A'}>
                    {x}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="text-sm text-ink2 md:w-64">
          <div className="font-mono text-base text-ink mb-1">
            <InlineMath latex={op.math} />
          </div>
          <div className="text-xs text-ink3 mb-2">
            U = {VENN_U.join(', ')} · A = {VENN_A.join(', ')} · B = {VENN_B.join(', ')}
          </div>
          <div className="mb-2">
            <span className="text-xs font-medium text-ink">In {op.label.split(' (')[0]}: </span>
            <span className="font-mono">
              {VENN_U.filter((x) => active.has(vennRegionOf(x))).join(', ') || '∅'}
            </span>
          </div>
          {preset === 'de_morgan' && (
            <div className="border-t border-line pt-2 text-xs leading-relaxed">
              <div>
                <InlineMath latex="(A \\cup B)^{c} = A^{c} \\cap B^{c}" />
              </div>
              <div className="mt-1">
                <InlineMath latex="(A \\cap B)^{c} = A^{c} \\cup B^{c}" />
              </div>
              <p className="mt-2 text-ink3">
                Try both complement operations — the highlighted region never changes when you rewrite with De Morgan.
              </p>
            </div>
          )}
        </div>
      </div>
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// 3. Recursion tree
// ---------------------------------------------------------------------------

function RecursionTreeViz({ props }: { props?: Record<string, unknown> }) {
  const [n, setN] = useState<number>(Number(props?.n ?? 16));
  const [a, setA] = useState<number>(Number(props?.a ?? 2));
  const [k, setK] = useState<number>(Number(props?.k ?? 1));
  const b = 2;

  const levels = useMemo(() => {
    const out: { i: number; count: number; size: number; work: number }[] = [];
    let size = n;
    let count = 1;
    let i = 0;
    for (;;) {
      out.push({ i, count, size, work: count * Math.max(1, Math.pow(size, k)) });
      if (size < 2 || i >= 12) break;
      size = Math.floor(size / b);
      count = count * a;
      i++;
    }
    return out;
  }, [n, a, k, b]);

  const totalNodes = levels.reduce((s, l) => s + l.count, 0);
  const totalWork = levels.reduce((s, l) => s + l.work, 0);
  const maxWork = Math.max(...levels.map((l) => l.work), 1);
  const logbA = Math.log(a) / Math.log(b);

  const regime =
    Math.abs(k - logbA) < 1e-9
      ? { t: 'balanced', text: 'f(n) matches the leaf work — each level does about the same amount, so T(n) = Θ(n^k log n).' }
      : k < logbA
        ? { t: 'leaves', text: 'Leaf work dominates (log_b a > k), so T(n) = Θ(n^log_b a) = Θ(n^' + logbA.toFixed(2) + ').' }
        : { t: 'roots', text: 'Root-side work dominates (k > log_b a), so T(n) = Θ(n^k) = Θ(n^' + k + ').' };

  const drawTree = totalNodes <= 127;

  return (
    <VizShell title="Recursion tree — divide and conquer">
      <div className="flex flex-wrap gap-3 items-center text-xs text-ink2">
        <NumberInput label="n" value={n} onChange={setN} min={4} max={256} />
        <NumberInput label="a (subproblems)" value={a} onChange={setA} min={1} max={4} />
        <NumberInput label="k (f(n)=n^k)" value={k} onChange={setK} min={0} max={3} />
        <span className="font-mono text-ink">
          T(n) = {a}·T(n/2) + Θ(n^{k === 0 ? 0 : k})
        </span>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="grid-paper border border-line">
          {drawTree ? (
            <svg viewBox="0 0 460 320" className="w-full">
              {levels.map((l) => {
                const y = 28 + l.i * 46;
                const xs = Array.from({ length: Math.min(l.count, 24) }, (_, j) =>
                  l.count === 1 ? 230 : 230 + ((j - (Math.min(l.count, 24) - 1) / 2) * 420) / Math.max(1, Math.min(l.count, 24) - 1),
                );
                const prevY = l.i > 0 ? 28 + (l.i - 1) * 46 : null;
                return (
                  <g key={l.i}>
                    {l.i > 0 && xs.map((x, j) => (
                      <line key={j} x1={230} y1={prevY!} x2={x} y2={y} stroke="#D5D1C4" strokeWidth="1" />
                    ))}
                    {xs.map((x, j) => (
                      <g key={j}>
                        <circle cx={x} cy={y} r={12} fill={l.i === 0 ? '#2B5C8A' : l.i === levels.length - 1 ? '#3E7A4E' : '#EAF1F7'} stroke="#1B2A41" strokeWidth="1" />
                        {(x < 440) && (
                          <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fontWeight="600" fill={l.i === 0 ? '#fff' : '#1B2A41'}>
                            {l.size}
                          </text>
                        )}
                      </g>
                    ))}
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="p-6 text-sm text-ink3">
              This tree has {totalNodes.toLocaleString()} subproblems — too wide to draw. The table on the right shows it level by level.
            </div>
          )}
        </div>

        <div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-paper2 text-left">
                <th className="border border-line px-2 py-1">level</th>
                <th className="border border-line px-2 py-1">nodes</th>
                <th className="border border-line px-2 py-1">size/node</th>
                <th className="border border-line px-2 py-1 text-right">work</th>
                <th className="border border-line px-2 py-1 w-1/3">relative</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((l) => (
                <tr key={l.i}>
                  <td className="border border-line px-2 py-1 font-mono">{l.i}</td>
                  <td className="border border-line px-2 py-1 font-mono">{l.count.toLocaleString()}</td>
                  <td className="border border-line px-2 py-1 font-mono">{l.size}</td>
                  <td className="border border-line px-2 py-1 font-mono text-right">{l.work.toLocaleString()}</td>
                  <td className="border border-line px-1 py-1">
                    <div className="h-2.5 bg-bluel" style={{ width: `${Math.max(2, (l.work / maxWork) * 100)}%` }} />
                  </td>
                </tr>
              ))}
              <tr className="font-semibold bg-goldl/40">
                <td className="border border-line px-2 py-1" colSpan={3}>total</td>
                <td className="border border-line px-2 py-1 font-mono text-right">{totalWork.toLocaleString()}</td>
                <td />
              </tr>
            </tbody>
          </table>
          <div className="mt-2 text-xs text-ink3">
            log<sub>2</sub>({a}) ≈ {logbA.toFixed(3)} vs k = {k} → <span className="text-ink">{regime.text}</span>
          </div>
        </div>
      </div>
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// 4. Graph editor (algorithms over preset graphs)
// ---------------------------------------------------------------------------

const GNODE = (id: string, x: number, y: number): GNode => ({ id, x, y });

const GRAPH_PRESETS: Record<string, { label: string; graph: Graph }> = {
  basic: {
    label: 'Connected graph',
    graph: {
      directed: false,
      nodes: [GNODE('A', 70, 70), GNODE('B', 200, 40), GNODE('C', 330, 70), GNODE('D', 120, 190), GNODE('E', 260, 180), GNODE('F', 390, 170)],
      edges: [
        { a: 'A', b: 'B', w: 1 }, { a: 'A', b: 'D', w: 1 }, { a: 'B', b: 'C', w: 1 },
        { a: 'B', b: 'D', w: 1 }, { a: 'B', b: 'E', w: 1 }, { a: 'C', b: 'F', w: 1 },
        { a: 'D', b: 'E', w: 1 }, { a: 'E', b: 'F', w: 1 },
      ],
    },
  },
  bfs: {
    label: 'BFS tree',
    graph: {
      directed: false,
      nodes: [GNODE('A', 80, 60), GNODE('B', 200, 40), GNODE('C', 330, 55), GNODE('D', 130, 150), GNODE('E', 260, 140), GNODE('F', 390, 130), GNODE('G', 200, 220)],
      edges: [
        { a: 'A', b: 'B', w: 1 }, { a: 'A', b: 'D', w: 1 }, { a: 'B', b: 'C', w: 1 },
        { a: 'B', b: 'D', w: 1 }, { a: 'B', b: 'E', w: 1 }, { a: 'C', b: 'F', w: 1 },
        { a: 'D', b: 'E', w: 1 }, { a: 'E', b: 'G', w: 1 }, { a: 'F', b: 'G', w: 1 },
      ],
    },
  },
  dijkstra: {
    label: 'Weighted graph',
    graph: {
      directed: false,
      nodes: [GNODE('A', 70, 60), GNODE('B', 200, 40), GNODE('C', 340, 60), GNODE('D', 110, 190), GNODE('E', 240, 160), GNODE('F', 370, 190)],
      edges: [
        { a: 'A', b: 'B', w: 4 }, { a: 'A', b: 'D', w: 2 }, { a: 'B', b: 'C', w: 3 },
        { a: 'B', b: 'D', w: 5 }, { a: 'B', b: 'E', w: 6 }, { a: 'C', b: 'F', w: 2 },
        { a: 'D', b: 'E', w: 3 }, { a: 'E', b: 'F', w: 4 },
      ],
    },
  },
  mst: {
    label: 'MST (Kruskal)',
    graph: {
      directed: false,
      nodes: [GNODE('A', 70, 70), GNODE('B', 210, 40), GNODE('C', 350, 70), GNODE('D', 100, 185), GNODE('E', 235, 170), GNODE('F', 365, 185)],
      edges: [
        { a: 'A', b: 'B', w: 4 }, { a: 'A', b: 'C', w: 8 }, { a: 'A', b: 'D', w: 3 },
        { a: 'B', b: 'C', w: 2 }, { a: 'B', b: 'D', w: 5 }, { a: 'B', b: 'E', w: 7 },
        { a: 'C', b: 'F', w: 3 }, { a: 'D', b: 'E', w: 2 }, { a: 'E', b: 'F', w: 4 },
      ],
    },
  },
  topo: {
    label: 'DAG (topological sort)',
    graph: {
      directed: true,
      nodes: [GNODE('A', 60, 60), GNODE('B', 200, 35), GNODE('C', 340, 60), GNODE('D', 140, 165), GNODE('E', 280, 160)],
      edges: [
        { a: 'A', b: 'B', w: 1 }, { a: 'A', b: 'D', w: 1 }, { a: 'B', b: 'C', w: 1 },
        { a: 'B', b: 'D', w: 1 }, { a: 'B', b: 'E', w: 1 }, { a: 'D', b: 'E', w: 1 },
      ],
    },
  },
  coloring: {
    label: 'Coloring (greedy)',
    graph: {
      directed: false,
      nodes: [GNODE('A', 100, 80), GNODE('B', 260, 50), GNODE('C', 380, 110), GNODE('D', 160, 190), GNODE('E', 300, 190)],
      edges: [
        { a: 'A', b: 'B', w: 1 }, { a: 'A', b: 'C', w: 1 }, { a: 'B', b: 'C', w: 1 },
        { a: 'B', b: 'D', w: 1 }, { a: 'C', b: 'D', w: 1 }, { a: 'A', b: 'E', w: 1 }, { a: 'D', b: 'E', w: 1 },
      ],
    },
  },
};

const ALGOS_FOR: Record<string, { id: string; label: string }[]> = {
  basic: [
    { id: 'bfs', label: 'BFS' },
    { id: 'dfs', label: 'DFS' },
  ],
  bfs: [
    { id: 'bfs', label: 'BFS' },
    { id: 'dfs', label: 'DFS' },
  ],
  dijkstra: [
    { id: 'dijkstra', label: 'Dijkstra' },
    { id: 'bfs', label: 'BFS' },
    { id: 'dfs', label: 'DFS' },
  ],
  mst: [
    { id: 'kruskal', label: 'Kruskal MST' },
    { id: 'bfs', label: 'BFS' },
  ],
  topo: [
    { id: 'topo', label: 'Topological sort' },
    { id: 'dfs', label: 'DFS' },
  ],
  coloring: [
    { id: 'coloring', label: 'Greedy coloring' },
    { id: 'bfs', label: 'BFS' },
  ],
};

const COLOR_PALETTE = ['#2B5C8A', '#A9432E', '#3E7A4E', '#8A6D2F', '#66718A', '#1F4468'];

function GraphEditorViz({ props }: { props?: Record<string, unknown> }) {
  const presetId = (props?.preset as string | undefined) ?? 'basic';
  const [preset, setPreset] = useState(presetId);
  const presetDef = GRAPH_PRESETS[preset] ?? GRAPH_PRESETS.basic;
  const [graph, setGraph] = useState<Graph>(() => JSON.parse(JSON.stringify(presetDef.graph)));
  const [algo, setAlgo] = useState(ALGOS_FOR[presetId]?.[0]?.id ?? 'bfs');
  const [source, setSource] = useState(presetDef.graph.nodes[0]?.id ?? 'A');
  const [dragId, setDragId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const def = GRAPH_PRESETS[preset] ?? GRAPH_PRESETS.basic;
    setGraph(JSON.parse(JSON.stringify(def.graph)));
    setAlgo(ALGOS_FOR[preset]?.[0]?.id ?? 'bfs');
    setSource(def.graph.nodes[0]?.id ?? 'A');
  }, [preset]);

  const needsSource = algo === 'bfs' || algo === 'dfs' || algo === 'dijkstra';

  const steps = useMemo(() => {
    if (!graph.nodes.some((n) => n.id === source)) return [];
    switch (algo) {
      case 'bfs': return bfsSteps(graph, source);
      case 'dfs': return dfsSteps(graph, source);
      case 'dijkstra': return dijkstraSteps(graph, source);
      case 'kruskal': return kruskalSteps(graph);
      case 'topo': return topoSteps(graph);
      case 'coloring': return coloringSteps(graph);
      default: return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algo, source, graph]);

  const p = usePlayer(steps.length, algo === 'dijkstra' ? 950 : 750);
  const step: unknown = p.i < steps.length ? steps[p.i] : (steps[steps.length - 1] ?? null);

  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

  // Node visual state per algorithm
  const nodeFill = (id: string): { fill: string; stroke: string; text: string; ring?: boolean } => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s: any = step;
    if (s && 'visited' in s) {
      if (s.visited.includes(id)) return { fill: '#2B5C8A', stroke: '#1F4468', text: '#fff' };
      const disc: string[] | undefined = s.discovered;
      if (disc && disc.includes(id)) {
        return { fill: '#EAF1F7', stroke: '#2B5C8A', text: '#1B2A41' };
      }
    }
    if (s && algo === 'dfs' && 'stack' in s) {
      const stack = (s as { stack: string[] }).stack;
      if (stack.includes(id)) {
        return stack[stack.length - 1] === id
          ? { fill: '#8A6D2F', stroke: '#8A6D2F', text: '#fff', ring: true }
          : { fill: '#EAF1F7', stroke: '#8A6D2F', text: '#1B2A41' };
      }
    }
    if (s && algo === 'coloring') {
      const c = (s as { colors: Record<string, number> }).colors[id];
      if (c !== undefined) return { fill: COLOR_PALETTE[c % COLOR_PALETTE.length], stroke: '#1B2A41', text: '#fff' };
    }
    if (s && algo === 'topo' && 'inDegree' in s) {
      if ((s as { order: string[] }).order.includes(id)) return { fill: '#2B5C8A', stroke: '#1F4468', text: '#fff' };
    }
    if (s && algo === 'dijkstra' && (s as { select?: string }).select === id) {
      return { fill: '#8A6D2F', stroke: '#8A6D2F', text: '#fff', ring: true };
    }
    if (s && algo === 'bfs' && (s as { visit?: string }).visit === id) {
      return { fill: '#8A6D2F', stroke: '#8A6D2F', text: '#fff', ring: true };
    }
    if (s && algo === 'topo' && (s as { removed?: string }).removed === id) {
      return { fill: '#8A6D2F', stroke: '#8A6D2F', text: '#fff', ring: true };
    }
    if (s && algo === 'coloring' && (s as { vertex?: string }).vertex === id) {
      return { fill: '#F5EFDF', stroke: '#8A6D2F', text: '#1B2A41', ring: true };
    }
    return { fill: '#fff', stroke: '#8A93A5', text: '#1B2A41' };
  };

  // Edge visual state
  const edgeState = (a: string, b2: string): { stroke: string; width: number; dash?: string } => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s: any = step;
    const isEdge = (e?: [string, string]) => e && ((e[0] === a && e[1] === b2) || (e[0] === b2 && e[1] === a));
    if (s && algo === 'kruskal') {
      const mst = (s as { mstEdges: [string, string][] }).mstEdges ?? [];
      if (mst.some(([x, y]) => (x === a && y === b2) || (x === b2 && y === a))) {
        return { stroke: '#3E7A4E', width: 3 };
      }
      if (isEdge((s as { edge?: [string, string] }).edge)) {
        return (s as { accept?: boolean }).accept
          ? { stroke: '#3E7A4E', width: 3 }
          : { stroke: '#A9432E', width: 3 };
      }
      return { stroke: '#D5D1C4', width: 1.5 };
    }
    if (s && algo === 'dijkstra') {
      const relax = (s as { relax?: { from: string; to: string; improved: boolean } }).relax;
      if (relax && ((relax.from === a && relax.to === b2) || (relax.from === b2 && relax.to === a))) {
        return relax.improved ? { stroke: '#3E7A4E', width: 3 } : { stroke: '#A9432E', width: 2, dash: '4 3' };
      }
    }
    if (s && (algo === 'bfs' || algo === 'dfs')) {
      if (isEdge((s as { edge?: [string, string] }).edge)) return { stroke: '#2B5C8A', width: 3 };
    }
    return { stroke: '#C9C6BA', width: 1.5 };
  };

  const nodeLabelExtra = (id: string): string | null => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s: any = step;
    if (s && algo === 'dijkstra') {
      const d = (s as { dist: Record<string, number> }).dist?.[id];
      return d === undefined || d === Infinity ? '∞' : String(d);
    }
    if (s && algo === 'topo' && 'inDegree' in s) {
      const d = (s as { inDegree: Record<string, number> }).inDegree?.[id];
      return d === undefined ? null : `in ${d}`;
    }
    return null;
  };

  const messageOf = (s: unknown): { text: string; tone: 'normal' | 'good' | 'bad' } => {
    if (!s) return { text: 'Pick an algorithm to begin.', tone: 'normal' };
    const m = (s as { message: string }).message;
    if ((s as { error?: string }).error === 'cycle') return { text: m, tone: 'bad' };
    const done = /complete|Done|order:/.test(m);
    return { text: m, tone: done ? 'good' : 'normal' };
  };

  const sideInfo = (): string | null => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s: any = step;
    if (!s) return null;
    if (algo === 'bfs' && 'queue' in s) return 'Queue: ' + (((s as { queue: string[] }).queue?.length ?? 0) ? (s as { queue: string[] }).queue.join(' → ') : 'empty');
    if (algo === 'dfs' && 'stack' in s) return 'Stack: ' + (((s as { stack: string[] }).stack?.length ?? 0) ? (s as { stack: string[] }).stack.join(' → ') : 'empty');
    if (algo === 'coloring' && 'colors' in s) {
      const used = new Set(Object.values((s as { colors: Record<string, number> }).colors ?? {})).size;
      return used ? `${used} color${used > 1 ? 's' : ''} used so far` : null;
    }
    return null;
  };

  const onNodeDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    setDragId(id);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragId || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const loc = pt.matrixTransform(ctm.inverse());
    const x = Math.max(22, Math.min(438, loc.x));
    const y = Math.max(22, Math.min(228, loc.y));
    setGraph((g) => ({
      ...g,
      nodes: g.nodes.map((n) => (n.id === dragId ? { ...n, x, y } : n)),
    }));
  };

  const msg = messageOf(step);
  const weighted = preset === 'dijkstra' || preset === 'mst';
  const arrows = graph.directed;

  return (
    <VizShell title={`Graph lab — ${presetDef.label}`}>
      <div className="flex flex-wrap gap-2 items-center text-xs">
        <label className="flex items-center gap-1.5 text-ink2">
          Graph
          <select className="input !w-auto !py-1" value={preset} onChange={(e) => setPreset(e.target.value)}>
            {Object.entries(GRAPH_PRESETS).map(([id, d]) => (
              <option key={id} value={id}>{d.label}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-ink2">
          Algorithm
          <select className="input !w-auto !py-1" value={algo} onChange={(e) => setAlgo(e.target.value)}>
            {(ALGOS_FOR[preset] ?? []).map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </label>
        {needsSource && (
          <label className="flex items-center gap-1.5 text-ink2">
            Start
            <select className="input !w-auto !py-1" value={source} onChange={(e) => setSource(e.target.value)}>
              {graph.nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.id}</option>
              ))}
            </select>
          </label>
        )}
        <span className="text-ink4 hidden lg:inline">drag nodes to rearrange</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <Controls p={p} total={steps.length} />
        {sideInfo() && <div className="text-xs font-mono text-ink2">{sideInfo()}</div>}
      </div>

      <div className="grid-paper border border-line mt-2">
        <svg
          ref={svgRef}
          viewBox="0 0 460 250"
          className="w-full touch-none"
          onPointerMove={onMove}
          onPointerUp={() => setDragId(null)}
          onPointerLeave={() => setDragId(null)}
        >
          <defs>
            <marker id="viz-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#8A93A5" />
            </marker>
          </defs>
          {graph.edges.map((e) => {
            const a = nodeById.get(e.a);
            const b2 = nodeById.get(e.b);
            if (!a || !b2) return null;
            const st = edgeState(e.a, e.b);
            const dx = b2.x - a.x;
            const dy = b2.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const x1 = a.x + ux * 18;
            const y1 = a.y + uy * 18;
            const x2 = b2.x - ux * (arrows ? 22 : 18);
            const y2 = b2.y - uy * (arrows ? 22 : 18);
            return (
              <g key={`${e.a}-${e.b}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={st.stroke} strokeWidth={st.width} strokeDasharray={st.dash} markerEnd={arrows ? 'url(#viz-arrow)' : undefined} />
                {weighted && (
                  <text x={(x1 + x2) / 2 + 6} y={(y1 + y2) / 2 - 6} fontSize="11" fontFamily="monospace" fill="#66718A">
                    {e.w}
                  </text>
                )}
              </g>
            );
          })}
          {graph.nodes.map((n) => {
            const st = nodeFill(n.id);
            const extra = nodeLabelExtra(n.id);
            return (
              <g key={n.id} onPointerDown={(e) => onNodeDown(e, n.id)} className="cursor-grab active:cursor-grabbing">
                <circle cx={n.x} cy={n.y} r="17" fill={st.fill} stroke={st.stroke} strokeWidth={st.ring ? 3 : 1.5} />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={st.text} style={{ pointerEvents: 'none' }}>
                  {n.id}
                </text>
                {extra !== null && (
                  <text x={n.x} y={n.y + 32} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#66718A" style={{ pointerEvents: 'none' }}>
                    {extra}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <Message text={msg.text} tone={msg.tone} />
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// 5. Prime explorer
// ---------------------------------------------------------------------------

function PrimeExplorerViz({ props }: { props?: Record<string, unknown> }) {
  const maxN = Math.max(60, Math.min(400, Number(props?.maxN ?? 120)));
  const [n, setN] = useState(84);

  const factors = useMemo(() => primeFactorMap(n), [n]);
  const factorStr =
    n < 2
      ? ''
      : factors
          .map(([p, e]) => (e > 1 ? `${p}${sup(e)}` : String(p)))
          .join(' · ');

  return (
    <VizShell title="Prime explorer">
      <div className="text-xs text-ink3 mb-2">
        Click any number to factorize it. Blue = prime.
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(34px,1fr))] gap-1 max-h-72 overflow-y-auto slim-scroll">
        {Array.from({ length: maxN - 1 }, (_, i) => i + 2).map((x) => {
          const prime = isPrime(x);
          const sel = x === n;
          return (
            <button
              key={x}
              type="button"
              onClick={() => setN(x)}
              className={`h-8 text-xs font-mono border transition-colors cursor-pointer ${
                sel
                  ? 'bg-ink text-paper border-ink'
                  : prime
                    ? 'bg-bluel text-blue border-bluep hover:bg-bluep'
                    : 'bg-paper2 text-ink2 border-line hover:border-ink3'
              }`}
            >
              {x}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm border-t border-line pt-3">
        <span className="text-ink">
          <span className="font-mono font-semibold text-lg">{n}</span>{' '}
          {n < 2 ? '— ' : isPrime(n) ? <span className="text-blue font-medium">is prime</span> : <span className="text-terracotta font-medium">= {factorStr}</span>}
        </span>
        <span className="text-ink3 text-xs self-center">
          {isPrime(n)
            ? `smallest prime factor: itself · φ(${n}) = ${phi(n)}`
            : `${numDivisorsFromFactors(factors)} divisors: ${divisors(n).slice(0, 12).join(', ')}${divisors(n).length > 12 ? '…' : ''}`}
        </span>
      </div>
    </VizShell>
  );
}

function sup(n: number): string {
  const map: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  return String(n).split('').map((c) => map[c] ?? c).join('');
}

// ---------------------------------------------------------------------------
// 6. Sieve of Eratosthenes
// ---------------------------------------------------------------------------

function SieveViz({ props }: { props?: Record<string, unknown> }) {
  const maxN = Math.max(50, Math.min(400, Number(props?.maxN ?? 100)));
  const steps = useMemo(() => sieveSteps(maxN), [maxN]);
  const p = usePlayer(steps.length + 1, 900); // +1 = final state
  const cur = p.i; // 0..steps.length ; steps.length means "done"

  const crossedNow = new Set<number>();
  const crossedBefore = new Set<number>();
  if (cur > 0 && cur <= steps.length) {
    for (let i = 0; i < cur - 1; i++) steps[i].crossed.forEach((c) => crossedBefore.add(c));
    if (cur <= steps.length) steps[cur - 1].crossed.forEach((c) => crossedNow.add(c));
  }
  const final = cur >= steps.length;
  const primes = new Set(steps.length ? steps[steps.length - 1].remaining : []);

  const msg =
    cur === 0
      ? 'Ready. Step through to cross out multiples of each prime.'
      : cur <= steps.length
        ? `Crossing out multiples of ${steps[cur - 1].prime}.`
        : `Done — ${steps[steps.length - 1].remaining.length} primes up to ${maxN}.`;

  return (
    <VizShell title={`Sieve of Eratosthenes (up to ${maxN})`}>
      <Controls p={p} total={steps.length + 1} />
      <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(34px,1fr))] gap-1 max-h-72 overflow-y-auto slim-scroll">
        {Array.from({ length: maxN }, (_, i) => i + 1).map((x) => {
          if (x === 1) {
            return <div key={x} className="h-8 border border-line bg-paper flex items-center justify-center text-xs font-mono text-ink4 line-through">1</div>;
          }
          let cls = 'bg-white text-ink2 border-line';
          let strike = false;
          if (final && primes.has(x)) cls = 'bg-mossl text-moss border-moss';
          else if (crossedNow.has(x)) { cls = 'bg-terracottal text-terracotta border-terracotta'; strike = true; }
          else if (crossedBefore.has(x)) { cls = 'bg-paper2 text-ink4 border-line opacity-60'; strike = true; }
          else if (cur > 0 && x === steps[Math.min(cur, steps.length) - 1]?.prime) cls = 'bg-goldl text-gold border-gold font-semibold';
          return (
            <div key={x} className={`h-8 border flex items-center justify-center text-xs font-mono ${cls} ${strike ? 'line-through' : ''}`}>
              {x}
            </div>
          );
        })}
      </div>
      <Message text={msg} tone={final ? 'good' : 'normal'} />
      {final && (
        <div className="mt-2 text-xs font-mono text-ink2">
          primes: {steps[steps.length - 1].remaining.join(' ')}
        </div>
      )}
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// 7. Euclid's algorithm
// ---------------------------------------------------------------------------

function EuclidViz({ props }: { props?: Record<string, unknown> }) {
  const [a, setA] = useState<number>(Number(props?.a ?? 1071));
  const [b, setB] = useState<number>(Number(props?.b ?? 462));
  const steps = useMemo(() => euclidSteps(a, b), [a, b]);
  const p = usePlayer(steps.length, 800);

  const gcdVal = steps.length ? steps[steps.length - 1].b : 0;

  return (
    <VizShell title="Euclid’s algorithm — gcd by repeated division">
      <div className="flex flex-wrap gap-3">
        <NumberInput label="a" value={a} onChange={setA} min={1} max={99999} />
        <NumberInput label="b" value={b} onChange={setB} min={0} max={99999} />
      </div>
      <div className="mt-3">
        <Controls p={p} total={steps.length} />
      </div>
      <div className="mt-3 space-y-1.5 font-mono text-sm">
        {steps.slice(0, p.i + 1).map((s, i) => (
          <div
            key={i}
            className={`px-3 py-1.5 border ${
              i === p.i && !p.atEnd
                ? 'border-gold bg-goldl/50'
                : i === p.i
                  ? 'border-moss bg-mossl'
                  : 'border-line bg-white'
            }`}
          >
            <InlineMath latex={`${s.a} = ${s.q} \\cdot ${s.b} + ${s.r}`} />
            <span className="text-ink4 text-xs ml-2">→ gcd({s.a}, {s.b}) = gcd({s.b}, {s.r})</span>
          </div>
        ))}
        {p.atEnd && steps.length > 0 && (
          <div className="px-3 py-1.5 border border-moss bg-mossl font-semibold text-moss">
            <InlineMath latex={`\\gcd(${a}, ${b}) = ${gcdVal}`} />
          </div>
        )}
      </div>
      <Message
        text={
          p.atEnd
            ? `The last non-zero remainder is the gcd — ${gcdVal}. Every division preserved the common divisors.`
            : 'Each step replaces (a, b) with (b, a mod b). The gcd never changes.'
        }
        tone={p.atEnd ? 'good' : 'normal'}
      />
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// 8. Modular arithmetic clock
// ---------------------------------------------------------------------------

function ModularClockViz({ props }: { props?: Record<string, unknown> }) {
  const m = Math.max(2, Math.min(16, Number(props?.modulus ?? 12)));
  const [base, setBase] = useState(2);
  const showPowers = Number(props?.showPowers ?? 0);
  const [trail, setTrail] = useState<number[]>(() => {
    const out = [1 % m];
    let cur = 1 % m;
    for (let i = 0; i < showPowers; i++) { cur = (cur * base) % m; out.push(cur); }
    return out;
  });
  const [idx, setIdx] = useState(showPowers);

  const cur = trail[Math.min(idx, trail.length - 1)];

  const advance = () => {
    if (idx < trail.length - 1) {
      setIdx(idx + 1);
      return;
    }
    const next = (trail[trail.length - 1] * base) % m;
    if (next === trail[0] && trail.length > 1) {
      // cycle closes — restart to show the order
      setTrail([trail[0]]);
      setIdx(0);
      return;
    }
    setTrail([...trail, next]);
    setIdx(trail.length);
  };

  const pos = (v: number): [number, number] => {
    const ang = -Math.PI / 2 + (v / m) * 2 * Math.PI;
    return [100 + 78 * Math.cos(ang), 100 + 78 * Math.sin(ang)];
  };

  const order = useMemo(() => {
    let x = 1 % m;
    for (let i = 1; i <= m; i++) {
      x = (x * base) % m;
      if (x === 1 % m) return i;
    }
    return null;
  }, [base, m]);

  return (
    <VizShell title={`Modular clock — arithmetic mod ${m}`}>
      <div className="flex flex-wrap gap-3 items-center text-xs">
        <NumberInput label="multiplier a" value={base} onChange={setBase} min={1} max={Math.max(1, m - 1)} />
        <NumberInput label="modulus m" value={m} onChange={(v) => setBase((b) => Math.min(b, Math.max(1, v - 1)))} min={2} max={16} />
        <button type="button" className="btn-secondary btn-sm" onClick={advance}>
          × {base} → next
        </button>
        <button type="button" className="btn-ghost btn-sm" onClick={() => { setTrail([1 % m]); setIdx(0); }}>
          reset
        </button>
      </div>
      <div className="mt-3 grid md:grid-cols-2 gap-4 items-center">
        <div className="grid-paper border border-line">
          <svg viewBox="0 0 200 200" className="w-full max-w-[260px] mx-auto">
            <circle cx="100" cy="100" r="92" fill="none" stroke="#D5D1C4" strokeWidth="1.5" />
            {Array.from({ length: m }, (_, v) => {
              const [x, y] = pos(v);
              const [lx, ly] = [100 + 86 * Math.cos(-Math.PI / 2 + (v / m) * 2 * Math.PI), 100 + 86 * Math.sin(-Math.PI / 2 + (v / m) * 2 * Math.PI)];
              return (
                <g key={v}>
                  <line x1={100 + 92 * Math.cos(-Math.PI / 2 + (v / m) * 2 * Math.PI)} y1={100 + 92 * Math.sin(-Math.PI / 2 + (v / m) * 2 * Math.PI)} x2={x} y2={y} stroke="#8A93A5" strokeWidth="1" />
                  <text x={lx} y={ly + 3.5} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#3D4C63">{v}</text>
                </g>
              );
            })}
            {trail.map((v, i) => {
              const [x, y] = pos(v);
              const last = i === Math.min(idx, trail.length - 1);
              if (i > 0) {
                const [px, py] = pos(trail[i - 1]);
                <line key={`l${i}`} x1={px} y1={py} x2={x} y2={y} stroke="#2B5C8A" strokeWidth="1.5" opacity="0.4" />
              }
              return (
                <circle key={i} cx={x} cy={y} r={last ? 9 : 6} fill={last ? '#8A6D2F' : '#2B5C8A'} opacity={last ? 1 : 0.55} />
              );
            })}
            <text x="100" y="104" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1B2A41">
              {cur}
            </text>
          </svg>
        </div>
        <div className="text-sm text-ink2">
          <div className="font-mono">
            current: <InlineMath latex={`${base}^${Math.min(idx, trail.length - 1)} \\bmod ${m} = ${cur}`} />
          </div>
          <div className="mt-2 text-xs">
            powers visited: <span className="font-mono">{trail.join(' → ')}</span>
          </div>
          {order !== null && (
            <div className="mt-3 border border-line bg-bluel/40 px-3 py-2 text-xs leading-relaxed">
              <span className="font-medium text-blue">Order of {base} mod {m} is {order}:</span>{' '}
              <InlineMath latex={`${base}^{${order}} \\equiv 1 \\pmod{${m}}`} /> — the powers cycle with period {order}.
            </div>
          )}
        </div>
      </div>
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// 9. RSA lab
// ---------------------------------------------------------------------------

function RsaViz({ props }: { props?: Record<string, unknown> }) {
  const [p, setP] = useState<number>(Number(props?.p ?? 61));
  const [q, setQ] = useState<number>(Number(props?.q ?? 53));
  const [msg, setMsg] = useState<string>(String(Number(props?.m ?? 65)));
  const [cipher, setCipher] = useState('');

  const res = useMemo(() => {
    const r = rsaSetup(p, q);
    return 'error' in r ? null : r;
  }, [p, q]);

  const mNum = parseInt(msg, 10);
  const cNum = parseInt(cipher, 10);
  const enc = res && !Number.isNaN(mNum) && mNum >= 0 && mNum < res.n ? res.encrypt(mNum) : null;
  const dec = res && !Number.isNaN(cNum) && cNum >= 0 && cNum < res.n ? res.decrypt(cNum) : null;

  return (
    <VizShell title="RSA — key generation, encrypt, decrypt">
      <div className="flex flex-wrap gap-3 items-center">
        <NumberInput label="p (prime)" value={p} onChange={setP} min={2} max={997} />
        <NumberInput label="q (prime)" value={q} onChange={setQ} min={2} max={997} />
        <div className="flex gap-1 items-center text-xs">
          <input className="input !w-28 !py-1" value={msg} placeholder="message m" onChange={(e) => setMsg(e.target.value)} />
          <span className="text-ink4">→</span>
          <input className="input !w-28 !py-1" value={cipher} placeholder="ciphertext c" onChange={(e) => setCipher(e.target.value)} />
        </div>
      </div>

      {res === null ? (
        <div className="mt-3 text-sm text-terracotta">
          {rsaSetup(p, q) && 'error' in (rsaSetup(p, q) as { error?: string }) ? (rsaSetup(p, q) as { error: string }).error : 'Choose two distinct primes.'}
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            {[
              ['n = p·q', res.n],
              ['φ(n)', res.phi],
              ['e (public)', res.e],
              ['d (private)', res.d],
              ['e·d mod φ(n)', res.edModPhi],
            ].map(([label, val]) => (
              <div key={String(label)} className="border border-line bg-paper2/50 px-2 py-2">
                <div className="text-[10px] uppercase tracking-wide text-ink3">{label}</div>
                <div className="font-mono text-lg font-semibold text-ink">{val}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-sm font-mono">
            {enc !== null && (
              <span className="text-ink">
                E({mNum}) = {mNum}^{res.e} mod {res.n} = <span className="text-blue font-semibold">{enc}</span>
              </span>
            )}
            {dec !== null && (
              <span className="text-ink">
                D({cNum}) = {cNum}^{res.d} mod {res.n} = <span className="text-moss font-semibold">{dec}</span>
              </span>
            )}
            {enc === null && dec === null && (
              <span className="text-ink3">Enter a message m (0 ≤ m &lt; n) or a ciphertext c to try it out.</span>
            )}
          </div>
          <div className="mt-3 overflow-x-auto slim-scroll">
            <table className="border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-paper2">
                  <th className="border border-line px-2 py-1 text-left">m</th>
                  <th className="border border-line px-2 py-1 text-left">c = m^e mod n</th>
                  <th className="border border-line px-2 py-1 text-left">m′ = c^d mod n</th>
                </tr>
              </thead>
              <tbody>
                {res.table.map((row) => (
                  <tr key={row.m}>
                    <td className="border border-line px-2 py-1">{row.m}</td>
                    <td className="border border-line px-2 py-1">{row.c}</td>
                    <td className="border border-line px-2 py-1 text-moss">{row.mRec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

type VizCmp = React.ComponentType<{ props?: Record<string, unknown> }>;

const REGISTRY: Record<string, VizCmp> = {
  'truth-table': TruthTableViz,
  venn: VennViz,
  'recursion-tree': RecursionTreeViz,
  'graph-editor': GraphEditorViz,
  'prime-explorer': PrimeExplorerViz,
  sieve: SieveViz,
  euclid: EuclidViz,
  'modular-clock': ModularClockViz,
  rsa: RsaViz,
};

export function Viz({ id, props }: { id: string; props?: Record<string, unknown> }) {
  const Cmp = REGISTRY[id];
  if (!Cmp) {
    return (
      <div className="my-5 border border-dashed border-line2 bg-paper2/40 px-4 py-3 text-sm text-ink3">
        Interactive visualization “{id}” is not available in this build.
      </div>
    );
  }
  return <Cmp key={id} props={props} />;
}

// keep factorize referenced for tree-shaking clarity (used indirectly)
export { factorize as _factorize };
