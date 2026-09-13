// ---------------------------------------------------------------------------
// Linear algebra utilities (pure, no UI)
// ---------------------------------------------------------------------------

export type Mat2 = [number, number, number, number]; // row-major [[a,b],[c,d]]
export type Vec2 = [number, number];

export const mat2Mul = (A: Mat2, B: Mat2): Mat2 => [
  A[0] * B[0] + A[1] * B[2],
  A[0] * B[1] + A[1] * B[3],
  A[2] * B[0] + A[3] * B[2],
  A[2] * B[1] + A[3] * B[3],
];

export const mat2Vec = (A: Mat2, v: Vec2): Vec2 => [
  A[0] * v[0] + A[1] * v[1],
  A[2] * v[0] + A[3] * v[1],
];

export const det2 = (A: Mat2): number => A[0] * A[3] - A[1] * A[2];

export const inv2 = (A: Mat2): Mat2 | null => {
  const d = det2(A);
  if (Math.abs(d) < 1e-12) return null;
  return [A[3] / d, -A[1] / d, -A[2] / d, A[0] / d];
};

export const rot2 = (theta: number): Mat2 => {
  const c = Math.cos(theta), s = Math.sin(theta);
  return [c, -s, s, c];
};

export const scale2 = (sx: number, sy: number): Mat2 => [sx, 0, 0, sy];

export const eigen2 = (A: Mat2): {
  real: { lambda: number; vec: Vec2 }[];
  complex?: { re: number; im: number };
} => {
  const [a, b, c, d] = A;
  const tr = a + d;
  const det = a * d - b * c;
  const disc = tr * tr - 4 * det;
  if (disc >= -1e-12) {
    const sq = Math.sqrt(Math.max(0, disc));
    const l1 = (tr + sq) / 2;
    const l2 = (tr - sq) / 2;
    const vecFor = (l: number): Vec2 => {
      // solve (A - lI) v = 0
      const x = a - l, y = b, z = c, w = d - l;
      if (Math.abs(y) > 1e-9) return [y, l - a];
      if (Math.abs(z) > 1e-9) return [l - d, z];
      if (Math.abs(x) > 1e-9) return [0, 1];
      return [1, 0];
    };
    const norm = (v: Vec2): Vec2 => {
      const m = Math.hypot(v[0], v[1]) || 1;
      return [v[0] / m, v[1] / m];
    };
    const out: { lambda: number; vec: Vec2 }[] = [];
    out.push({ lambda: l1, vec: norm(vecFor(l1)) });
    if (Math.abs(l1 - l2) > 1e-9) out.push({ lambda: l2, vec: norm(vecFor(l2)) });
    return { real: out };
  }
  return {
    real: [],
    complex: { re: tr / 2, im: Math.sqrt(-disc) / 2 },
  };
};

// Gaussian elimination with partial pivoting; returns {rref, pivots, rank, freeVars}
export function rref(M: number[][]): { rref: number[][]; pivots: number[]; rank: number } {
  const rows = M.length;
  const cols = rows ? M[0].length : 0;
  const a = M.map((r) => [...r]);
  const pivots: number[] = [];
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    let pivot = r;
    for (let i = r + 1; i < rows; i++) {
      if (Math.abs(a[i][c]) > Math.abs(a[pivot][c])) pivot = i;
    }
    if (Math.abs(a[pivot][c]) < 1e-12) continue;
    [a[r], a[pivot]] = [a[pivot], a[r]];
    const pv = a[r][c];
    for (let j = c; j < cols; j++) a[r][j] /= pv;
    for (let i = 0; i < rows; i++) {
      if (i === r) continue;
      const f = a[i][c];
      if (Math.abs(f) < 1e-12) continue;
      for (let j = c; j < cols; j++) a[i][j] -= f * a[r][j];
    }
    pivots.push(c);
    r++;
  }
  return { rref: a, pivots, rank: r };
}

// Solve A x = b via rref (with augmented column). Returns solution or null.
export function solveLinear(A: number[][], b: number[]): number[] | null {
  const aug = A.map((row, i) => [...row, b[i]]);
  const { rref: M, pivots, rank } = rref(aug);
  const n = A[0]?.length ?? 0;
  const x = new Array<number>(n).fill(0);
  for (let i = 0; i < rank; i++) {
    x[pivots[i]] = M[i][n];
  }
  // check consistency for free vars
  for (let i = rank; i < M.length; i++) {
    if (Math.abs(M[i][n]) > 1e-9) return null;
  }
  return x;
}

