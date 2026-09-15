// ---------------------------------------------------------------------------
// Pure math backing the interactive visualizations.
//
// Everything here is DOM-free so tests/run.ts can verify the same numbers the
// UI displays. Components in components/viz.tsx only render these results.
// ---------------------------------------------------------------------------

import type { Mat2, Vec2 } from './linalg';
import { eigen2, det2, mat2Vec } from './linalg';
import { histogram, mean, std, normalPdf, mulberry32 } from './stat';
import { divisors, factorize, gcd, lcm } from './numbertheory';

/** A uniform-[0,1) generator, as returned by mulberry32. */
export type RNG = () => number;

// ===========================================================================
// 1. Taylor series
// ===========================================================================

export interface TaylorPreset {
  id: string;
  label: string;
  latex: string; // the function, for display
  center: number;
  coeffs: number[]; // coeffs[k] multiplies (x - center)^k
  fn: (x: number) => number;
  interval: [number, number]; // where the comparison plot is meaningful
  note: string;
}

const fact = (n: number): number => {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
};

/** Coefficients of exp(x) up to order `n`. */
export const expCoeffs = (n: number): number[] =>
  Array.from({ length: n + 1 }, (_, k) => 1 / fact(k));

/** Coefficients of sin(x): only odd powers, signs +, -, +, - for k = 1, 3, 5, 7, … */
export const sinCoeffs = (n: number): number[] =>
  Array.from({ length: n + 1 }, (_, k) =>
    k % 2 === 1 ? (((k - 1) / 2) % 2 === 0 ? 1 : -1) / fact(k) : 0,
  );

/** Coefficients of cos(x): only even powers, signs +, -, +, - for k = 0, 2, 4, 6, … */
export const cosCoeffs = (n: number): number[] =>
  Array.from({ length: n + 1 }, (_, k) =>
    k % 2 === 0 ? ((k / 2) % 2 === 0 ? 1 : -1) / fact(k) : 0,
  );

/** Coefficients of ln(1+x): x - x²/2 + x³/3 - ... (converges on (-1, 1]). */
export const ln1pCoeffs = (n: number): number[] =>
  Array.from({ length: n + 1 }, (_, k) => (k === 0 ? 0 : (k % 2 === 1 ? 1 : -1) / k));

/** Coefficients of 1/(1-x): all ones (geometric series, converges on (-1, 1)). */
export const geometricCoeffs = (n: number): number[] => Array.from({ length: n + 1 }, () => 1);

export const TAYLOR_PRESETS: TaylorPreset[] = [
  {
    id: 'exp', label: 'exp x', latex: 'e^{x}', center: 0,
    coeffs: expCoeffs(12), fn: (x) => Math.exp(x), interval: [-3, 3],
    note: 'The factorial denominator beats every polynomial, so the series converges for all x.',
  },
  {
    id: 'sin', label: 'sin x', latex: '\\sin x', center: 0,
    coeffs: sinCoeffs(13), fn: (x) => Math.sin(x), interval: [-6.3, 6.3],
    note: 'Odd powers only. Near x = 0 the fit is excellent; the further you slide out toward ±2π, the later the polynomial catches up.',
  },
  {
    id: 'cos', label: 'cos x', latex: '\\cos x', center: 0,
    coeffs: cosCoeffs(12), fn: (x) => Math.cos(x), interval: [-6.3, 6.3],
    note: 'Even powers only, so the Taylor polynomial is an even function — exactly like cos itself. Compare the local window with the full one.',
  },
  {
    id: 'ln1p', label: 'ln(1+x)', latex: '\\ln(1+x)', center: 0,
    coeffs: ln1pCoeffs(12), fn: (x) => Math.log(1 + x), interval: [-0.9, 1],
    note: 'Converges only for -1 < x ≤ 1 — step outside and the partial sums run away.',
  },
  {
    id: 'geom', label: '1/(1-x)', latex: '\\dfrac{1}{1-x}', center: 0,
    coeffs: geometricCoeffs(12), fn: (x) => 1 / (1 - x), interval: [-0.9, 0.9],
    note: 'The geometric series: the partial sum is exactly (1-x^{n+1})/(1-x).',
  },
];

