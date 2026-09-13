// ---------------------------------------------------------------------------
// Statistics / probability utilities (pure, no UI)
// ---------------------------------------------------------------------------

export function mean(xs: number[]): number {
  if (!xs.length) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function variance(xs: number[], sample = false): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const ss = xs.reduce((a, b) => a + (b - m) ** 2, 0);
  return ss / (sample ? xs.length - 1 : xs.length);
}

export function std(xs: number[], sample = false): number {
  return Math.sqrt(variance(xs, sample));
}

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function histogram(xs: number[], lo: number, hi: number, bins: number): { lo: number; hi: number; count: number }[] {
  const out = Array.from({ length: bins }, (_, i) => ({
    lo: lo + ((hi - lo) * i) / bins,
    hi: lo + ((hi - lo) * (i + 1)) / bins,
    count: 0,
  }));
  for (const x of xs) {
    if (x < lo || x > hi) continue;
    const i = Math.min(bins - 1, Math.floor(((x - lo) / (hi - lo)) * bins));
    out[i].count++;
  }
  return out;
}

// Normal PDF (fixed mu/sigma)
export const normalPdf = (x: number, mu = 0, sigma = 1): number =>
  Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));

export function erf(x: number): number {
  // Abramowitz & Stegun 7.1.26
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return sign * y;
}

export function normalCdf2(x: number, mu = 0, sigma = 1): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
}

// Binomial PMF
export function binomialPmf(k: number, n: number, p: number): number {
  return binom(n, k) * p ** k * (1 - p) ** (n - k);
}

export function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

export function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// Deterministic PRNG (mulberry32) for reproducible simulations
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface BernoulliRun {
  n: number;
  ones: number;
  prop: number;
  runningProp: number[]; // after each flip (log-spaced sampling)
}

export function coinRun(n: number, p: number, rng: () => number, sampleEvery = 0): BernoulliRun {
  let ones = 0;
  const runningProp: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (rng() < p) ones++;
    if (sampleEvery && (i % sampleEvery === 0 || i <= 5)) runningProp.push(ones / i);
    else if (!sampleEvery && i <= 2000) runningProp.push(ones / i);
  }
  return { n, ones, prop: ones / n, runningProp };
}

export function diceRun(n: number, rng: () => number): { counts: number[]; prop: number[] } {
  const counts = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < n; i++) counts[Math.floor(rng() * 6)]++;
  const prop = counts.map((c) => c / n);
  return { counts, prop };
}

export interface MontyHallRun { switchWins: number; stayWins: number; n: number }

export function montyHallRun(n: number, rng: () => number): MontyHallRun {
  let sw = 0, st = 0;
  for (let i = 0; i < n; i++) {
    const car = Math.floor(rng() * 3);
    const player = Math.floor(rng() * 3);
    const host = [0, 1, 2].filter((g) => g !== car && g !== player)[Math.floor(rng() * 1) === 1 ? 0 : Math.floor(rng() * 2)];
    // host reveals a goat: pick randomly from available goat doors
    const available = [0, 1, 2].filter((g) => g !== car && g !== player);
    const hostDoor = available[Math.floor(rng() * available.length)];
    const stayWin = player === car;
    const other = [0, 1, 2].filter((g) => g !== player && g !== hostDoor)[0];
    const switchWin = other === car;
    if (stayWin) st++;
    if (switchWin) sw++;
  }
  return { switchWins: sw, stayWins: st, n };
}

export function sampleMeans(n: number, k: number, rng: () => number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < k; j++) s += rng();
    out.push(s / k);
  }
  return out;
}

// Correlation (Pearson)
export function correlation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  const mx = mean(xs), my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  return num / Math.sqrt(dx * dy);
}

// Linear regression y = a + b x
export function linreg(xs: number[], ys: number[]): { a: number; b: number; r: number } {
  const n = Math.min(xs.length, ys.length);
  const mx = mean(xs), my = mean(ys);
  let sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
  const b = sxy / sxx;
  return { a: my - b * mx, b, r: correlation(xs, ys) };
}

// Entropy of a discrete distribution
export function entropy(probs: number[]): number {
  return probs.reduce((acc, p) => (p > 0 ? acc - p * Math.log2(p) : acc), 0);
}

// KL divergence D(P || Q)
export function klDivergence(p: number[], q: number[]): number {
  return p.reduce((acc, pi, i) => (pi > 0 ? acc + pi * Math.log2(pi / (q[i] || 1e-300)) : acc), 0);
}