export interface GElimStep {
  matrix: number[][];
  action: string;
  swap?: [number, number];
}

// Gaussian elimination trace (row-echelon, partial pivoting)
export function gaussianTrace(A: number[][], b: number[]): GElimStep[] {
  const n = A.length;
  const m = A[0]?.length ?? 0;
  const a = A.map((row) => [...row]);
  const bb = [...b];
  const steps: GElimStep[] = [];
  steps.push({ matrix: a.map((r) => [...r]), action: 'Augmented matrix [A | b].' });
  for (let c = 0; c < m; c++) {
    let pivot = c;
    for (let i = c + 1; i < n; i++) {
      if (Math.abs(a[i][c]) > Math.abs(a[pivot][c])) pivot = i;
    }
    if (Math.abs(a[pivot][c]) < 1e-12) continue;
    if (pivot !== c) {
      [a[c], a[pivot]] = [a[pivot], a[c]];
      [bb[c], bb[pivot]] = [bb[pivot], bb[c]];
      steps.push({ matrix: a.map((r) => [...r]), action: `Swap R${c + 1} ↔ R${pivot + 1} (partial pivoting).`, swap: [c, pivot] });
    }
    const pv = a[c][c];
    if (Math.abs(pv - 1) > 1e-12) {
      for (let j = c; j < m; j++) a[c][j] /= pv;
      bb[c] /= pv;
      steps.push({ matrix: a.map((r) => [...r]), action: `Scale R${c + 1} by 1/${round(pv)} to make the pivot 1.` });
    }
    for (let i = c + 1; i < n; i++) {
      const f = a[i][c];
      if (Math.abs(f) < 1e-12) continue;
      for (let j = c; j < m; j++) a[i][j] -= f * a[c][j];
      bb[i] -= f * bb[c];
      steps.push({ matrix: a.map((r) => [...r]), action: `R${i + 1} ← R${i + 1} − (${round(f)})·R${c + 1}.` });
    }
  }
  return steps;
}

const round = (x: number) => parseFloat(x.toFixed(6));

// Least squares: A (m×n), b (m) → x = (AᵀA)⁻¹Aᵀb (for small n, exact via elimination)
export function leastSquares(A: number[][], b: number[]): number[] | null {
  const m = A.length, n = A[0]?.length ?? 0;
  const At: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(0));
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) At[j][i] = A[i][j];
  const AtA: number[][] = mulM(At, A);
  const Atb: number[] = new Array<number>(n).fill(0);
  for (let j = 0; j < n; j++) for (let i = 0; i < m; i++) Atb[j] += At[j][i] * b[i];
  return solveLinear(AtA, Atb);
}

export function mulM(A: number[][], B: number[][]): number[][] {
  const m = A.length, k = A[0].length, n = B[0].length;
  const out = Array.from({ length: m }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let t = 0; t < k; t++) out[i][j] += A[i][t] * B[t][j];
  return out;
}

export function dot2(u: Vec2, v: Vec2): number { return u[0] * v[0] + u[1] * v[1]; }
export function cross2(u: Vec2, v: Vec2): number { return u[0] * v[1] - u[1] * v[0]; }
export function norm2(v: Vec2): number { return Math.hypot(v[0], v[1]); }
export function proj2(u: Vec2, v: Vec2): Vec2 {
  const d = dot2(v, v);
  if (d === 0) return [0, 0];
  const s = dot2(u, v) / d;
  return [s * v[0], s * v[1]];
}

// ---- 3D helpers ----
export type Vec3 = [number, number, number];
export const dot3 = (u: Vec3, v: Vec3): number => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
export const cross3 = (u: Vec3, v: Vec3): Vec3 => [
  u[1] * v[2] - u[2] * v[1],
  u[2] * v[0] - u[0] * v[2],
  u[0] * v[1] - u[1] * v[0],
];
export const norm3 = (v: Vec3): number => Math.hypot(v[0], v[1], v[2]);
