import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  bfsSteps, dijkstraSteps, dfsSteps, kruskalSteps, topoSteps, coloringSteps,
} from '../lib/graph';
import type { Graph, GNode } from '../lib/graph';
import {
  euclidSteps, sieveSteps, factorize, primeFactorMap, isPrime, divisors, phi, numDivisorsFromFactors, rsaSetup,
} from '../lib/numbertheory';
import { InlineMath } from './TeX';
import type { Mat2, Vec2 } from '../lib/linalg';
import type { HuffmanNode } from '../lib/vizmath';
import { mulberry32 } from '../lib/stat';
import {
  LANDSCAPES, MAP_PRESETS, POPULATIONS, TAYLOR_PRESETS,
  applyMap, bayes, bayesCounts, cltRun, gdRun, getLandscape, getMapPreset, getPopulation,
  getTaylorPreset, huffmanCodes, huffmanDecode, huffmanEncode, isPrefixFree, mapInfo,
  normalOverlay, sampleFn, taylorApprox, taylorError, taylorTerm, transformedUnitSquare, turnDegrees,
} from '../lib/vizmath';

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
// 10. Matrix transformations of the plane
// ---------------------------------------------------------------------------

function num(x: number, d = 3): string {
  if (!Number.isFinite(x)) return '—';
  const v = Number(x.toFixed(d));
  return Object.is(v, -0) ? '0' : String(v);
}

const SVG_INK = '#1B2A41';
const SVG_BLUE = '#2B5C8A';
const SVG_GOLD = '#8A6D2F';
const SVG_TERRA = '#A9432E';
const SVG_MOSS = '#3E7A4E';

