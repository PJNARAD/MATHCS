// ---------------------------------------------------------------------------
// Playground snippets.
//
// Every snippet is plain JavaScript with no imports, so it can be executed
// inside the browser (src/lib/runner.ts) AND in CI (tests/run.ts). The
// `output` field is the exact stdout of the snippet — regenerate it with
// `npm run snippets:verify` rather than editing it by hand.
// ---------------------------------------------------------------------------

export interface Snippet {
  id: string;
  conceptId: string; // concept page this demonstrates
  title: string;
  blurb: string;
  code: string;
  output: string; // exact console.log output, verified in CI
}

export const snippets: Snippet[] = [
  {
    id: 'euclid-gcd',
    conceptId: 'euclidean-algorithm',
    title: 'Euclid in five lines',
    blurb: 'The oldest algorithm still in daily use: the remainder shrinks until it hits zero.',
    code: `function gcd(a, b) {
  const steps = [];
  while (b !== 0) {
    steps.push(a + " = " + Math.floor(a / b) + " x " + b + " + " + (a % b));
    [a, b] = [b, a % b];
  }
  return { g: a, steps };
}

const r = gcd(1071, 462);
r.steps.forEach(s => console.log(s));
console.log("gcd =", r.g);`,
    output: '1071 = 2 x 462 + 147\n462 = 3 x 147 + 21\n147 = 7 x 21 + 0\ngcd = 21',
  },
  {
    id: 'fast-modpow',
    conceptId: 'modular-exponentiation',
    title: 'Repeated squaring',
    blurb: 'Computing 7^222 mod 11 by hand is hopeless; squaring gets there in 8 multiplications.',
    code: `function modPow(base, exp, m) {
  let result = 1, b = base % m, e = exp, count = 0;
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % m;
    b = (b * b) % m;
    e = Math.floor(e / 2);
    count++;
  }
  return { result, count };
}

const { result, count } = modPow(7, 222, 11);
console.log("7^222 mod 11 =", result);
console.log("squarings:", count);
console.log("slow way:", Array.from({ length: 222 }).reduce(a => (a * 7) % 11, 1));`,
    output: '7^222 mod 11 = 5\nsquarings: 8\nslow way: 5',
  },
  {
    id: 'sieve',
    conceptId: 'sieve-of-eratosthenes',
    title: 'Sieve of Eratosthenes',
    blurb: 'Strike out multiples; whatever survives is prime. O(n log log n) with a boolean array.',
    code: `function sieve(n) {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let p = 2; p * p <= n; p++) {
    if (isPrime[p]) for (let k = p * p; k <= n; k += p) isPrime[k] = false;
  }
  return isPrime.map((v, i) => (v ? i : 0)).filter(Boolean);
}

const primes = sieve(100);
console.log("primes below 100:", primes.join(" "));
console.log("count:", primes.length);`,
    output: 'primes below 100: 2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97\ncount: 25',
  },
  {
    id: 'rsa-roundtrip',
    conceptId: 'rsa-cryptography',
    title: 'RSA on tiny primes',
    blurb: 'Key generation, encryption and decryption — with primes small enough to see the arithmetic.',
    code: `const p = 61, q = 53, e = 17;
const n = p * q, phi = (p - 1) * (q - 1);

function modPow(b, exp, m) {
  let r = 1;
  b %= m;
  while (exp > 0) { if (exp & 1) r = (r * b) % m; b = (b * b) % m; exp >>= 1; }
  return r;
}
function modInverse(a, m) {
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
  return null;
}

const d = modInverse(e, phi);
const m = 65;
const c = modPow(m, e, n);
console.log("public key (n, e) =", n, e);
console.log("private d =", d);
console.log("ciphertext =", c);
console.log("decrypted =", modPow(c, d, n));`,
    output: 'public key (n, e) = 3233 17\nprivate d = 2753\nciphertext = 2790\ndecrypted = 65',
  },
  {
    id: 'mod-inverse',
    conceptId: 'modular-inverses',
    title: 'Inverses mod n',
    blurb: 'An inverse exists exactly when gcd(a, n) = 1 — the loop shows which residues are invertible.',
    code: `const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
function inverse(a, n) {
  for (let x = 1; x < n; x++) if ((a * x) % n === 1) return x;
  return null;
}

for (const a of [3, 4, 5, 6]) {
  const inv = inverse(a, 7);
  console.log("a=" + a + " mod 7: gcd=" + gcd(a, 7) + "  a^-1=" + inv + (inv === null ? "" : "  check " + a + "*" + inv + " mod 7 = " + (a * inv) % 7));
}
console.log("inverse of 4 mod 6:", inverse(4, 6), "(gcd = 2, shares a factor)");`,
    output: 'a=3 mod 7: gcd=1  a^-1=5  check 3*5 mod 7 = 1\na=4 mod 7: gcd=1  a^-1=2  check 4*2 mod 7 = 1\na=5 mod 7: gcd=1  a^-1=3  check 5*3 mod 7 = 1\na=6 mod 7: gcd=1  a^-1=6  check 6*6 mod 7 = 1\ninverse of 4 mod 6: null (gcd = 2, shares a factor)',
  },
  {
    id: 'pascal-row',
    conceptId: 'binomial-coefficients',
    title: "Pascal's triangle by addition",
    blurb: 'Each entry is the sum of the two above it — no factorials needed.',
    code: `function pascal(rows) {
  const out = [[1]];
  for (let r = 1; r < rows; r++) {
    const prev = out[r - 1];
    const row = [1];
    for (let i = 1; i < prev.length; i++) row.push(prev[i - 1] + prev[i]);
    row.push(1);
    out.push(row);
  }
  return out;
}

for (const row of pascal(7)) console.log(row.join(" "));
const row6 = pascal(7)[6];
console.log("row 6 sums to 2^6 =", row6.reduce((a, b) => a + b, 0));`,
    output: '1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1\n1 5 10 10 5 1\n1 6 15 20 15 6 1\nrow 6 sums to 2^6 = 64',
  },
  {
    id: 'counting-perms-combs',
    conceptId: 'permutations-combinations',
    title: 'nPr vs nCr',
    blurb: 'Order matters for permutations, not for combinations — the ratio is exactly r!.',
    code: `function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }
const P = (n, r) => factorial(n) / factorial(n - r);
const C = (n, r) => P(n, r) / factorial(r);

console.log("P(10,3) =", P(10, 3));
console.log("C(10,3) =", C(10, 3));
console.log("ratio P/C = 3! =", P(10, 3) / C(10, 3));
console.log("lotto odds 1 in", C(49, 6));`,
    output: 'P(10,3) = 720\nC(10,3) = 120\nratio P/C = 3! = 6\nlotto odds 1 in 13983816',
  },
  {
    id: 'catalan',
    conceptId: 'catalan-numbers',
    title: 'Catalan numbers',
    blurb: 'Count balanced parentheses, binary trees and lattice paths — all with one recurrence.',
    code: `const catalan = n => {
  const c = [1];
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j <= i; j++) sum += c[j] * c[i - j];
    c.push(sum);
  }
  return c;
};

const c = catalan(9);
console.log("C_0..C_9:", c.join(" "));
console.log("balanced strings with 4 pairs:", c[4]);`,
    output: 'C_0..C_9: 1 1 2 5 14 42 132 429 1430 4862\nbalanced strings with 4 pairs: 14',
  },
  {
    id: 'pigeonhole-birthdays',
    conceptId: 'pigeonhole-principle',
    title: 'Pigeonhole for birthdays',
    blurb: 'With 13 people two share a birth month. More people than boxes guarantees a collision.',
    code: `function collisionForced(people, boxes) {
  return people > boxes;
}

console.log("13 people, 12 months -> collision forced:", collisionForced(13, 12));
console.log("12 people, 12 months -> collision forced:", collisionForced(12, 12));

// how many people before a shared birthday is more likely than not?
function collisionProbability(n) {
  let p = 1;
  for (let i = 0; i < n; i++) p *= (365 - i) / 365;
  return 1 - p;
}
let n = 2;
while (collisionProbability(n) < 0.5) n++;
console.log("n for > 50% shared birthday:", n);`,
    output: '13 people, 12 months -> collision forced: true\n12 people, 12 months -> collision forced: false\nn for > 50% shared birthday: 23',
  },
  {
    id: 'fib-memo',
    conceptId: 'dynamic-programming',
    title: 'Memoisation vs naive recursion',
    blurb: 'The same recurrence, two algorithms: exponential calls collapse to linear.',
    code: `let naiveCalls = 0;
function fibNaive(n) { naiveCalls++; return n < 2 ? n : fibNaive(n - 1) + fibNaive(n - 2); }

const memo = new Map();
let memoCalls = 0;
function fibMemo(n) {
  memoCalls++;
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);
  const v = fibMemo(n - 1) + fibMemo(n - 2);
  memo.set(n, v);
  return v;
}

console.log("fib(25) =", fibNaive(25), "in", naiveCalls, "calls");
console.log("fib(25) =", fibMemo(25), "in", memoCalls, "calls");`,
    output: 'fib(25) = 75025 in 242785 calls\nfib(25) = 75025 in 49 calls',
  },
  {
    id: 'master-theorem',
    conceptId: 'solving-recurrences',
    title: 'Growth of divide-and-conquer',
    blurb: 'T(n) = 2T(n/2) + n is n log n; make the split 3-way and it stays n log n, change the work and it shifts.',
    code: `// Master theorem for T(n) = a T(n/b) + n^d: compare a with b^d.
function growth(a, b, d) {
  const lb = Math.log(a) / Math.log(b);          // log_b(a)
  const eps = 1e-9;
  if (lb > d + eps) return "Theta(n^" + lb.toFixed(3).replace(/[.]?0+$/, "") + ")";   // leaves dominate
  const p = d === 1 ? "n" : "n^" + d;
  if (Math.abs(lb - d) <= eps) return d === 0 ? "Theta(log n)" : "Theta(" + p + " log n)"; // balanced
  return "Theta(" + p + ")";                     // work at the root dominates
}

const cases = [
  ["merge sort   ", 2, 2, 1],
  ["binary search", 1, 2, 0],
  ["strassen     ", 7, 2, 2],
  ["naive mult   ", 4, 2, 1],
  ["linear scan  ", 1, 1, 1],
];
for (const [name, a, b, d] of cases) {
  console.log(name + " T(n)=" + a + "T(n/" + b + ")+n^" + d + "  ->  " + growth(a, b, d));
}`,
    output: 'merge sort    T(n)=2T(n/2)+n^1  ->  Theta(n log n)\nbinary search T(n)=1T(n/2)+n^0  ->  Theta(log n)\nstrassen      T(n)=7T(n/2)+n^2  ->  Theta(n^2.807)\nnaive mult    T(n)=4T(n/2)+n^1  ->  Theta(n^2)\nlinear scan   T(n)=1T(n/1)+n^1  ->  Theta(n)',
  },
  {
    id: 'log-steps',
    conceptId: 'logarithms',
    title: 'Halving reaches 1 in log2 steps',
    blurb: 'Why binary search over a billion items needs only 30 probes.',
    code: `function halvings(n) {
  let steps = 0;
  while (n > 1) { n = Math.floor(n / 2); steps++; }
  return steps;
}

for (const n of [8, 1024, 1000000, 1000000000]) {
  console.log("n = " + n + " -> " + halvings(n) + " halvings, log2 = " + (Math.log2(n).toFixed(3)));
}`,
    output: 'n = 8 -> 3 halvings, log2 = 3.000\nn = 1024 -> 10 halvings, log2 = 10.000\nn = 1000000 -> 19 halvings, log2 = 19.932\nn = 1000000000 -> 29 halvings, log2 = 29.897',
  },
  {
    id: 'merge-sort-counts',
    conceptId: 'asymptotics',
    title: 'Merge sort comparisons vs n log n',
    blurb: 'Counting comparisons shows the hidden constant of an O(n log n) algorithm.',
    code: `let comparisons = 0;
function mergeSort(a) {
  if (a.length <= 1) return a;
  const mid = Math.floor(a.length / 2);
  const left = mergeSort(a.slice(0, mid));
  const right = mergeSort(a.slice(mid));
  const out = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    comparisons++;
    out.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return out.concat(left.slice(i), right.slice(j));
}

const n = 256;
const data = Array.from({ length: n }, (_, i) => (i * 97) % n);
mergeSort(data);
console.log("n =", n, "comparisons =", comparisons);
console.log("n log2 n =", n * Math.log2(n));
console.log("ratio =", (comparisons / (n * Math.log2(n))).toFixed(3));`,
    output: 'n = 256 comparisons = 1777\nn log2 n = 2048\nratio = 0.868',
  },
  {
    id: 'bfs-grid',
    conceptId: 'bfs-dfs',
    title: 'BFS distances on a grid',
    blurb: 'A queue explores in rings, so the first time you reach a cell is by a shortest path.',
    code: `const grid = [
  "S..#....",
  ".#.#.##.",
  ".#...#..",
  ".##.##.#",
  ".....#.T",
];
const rows = grid.length, cols = grid[0].length;
const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1));
const queue = [[0, 0]];
dist[0][0] = 0;
while (queue.length) {
  const [r, c] = queue.shift();
  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
    if (grid[nr][nc] === "#" || dist[nr][nc] !== -1) continue;
    dist[nr][nc] = dist[r][c] + 1;
    queue.push([nr, nc]);
  }
}
dist.forEach(row => console.log(row.map(d => String(d < 0 ? "." : d).padStart(3)).join("")));
console.log("shortest S->T:", dist[4][7]);`,
    output: '  0  1  2  .  8  9 10 11\n  1  .  3  .  7  .  . 12\n  2  .  4  5  6  . 14 13\n  3  .  .  6  .  . 15  .\n  4  5  6  7  8  . 16 17\nshortest S->T: 17',
  },
  {
    id: 'dfs-components',
    conceptId: 'connectivity',
    title: 'Counting connected components',
    blurb: 'Depth-first search paints one whole component before moving on.',
    code: `const adj = {
  A: ["B"], B: ["A", "C"], C: ["B"],
  D: ["E"], E: ["D"],
  F: [],
};
const seen = new Set();
const components = [];

function dfs(v, bucket) {
  seen.add(v);
  bucket.push(v);
  for (const w of adj[v]) if (!seen.has(w)) dfs(w, bucket);
}

for (const v of Object.keys(adj)) {
  if (seen.has(v)) continue;
  const bucket = [];
  dfs(v, bucket);
  components.push(bucket);
}
console.log("adjacency:", JSON.stringify(adj));
components.forEach((c, i) => console.log("component " + (i + 1) + ":", c.join(" ")));
console.log("total components:", components.length);`,
    output: 'adjacency: {"A":["B"],"B":["A","C"],"C":["B"],"D":["E"],"E":["D"],"F":[]}\ncomponent 1: A B C\ncomponent 2: D E\ncomponent 3: F\ntotal components: 3',
  },
  {
    id: 'dijkstra',
    conceptId: 'shortest-paths',
    title: "Dijkstra's shortest paths",
    blurb: 'Greedily settle the closest unsettled node; its distance can never improve later.',
    code: `const graph = {
  A: { B: 4, C: 2 },
  B: { C: 5, D: 10 },
  C: { E: 3 },
  D: { F: 11 },
  E: { D: 4 },
  F: {},
};
const dist = {}, visited = new Set();
for (const v of Object.keys(graph)) dist[v] = Infinity;
dist.A = 0;

while (true) {
  let u = null;
  for (const v of Object.keys(graph)) {
    if (!visited.has(v) && (u === null || dist[v] < dist[u])) u = v;
  }
  if (u === null || dist[u] === Infinity) break;
  visited.add(u);
  for (const [v, w] of Object.entries(graph[u])) {
    if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
  }
}
console.log(Object.entries(dist).map(([k, v]) => k + ":" + v).join("  "));
console.log("A to F costs", dist.F);`,
    output: 'A:0  B:4  C:2  D:9  E:5  F:20\nA to F costs 20',
  },
  {
    id: 'topo-kahn',
    conceptId: 'topological-sorting',
    title: "Kahn's topological sort",
    blurb: 'Repeatedly remove a node with in-degree zero. If nodes remain, the graph has a cycle.',
    code: `const edges = [["shirt", "tie"], ["tie", "jacket"], ["pants", "shoes"], ["pants", "belt"], ["belt", "jacket"]];
const nodes = ["shirt", "tie", "jacket", "pants", "belt", "shoes"];
const indeg = Object.fromEntries(nodes.map(n => [n, 0]));
const adj = Object.fromEntries(nodes.map(n => [n, []]));
for (const [a, b] of edges) { adj[a].push(b); indeg[b]++; }

const queue = nodes.filter(n => indeg[n] === 0);
const order = [];
while (queue.length) {
  const n = queue.shift();
  order.push(n);
  for (const m of adj[n]) if (--indeg[m] === 0) queue.push(m);
}
console.log("order:", order.join(" -> "));
console.log("all nodes placed:", order.length === nodes.length);`,
    output: 'order: shirt -> pants -> tie -> shoes -> belt -> jacket\nall nodes placed: true',
  },
  {
    id: 'greedy-coloring',
    conceptId: 'graph-coloring',
    title: 'Greedy coloring of an even cycle',
    blurb: 'A cycle of even length is bipartite, so two colors suffice — greedy finds them.',
    code: `const cycle = n => {
  const adj = {};
  for (let i = 0; i < n; i++) adj[i] = [(i + 1) % n, (i - 1 + n) % n];
  return adj;
};

const adj = cycle(8);
const color = {};
for (const v of Object.keys(adj)) {
  const used = new Set(adj[v].map(w => color[w]).filter(c => c !== undefined));
  let c = 0;
  while (used.has(c)) c++;
  color[v] = c;
}
console.log("colors:", Object.values(color).join(" "));
console.log("chromatic number used:", Math.max(...Object.values(color)) + 1);`,
    output: 'colors: 0 1 0 1 0 1 0 1\nchromatic number used: 2',
  },
  {
    id: 'kruskal-mst',
    conceptId: 'minimum-spanning-trees',
    title: 'Kruskal with union-find',
    blurb: 'Sort the edges, keep it if it joins two components. First n−1 survivors form the MST.',
    code: `const edges = [
  ["A", "B", 4], ["A", "C", 1], ["B", "C", 2],
  ["B", "D", 5], ["C", "D", 8], ["D", "E", 3], ["C", "E", 7],
].sort((x, y) => x[2] - y[2]);

const parent = { A: "A", B: "B", C: "C", D: "D", E: "E" };
const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));

let total = 0;
const chosen = [];
for (const [a, b, w] of edges) {
  const ra = find(a), rb = find(b);
  if (ra === rb) { console.log("skip " + a + "-" + b + " (" + w + ") would cycle"); continue; }
  parent[ra] = rb;
  chosen.push(a + "-" + b + ":" + w);
  total += w;
}
console.log("MST edges:", chosen.join("  "));
console.log("total weight:", total);`,
    output: 'skip A-B (4) would cycle\nskip C-E (7) would cycle\nskip C-D (8) would cycle\nMST edges: A-C:1  B-C:2  D-E:3  B-D:5\ntotal weight: 11',
  },
  {
    id: 'matrix-multiply',
    conceptId: 'matrix-multiplication',
    title: 'Matrix multiplication is not commutative',
    blurb: 'Rows meet columns, and swapping the order changes the answer.',
    code: `const mul = (A, B) => A.map(row =>
  B[0].map((_, j) => row.reduce((sum, v, k) => sum + v * B[k][j], 0)));

const A = [[1, 2], [3, 4]];
const B = [[0, 1], [1, 0]];
console.log("A x B =", JSON.stringify(mul(A, B)));
console.log("B x A =", JSON.stringify(mul(B, A)));
console.log("AB = BA here:", JSON.stringify(mul(A, B)) === JSON.stringify(mul(B, A)));`,
    output: 'A x B = [[2,1],[4,3]]\nB x A = [[3,4],[1,2]]\nAB = BA here: false',
  },
  {
    id: 'det-inverse',
    conceptId: 'determinants',
    title: 'Determinant decides invertibility',
    blurb: 'det = 0 means the matrix collapses the plane, and no inverse can undo that.',
    code: `const round = M => M === null ? null : M.map(row => row.map(v => Number(v.toFixed(4))));

function inverse2([[a, b], [c, d]]) {
  const det = a * d - b * c;
  if (det === 0) return null;
  return [[d / det, -b / det], [-c / det, a / det]];
}

for (const M of [[[2, 1], [1, 3]], [[1, 2], [2, 4]], [[3, 0], [0, 2]]]) {
  const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
  console.log(JSON.stringify(M), "det =", det, "inverse:", JSON.stringify(round(inverse2(M))));
}`,
    output: '[[2,1],[1,3]] det = 5 inverse: [[0.6,-0.2],[-0.2,0.4]]\n[[1,2],[2,4]] det = 0 inverse: null\n[[3,0],[0,2]] det = 6 inverse: [[0.3333,0],[0,0.5]]',
  },
  {
    id: 'power-iteration',
    conceptId: 'eigenvalues-eigenvectors',
    title: 'Power iteration finds the dominant eigenvalue',
    blurb: 'Multiply by the matrix and renormalise: the vector rotates toward the top eigenvector.',
    code: `const M = [[2, 0], [0, 3]];
let v = [1, 1];
for (let i = 0; i < 12; i++) {
  const w = [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];
  const norm = Math.hypot(w[0], w[1]);
  v = [w[0] / norm, w[1] / norm];
  if (i < 3 || i === 11) console.log("iter " + (i + 1) + ":", v.map(x => x.toFixed(6)).join(", "));
}
const lambda = (M[0][0] * v[0] * v[0] + M[1][1] * v[1] * v[1]) / (v[0] * v[0] + v[1] * v[1]);
console.log("dominant eigenvalue approx:", lambda.toFixed(6));`,
    output: 'iter 1: 0.554700, 0.832050\niter 2: 0.406138, 0.913812\niter 3: 0.284088, 0.958798\niter 12: 0.007707, 0.999970\ndominant eigenvalue approx: 2.999941',
  },
  {
    id: 'dot-angle',
    conceptId: 'dot-product',
    title: 'Angle from the dot product',
    blurb: 'cos θ = (u·v) / (|u||v|). Orthogonal vectors score zero.',
    code: `const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
const norm = v => Math.hypot(v[0], v[1]);
const angle = (u, v) => Math.acos(dot(u, v) / (norm(u) * norm(v))) * 180 / Math.PI;

const pairs = [[[1, 0], [1, 1]], [[1, 0], [0, 1]], [[1, 0], [-1, 0]], [[2, 1], [3, 4]]];
for (const [u, v] of pairs) {
  console.log("u=" + JSON.stringify(u) + " v=" + JSON.stringify(v) +
    " dot=" + dot(u, v) + " angle=" + angle(u, v).toFixed(2) + "deg");
}`,
    output: 'u=[1,0] v=[1,1] dot=1 angle=45.00deg\nu=[1,0] v=[0,1] dot=0 angle=90.00deg\nu=[1,0] v=[-1,0] dot=-1 angle=180.00deg\nu=[2,1] v=[3,4] dot=10 angle=26.57deg',
  },
  {
    id: 'least-squares',
    conceptId: 'least-squares',
    title: 'Least squares fit by normal equations',
    blurb: 'Solve AᵀA x = Aᵀb when the system is overdetermined and has no exact answer.',
    code: `const xs = [0, 1, 2, 3, 4];
const ys = [1.1, 2.9, 5.2, 6.8, 9.1];

const n = xs.length;
const sx = xs.reduce((a, b) => a + b, 0);
const sy = ys.reduce((a, b) => a + b, 0);
const sxx = xs.reduce((a, b) => a + b * b, 0);
const sxy = xs.reduce((a, b, i) => a + b * ys[i], 0);

const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
const intercept = (sy - slope * sx) / n;
console.log("slope =", slope.toFixed(4), "intercept =", intercept.toFixed(4));

const residual = xs.reduce((acc, x, i) => acc + (ys[i] - (slope * x + intercept)) ** 2, 0);
console.log("sum of squared residuals =", residual.toFixed(6));`,
    output: 'slope = 1.9900 intercept = 1.0400\nsum of squared residuals = 0.107000',
  },
  {
    id: 'numeric-derivative',
    conceptId: 'derivative',
    title: 'Derivative by central difference',
    blurb: 'The limit definition, approximated: (f(x+h) − f(x−h)) / 2h has O(h²) error.',
    code: `const f = x => Math.exp(-x) * Math.sin(3 * x);
const df = x => Math.exp(-x) * (3 * Math.cos(3 * x) - Math.sin(3 * x));

for (const h of [0.1, 0.01, 0.001]) {
  const x = 1.0;
  const approx = (f(x + h) - f(x - h)) / (2 * h);
  console.log("h=" + h.toString().padEnd(5) + " approx=" + approx.toFixed(8) +
    " exact=" + df(x).toFixed(8) + " error=" + Math.abs(approx - df(x)).toExponential(2));
}`,
    output: 'h=0.1   approx=-1.13134336 exact=-1.14450881 error=1.32e-2\nh=0.01  approx=-1.14437705 exact=-1.14450881 error=1.32e-4\nh=0.001 approx=-1.14450749 exact=-1.14450881 error=1.32e-6',
  },
  {
    id: 'trapezoid-integral',
    conceptId: 'numerical-integration',
    title: 'Trapezoid rule vs the exact integral',
    blurb: 'Doubling n cuts the error by about 4 — the signature of a second-order method.',
    code: `const f = x => Math.sin(x);
const trapezoid = (a, b, n) => {
  const h = (b - a) / n;
  let sum = (f(a) + f(b)) / 2;
  for (let i = 1; i < n; i++) sum += f(a + i * h);
  return sum * h;
};

const exact = 2; // integral of sin from 0 to pi
for (const n of [4, 8, 16, 64]) {
  const approx = trapezoid(0, Math.PI, n);
  console.log("n=" + String(n).padEnd(3) + " approx=" + approx.toFixed(8) + " error=" + Math.abs(approx - exact).toExponential(2));
}`,
    output: 'n=4   approx=1.89611890 error=1.04e-1\nn=8   approx=1.97423160 error=2.58e-2\nn=16  approx=1.99357034 error=6.43e-3\nn=64  approx=1.99959839 error=4.02e-4',
  },
  {
    id: 'taylor-sin',
    conceptId: 'taylor-series',
    title: 'Taylor polynomials approach sin',
    blurb: 'Each extra term hugs the true curve for longer — but only near the centre.',
    code: `function taylorSin(x, terms) {
  let sum = 0, term = x;
  for (let k = 0; k < terms; k++) {
    sum += term;
    term *= -x * x / ((2 * k + 2) * (2 * k + 3));
  }
  return sum;
}

const x = 1.2;
console.log("sin(" + x + ") =", Math.sin(x).toFixed(8));
for (const terms of [1, 2, 3, 4, 6]) {
  const p = taylorSin(x, terms);
  console.log("terms=" + terms + " P(x)=" + p.toFixed(8) + " error=" + Math.abs(p - Math.sin(x)).toExponential(2));
}`,
    output: 'sin(1.2) = 0.93203909\nterms=1 P(x)=1.20000000 error=2.68e-1\nterms=2 P(x)=0.91200000 error=2.00e-2\nterms=3 P(x)=0.93273600 error=6.97e-4\nterms=4 P(x)=0.93202505 error=1.40e-5\nterms=6 P(x)=0.93203908 error=1.71e-9',
  },
  {
    id: 'newton-sqrt',
    conceptId: 'root-finding',
    title: "Newton's method for square roots",
    blurb: 'Each step roughly doubles the number of correct digits.',
    code: `function newtonSqrt(a, x0 = 1) {
  let x = x0;
  const steps = [];
  for (let i = 0; i < 6; i++) {
    x = (x + a / x) / 2;
    steps.push(x);
  }
  return steps;
}

const steps = newtonSqrt(2);
steps.forEach((x, i) => {
  const err = Math.abs(x - Math.SQRT2);
  console.log("step " + (i + 1) + ": " + x.toFixed(15) + " error " + err.toExponential(2));
});`,
    output: 'step 1: 1.500000000000000 error 8.58e-2\nstep 2: 1.416666666666667 error 2.45e-3\nstep 3: 1.414215686274510 error 2.12e-6\nstep 4: 1.414213562374690 error 1.59e-12\nstep 5: 1.414213562373095 error 2.22e-16\nstep 6: 1.414213562373095 error 2.22e-16',
  },
  {
    id: 'gradient-descent-1d',
    conceptId: 'gradient-descent',
    title: 'Gradient descent on (x − 3)²',
    blurb: 'Step against the gradient. Too large a step and the iterates jump the minimum forever.',
    code: `const f = x => (x - 3) ** 2;
const df = x => 2 * (x - 3);

for (const lr of [0.1, 0.4, 0.9]) {
  let x = 0;
  for (let i = 0; i < 25; i++) x -= lr * df(x);
  console.log("lr=" + lr + " x after 25 steps = " + x.toFixed(6) + " loss = " + f(x).toExponential(2));
}`,
    output: 'lr=0.1 x after 25 steps = 2.988666 loss = 1.28e-4\nlr=0.4 x after 25 steps = 3.000000 loss = 0.00e+0\nlr=0.9 x after 25 steps = 3.011334 loss = 1.28e-4',
  },
  {
    id: 'bayes-posterior',
    conceptId: 'bayes-theorem',
    title: "Bayes' rule with natural frequencies",
    blurb: 'Same numbers as the visualization: 10,000 people, a rare condition, an imperfect test.',
    code: `const population = 10000;
const prior = 0.001, sensitivity = 0.99, specificity = 0.95;

const sick = population * prior;
const tp = sick * sensitivity, fn = sick - tp;
const fp = (population - sick) * (1 - specificity), tn = population - sick - fp;
const posterior = tp / (tp + fp);

console.log("sick:", Math.round(sick), "test positive:", Math.round(tp + fp));
console.log("true positives:", tp.toFixed(1), "false positives:", fp.toFixed(1));
console.log("P(sick | positive) =", (posterior * 100).toFixed(2) + "%");
console.log("missed cases (false negatives):", fn.toFixed(1), "true negatives:", Math.round(tn));`,
    output: 'sick: 10 test positive: 509\ntrue positives: 9.9 false positives: 499.5\nP(sick | positive) = 1.94%\nmissed cases (false negatives): 0.1 true negatives: 9491',
  },
  {
    id: 'monte-carlo-pi',
    conceptId: 'monte-carlo',
    title: 'Monte Carlo estimate of pi',
    blurb: 'Throw darts at a square, count the hits inside the quarter circle. Error shrinks like 1/√n.',
    code: `function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const rng = lcg(12345);
for (const n of [1000, 10000, 100000]) {
  let inside = 0;
  for (let i = 0; i < n; i++) {
    const x = rng(), y = rng();
    if (x * x + y * y <= 1) inside++;
  }
  const pi = 4 * inside / n;
  console.log("n=" + String(n).padEnd(7) + " pi = " + pi.toFixed(5) + " error = " + Math.abs(pi - Math.PI).toFixed(5));
}`,
    output: 'n=1000    pi = 3.17200 error = 0.03041\nn=10000   pi = 3.16120 error = 0.01961\nn=100000  pi = 3.13684 error = 0.00475',
  },
  {
    id: 'mean-variance',
    conceptId: 'measures-of-spread',
    title: 'Mean, variance and the standard deviation',
    blurb: 'Two datasets can share a mean and behave completely differently.',
    code: `function stats(xs) {
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const variance = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length;
  return { mean, variance, sd: Math.sqrt(variance) };
}

for (const data of [[2, 4, 4, 4, 5, 5, 7, 9], [4, 4, 5, 5, 5, 5, 6, 6]]) {
  const s = stats(data);
  console.log(JSON.stringify(data) + " mean=" + s.mean.toFixed(3) + " var=" + s.variance.toFixed(3) + " sd=" + s.sd.toFixed(3));
}`,
    output: '[2,4,4,4,5,5,7,9] mean=5.000 var=4.000 sd=2.000\n[4,4,5,5,5,5,6,6] mean=5.000 var=0.500 sd=0.707',
  },
  {
    id: 'pearson-correlation',
    conceptId: 'correlation',
    title: 'Pearson correlation by hand',
    blurb: 'Correlation is covariance with the units divided out, so it always lies in [-1, 1].',
    code: `function correlation(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let cov = 0, vx = 0, vy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    cov += dx * dy; vx += dx * dx; vy += dy * dy;
  }
  return cov / Math.sqrt(vx * vy);
}

console.log("perfect +:", correlation([1, 2, 3, 4], [2, 4, 6, 8]).toFixed(6));
console.log("perfect -:", correlation([1, 2, 3, 4], [8, 6, 4, 2]).toFixed(6));
console.log("noisy:", correlation([1, 2, 3, 4, 5], [2, 1, 4, 3, 6]).toFixed(6));`,
    output: 'perfect +: 1.000000\nperfect -: -1.000000\nnoisy: 0.821995',
  },
  {
    id: 'linear-regression',
    conceptId: 'linear-regression',
    title: 'Least-squares regression line',
    blurb: 'The line minimising squared error — the same formula the statistics page derives.',
    code: `const xs = [1, 2, 3, 4, 5];
const ys = [2, 4, 5, 4, 5];

const n = xs.length;
const mx = xs.reduce((a, b) => a + b, 0) / n;
const my = ys.reduce((a, b) => a + b, 0) / n;
const sxy = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0);
const sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0);
const b = sxy / sxx;
const a = my - b * mx;

console.log("y = " + b.toFixed(4) + "x + " + a.toFixed(4));
console.log("predictions:", xs.map(x => (b * x + a).toFixed(3)).join(" "));
console.log("r^2 =", ((sxy * sxy) / (sxx * ys.reduce((acc, y) => acc + (y - my) ** 2, 0))).toFixed(6));`,
    output: 'y = 0.6000x + 2.2000\npredictions: 2.800 3.400 4.000 4.600 5.200\nr^2 = 0.600000',
  },
  {
    id: 'entropy-bits',
    conceptId: 'entropy',
    title: 'Entropy in bits',
    blurb: 'The average surprise of a source: 1 bit per fair coin flip, less for a loaded coin.',
    code: `const entropy = ps => -ps.filter(p => p > 0).reduce((s, p) => s + p * Math.log2(p), 0);

const sources = [
  ["fair coin      ", [0.5, 0.5]],
  ["loaded 0.9     ", [0.9, 0.1]],
  ["fair die       ", Array(6).fill(1 / 6)],
  ["skewed 4-symbol", [0.7, 0.1, 0.1, 0.1]],
  ["certain        ", [1]],
];
for (const [name, ps] of sources) {
  console.log(name + " H = " + entropy(ps).toFixed(4) + " bits");
}`,
    output: 'fair coin       H = 1.0000 bits\nloaded 0.9      H = 0.4690 bits\nfair die        H = 2.5850 bits\nskewed 4-symbol H = 1.3568 bits\ncertain         H = 0.0000 bits',
  },
  {
    id: 'huffman-average-length',
    conceptId: 'compression',
    title: 'Huffman average code length',
    blurb: 'Merge the two rarest symbols repeatedly, then read the codes off the tree.',
    code: `const symbols = [{ s: "A", p: 0.7 }, { s: "B", p: 0.1 }, { s: "C", p: 0.1 }, { s: "D", p: 0.1 }];
let pool = symbols.map((x, i) => ({ ...x, order: i }));
while (pool.length > 1) {
  pool.sort((a, b) => a.p - b.p || a.order - b.order);
  const [x, y] = pool.splice(0, 2);
  pool.push({ s: x.s + y.s, p: x.p + y.p, order: 99, left: x, right: y });
}
const codes = {};
(function walk(node, prefix) {
  if (!node.left && !node.right) { codes[node.s] = prefix; return; }
  walk(node.left, prefix + "0");
  walk(node.right, prefix + "1");
})(pool[0], "");

const avg = symbols.reduce((sum, x) => sum + x.p * codes[x.s].length, 0);
const H = -symbols.reduce((sum, x) => sum + x.p * Math.log2(x.p), 0);
console.log("codes:", Object.entries(codes).map(([s, c]) => s + "=" + c).join(" "));
console.log("average length =", avg.toFixed(4), "bits/symbol");
console.log("entropy =", H.toFixed(4), "bits; redundancy =", (avg - H).toFixed(4));`,
    output: 'codes: D=00 B=010 C=011 A=1\naverage length = 1.5000 bits/symbol\nentropy = 1.3568 bits; redundancy = 0.1432',
  },
  {
    id: 'clt-sample-means',
    conceptId: 'central-limit-theorem',
    title: 'Sample means from a skewed population',
    blurb: 'Draw from an exponential, average, repeat — and watch the bell appear.',
    code: `function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function report(n, samples) {
  const rng = lcg(7);
  const means = [];
  for (let i = 0; i < samples; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) sum += -Math.log(1 - rng());
    means.push(sum / n);
  }
  const mean = means.reduce((a, b) => a + b, 0) / samples;
  const sd = Math.sqrt(means.reduce((a, b) => a + (b - mean) ** 2, 0) / samples);
  console.log("n=" + String(n).padStart(3) + "  mean=" + mean.toFixed(4) +
    "  sd=" + sd.toFixed(4) + "  theory 1/sqrt(n)=" + (1 / Math.sqrt(n)).toFixed(4));
}

[1, 2, 5, 25, 100].forEach(n => report(n, 4000));`,
    output: 'n=  1  mean=0.9939  sd=1.0127  theory 1/sqrt(n)=1.0000\nn=  2  mean=1.0096  sd=0.7220  theory 1/sqrt(n)=0.7071\nn=  5  mean=1.0082  sd=0.4411  theory 1/sqrt(n)=0.4472\nn= 25  mean=0.9982  sd=0.1987  theory 1/sqrt(n)=0.2000\nn=100  mean=0.9991  sd=0.1012  theory 1/sqrt(n)=0.1000',
  },
  {
    id: 'markov-steady-state',
    conceptId: 'markov-chains',
    title: 'Markov chain steady state',
    blurb: 'Push a distribution through the transition matrix until it stops changing.',
    code: `const P = [[0.9, 0.1], [0.2, 0.8]];
let dist = [1, 0];

for (let step = 1; step <= 30; step *= 3) {
  let d = dist.slice();
  for (let i = 1; i < step; i++) d = [d[0] * P[0][0] + d[1] * P[1][0], d[0] * P[0][1] + d[1] * P[1][1]];
  console.log("after " + String(step).padStart(2) + " steps: sunny=" + d[0].toFixed(6) + " rainy=" + d[1].toFixed(6));
}
console.log("theoretical steady state: 2/3 sunny, 1/3 rainy =", (2 / 3).toFixed(6), (1 / 3).toFixed(6));`,
    output: 'after  1 steps: sunny=1.000000 rainy=0.000000\nafter  3 steps: sunny=0.830000 rainy=0.170000\nafter  9 steps: sunny=0.685883 rainy=0.314117\nafter 27 steps: sunny=0.666698 rainy=0.333302\ntheoretical steady state: 2/3 sunny, 1/3 rainy = 0.666667 0.333333',
  },
  {
    id: 'truth-table-implication',
    conceptId: 'truth-tables',
    title: 'Truth table for p → q',
    blurb: 'Implication is false only when a true premise forces a false conclusion.',
    code: `const ops = {
  "p AND q": (p, q) => p && q,
  "p OR q": (p, q) => p || q,
  "p -> q": (p, q) => !p || q,
  "p XOR q": (p, q) => p !== q,
  "(p AND q) OR NOT p": (p, q) => (p && q) || !p,
};

const names = Object.keys(ops);
console.log("p  q  " + names.map(n => n.padEnd(22)).join(""));
for (const p of [true, false]) {
  for (const q of [true, false]) {
    console.log((p ? "T" : "F") + "  " + (q ? "T" : "F") + "  " +
      names.map(n => (ops[n](p, q) ? "T" : "F").padEnd(22)).join(""));
  }
}
const tautology = names.filter(n => [true, false].every(p => [true, false].every(q => ops[n](p, q))));
console.log("tautologies here:", tautology.length === 0 ? "none" : tautology.join(", "));`,
    output: 'p  q  p AND q               p OR q                p -> q                p XOR q               (p AND q) OR NOT p    \nT  T  T                     T                     T                     F                     T                     \nT  F  F                     T                     F                     T                     F                     \nF  T  F                     T                     T                     T                     T                     \nF  F  F                     F                     T                     F                     T                     \ntautologies here: none',
  },
  {
    id: 'dfa-simulation',
    conceptId: 'finite-automata',
    title: 'Simulating a DFA',
    blurb: 'A finite automaton is a table plus a current state: accept exactly the strings with an even number of 1s.',
    code: `const delta = {
  even: { "0": "even", "1": "odd" },
  odd: { "0": "odd", "1": "even" },
};
const accepts = state => state === "even";

function run(input) {
  let state = "even";
  const trace = [state];
  for (const ch of input) {
    state = delta[state][ch];
    trace.push(state);
  }
  return { accepted: accepts(state), trace };
}

const label = w => (w === '' ? '(empty)' : w);
for (const word of ['', '0', '1', '1010', '111']) {
  const r = run(word);
  console.log(label(word).padEnd(8) + ' -> ' + r.trace.join(' -> ') + '  accepted=' + r.accepted);
}`,
    output: '(empty)  -> even  accepted=true\n0        -> even -> even  accepted=true\n1        -> even -> odd  accepted=false\n1010     -> even -> odd -> odd -> even -> even  accepted=true\n111      -> even -> odd -> even -> odd  accepted=false',
  },
  {
    id: 'rotation-matrix',
    conceptId: 'transformations-geometry',
    title: 'Rotating the plane',
    blurb: 'A rotation is a 2×2 matrix: cos and sin place the new axes, and det = 1 keeps areas intact.',
    code: `const rotate = theta => [[Math.cos(theta), -Math.sin(theta)], [Math.sin(theta), Math.cos(theta)]];
const apply = (M, [x, y]) => [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y];

const point = [1, 0];
for (const deg of [90, 180, 270]) {
  const M = rotate(deg * Math.PI / 180);
  const p = apply(M, point);
  const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
  console.log(deg + "deg: (1,0) -> (" + p[0].toFixed(3) + ", " + p[1].toFixed(3) + ")  det = " + det.toFixed(3));
}

const twice = apply(rotate(Math.PI / 4), apply(rotate(Math.PI / 4), point));
console.log("45 + 45 deg = 90 deg:", twice[0].toFixed(3), twice[1].toFixed(3));`,
    output: '90deg: (1,0) -> (0.000, 1.000)  det = 1.000\n180deg: (1,0) -> (-1.000, 0.000)  det = 1.000\n270deg: (1,0) -> (-0.000, -1.000)  det = 1.000\n45 + 45 deg = 90 deg: 0.000 1.000',
  },
  {
    id: 'hamming-distance',
    conceptId: 'error-correction-codes',
    title: 'Hamming distance and parity bits',
    blurb: 'Distance measures how many flipped bits a detector can survive; parity catches one.',
    code: `const hamming = (a, b) => {
  let x = a ^ b, count = 0;
  while (x) { count += x & 1; x >>= 1; }
  return count;
};

const words = [0b1011, 0b1001, 0b1111];
for (const w of words) {
  const parity = w.toString(2).split("").filter(c => c === "1").length % 2;
  console.log("word " + w.toString(2).padStart(4, "0") + " distance to 1011 = " + hamming(w, 0b1011) + " parity bit = " + parity);
}

// minimum distance of the code {1011, 0100, 1110}
const code = [0b1011, 0b0100, 0b1110];
let min = Infinity;
for (let i = 0; i < code.length; i++)
  for (let j = i + 1; j < code.length; j++) min = Math.min(min, hamming(code[i], code[j]));
console.log("minimum distance of {1011, 0100, 1110} =", min, "-> detects", min - 1, "errors");`,
    output: 'word 1011 distance to 1011 = 0 parity bit = 1\nword 1001 distance to 1011 = 1 parity bit = 0\nword 1111 distance to 1011 = 1 parity bit = 0\nminimum distance of {1011, 0100, 1110} = 2 -> detects 1 errors',
  },
  {
    id: 'union-find',
    conceptId: 'union-find',
    title: 'Union–find in fifteen lines',
    blurb: 'Path compression plus union by size — the component bookkeeping that finishes Kruskal’s algorithm.',
    code: `const parent = {}, size = {};
const make = x => { parent[x] = x; size[x] = 1; };
function find(x) {
  while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
  return x;
}
function union(a, b) {
  let ra = find(a), rb = find(b);
  if (ra === rb) return false;
  if (size[ra] < size[rb]) { const t = ra; ra = rb; rb = t; }
  parent[rb] = ra; size[ra] += size[rb];
  return true;
}

["A", "B", "C", "D", "E", "F"].forEach(make);
const edges = [["A","B"],["C","D"],["B","C"],["A","C"],["E","F"]];
for (const [u, v] of edges) {
  const merged = union(u, v);
  console.log("union(" + u + "," + v + ") -> " + (merged ? "accepted" : "rejected (same component)") + ", find(A) = " + find("A") + ", find(E) = " + find("E"));
}
const depth = x => { let hops = 0; while (parent[x] !== x) { x = parent[x]; hops++; } return hops; };
console.log("D sits " + depth("D") + " hops below its root (D -> C -> A)");
console.log("find(D) = " + find("D"));
console.log("after that find, D sits " + depth("D") + " hop below its root (path compression)");
console.log("components: " + [...new Set(["A","B","C","D","E","F"].map(find))].join(", "));`,
    output: 'union(A,B) -> accepted, find(A) = A, find(E) = E\nunion(C,D) -> accepted, find(A) = A, find(E) = E\nunion(B,C) -> accepted, find(A) = A, find(E) = E\nunion(A,C) -> rejected (same component), find(A) = A, find(E) = E\nunion(E,F) -> accepted, find(A) = A, find(E) = E\nD sits 2 hops below its root (D -> C -> A)\nfind(D) = A\nafter that find, D sits 1 hop below its root (path compression)\ncomponents: A, E',
  },
  {
    id: 'binary-search-steps',
    conceptId: 'binary-search',
    title: 'Twenty guesses for a million',
    blurb: 'Counting comparisons shows the logarithm directly — then the same loop picks a shipping capacity.',
    code: `function guessCount(n) {
  let lo = 1, hi = n, steps = 0;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    steps++;
    hi = mid;
  }
  return steps;
}

for (const n of [10, 100, 1000, 1000000, 1000000000]) {
  console.log("range 1.." + n + " -> " + guessCount(n) + " comparisons (ceil(log2 n) = " + Math.ceil(Math.log2(n)) + ")");
}

const weights = [3, 2, 2, 4, 1, 4];
const daysFor = cap => {
  let days = 1, load = 0;
  for (const w of weights) {
    if (load + w > cap) { days++; load = 0; }
    load += w;
  }
  return days;
};
let lo = Math.max.apply(null, weights), hi = weights.reduce((a, b) => a + b, 0);
while (lo < hi) {
  const mid = lo + Math.floor((hi - lo) / 2);
  if (daysFor(mid) <= 5) hi = mid; else lo = mid + 1;
}
const totalWeight = weights.reduce((a, b) => a + b, 0);
console.log("minimum capacity for 5 days = " + lo + " (one day would need " + totalWeight + ")");`,
    output: 'range 1..10 -> 4 comparisons (ceil(log2 n) = 4)\nrange 1..100 -> 7 comparisons (ceil(log2 n) = 7)\nrange 1..1000 -> 10 comparisons (ceil(log2 n) = 10)\nrange 1..1000000 -> 20 comparisons (ceil(log2 n) = 20)\nrange 1..1000000000 -> 30 comparisons (ceil(log2 n) = 30)\nminimum capacity for 5 days = 4 (one day would need 16)',
  },
  {
    id: 'cosine-similarity',
    conceptId: 'cosine-similarity',
    title: 'Cosine similarity vs raw dot product',
    blurb: 'Three toy documents show why direction matters and length does not.',
    code: `const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const norm = a => Math.sqrt(dot(a, a));
const cosine = (a, b) => dot(a, b) / (norm(a) * norm(b));

const docs = {
  "math math cs": [2, 1, 0],
  "math cs cs": [1, 2, 0],
  "pizza x4": [0, 0, 4],
};
const names = Object.keys(docs);
for (let i = 0; i < names.length; i++) {
  for (let j = i + 1; j < names.length; j++) {
    const a = docs[names[i]], b = docs[names[j]];
    console.log(names[i].padEnd(12) + " vs " + names[j].padEnd(12) + " dot = " + String(dot(a, b)).padStart(2) + "  cos = " + cosine(a, b).toFixed(2));
  }
}
console.log("scale check: cos((3,4),(6,8)) = " + cosine([3, 4], [6, 8]).toFixed(2));`,
    output: 'math math cs vs math cs cs   dot =  4  cos = 0.80\nmath math cs vs pizza x4     dot =  0  cos = 0.00\nmath cs cs   vs pizza x4     dot =  0  cos = 0.00\nscale check: cos((3,4),(6,8)) = 1.00',
  },
  {
    id: 'edmonds-karp',
    conceptId: 'maximum-flow',
    title: 'Edmonds–Karp with a residual graph',
    blurb: 'BFS augmenting paths, reverse edges that undo bad choices, and the min cut read off the residuals.',
    code: `const capacity = { "s->a": 3, "a->t": 2, "s->b": 2, "b->t": 3, "a->b": 1 };
const flow = {};
const residual = () => {
  const r = {};
  for (const key of Object.keys(capacity)) {
    const parts = key.split("->"), u = parts[0], v = parts[1];
    r[u + "->" + v] = capacity[key] - (flow[key] || 0);
    r[v + "->" + u] = flow[key] || 0;
  }
  return r;
};
const outgoing = (r, u) => Object.keys(r).filter(k => k.split("->")[0] === u && r[k] > 0);

let total = 0, round = 0;
while (true) {
  const r = residual();
  const parent = {}, seen = { s: true }, queue = ["s"];
  while (queue.length && !seen.t) {
    const u = queue.shift();
    for (const k of outgoing(r, u)) {
      const v = k.split("->")[1];
      if (!seen[v]) { seen[v] = true; parent[v] = k; queue.push(v); }
    }
  }
  if (!seen.t) break;
  let v = "t", bottleneck = Infinity, path = [];
  while (v !== "s") { const k = parent[v]; path.unshift(k); bottleneck = Math.min(bottleneck, r[k]); v = k.split("->")[0]; }
  for (const k of path) {
    const parts = k.split("->"), a = parts[0], b = parts[1];
    if (capacity[a + "->" + b] !== undefined) flow[a + "->" + b] = (flow[a + "->" + b] || 0) + bottleneck;
    else flow[b + "->" + a] = (flow[b + "->" + a] || 0) - bottleneck;
  }
  total += bottleneck;
  round++;
  console.log("round " + round + ": " + path.join(" + ") + "  bottleneck = " + bottleneck + "  flow = " + total);
}

const r = residual();
const reachable = { s: true }, queue = ["s"];
while (queue.length) {
  const u = queue.shift();
  for (const k of outgoing(r, u)) {
    const v = k.split("->")[1];
    if (!reachable[v]) { reachable[v] = true; queue.push(v); }
  }
}
console.log("max flow = " + total);
console.log("min cut: vertices reachable from s = {" + Object.keys(reachable).join(", ") + "}");`,
    output: 'round 1: s->a + a->t  bottleneck = 2  flow = 2\nround 2: s->b + b->t  bottleneck = 2  flow = 4\nround 3: s->a + a->b + b->t  bottleneck = 1  flow = 5\nmax flow = 5\nmin cut: vertices reachable from s = {s}',
  },
];

export const snippetById = (id: string): Snippet | undefined => snippets.find((s) => s.id === id);

/** Snippets attached to a concept, for cross-linking from concept pages. */
export const snippetsForConcept = (conceptId: string): Snippet[] =>
  snippets.filter((s) => s.conceptId === conceptId);