export const getTaylorPreset = (id: string): TaylorPreset =>
  TAYLOR_PRESETS.find((p) => p.id === id) ?? TAYLOR_PRESETS[0];

/** Horner evaluation of a polynomial given low-to-high coefficients. */
export function polyEval(coeffs: number[], x: number): number {
  let acc = 0;
  for (let k = coeffs.length - 1; k >= 0; k--) acc = acc * x + coeffs[k];
  return acc;
}

/** The degree-`order` Taylor polynomial of a preset, evaluated at x. */
export function taylorApprox(preset: TaylorPreset, order: number, x: number): number {
  const n = Math.max(0, Math.min(order, preset.coeffs.length - 1));
  return polyEval(preset.coeffs.slice(0, n + 1), x - preset.center);
}

/** The k-th non-zero term of the series: a_k (x-c)^k. */
export function taylorTerm(preset: TaylorPreset, k: number, x: number): number {
  if (k < 0 || k >= preset.coeffs.length) return 0;
  return preset.coeffs[k] * (x - preset.center) ** k;
}

/**
 * Max |f(x) - P_n(x)| sampled over `range` (defaults to the preset's interval).
 * Pass a narrow range to measure local accuracy, or the full window to see the
 * polynomial peel away from f once you leave the neighbourhood of the centre.
 */
export function taylorError(preset: TaylorPreset, order: number, range?: [number, number], samples = 400): number {
  const [lo, hi] = range ?? preset.interval;
  let worst = 0;
  for (let i = 0; i <= samples; i++) {
    const x = lo + ((hi - lo) * i) / samples;
    const err = Math.abs(preset.fn(x) - taylorApprox(preset, order, x));
    if (Number.isFinite(err)) worst = Math.max(worst, err);
  }
  return worst;
}

/** Sample [x, f(x)] pairs for plotting. */
export function sampleFn(f: (x: number) => number, lo: number, hi: number, n = 240): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n;
    out.push([x, f(x)]);
  }
  return out;
}

// ===========================================================================
// 2. Bayes / natural frequencies
// ===========================================================================

export interface BayesInput {
  prior: number; // P(H)
  sensitivity: number; // P(+ | H)
  specificity: number; // P(- | not H)
}

export interface BayesResult {
  population: number;
  tp: number; // true positives
  fn: number; // false negatives
  fp: number; // false positives
  tn: number; // true negatives
  pPositive: number; // P(+)
  posterior: number; // P(H | +)
  falseDiscovery: number; // P(not H | +) = 1 - posterior
}

/** Natural-frequency computation of Bayes' rule over a hypothetical population. */
export function bayes(input: BayesInput, population = 10000): BayesResult {
  const { prior, sensitivity, specificity } = input;
  const withH = prior * population;
  const withoutH = population - withH;
  const tp = withH * sensitivity;
  const fn = withH * (1 - sensitivity);
  const fp = withoutH * (1 - specificity);
  const tn = withoutH * specificity;
  const positives = tp + fp;
  const posterior = positives > 0 ? tp / positives : 0;
  return {
    population, tp, fn, fp, tn,
    pPositive: positives / population,
    posterior,
    falseDiscovery: 1 - posterior,
  };
}

/** Rounded counts (for drawing dots) that still sum to the population. */
export function bayesCounts(r: BayesResult): { tp: number; fp: number; fn: number; tn: number } {
  const tp = Math.round(r.tp);
  const fp = Math.round(r.fp);
  const fn = Math.round(r.fn);
  const tn = r.population - tp - fp - fn;
  return { tp, fp, fn, tn };
}

