// ---------------------------------------------------------------------------
// Number theory utilities (pure, no UI)
// ---------------------------------------------------------------------------

export function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

// Extended Euclid: returns {g, x, y} with a*x + b*y = g = gcd(a,b)
export function egcd(a: number, b: number): { g: number; x: number; y: number } {
  if (b === 0) return { g: Math.abs(a), x: Math.sign(a) || 1, y: 0 };
  const r = egcd(b, a % b);
  return { g: r.g, x: r.y, y: r.x - Math.floor(a / b) * r.y };
}

export function modPow(base: number, exp: number, m: number): number {
  if (m === 1) return 0;
  base = ((base % m) + m) % m;
  let result = 1;
  let b = base;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1;
  }
  return result;
}

// modular inverse of a mod m (gcd must be 1); returns null if none
export function modInverse(a: number, m: number): number | null {
  const r = egcd(a, m);
  if (r.g !== 1) return null;
  return ((r.x % m) + m) % m;
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

export function primesUpTo(n: number): number[] {
  return sieve(n).filter((p) => p !== -1);
}

// Returns array of length n+1; index i = i if prime, else -1
export function sieve(n: number): number[] {
  const res = new Array<number>(n + 1).fill(-1);
  const isP = new Array<boolean>(n + 1).fill(true);
  isP[0] = isP[1] = false;
  for (let i = 2; i * i <= n; i++) {
    if (isP[i]) {
      for (let j = i * i; j <= n; j += i) isP[j] = false;
    }
  }
  for (let i = 2; i <= n; i++) if (isP[i]) res[i] = i;
  return res;
}

export interface SieveStep {
  prime: number;
  crossed: number[];
  remaining: number[];
}

export function sieveSteps(n: number): SieveStep[] {
  const steps: SieveStep[] = [];
  const struck = new Set<number>();
  let remaining: number[] = [];
  const collect = () => {
    remaining = [];
    for (let i = 2; i <= n; i++) if (!struck.has(i)) remaining.push(i);
  };
  collect();
  for (let p = 2; p * p <= n; p++) {
    if (struck.has(p)) continue;
    const crossed: number[] = [];
    for (let j = p * 2; j <= n; j += p) {
      if (!struck.has(j)) { struck.add(j); crossed.push(j); }
    }
    collect();
    steps.push({ prime: p, crossed, remaining });
  }
  return steps;
}

export interface EuclidStep { a: number; b: number; q: number; r: number }

export function euclidSteps(a: number, b: number): EuclidStep[] {
  const steps: EuclidStep[] = [];
  let x = Math.abs(a), y = Math.abs(b);
  if (y === 0) { steps.push({ a: x, b: 0, q: 0, r: 0 }); return steps; }
  while (y !== 0) {
    const q = Math.floor(x / y);
    const r = x % y;
    steps.push({ a: x, b: y, q, r });
    x = y; y = r;
  }
  return steps;
}

export function factorize(n: number): number[] {
  const factors: number[] = [];
  let m = Math.abs(n);
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) { factors.push(p); m /= p; }
  }
  if (m > 1) factors.push(m);
  return factors;
}

export function primeFactorMap(n: number): [number, number][] {
  const fs = factorize(n);
  const map = new Map<number, number>();
  for (const f of fs) map.set(f, (map.get(f) || 0) + 1);
  return [...map.entries()];
}

// Number of divisors from prime factorization exponents
export function numDivisorsFromFactors(factors: [number, number][]): number {
  return factors.reduce((acc, [, e]) => acc * (e + 1), 1);
}

// Sum of divisors
export function sumDivisorsFromFactors(factors: [number, number][]): number {
  return factors.reduce((acc, [p, e]) => {
    let s = 1;
    for (let i = 1; i <= e; i++) s *= p;
    return acc * s;
  }, 1);
}

export function divisors(n: number): number[] {
  const out: number[] = [];
  const root = Math.floor(Math.sqrt(n));
  for (let i = 1; i <= root; i++) {
    if (n % i === 0) {
      out.push(i);
      if (i !== n / i) out.push(n / i);
    }
  }
  return out.sort((a, b) => a - b);
}

// Euler totient
export function phi(n: number): number {
  let m = n, result = n;
  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      while (m % p === 0) m /= p;
      result -= result / p;
    }
  }
  if (m > 1) result -= result / m;
  return result;
}

export interface RSAResult {
  p: number; q: number; n: number; phi: number; e: number; d: number;
  edModPhi: number;
  encrypt: (m: number) => number;
  decrypt: (c: number) => number;
  table: { m: number; c: number; mRec: number }[];
}

export function rsaSetup(p: number, q: number, e?: number): RSAResult | { error: string } {
  if (!isPrime(p) || p === q) return { error: 'p and q must be distinct primes.' };
  if (!isPrime(q)) return { error: 'p and q must be distinct primes.' };
  const n = p * q;
  const ph = (p - 1) * (q - 1);
  let eCh = e;
  if (eCh === undefined || eCh === null) {
    for (let c = 3; c < ph; c += 2) { if (gcd(c, ph) === 1) { eCh = c; break; } }
  }
  if (eCh === undefined || eCh >= ph || gcd(eCh, ph) !== 1) return { error: 'e must be coprime to φ(n).' };
  const d = modInverse(eCh, ph);
  if (d === null) return { error: 'No inverse exists (e not coprime to φ(n)).' };
  const encrypt = (m: number) => modPow(m % n, eCh, n);
  const decrypt = (c: number) => modPow(c % n, d, n);
  const table: { m: number; c: number; mRec: number }[] = [];
  for (let m = 2; m < 12 && m < n; m++) {
    const c = encrypt(m);
    table.push({ m, c, mRec: decrypt(c) });
  }
  return { p, q, n, phi: ph, e: eCh, d, edModPhi: modPow(eCh * d, 1, ph), table, encrypt, decrypt };
}

export function totientTable(max: number): { x: number; pi: number }[] {
  const isP = sieve(max);
  const out: { x: number; pi: number }[] = [];
  let count = 0;
  for (let i = 0; i <= max; i++) {
    if (i >= 2 && isP[i] !== -1) count++;
    if (i % Math.max(1, Math.floor(max / 40)) === 0 || i === max) out.push({ x: i, pi: count });
  }
  return out;
}