function MatrixTransformViz({ props }: { props?: Record<string, unknown> }) {
  const initialPreset = (props?.preset as string | undefined) ?? 'shear';
  const [pid, setPid] = useState(initialPreset);
  const [m, setM] = useState<Mat2>(() => getMapPreset(initialPreset).matrix);
  const [angle, setAngle] = useState(30);

  const info = useMemo(() => mapInfo(m), [m]);
  const SIZE = 340;
  const WORLD = 3;
  const k = SIZE / (2 * WORLD);
  const P = (p: Vec2): [number, number] => [SIZE / 2 + p[0] * k, SIZE / 2 - p[1] * k];
  const line = (a: Vec2, b: Vec2): string => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    return `M${x1.toFixed(2)},${y1.toFixed(2)}L${x2.toFixed(2)},${y2.toFixed(2)}`;
  };
  const arrow = (a: Vec2, b: Vec2, color: string, key: string, width = 2.2) => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    const ang = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    const head = 8;
    return (
      <g key={key}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />
        <polygon
          points={`0,0 -${head},${head / 2.6} -${head},-${head / 2.6}`}
          fill={color}
          transform={`translate(${x2.toFixed(2)},${y2.toFixed(2)}) rotate(${ang.toFixed(2)})`}
        />
      </g>
    );
  };

  const gridLines = Array.from({ length: 2 * WORLD + 1 }, (_, i) => i - WORLD);

  const theta = (angle * Math.PI) / 180;
  const v: Vec2 = [Math.cos(theta) * 1.7, Math.sin(theta) * 1.7];
  const w = applyMap(m, v);
  const turn = turnDegrees(m, v);

  const set = (idx: 0 | 1 | 2 | 3, val: number) => {
    setM((old) => {
      const next: Mat2 = [...old] as Mat2;
      next[idx] = val;
      return next;
    });
    setPid('custom');
  };

  return (
    <VizShell title="Linear maps on the plane" right={<span className="text-xs text-ink3 font-mono">det = {num(info.det, 3)}</span>}>
      <div className="flex flex-wrap gap-1.5">
        {MAP_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => { setPid(p.id); setM(p.matrix); }}
            className={`chip cursor-pointer ${pid === p.id ? 'bg-bluel text-blue border-bluep' : 'hover:bg-paper2'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-[auto,1fr]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-[340px] max-w-full bg-white border border-line">
          {/* image of the integer grid */}
          <g stroke="#DCE8F2" strokeWidth={1}>
            {gridLines.map((g) => (
              <path key={`vx${g}`} d={line([g, -WORLD], [g, WORLD])} fill="none" />
            ))}
            {gridLines.map((g) => (
              <path key={`hz${g}`} d={line([-WORLD, g], [WORLD, g])} fill="none" />
            ))}
          </g>
          {/* untransformed grid */}
          <g stroke="#ECE8DE" strokeWidth={1}>
            {gridLines.map((g) => (
              <path key={`ov${g}`} d={`M${P([g, -WORLD])[0]},0L${P([g, WORLD])[0]},${SIZE}`} fill="none" />
            ))}
            {gridLines.map((g) => (
              <path key={`oh${g}`} d={`M0,${P([-WORLD, g])[1]}L${SIZE},${P([WORLD, g])[1]}`} fill="none" />
            ))}
          </g>
          <g stroke="#E4E1D7" strokeWidth={1}>
            <line x1={0} y1={SIZE / 2} x2={SIZE} y2={SIZE / 2} />
            <line x1={SIZE / 2} y1={0} x2={SIZE / 2} y2={SIZE} />
          </g>

          {/* image of the unit square */}
          <polygon
            points={transformedUnitSquare(m).map((p) => P(p).join(',')).join(' ')}
            fill="rgba(43,92,138,0.16)"
            stroke={SVG_BLUE}
            strokeWidth={1.4}
          />

          {/* eigenvectors */}
          {info.eigenvalues.map((e, i) => {
            const s = 2.4;
            return (
              <line
                key={`eig${i}`}
                x1={P([-e.vec[0] * s, -e.vec[1] * s])[0]}
                y1={P([-e.vec[0] * s, -e.vec[1] * s])[1]}
                x2={P([e.vec[0] * s, e.vec[1] * s])[0]}
                y2={P([e.vec[0] * s, e.vec[1] * s])[1]}
                stroke={SVG_TERRA}
                strokeWidth={1.3}
                strokeDasharray="5 4"
              />
            );
          })}

          {/* the test vector and its image */}
          {arrow([0, 0], v, SVG_GOLD, 'v', 2.2)}
          {arrow(v, w, '#C9A227', 'vw', 1.2)}
          {arrow([0, 0], w, SVG_MOSS, 'w', 2.2)}

          {/* images of the basis vectors */}
          {arrow([0, 0], applyMap(m, [1, 0]), SVG_BLUE, 'e1', 2.6)}
          {arrow([0, 0], applyMap(m, [0, 1]), '#1F4468', 'e2', 2.6)}
        </svg>

        <div className="min-w-[15rem]">
          <div className="grid grid-cols-2 gap-2">
            {(['a', 'b', 'c', 'd'] as const).map((lbl, i) => (
              <label key={lbl} className="flex items-center gap-2 text-xs text-ink2">
                <span className="font-mono w-3 text-ink">{lbl}</span>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.05}
                  value={m[i]}
                  onChange={(e) => set(i as 0 | 1 | 2 | 3, parseFloat(e.target.value))}
                  className="w-full accent-blue"
                />
                <span className="font-mono w-10 text-right text-ink">{num(m[i], 2)}</span>
              </label>
            ))}
          </div>

          <label className="mt-3 flex items-center gap-2 text-xs text-ink2">
            test vector angle
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value, 10))}
              className="w-full accent-blue"
            />
            <span className="font-mono w-10 text-right text-ink">{angle}°</span>
          </label>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-ink2">
            <span>area scale |det|</span><span className="font-mono text-ink text-right">{num(info.areaScale)}</span>
            <span>trace</span><span className="font-mono text-ink text-right">{num(info.trace)}</span>
            <span>orientation</span>
            <span className="text-right font-mono text-ink">{info.orientationFlipped ? 'flipped' : 'kept'}</span>
            <span>test vector turns</span><span className="font-mono text-ink text-right">{num(turn, 1)}°</span>
          </div>

          <div className="mt-3 border-t border-line pt-2 text-xs">
            <div className="font-medium text-ink">Eigenvalues</div>
            {info.eigenvalues.length > 0 ? (
              <ul className="mt-1 space-y-0.5 font-mono text-ink2">
                {info.eigenvalues.map((e, i) => (
                  <li key={i}>
                    λ{i + 1} = {num(e.lambda)} → dir ({num(e.vec[0], 2)}, {num(e.vec[1], 2)})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 font-mono text-ink2">
                complex: {num(info.complex?.re ?? 0)} ± {num(info.complex?.im ?? 0)}i — a rotation hides in here
              </p>
            )}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-ink3">
            {pid === 'custom' ? 'Your own matrix: watch the square area become |det| and see when the grid collapses.' : getMapPreset(pid).note}
          </p>
          {info.singular && (
            <p className="mt-2 text-xs text-terracotta">
              det = 0: the map squashes the plane onto a line, so information is destroyed and A⁻¹ cannot exist.
            </p>
          )}
        </div>
      </div>
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// 11. Taylor polynomials
// ---------------------------------------------------------------------------

function TaylorViz({ props }: { props?: Record<string, unknown> }) {
  const [pid, setPid] = useState((props?.fn as string | undefined) ?? 'sin');
  const [order, setOrder] = useState((props?.order as number | undefined) ?? 3);
  const [xTarget, setXTarget] = useState((props?.x as number | undefined) ?? 1.6);
  const preset = getTaylorPreset(pid);

  const [xLo, xHi] = preset.interval;
  const xStar = Math.min(Math.max(xTarget, xLo), xHi);
  const W = 400;
  const H = 260;
  const PAD = 26;

  const curves = useMemo(() => {
    const fPts = sampleFn(preset.fn, xLo, xHi, 320);
    const pPts = sampleFn((x) => taylorApprox(preset, order, x), xLo, xHi, 320);
    const ys = [...fPts, ...pPts].map(([, y]) => y).filter((y) => Number.isFinite(y) && Math.abs(y) < 40);
    const lo = Math.max(-8, Math.min(...ys, 0));
    const hi = Math.min(8, Math.max(...ys, 0));
    return { fPts, pPts, yLo: lo, yHi: hi };
  }, [preset, order, xLo, xHi]);

  const { fPts, pPts, yLo, yHi } = curves;
  const X = (x: number): number => PAD + ((x - xLo) / (xHi - xLo)) * (W - 2 * PAD);
  const Y = (y: number): number => H - PAD - ((y - yLo) / (yHi - yLo)) * (H - 2 * PAD);

  const polyline = (pts: Vec2[]): string => {
    let d = '';
    let pen = false;
    for (const [x, y] of pts) {
      if (!Number.isFinite(y) || y < yLo - 0.5 || y > yHi + 0.5) { pen = false; continue; }
      d += `${pen ? 'L' : 'M'}${X(x).toFixed(2)},${Y(y).toFixed(2)}`;
      pen = true;
    }
    return d;
  };

  const fAt = preset.fn(xStar);
  const pAt = taylorApprox(preset, order, xStar);
  const err = Math.abs(fAt - pAt);
  const worstNear = useMemo(() => taylorError(preset, order, [-1, 1]), [preset, order]);
  const worst = useMemo(() => taylorError(preset, order), [preset, order]);

  const terms = useMemo(() => {
    const out: { k: number; value: number }[] = [];
    for (let k = 0; k <= order; k++) {
      if (preset.coeffs[k] !== 0) out.push({ k, value: taylorTerm(preset, k, xStar) });
    }
    return out;
  }, [preset, order, xStar]);

  const nextK = preset.coeffs.findIndex((c, k) => k > order && c !== 0);

  return (
    <VizShell title="Taylor polynomials" right={<span className="text-xs text-ink3 font-mono">n = {order}</span>}>
      <div className="flex flex-wrap gap-1.5">
        {TAYLOR_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPid(p.id)}
            className={`chip cursor-pointer ${pid === p.id ? 'bg-bluel text-blue border-bluep' : 'hover:bg-paper2'}`}
          >
            {p.label}
          </button>
        ))}
        <span className="chip bg-white">
          <InlineMath latex={preset.latex} />
        </span>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-[auto,1fr]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-[400px] max-w-full bg-white border border-line">
          <g stroke="#ECE8DE" strokeWidth={1}>
            {Array.from({ length: 10 }, (_, i) => {
              const x = xLo + ((xHi - xLo) * i) / 9;
              return <line key={`gx${i}`} x1={X(x)} y1={PAD} x2={X(x)} y2={H - PAD} />;
            })}
            {Array.from({ length: 7 }, (_, i) => {
              const y = yLo + ((yHi - yLo) * i) / 6;
              return <line key={`gy${i}`} x1={PAD} y1={Y(y)} x2={W - PAD} y2={Y(y)} />;
            })}
          </g>
          {yLo <= 0 && yHi >= 0 && <line x1={PAD} y1={Y(0)} x2={W - PAD} y2={Y(0)} stroke="#D5D1C4" />}
          {xLo <= 0 && xHi >= 0 && <line x1={X(0)} y1={PAD} x2={X(0)} y2={H - PAD} stroke="#D5D1C4" />}

          <path d={polyline(fPts)} fill="none" stroke={SVG_INK} strokeWidth={2} />
          <path d={polyline(pPts)} fill="none" stroke={SVG_BLUE} strokeWidth={2} strokeDasharray="6 3" />

          {/* the error we are measuring, drawn to scale */}
          <line x1={X(xStar)} y1={Y(fAt)} x2={X(xStar)} y2={Y(pAt)} stroke={SVG_TERRA} strokeWidth={2} />
          <circle cx={X(xStar)} cy={Y(fAt)} r={3} fill={SVG_INK} />
          <circle cx={X(xStar)} cy={Y(pAt)} r={3} fill={SVG_BLUE} />

          <text x={PAD} y={16} fontSize={11} fill={SVG_INK} fontFamily="ui-monospace, monospace">
            f(x) solid · P{order}(x) dashed
          </text>
          <text x={W - PAD} y={H - 8} fontSize={11} fill="#66718A" textAnchor="end" fontFamily="ui-monospace, monospace">
            x ∈ [{num(xLo, 2)}, {num(xHi, 2)}]
          </text>
        </svg>

        <div className="min-w-[15rem]">
          <label className="flex items-center gap-2 text-xs text-ink2">
            degree n
            <input type="range" min={0} max={12} step={1} value={order} onChange={(e) => setOrder(parseInt(e.target.value, 10))} className="w-full accent-blue" />
            <span className="font-mono w-6 text-right text-ink">{order}</span>
          </label>
          <label className="mt-2 flex items-center gap-2 text-xs text-ink2">
            evaluate at x
            <input
              type="range"
              min={xLo}
              max={xHi}
              step={(xHi - xLo) / 200}
              value={xStar}
              onChange={(e) => setXTarget(parseFloat(e.target.value))}
              className="w-full accent-blue"
            />
            <span className="font-mono w-12 text-right text-ink">{num(xStar, 2)}</span>
          </label>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-ink2">
            <span>f({num(xStar, 2)})</span><span className="font-mono text-ink text-right">{num(fAt, 5)}</span>
            <span>P{order}({num(xStar, 2)})</span><span className="font-mono text-blue text-right">{num(pAt, 5)}</span>
            <span>error here</span><span className="font-mono text-terracotta text-right">{num(err, 5)}</span>
            <span>worst |error|, |x| ≤ 1</span><span className="font-mono text-ink text-right">{num(worstNear, 5)}</span>
            <span>worst |error|, window</span><span className="font-mono text-ink text-right">{num(worst, 5)}</span>
          </div>

          <div className="mt-3 border-t border-line pt-2 text-xs">
            <div className="font-medium text-ink">Terms at x = {num(xStar, 2)}</div>
            <div className="mt-1 max-h-32 overflow-y-auto slim-scroll font-mono text-[11px] text-ink2">
              {terms.map((t) => (
                <div key={t.k} className="flex justify-between gap-3">
                  <span>k={t.k}</span>
                  <span className={t.k === order ? 'text-blue' : ''}>{num(t.value, 5)}</span>
                </div>
              ))}
            </div>
            {nextK > 0 && (
              <p className="mt-1 text-[11px] text-ink3">
                next term would add {num(taylorTerm(preset, nextK, xStar), 5)}
              </p>
            )}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-ink3">{preset.note}</p>
        </div>
      </div>
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// 12. Bayes / natural frequencies
// ---------------------------------------------------------------------------

const BAYES_PRESETS: { id: string; label: string; prior: number; sensitivity: number; specificity: number; note: string }[] = [
  {
    id: 'rare', label: 'Rare disease (1 in 1000)', prior: 0.001, sensitivity: 0.99, specificity: 0.95,
    note: 'The base rate dominates: most positives are false alarms because the healthy group is 999× larger.',
  },
  {
    id: 'mammo', label: 'Screening test', prior: 0.008, sensitivity: 0.9, specificity: 0.91,
    note: 'A 90% sensitive, 91% specific test on a 0.8% prevalence population still leaves most positives healthy.',
  },
  {
    id: 'spam', label: 'Spam filter', prior: 0.5, sensitivity: 0.99, specificity: 0.995,
    note: 'With a balanced prior, the same test quality gives a posterior close to certainty.',
  },
  {
    id: 'dna', label: 'DNA match (1 in 10⁶)', prior: 1e-6, sensitivity: 1, specificity: 0.9999,
    note: 'Even a 99.99% specific test is wrong about half the time when the prior is one in a million — the prosecutor\u2019s fallacy.',
  },
];

function BayesViz({ props }: { props?: Record<string, unknown> }) {
  const [presetId, setPresetId] = useState((props?.preset as string | undefined) ?? 'rare');
  const [prior, setPrior] = useState((props?.prior as number | undefined) ?? 0.001);
  const [sens, setSens] = useState((props?.sensitivity as number | undefined) ?? 0.99);
  const [spec, setSpec] = useState((props?.specificity as number | undefined) ?? 0.95);

  const result = useMemo(() => bayes({ prior, sensitivity: sens, specificity: spec }), [prior, sens, spec]);
  const counts = bayesCounts(result);
  const preset = BAYES_PRESETS.find((p) => p.id === presetId);

  const W = 400;
  const H = 210;
  const posH = result.pPositive * H;
  const negH = H - posH;
  const tpW = result.tp + result.fp > 0 ? (result.tp / (result.tp + result.fp)) * W : W;

  const block = (
    x: number, y: number, w: number, h: number, fill: string, stroke: string, label: string, count: number, key: string,
  ) => (
    <g key={key}>
      <rect x={x} y={y} width={Math.max(0, w)} height={Math.max(0, h)} fill={fill} stroke={stroke} strokeWidth={1} />
      {w > 62 && h > 26 && (
        <>
          <text x={x + 6} y={y + 15} fontSize={11} fill={stroke} fontFamily="ui-monospace, monospace">{label}</text>
          <text x={x + 6} y={y + 30} fontSize={13} fill={SVG_INK} fontWeight={600}>{count.toLocaleString()}</text>
        </>
      )}
    </g>
  );

  return (
    <VizShell
      title="Bayes' rule in natural frequencies"
      right={<span className="text-xs text-ink3 font-mono">P(H|+) = {(result.posterior * 100).toFixed(1)}%</span>}
    >
      <div className="flex flex-wrap gap-1.5">
        {BAYES_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => { setPresetId(p.id); setPrior(p.prior); setSens(p.sensitivity); setSpec(p.specificity); }}
            className={`chip cursor-pointer ${presetId === p.id ? 'bg-bluel text-blue border-bluep' : 'hover:bg-paper2'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-[auto,1fr]">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-[400px] max-w-full bg-white border border-line">
            {block(0, 0, tpW, posH, '#E7F0E9', SVG_MOSS, 'TRUE POS', counts.tp, 'tp')}
            {block(tpW, 0, W - tpW, posH, '#F7E9E5', SVG_TERRA, 'FALSE POS', counts.fp, 'fp')}
            {block(0, posH, W, negH, '#F5EFDF', SVG_GOLD, 'FALSE NEG', counts.fn, 'fn')}
            <text
              x={W - 4}
              y={H - 6}
              fontSize={10}
              fill="#66718A"
              textAnchor="end"
              fontFamily="ui-monospace, monospace"
            >
              {counts.tn.toLocaleString()} true negatives below
            </text>
          </svg>
          <div className="mt-1 text-[11px] text-ink3 font-mono">
            top band = everyone who tests positive ({Math.round(result.pPositive * result.population).toLocaleString()} of{' '}
            {result.population.toLocaleString()})
          </div>
        </div>

        <div className="min-w-[15rem]">
          <label className="flex items-center gap-2 text-xs text-ink2">
            prevalence P(H)
            <input
              type="range"
              min={1}
              max={6}
              step={0.05}
              value={-Math.log10(prior)}
              onChange={(e) => { setPrior(10 ** -parseFloat(e.target.value)); setPresetId('custom'); }}
              className="w-full accent-blue"
            />
            <span className="font-mono w-16 text-right text-ink">
              {prior >= 0.01 ? `${(prior * 100).toFixed(1)}%` : `1 in ${Math.round(1 / prior).toLocaleString()}`}
            </span>
          </label>
          <label className="mt-2 flex items-center gap-2 text-xs text-ink2">
            sensitivity P(+|H)
            <input type="range" min={0.5} max={1} step={0.005} value={sens} onChange={(e) => { setSens(parseFloat(e.target.value)); setPresetId('custom'); }} className="w-full accent-blue" />
            <span className="font-mono w-16 text-right text-ink">{(sens * 100).toFixed(1)}%</span>
          </label>
          <label className="mt-2 flex items-center gap-2 text-xs text-ink2">
            specificity P(−|¬H)
            <input type="range" min={0.5} max={1} step={0.005} value={spec} onChange={(e) => { setSpec(parseFloat(e.target.value)); setPresetId('custom'); }} className="w-full accent-blue" />
            <span className="font-mono w-16 text-right text-ink">{(spec * 100).toFixed(1)}%</span>
          </label>

          <div className="mt-4">
            <div className="flex h-6 w-full overflow-hidden border border-line">
              <div className="flex items-center justify-center bg-mossl text-[11px] font-medium text-moss" style={{ width: `${result.posterior * 100}%` }}>
                {result.posterior > 0.12 ? `H | +  ${(result.posterior * 100).toFixed(1)}%` : ''}
              </div>
              <div className="flex flex-1 items-center justify-center bg-terracottal text-[11px] font-medium text-terracotta">
                {result.falseDiscovery > 0.12 ? `¬H | +  ${(result.falseDiscovery * 100).toFixed(1)}%` : ''}
              </div>
            </div>
            <div className="mt-2 text-xs text-ink2">
              <InlineMath
                latex={`P(H\\mid +)=\\frac{${num(sens, 3)}\\cdot${prior >= 0.01 ? num(prior, 3) : `${num(prior, 5)}`}}{${num(result.pPositive, 5)}}=${num(result.posterior, 3)}`}
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-ink2">
              <span>P(+) overall</span><span className="font-mono text-ink text-right">{num(result.pPositive, 4)}</span>
              <span>false discovery rate</span><span className="font-mono text-terracotta text-right">{(result.falseDiscovery * 100).toFixed(1)}%</span>
              <span>false negatives</span><span className="font-mono text-ink text-right">{counts.fn.toLocaleString()} of {counts.tp + counts.fn}</span>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-ink3">
            {preset ? preset.note : 'Move the sliders: notice how the posterior is pulled by the prior, not just the test quality.'}
          </p>
        </div>
      </div>
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// 13. Central limit theorem
// ---------------------------------------------------------------------------

function CltViz({ props }: { props?: Record<string, unknown> }) {
  const [populationId, setPopulationId] = useState((props?.population as string | undefined) ?? 'exponential');
  const [n, setN] = useState((props?.n as number | undefined) ?? 5);
  const [samples, setSamples] = useState((props?.samples as number | undefined) ?? 3000);
  const [seed, setSeed] = useState((props?.seed as number | undefined) ?? 7);

  const pop = getPopulation(populationId);
  const run = useMemo(() => cltRun({ populationId, n, samples, seed }), [populationId, n, samples, seed]);
  const overlay = useMemo(() => normalOverlay(run.hist, run.meanOfMeans, run.theoreticalSe), [run]);

  const popShape = useMemo(() => {
    const rng = mulberry32(seed + 991);
    const draws: number[] = [];
    for (let i = 0; i < 4000; i++) draws.push(pop.draw(rng));
    const lo = pop.mean - 4 * pop.sd;
    const hi = pop.mean + 4 * pop.sd;
    const bins = 30;
    const out = new Array(bins).fill(0) as number[];
    for (const d of draws) {
      if (d < lo || d > hi) continue;
      const i = Math.min(bins - 1, Math.floor(((d - lo) / (hi - lo)) * bins));
      out[i]++;
    }
    return { out, lo, hi, bins };
  }, [pop, seed]);

  const W = 400;
  const H = 240;
  const PAD = 26;
  const maxCount = Math.max(1, ...run.hist.map((b) => b.count));
  const maxOverlay = Math.max(1, ...overlay);
  const bw = (W - 2 * PAD) / run.hist.length;
  const Yc = (c: number): number => H - PAD - (c / maxCount) * (H - 2 * PAD);

  const overlayPath = overlay
    .map((c, i) => `${i ? 'L' : 'M'}${(PAD + (i + 0.5) * bw).toFixed(2)},${Yc((c / maxOverlay) * maxCount).toFixed(2)}`)
    .join('');

  const shapeBars = popShape.out.map((c, i) => {
    const max = Math.max(1, ...popShape.out);
    const x = PAD + i * ((W - 2 * PAD) / popShape.bins);
    const h = (c / max) * 46;
    return <rect key={i} x={x} y={H - 8 - h} width={(W - 2 * PAD) / popShape.bins - 1} height={h} fill="#8A93A5" />;
  });

  const ratio = run.sdOfMeans / run.theoreticalSe;

  return (
    <VizShell
      title="Central limit theorem sampler"
      right={<span className="text-xs text-ink3 font-mono">σ/√n = {num(run.theoreticalSe, 4)}</span>}
    >
      <div className="flex flex-wrap gap-1.5">
        {POPULATIONS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPopulationId(p.id)}
            className={`chip cursor-pointer ${populationId === p.id ? 'bg-bluel text-blue border-bluep' : 'hover:bg-paper2'}`}
          >
            {p.label}
          </button>
        ))}
        <button type="button" className="chip cursor-pointer hover:bg-paper2" onClick={() => setSeed((s) => s + 1)}>
          new sample
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-ink2">
          sample size n
          <input type="range" min={1} max={60} step={1} value={n} onChange={(e) => setN(parseInt(e.target.value, 10))} className="w-40 accent-blue" />
          <span className="font-mono w-6 text-right text-ink">{n}</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-ink2">
          samples
          <input type="range" min={200} max={6000} step={100} value={samples} onChange={(e) => setSamples(parseInt(e.target.value, 10))} className="w-40 accent-blue" />
          <span className="font-mono w-12 text-right text-ink">{samples}</span>
        </label>
        <span className="text-[11px] text-ink3">population shape: {pop.shape}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-[400px] max-w-full bg-white border border-line">
        {run.hist.map((b, i) => {
          const y = Yc(b.count);
          return <rect key={i} x={PAD + i * bw + 0.5} y={y} width={bw - 1} height={H - PAD - y} fill="#DCE8F2" stroke={SVG_BLUE} strokeWidth={0.6} />;
        })}
        <path d={overlayPath} fill="none" stroke={SVG_TERRA} strokeWidth={2} />
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#D5D1C4" />
        <text x={PAD} y={14} fontSize={11} fill={SVG_INK} fontFamily="ui-monospace, monospace">
          {samples} sample means (bars) vs N(μ, σ/√n) (red)
        </text>
        <text x={PAD} y={H - 16} fontSize={10} fill="#66718A" fontFamily="ui-monospace, monospace">
          population {pop.label}
        </text>
        {shapeBars}
        <text x={W - PAD} y={H - 16} fontSize={10} fill="#66718A" textAnchor="end" fontFamily="ui-monospace, monospace">
          shades = population draws
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink2 sm:grid-cols-4">
        <span>mean of means</span><span className="font-mono text-ink">{num(run.meanOfMeans, 4)}</span>
        <span>population μ</span><span className="font-mono text-ink">{num(pop.mean, 4)}</span>
        <span>sd of means</span><span className="font-mono text-ink">{num(run.sdOfMeans, 4)}</span>
        <span>σ/√n</span><span className="font-mono text-ink">{num(run.theoreticalSe, 4)}</span>
      </div>

      <Message
        tone={ratio > 0.8 && ratio < 1.25 ? 'good' : 'normal'}
        text={
          n <= 2
            ? 'At n = 1 or 2 the histogram just mirrors the population — the theorem has not kicked in yet.'
            : `Observed spread is ${num(ratio, 3)}× the predicted σ/√n. Raise n and the bars slide toward the red normal curve, whatever shape you start from.`
        }
      />
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// 14. Gradient descent
// ---------------------------------------------------------------------------

function lossColor(t: number): string {
  const stops: [number, number, number][] = [
    [251, 250, 247],
    [220, 232, 242],
    [120, 165, 205],
    [43, 92, 138],
    [27, 42, 65],
  ];
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(scaled));
  const f = scaled - i;
  const c = stops[i].map((v, j) => Math.round(v + (stops[i + 1][j] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function GradientDescentViz({ props }: { props?: Record<string, unknown> }) {
  const [lid, setLid] = useState((props?.landscape as string | undefined) ?? 'ravine');
  const [lr, setLr] = useState((props?.lr as number | undefined) ?? 0.03);
  const [steps, setSteps] = useState((props?.steps as number | undefined) ?? 40);
  const landscape = getLandscape(lid);

  const run = useMemo(() => gdRun(landscape, { lr, steps }), [landscape, lr, steps]);
  const player = usePlayer(run.path.length, 320);
  const cur = run.path[Math.min(player.i, run.path.length - 1)];

  const SIZE = 320;
  const d = landscape.domain;
  const P = (p: Vec2): [number, number] => [
    ((p[0] + d) / (2 * d)) * SIZE,
    SIZE - ((p[1] + d) / (2 * d)) * SIZE,
  ];

  const cells = useMemo(() => {
    const N = 40;
    const losses: number[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = -d + (2 * d * (i + 0.5)) / N;
        const y = -d + (2 * d * (j + 0.5)) / N;
        losses.push(landscape.fn(x, y));
      }
    }
    const finite = losses.filter((l) => Number.isFinite(l)).sort((a, b) => a - b);
    const lo = finite.length ? Math.log1p(finite[0]) : 0;
    const hi = finite.length ? Math.log1p(finite[Math.floor(finite.length * 0.97)]) : 1;
    return Array.from({ length: N * N }, (_, idx) => {
      const i = Math.floor(idx / N);
      const j = idx % N;
      const l = losses[idx];
      const t = Number.isFinite(l) && hi > lo ? (Math.log1p(l) - lo) / (hi - lo) : 0;
      const size = SIZE / N;
      return (
        <rect
          key={idx}
          x={i * size}
          y={SIZE - (j + 1) * size}
          width={size + 0.6}
          height={size + 0.6}
          fill={lossColor(1 - Math.max(0, Math.min(1, t)))}
        />
      );
    });
  }, [landscape, d]);

  const pathPts = run.path.slice(0, player.i + 1).map((s) => P([s.x, s.y]));
  const dPath = pathPts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('');

  const [gx, gy] = landscape.grad(cur.x, cur.y);
  const gn = Math.hypot(gx, gy) || 1;
  const arrowLen = 34;
  const cpx = P([cur.x, cur.y]);
  const gradTip: [number, number] = [cpx[0] - (gx / gn) * arrowLen, cpx[1] + (gy / gn) * arrowLen];
  const minPx = P(landscape.min);

  return (
    <VizShell
      title="Gradient descent on a loss surface"
      right={<span className="text-xs text-ink3 font-mono">lr = {num(lr, 4)}</span>}
    >
      <div className="flex flex-wrap gap-1.5">
        {LANDSCAPES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => { setLid(l.id); setLr(l.lrHint); }}
            className={`chip cursor-pointer ${lid === l.id ? 'bg-bluel text-blue border-bluep' : 'hover:bg-paper2'}`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-[auto,1fr]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-[320px] max-w-full border border-line">
          {cells}
          <path d={dPath} fill="none" stroke="#F5EFDF" strokeWidth={3.4} strokeLinejoin="round" strokeLinecap="round" />
          <path d={dPath} fill="none" stroke={SVG_TERRA} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
          {run.path.slice(0, player.i + 1).map((s, i) => (
            <circle key={i} cx={P([s.x, s.y])[0]} cy={P([s.x, s.y])[1]} r={i % 5 === 0 ? 2.4 : 1.4} fill="#F7E9E5" stroke={SVG_TERRA} strokeWidth={0.8} />
          ))}
          <circle cx={minPx[0]} cy={minPx[1]} r={4} fill="none" stroke={SVG_MOSS} strokeWidth={2} />
          <circle cx={cpx[0]} cy={cpx[1]} r={5} fill={SVG_INK} />
          <line x1={cpx[0]} y1={cpx[1]} x2={gradTip[0]} y2={gradTip[1]} stroke="#C9A227" strokeWidth={2.4} strokeLinecap="round" />
          <text x={8} y={16} fontSize={11} fill="#FBFAF7" fontFamily="ui-monospace, monospace">
            {landscape.latex} · step {player.i}/{Math.max(0, run.path.length - 1)}
          </text>
        </svg>

        <div className="min-w-[15rem]">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={player.playing ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} onClick={player.toggle}>
              {player.playing ? '⏸ pause' : '▶ trace'}
            </button>
            <button type="button" className="btn-secondary btn-sm" onClick={player.prev} disabled={player.atStart}>←</button>
            <button type="button" className="btn-secondary btn-sm" onClick={player.next} disabled={player.atEnd}>→</button>
            <button type="button" className="btn-secondary btn-sm" onClick={player.reset}>reset</button>
          </div>

          <label className="mt-3 flex items-center gap-2 text-xs text-ink2">
            learning rate
            <input
              type="range"
              min={-4}
              max={0}
              step={0.02}
              value={Math.log10(lr)}
              onChange={(e) => setLr(10 ** parseFloat(e.target.value))}
              className="w-full accent-blue"
            />
            <span className="font-mono w-16 text-right text-ink">{lr < 0.001 ? lr.toExponential(1) : num(lr, 4)}</span>
          </label>
          <label className="mt-2 flex items-center gap-2 text-xs text-ink2">
            iterations
            <input type="range" min={5} max={150} step={1} value={steps} onChange={(e) => setSteps(parseInt(e.target.value, 10))} className="w-full accent-blue" />
            <span className="font-mono w-8 text-right text-ink">{steps}</span>
          </label>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-ink2">
            <span>loss f(x,y)</span><span className="font-mono text-ink text-right">{num(cur.loss, 5)}</span>
            <span>‖gradient‖</span><span className="font-mono text-ink text-right">{num(cur.gradNorm, 5)}</span>
            <span>(x, y)</span><span className="font-mono text-ink text-right">({num(cur.x, 3)}, {num(cur.y, 3)})</span>
            <span>distance to min</span><span className="font-mono text-ink text-right">{num(run.distanceToMin, 4)}</span>
          </div>

          <div className="mt-3 h-24 border border-line bg-paper2/40 p-1">
            <svg viewBox="0 0 100 40" className="h-full w-full" preserveAspectRatio="none">
              {(() => {
                const losses = run.path.map((s) => (Number.isFinite(s.loss) ? Math.log1p(Math.max(0, s.loss)) : 0));
                const hi = Math.max(1e-6, ...losses);
                return run.path.map((s, i) => {
                  const barW = 100 / Math.max(1, run.path.length);
                  const h = (losses[i] / hi) * 38;
                  return <rect key={i} x={i * barW} y={40 - h} width={Math.max(0.4, barW - 0.2)} height={h} fill={i <= player.i ? SVG_BLUE : '#D5D1C4'} />;
                });
              })()}
            </svg>
          </div>
          <div className="mt-1 text-[11px] text-ink3 font-mono">log-scale loss per iteration</div>

          <p className="mt-3 text-xs leading-relaxed text-ink3">{landscape.note}</p>
          {run.diverged && (
            <p className="mt-2 text-xs text-terracotta">
              Diverged. The step size exceeds the stability limit 2/λmax for this curvature — the iterates fly off the surface.
            </p>
          )}
          {!run.diverged && run.final.gradNorm < 1e-3 && (
            <p className="mt-2 text-xs text-moss">Converged: the gradient has flattened out.</p>
          )}
        </div>
      </div>
    </VizShell>
  );
}

// ---------------------------------------------------------------------------
// 15. Huffman coding
// ---------------------------------------------------------------------------

const HUFF_PRESETS: { id: string; label: string; weights: { symbol: string; w: number }[]; note: string }[] = [
  {
    id: 'coin', label: 'Fair coin', weights: [{ symbol: 'H', w: 1 }, { symbol: 'T', w: 1 }],
    note: 'Two equally likely symbols: one bit each, and the average length equals 1 bit = the entropy.',
  },
  {
    id: 'skew', label: 'Skewed source', weights: [{ symbol: 'A', w: 7 }, { symbol: 'B', w: 1 }, { symbol: 'C', w: 1 }, { symbol: 'D', w: 1 }],
    note: 'Rare symbols get long codes; the common symbol gets one bit. Average length beats the 2-bit fixed code.',
  },
  {
    id: 'english', label: 'English letters', weights: [{ symbol: 'E', w: 127 }, { symbol: 'T', w: 91 }, { symbol: 'A', w: 82 }, { symbol: 'O', w: 75 }, { symbol: 'I', w: 70 }, { symbol: 'N', w: 67 }],
    note: 'Real letter frequencies: the code lengths track 1/p, and the average lands near the entropy of English.',
  },
  {
    id: 'dice', label: 'Loaded die', weights: [{ symbol: '1', w: 1 }, { symbol: '2', w: 1 }, { symbol: '3', w: 1 }, { symbol: '4', w: 1 }, { symbol: '5', w: 1 }, { symbol: '6', w: 3 }],
    note: 'Six outcomes but not uniform — Huffman finds a code whose average length is below log₂6 ≈ 2.585.',
  },
];

function huffmanLayout(root: HuffmanNode): {
  pos: Map<HuffmanNode, { x: number; y: number }>;
  links: { x1: number; y1: number; x2: number; y2: number; bit: string }[];
  leaves: number;
  maxDepth: number;
} {
  const pos = new Map<HuffmanNode, { x: number; y: number }>();
  let col = 0;
  let maxDepth = 0;
  const assign = (n: HuffmanNode, depth: number): number => {
    maxDepth = Math.max(maxDepth, depth);
    if (n.symbol !== undefined) {
      const x = col++;
      pos.set(n, { x, y: depth });
      return x;
    }
    const xs: number[] = [];
    if (n.left) xs.push(assign(n.left, depth + 1));
    if (n.right) xs.push(assign(n.right, depth + 1));
    const x = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : col++;
    pos.set(n, { x, y: depth });
    return x;
  };
  assign(root, 0);
  const links: { x1: number; y1: number; x2: number; y2: number; bit: string }[] = [];
  const collect = (n: HuffmanNode): void => {
    const kids: [HuffmanNode | undefined, string][] = [[n.left, '0'], [n.right, '1']];
    for (const [child, bit] of kids) {
      if (!child) continue;
      const a = pos.get(n);
      const b = pos.get(child);
      if (a && b) links.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, bit });
      collect(child);
    }
  };
  collect(root);
  return { pos, links, leaves: Math.max(1, col), maxDepth };
}

function HuffmanViz({ props }: { props?: Record<string, unknown> }) {
  const [presetId, setPresetId] = useState((props?.preset as string | undefined) ?? 'skew');
  const [weights, setWeights] = useState(() => {
    const p = HUFF_PRESETS.find((x) => x.id === ((props?.preset as string | undefined) ?? 'skew')) ?? HUFF_PRESETS[1];
    return p.weights.map((w) => ({ ...w }));
  });
  const [message, setMessage] = useState((props?.message as string | undefined) ?? 'AAAAAABCD');

  const freqs = useMemo(() => {
    const total = weights.reduce((s, w) => s + w.w, 0);
    return weights.map((w) => ({ symbol: w.symbol, p: total > 0 ? w.w / total : 0 }));
  }, [weights]);

  const huff = useMemo(() => huffmanCodes(freqs), [freqs]);
  const alphabet = useMemo(() => new Set(freqs.map((f) => f.symbol)), [freqs]);

  const symbolsInMessage = useMemo(
    () => message.split('').filter((c) => alphabet.has(c)).slice(0, 40),
    [message, alphabet],
  );
  const roundTrip = useMemo(() => {
    const bits = huffmanEncode(symbolsInMessage.join(''), huff.codes);
    return { bits, decoded: huffmanDecode(bits, huff.tree).text };
  }, [symbolsInMessage, huff]);

  const layout = useMemo(() => (huff.tree ? huffmanLayout(huff.tree) : null), [huff]);

  const fixedBits = Math.ceil(Math.log2(Math.max(2, freqs.filter((f) => f.p > 0).length)));
  const COL = 52;
  const ROW = 46;
  const treeW = layout ? 70 + layout.leaves * COL : 0;
  const treeH = layout ? 60 + layout.maxDepth * ROW : 0;
  const TX = (x: number): number => 34 + x * COL;
  const TY = (y: number): number => 26 + y * ROW;

  return (
    <VizShell
      title="Huffman coding"
      right={<span className="text-xs text-ink3 font-mono">avg {num(huff.avgLen, 3)} bits/symbol</span>}
    >
      <div className="flex flex-wrap gap-1.5">
        {HUFF_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => { setPresetId(p.id); setWeights(p.weights.map((w) => ({ ...w }))); }}
            className={`chip cursor-pointer ${presetId === p.id ? 'bg-bluel text-blue border-bluep' : 'hover:bg-paper2'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr),auto]">
        <div>
          <div className="overflow-x-auto slim-scroll">
            <svg viewBox={`0 0 ${treeW} ${Math.max(90, treeH)}`} className="min-w-[320px] w-full max-w-[640px] bg-white border border-line">
              {layout &&
                layout.links.map((l, i) => (
                  <g key={i}>
                    <line x1={TX(l.x1)} y1={TY(l.y1)} x2={TX(l.x2)} y2={TY(l.y2)} stroke="#D5D1C4" strokeWidth={1.4} />
                    <text
                      x={(TX(l.x1) + TX(l.x2)) / 2 + (l.bit === '0' ? -9 : 9)}
                      y={(TY(l.y1) + TY(l.y2)) / 2}
                      fontSize={10}
                      fill={SVG_BLUE}
                      fontFamily="ui-monospace, monospace"
                    >
                      {l.bit}
                    </text>
                  </g>
                ))}
              {layout &&
                [...layout.pos.entries()].map(([n, p], i) =>
                  n.symbol !== undefined ? (
                    <g key={i}>
                      <rect x={TX(p.x) - 17} y={TY(p.y) - 12} width={34} height={24} fill="#EAF1F7" stroke={SVG_BLUE} />
                      <text x={TX(p.x)} y={TY(p.y) + 4} fontSize={12} textAnchor="middle" fill={SVG_INK} fontFamily="ui-monospace, monospace" fontWeight={600}>
                        {n.symbol}
                      </text>
                      <text x={TX(p.x)} y={TY(p.y) + 26} fontSize={10} textAnchor="middle" fill={SVG_TERRA} fontFamily="ui-monospace, monospace">
                        {huff.codes[n.symbol]}
                      </text>
                    </g>
                  ) : (
                    <g key={i}>
                      <circle cx={TX(p.x)} cy={TY(p.y)} r={4.5} fill="#F4F1EA" stroke="#8A93A5" />
                      <text x={TX(p.x)} y={TY(p.y) - 10} fontSize={9} textAnchor="middle" fill="#66718A" fontFamily="ui-monospace, monospace">
                        {num(n.p, 2)}
                      </text>
                    </g>
                  ),
                )}
            </svg>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-ink2">
              message
              <input className="input !w-44 !py-1" value={message} onChange={(e) => setMessage(e.target.value.toUpperCase())} maxLength={40} />
            </label>
            <span className="text-[11px] text-ink3">
              only symbols {[...alphabet].join(', ')} are encoded
            </span>
          </div>
          <div className="mt-2 border border-line bg-paper2/40 p-2 font-mono text-[11px] leading-relaxed break-all text-ink2">
            <div className="text-ink3">symbols → codes</div>
            <div className="text-blue">{symbolsInMessage.map((s) => huff.codes[s]).join(' ')}</div>
            <div className="mt-1 text-ink3">stream ({roundTrip.bits.length} bits)</div>
            <div className="text-ink">{roundTrip.bits || '—'}</div>
            <div className="mt-1 text-ink3">
              decodes to{' '}
              <span className={roundTrip.decoded === symbolsInMessage.join('') ? 'text-moss' : 'text-terracotta'}>
                {roundTrip.decoded || '—'} {roundTrip.decoded === symbolsInMessage.join('') ? '✓ lossless' : '✗ mismatch'}
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-[15rem] lg:w-[17rem]">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border border-line bg-paper2 px-2 py-1 text-left">sym</th>
                <th className="border border-line bg-paper2 px-2 py-1 text-left">weight</th>
                <th className="border border-line bg-paper2 px-2 py-1 text-left">p</th>
                <th className="border border-line bg-paper2 px-2 py-1 text-left">code</th>
                <th className="border border-line bg-paper2 px-2 py-1 text-left">bits</th>
              </tr>
            </thead>
            <tbody>
              {weights.map((w, i) => (
                <tr key={w.symbol}>
                  <td className="border border-line px-2 py-1 font-mono font-semibold text-ink">{w.symbol}</td>
                  <td className="border border-line px-2 py-0.5">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={w.w}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setWeights((old) => old.map((o, j) => (j === i ? { ...o, w: v } : o)));
                        setPresetId('custom');
                      }}
                      className="w-16 accent-blue"
                    />
                  </td>
                  <td className="border border-line px-2 py-1 font-mono text-ink2">{num(freqs[i].p, 3)}</td>
                  <td className="border border-line px-2 py-1 font-mono text-blue">{huff.codes[w.symbol] ?? '—'}</td>
                  <td className="border border-line px-2 py-1 font-mono text-ink2">{huff.lengths[w.symbol] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-ink2">
            <span>entropy H</span><span className="font-mono text-ink text-right">{num(huff.entropy, 4)}</span>
            <span>average length</span><span className="font-mono text-blue text-right">{num(huff.avgLen, 4)}</span>
            <span>redundancy</span><span className="font-mono text-ink text-right">{num(huff.redundancy, 4)}</span>
            <span>longest code</span><span className="font-mono text-ink text-right">{huff.maxLen}</span>
            <span>fixed-width code</span><span className="font-mono text-ink text-right">{fixedBits} bits</span>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-ink3">
            {presetId === 'custom'
              ? 'Your own source. Huffman keeps the average length H ≤ L < H + 1, and the tree stays prefix-free.'
              : HUFF_PRESETS.find((p) => p.id === presetId)?.note}
          </p>
          <p className="mt-2 text-xs text-ink3">
            Prefix-free check: {isPrefixFree(huff.codes) ? 'no code is a prefix of another ✓' : 'collision ✗'} — that is what makes the
            stream decodable without separators.
          </p>
        </div>
      </div>
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
  'matrix-transform': MatrixTransformViz,
  taylor: TaylorViz,
  bayes: BayesViz,
  clt: CltViz,
  'gradient-descent': GradientDescentViz,
  huffman: HuffmanViz,
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