// ===========================================================================
// 3. Huffman coding
// ===========================================================================

export interface SymbolFreq {
  symbol: string;
  p: number;
}

export interface HuffmanNode {
  symbol?: string;
  p: number;
  order: number; // insertion order, for deterministic tie-breaking
  left?: HuffmanNode;
  right?: HuffmanNode;
}

export interface HuffmanResult {
  codes: Record<string, string>;
  lengths: Record<string, number>;
  avgLen: number;
  entropy: number;
  redundancy: number; // avgLen - entropy, always >= 0
  maxLen: number;
  tree: HuffmanNode | null;
}

const symbolEntropy = (ps: number[]): number => {
  let h = 0;
  for (const p of ps) if (p > 0) h -= p * Math.log2(p);
  return h;
};

/**
 * Huffman tree by repeated merging of the two least likely symbols.
 * Ties are broken by insertion order so the tree (and therefore the demo) is
 * reproducible run to run.
 */
export function huffmanTree(freqs: SymbolFreq[]): HuffmanNode | null {
  const leaves: HuffmanNode[] = freqs
    .filter((f) => f.p > 0)
    .map((f, i) => ({ symbol: f.symbol, p: f.p, order: i }));
  if (leaves.length === 0) return null;
  if (leaves.length === 1) return leaves[0];

  const pool = [...leaves];
  let next = leaves.length;
  while (pool.length > 1) {
    pool.sort((a, b) => (a.p !== b.p ? a.p - b.p : a.order - b.order));
    const left = pool.shift()!;
    const right = pool.shift()!;
    pool.push({
      p: left.p + right.p,
      order: next++,
      left,
      right,
    });
  }
  return pool[0];
}

export function huffmanCodes(freqs: SymbolFreq[]): HuffmanResult {
  const tree = huffmanTree(freqs);
  const codes: Record<string, string> = {};
  const lengths: Record<string, number> = {};

  const walk = (node: HuffmanNode, prefix: string): void => {
    if (node.symbol !== undefined) {
      codes[node.symbol] = prefix || '0'; // single-symbol alphabet
      lengths[node.symbol] = Math.max(1, prefix.length);
      return;
    }
    if (node.left) walk(node.left, prefix + '0');
    if (node.right) walk(node.right, prefix + '1');
  };
  if (tree) walk(tree, '');

  const ps = freqs.filter((f) => f.p > 0).map((f) => f.p);
  const entropy = symbolEntropy(ps);
  let avgLen = 0;
  for (const f of freqs) {
    if (f.p > 0 && codes[f.symbol] !== undefined) avgLen += f.p * lengths[f.symbol];
  }
  const maxLen = Math.max(0, ...Object.values(lengths));
  return { codes, lengths, avgLen, entropy, redundancy: avgLen - entropy, maxLen, tree };
}

/** Encode a message one symbol at a time (symbols must exist in `codes`). */
export function huffmanEncode(message: string, codes: Record<string, string>): string {
  let out = '';
  for (const ch of message) out += codes[ch] ?? '';
  return out;
}

/** Verify that no code is a prefix of another — the property that makes it decodable. */
export function isPrefixFree(codes: Record<string, string>): boolean {
  const list = Object.entries(codes);
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < list.length; j++) {
      if (i === j) continue;
      if (list[j][1].startsWith(list[i][1])) return false;
    }
  }
  return true;
}

/** Decode a bit string by walking the tree; stops at the first impossible bit. */
export function huffmanDecode(bits: string, tree: HuffmanNode | null): { text: string; consumed: number } {
  if (!tree || tree.symbol !== undefined) return { text: '', consumed: 0 };
  let node = tree;
  let text = '';
  let consumed = 0;
  for (const bit of bits) {
    node = (bit === '0' ? node.left : node.right) ?? node;
    consumed++;
    if (node.symbol !== undefined) {
      text += node.symbol;
      node = tree;
    }
  }
  return { text, consumed };
}

// ===========================================================================
// 4. Central limit theorem
// ===========================================================================

export interface Population {
  id: string;
  label: string;
  mean: number;
  sd: number;
  draw: (rng: RNG) => number;
  shape: string; // describes the population's shape
}

/** Box–Muller transform, pulling two uniforms for one normal. */
export function normalDraw(rng: RNG, mu = 0, sigma = 1): number {
  let u = rng();
  if (u === 0) u = 1e-12;
  const v = rng();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mu + sigma * z;
}

export const POPULATIONS: Population[] = [
  { id: 'uniform', label: 'Uniform(0,1)', mean: 0.5, sd: 1 / Math.sqrt(12), shape: 'flat', draw: (r) => r() },
  {
    id: 'dice', label: 'One fair die', mean: 3.5, sd: Math.sqrt(35 / 12), shape: 'discrete & flat',
    draw: (r) => 1 + Math.floor(r() * 6),
  },
  {
    id: 'exponential', label: 'Exponential(1)', mean: 1, sd: 1, shape: 'strongly skewed',
    draw: (r) => {
      let u = r();
      if (u === 0) u = 1e-12;
      return -Math.log(u);
    },
  },
  {
    id: 'bimodal', label: 'Bimodal mixture', mean: 2.5, sd: Math.sqrt(2.41), shape: 'two humps',
    draw: (r) => (r() < 0.5 ? normalDraw(r, 1, 0.4) : normalDraw(r, 4, 0.4)),
  },
];

export const getPopulation = (id: string): Population =>
  POPULATIONS.find((p) => p.id === id) ?? POPULATIONS[0];

export interface CltRun {
  means: number[];
  hist: { lo: number; hi: number; count: number }[];
  meanOfMeans: number;
  sdOfMeans: number;
  theoreticalSe: number;
}

/**
 * Draw `samples` sample-means, each from `n` draws of the chosen population.
 * The seed makes the demo reproducible (and testable).
 */
export function cltRun(opts: { populationId: string; n: number; samples: number; seed: number }): CltRun {
  const { populationId, n, samples, seed } = opts;
  const pop = getPopulation(populationId);
  const rng = mulberry32(seed);
  const means: number[] = [];
  for (let s = 0; s < samples; s++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += pop.draw(rng);
    means.push(sum / n);
  }
  const m = mean(means);
  const sd = std(means); // population sd of the means
  const se = pop.sd / Math.sqrt(n);
  const lo = m - 4 * se;
  const hi = m + 4 * se;
  return { means, hist: histogram(means, lo, hi, 34), meanOfMeans: m, sdOfMeans: sd, theoreticalSe: se };
}

/** Normal density curve scaled to the tallest histogram bar, for overlay drawing. */
export function normalOverlay(
  hist: { lo: number; hi: number; count: number }[],
  mu: number,
  sigma: number,
): number[] {
  const width = hist.length > 0 ? hist[0].hi - hist[0].lo : 1;
  const total = hist.reduce((s, b) => s + b.count, 0);
  const barArea = total * width;
  return hist.map((b) => normalPdf((b.lo + b.hi) / 2, mu, sigma) * barArea);
}

// ===========================================================================
// 5. Gradient descent
// ===========================================================================

export interface Landscape {
  id: string;
  label: string;
  latex: string;
  fn: (x: number, y: number) => number;
  grad: (x: number, y: number) => Vec2;
  domain: number; // half-width of the square plotting window, [-d, d]
  start: Vec2;
  min: Vec2;
  lrHint: number;
  note: string;
}

export const LANDSCAPES: Landscape[] = [
  {
    id: 'bowl', label: 'Round bowl', latex: 'x^{2}+y^{2}', domain: 3, start: [-2.6, 2.4], min: [0, 0], lrHint: 0.15,
    fn: (x, y) => x * x + y * y,
    grad: (x, y) => [2 * x, 2 * y],
    note: 'Well-conditioned. Any learning rate below 1/(2λmax) walks straight in.',
  },
  {
    id: 'ravine', label: 'Ravine', latex: 'x^{2}+12y^{2}', domain: 3, start: [-2.7, 2.2], min: [0, 0], lrHint: 0.03,
    fn: (x, y) => x * x + 12 * y * y,
    grad: (x, y) => [2 * x, 24 * y],
    note: 'Curvature differs 12× between axes: big steps zig-zag across the narrow direction.',
  },
  {
    id: 'banana', label: 'Rosenbrock', latex: '(1-x)^{2}+100(y-x^{2})^{2}', domain: 1.6, start: [-1.3, 1.0], min: [1, 1], lrHint: 0.002,
    fn: (x, y) => (1 - x) ** 2 + 100 * (y - x * x) ** 2,
    grad: (x, y) => [-2 * (1 - x) - 400 * x * (y - x * x), 200 * (y - x * x)],
    note: 'The classic test: a curved valley where gradients are enormous near the walls.',
  },
  {
    id: 'doublewell', label: 'Two wells', latex: '(x^{2}-1)^{2}+y^{2}', domain: 1.8, start: [0.15, 1.4], min: [1, 0], lrHint: 0.04,
    fn: (x, y) => (x * x - 1) ** 2 + y * y,
    grad: (x, y) => [4 * x * (x * x - 1), 2 * y],
    note: 'Non-convex: descent commits to whichever well it happens to fall into.',
  },
];

export const getLandscape = (id: string): Landscape =>
  LANDSCAPES.find((l) => l.id === id) ?? LANDSCAPES[0];

export interface GdStep {
  x: number;
  y: number;
  loss: number;
  gradNorm: number;
}

export interface GdRun {
  path: GdStep[];
  diverged: boolean;
  converged: boolean;
  final: GdStep;
  distanceToMin: number;
}

/** Vanilla gradient descent: θ ← θ - lr·∇f(θ), recording every iterate. */
export function gdRun(landscape: Landscape, opts: { lr: number; steps: number; start?: Vec2 }): GdRun {
  const { lr, steps } = opts;
  let [x, y] = opts.start ?? landscape.start;
  const path: GdStep[] = [];
  let diverged = false;
  let converged = false;

  const record = (): GdStep => {
    const [gx, gy] = landscape.grad(x, y);
    return { x, y, loss: landscape.fn(x, y), gradNorm: Math.hypot(gx, gy) };
  };

  path.push(record());
  for (let i = 0; i < steps; i++) {
    const [gx, gy] = landscape.grad(x, y);
    x -= lr * gx;
    y -= lr * gy;
    const s = record();
    if (!Number.isFinite(s.loss) || !Number.isFinite(s.x) || !Number.isFinite(s.y)) {
      diverged = true;
      break;
    }
    path.push(s);
    if (s.gradNorm < 1e-6) {
      converged = true;
      break;
    }
  }

  const final = path[path.length - 1];
  const distanceToMin = Math.hypot(final.x - landscape.min[0], final.y - landscape.min[1]);
  if (!Number.isFinite(final.loss) || Math.abs(final.x) > 1e6 || Math.abs(final.y) > 1e6) diverged = true;
  return { path, diverged, converged, final, distanceToMin };
}

// ===========================================================================
// 6. Linear maps of the plane
// ===========================================================================

export interface MapPreset {
  id: string;
  label: string;
  matrix: Mat2;
  note: string;
}

export const MAP_PRESETS: MapPreset[] = [
  { id: 'identity', label: 'Identity', matrix: [1, 0, 0, 1], note: 'Does nothing: every vector is already an eigenvector.' },
  {
    id: 'rotate', label: 'Rotate 30°',
    matrix: [Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6), Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)],
    note: 'No real eigenvectors — every direction turns, and det = 1 so areas are untouched.',
  },
  { id: 'shear', label: 'Shear', matrix: [1, 1, 0, 1], note: 'det = 1: areas preserved, the y-axis is a line of fixed points.' },
  { id: 'stretch', label: 'Stretch (2, 1)', matrix: [2, 0, 0, 1], note: 'Diagonal: eigenvectors are the axes, eigenvalues 2 and 1.' },
  { id: 'reflect', label: 'Reflect in y-axis', matrix: [-1, 0, 0, 1], note: 'det = -1: orientation flips, area is unchanged in absolute value.' },
  { id: 'squash', label: 'Project onto x-axis', matrix: [1, 0, 0, 0], note: 'Singular (det = 0): the whole plane collapses onto a line, so it is not invertible.' },
  { id: 'golden', label: 'Rotate and stretch', matrix: [1.5, -0.5, 0.5, 1.5], note: 'Complex eigenvalues 1.5 ± 0.5i: a rotation composed with a scaling.' },
];

export const getMapPreset = (id: string): MapPreset =>
  MAP_PRESETS.find((m) => m.id === id) ?? MAP_PRESETS[0];

export interface MapInfo {
  det: number;
  trace: number;
  areaScale: number;
  orientationFlipped: boolean;
  singular: boolean;
  eigenvalues: { lambda: number; vec: Vec2 }[];
  complex?: { re: number; im: number } | undefined;
}

export function mapInfo(m: Mat2): MapInfo {
  const det = det2(m);
  const eig = eigen2(m);
  return {
    det,
    trace: m[0] + m[3],
    areaScale: Math.abs(det),
    orientationFlipped: det < 0,
    singular: Math.abs(det) < 1e-9,
    eigenvalues: eig.real,
    complex: eig.complex,
  };
}

export const applyMap = (m: Mat2, p: Vec2): Vec2 => mat2Vec(m, p);

/** The image of the unit square under the map — a parallelogram. */
export function transformedUnitSquare(m: Mat2): Vec2[] {
  return ([[0, 0], [1, 0], [1, 1], [0, 1]] as Vec2[]).map((p) => applyMap(m, p));
}

/** Twice the area of a polygon, by the shoelace formula. */
export function polygonArea2(pts: Vec2[]): number {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum;
}

/** Change in a vector's direction after the map, in degrees (0 for eigenvectors). */
export function turnDegrees(m: Mat2, v: Vec2): number {
  const w = applyMap(m, v);
  const dot = v[0] * w[0] + v[1] * w[1];
  const na = Math.hypot(v[0], v[1]);
  const nb = Math.hypot(w[0], w[1]);
  if (na < 1e-12 || nb < 1e-12) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, dot / (na * nb)))) * 180) / Math.PI;
}

// ===========================================================================
// 14. Lattices — Hasse diagrams, meets, joins
// ===========================================================================
//
// A lattice is a poset in which every pair has a join (least upper bound) and
// a meet (greatest lower bound). The presets are the three classic small
// lattices: D36 (divisors of 36 = 2^2*3^2, a 3x3 exponent grid), D30 (divisors
// of 30 = 2*3*5, the Boolean lattice B3, a cube), and N5 (the pentagon, the
// smallest non-distributive lattice).
//
// Divisor lattices are built generically: a divisor of n is a vector of prime
// exponents, its rank is the total number of prime factors counted with
// multiplicity, and a cover step multiplies by exactly one prime. Meet is
// gcd, join is lcm.

export interface LatticeElement {
  label: string;
  /** normalized horizontal position in [0, 1] */
  x: number;
  /** normalized vertical position in [0, 1], 0 = bottom */
  y: number;
}

export interface LatticePreset {
  id: string;
  label: string;
  /** short label for the preset chips */
  short: string;
  kind: string;
  /** display names of the lattice operations, e.g. ['gcd', 'lcm'] */
  ops: [string, string];
  elements: LatticeElement[];
  /** Hasse cover edges as [lower, upper] index pairs */
  covers: [number, number][];
  /** meet[i][j] = index of element a_i ∧ a_j */
  meet: number[][];
  /** join[i][j] = index of element a_i ∨ a_j */
  join: number[][];
  /** rank (height above the bottom element) of each element */
  rank: number[];
  complete: boolean;
  distributive: boolean;
  /** labels of the bottom and top element, when they exist */
  bottom?: string;
  top?: string;
  note: string;
}

export interface DivisorLattice {
  n: number;
  primes: number[];
  /** divisors of n, ascending */
  elements: number[];
  /** exponents of primes[k] in elements[i] */
  exponents: number[][];
  /** total number of prime factors (with multiplicity) of elements[i] */
  rank: number[];
  /** cover edges as [lower, upper] values */
  covers: [number, number][];
}

/**
 * The divisor lattice D_n. A cover is exactly one prime factor added, so the
 * rank of a divisor is its total number of prime factors. Throws when n has
 * more than three distinct primes (nothing beyond that has a 2-D layout here).
 */
export function divisorLattice(n: number): DivisorLattice {
  const counts = new Map<number, number>();
  for (const p of factorize(n)) counts.set(p, (counts.get(p) ?? 0) + 1);
  const primes = [...counts.keys()].sort((a, b) => a - b);
  if (primes.length > 3) throw new Error(`divisorLattice: ${n} has more than three distinct prime factors`);
  const elements = divisors(n);
  const exponents: number[][] = elements.map((d) => {
    let rem = d;
    return primes.map((p) => {
      let e = 0;
      while (rem % p === 0) {
        rem /= p;
        e++;
      }
      return e;
    });
  });
  const rank = exponents.map((v) => v.reduce((s, e) => s + e, 0));
  const covers: [number, number][] = [];
  for (const d of elements) {
    for (const p of primes) if (n % (d * p) === 0) covers.push([d, d * p]);
  }
  return { n, primes, elements, exponents, rank, covers };
}

/** Normalized (x, y) layout for the divisor lattice of n. */
function divisorLayout(L: DivisorLattice): { x: number; y: number }[] {
  const maxRank = Math.max(...L.rank);
  const y = (r: number): number => 0.08 + (0.84 * r) / maxRank;
  const k = L.primes.length;
  // One horizontal "lane" per prime factor; lanes span [0.14, 0.86].
  const lane = (t: number): number => 0.5 + (0.36 * (2 * t - (k - 1))) / (k - 1 || 1);
  const span0 = L.exponents.reduce((m, w) => Math.max(m, w[0] ?? 0), 0);
  const span1 = L.exponents.reduce((m, w) => Math.max(m, w[1] ?? 0), 0);
  return L.exponents.map((v, i) => {
    let x: number;
    if (k === 1) {
      x = 0.5;
    } else if (k === 2) {
      // two primes: the position slides with the normalized exponent difference,
      // so 36's 3x3 grid lands on five evenly spaced columns
      x = 0.5 + 0.36 * (v[0] / span0 - v[1] / span1);
    } else {
      const used = v.map((e, t) => (e > 0 ? lane(t) : NaN)).filter((l) => Number.isFinite(l));
      x = used.length ? used.reduce((s, l) => s + l, 0) / used.length : 0.5;
    }
    return { x, y: y(L.rank[i]) };
  });
}

/** Meet/join index tables for a divisor lattice: gcd and lcm. */
function divisorTables(L: DivisorLattice): { meet: number[][]; join: number[][] } {
  const idx = new Map(L.elements.map((d, i) => [d, i] as const));
  const meet: number[][] = [];
  const join: number[][] = [];
  for (let i = 0; i < L.elements.length; i++) {
    const mi: number[] = [];
    const ji: number[] = [];
    for (let j = 0; j < L.elements.length; j++) {
      mi.push(idx.get(gcd(L.elements[i], L.elements[j]))!);
      ji.push(idx.get(lcm(L.elements[i], L.elements[j]))!);
    }
    meet.push(mi);
    join.push(ji);
  }
  return { meet, join };
}

const sub = (s: string): string =>
  s.split('').map((c) => '₀₁₂₃₄₅₆₇₈₉'[Number(c)] ?? c).join('');

function divisorPreset(id: string, n: number, short: string, kind: string, note: string, distributive: boolean): LatticePreset {
  const L = divisorLattice(n);
  const { meet, join } = divisorTables(L);
  const pos = divisorLayout(L);
  return {
    id,
    label: `D${sub(String(n))}`,
    short,
    kind,
    ops: ['gcd', 'lcm'],
    elements: L.elements.map((d, i) => ({ label: String(d), x: pos[i].x, y: pos[i].y })),
    covers: L.covers.map(([lo, hi]) => [L.elements.indexOf(lo), L.elements.indexOf(hi)] as [number, number]),
    meet,
    join,
    rank: L.rank,
    complete: true,
    distributive,
    bottom: '1',
    top: String(n),
    note,
  };
}

/** The pentagon N5: 0 < a < 1 and 0 < b < c < 1, with a incomparable to b and c. */
const N5_PRESET: LatticePreset = (() => {
  const elements: LatticeElement[] = [
    { label: '0', x: 0.5, y: 0.08 },
    { label: 'a', x: 0.18, y: 0.38 },
    { label: 'b', x: 0.5, y: 0.38 },
    { label: 'c', x: 0.5, y: 0.66 },
    { label: '1', x: 0.5, y: 0.92 },
  ];
  // indices: 0 = bottom, 1 = a, 2 = b, 3 = c, 4 = top
  const covers: [number, number][] = [[0, 1], [0, 2], [2, 3], [3, 4], [1, 4]];
  const meet: number[][] = [
    [0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1],
    [0, 0, 2, 2, 2],
    [0, 0, 2, 3, 3],
    [0, 1, 2, 3, 4],
  ];
  const join: number[][] = [
    [0, 1, 2, 3, 4],
    [1, 1, 4, 4, 4],
    [2, 4, 2, 3, 4],
    [3, 4, 3, 3, 4],
    [4, 4, 4, 4, 4],
  ];
  return {
    id: 'n5',
    label: 'N₅',
    short: 'pentagon',
    kind: 'the pentagon — smallest non-distributive lattice',
    ops: ['∧', '∨'],
    elements,
    covers,
    meet,
    join,
    rank: [0, 1, 1, 2, 3],
    complete: true,
    distributive: false,
    bottom: '0',
    top: '1',
    note: 'The distributive law fails here: c ∧ (a ∨ b) = c, while (c ∧ a) ∨ (c ∧ b) = b. A lattice is distributive exactly when it contains neither N₅ nor M₃ (the diamond) as a sublattice.',
  };
})();

export const LATTICE_PRESETS: LatticePreset[] = [
  divisorPreset(
    'd36', 36, '3×3 grid',
    'divisors of 36 = 2²·3² — a 3×3 exponent grid',
    'Each divisor sits in a grid cell 2^i·3^j. The meet takes the smaller exponent in each axis (gcd), the join the larger (lcm). Grids are distributive but not Boolean — for instance, 4 has no complement.',
    true,
  ),
  divisorPreset(
    'd30', 30, 'cube B₃',
    'divisors of 30 = 2·3·5 — the Boolean lattice B₃ (a cube)',
    'Each divisor is a subset of {2, 3, 5}: the meet is gcd (intersection of prime sets), the join is lcm (union). Every element has a unique complement — its "opposite" corner, the product that gives 30 — which is what makes B₃ a Boolean algebra.',
    true,
  ),
  N5_PRESET,
];

export const getLatticePreset = (id: string): LatticePreset =>
  LATTICE_PRESETS.find((p) => p.id === id) ?? LATTICE_PRESETS[0];
