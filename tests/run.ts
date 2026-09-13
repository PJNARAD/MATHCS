/* Simple smoke tests for pure math libraries. Run: npm test */
import { parseExpr, sampleFunction } from '../src/lib/expression';
import { gcd, egcd, modPow, modInverse, isPrime, factorize, phi, rsaSetup, euclidSteps } from '../src/lib/numbertheory';
import { bfsSteps, dijkstraSteps, kruskalSteps, topoSteps, coloringSteps, components, dfsSteps } from '../src/lib/graph';
import type { Graph } from '../src/lib/graph';
import { eigen2, det2, inv2, rref, solveLinear, leastSquares, mat2Mul } from '../src/lib/linalg';
import { mean, std, binom, normalCdf2, correlation, linreg, entropy, mulberry32 } from '../src/lib/stat';

let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, detail = '') => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name} ${detail}`); }
};

console.log('expression parser');
{
  const f = parseExpr('2x^2 - 3x + 1');
  ok('2x^2-3x+1 at x=2 → 3', f.eval({ x: 2 }) === 3, `got ${f.eval({ x: 2 })}`);
  const g = parseExpr('sin(pi/2)');
  ok('sin(pi/2) → 1', Math.abs(g.eval({}) - 1) < 1e-12);
  const h = parseExpr('-x^2');
  ok('unary minus: -x^2 at 3 → -9', h.eval({ x: 3 }) === -9, `got ${h.eval({ x: 3 })}`);
  const i = parseExpr('2(x+1)(x-1)');
  ok('implicit mult: 2(x+1)(x-1) at 3 → 16', i.eval({ x: 3 }) === 16, `got ${i.eval({ x: 3 })}`);
  const j = parseExpr('a*x + b');
  ok('two vars', j.eval({ a: 2, b: 3, x: 4 }) === 11);
  const k = parseExpr('x/(x-2)');
  const segs = sampleFunction((x) => k.eval({ x }), 0, 5, 300);
  ok('1/(x-2) breaks at asymptote (≥2 segments)', segs.length >= 2, `got ${segs.length}`);
  const bad = parseExpr('x +* 2');
  ok('bad expression reports error', bad.error !== undefined);
  const l = parseExpr('exp(-x^2)');
  ok('exp(-x^2) at 0 → 1', Math.abs(l.eval({ x: 0 }) - 1) < 1e-12);
}

console.log('number theory');
{
  ok('gcd(48,36)=12', gcd(48, 36) === 12);
  const e = egcd(240, 46);
  ok('bezout 240,46: x·240 + y·46 = 2', 240 * e.x + 46 * e.y === 2, `x=${e.x}, y=${e.y}`);
  ok('modPow(2,10,1000)=24', modPow(2, 10, 1000) === 24);
  ok('modInverse(3,7)=5', modInverse(3, 7) === 5);
  ok('isPrime(97)', isPrime(97));
  ok('isPrime(1)=false', !isPrime(1));
  ok('factorize(360)=[2,2,2,3,3,5]', JSON.stringify(factorize(360)) === '[2,2,2,3,3,5]');
  ok('phi(12)=4', phi(12) === 4);
  const r = rsaSetup(61, 53);
  if ('error' in r) ok('rsa setup', false, r.error);
  else {
    ok('rsa n=3233', r.n === 3233);
    ok('rsa phi=3120', r.phi === 3120);
    ok('rsa roundtrip 42', r.decrypt(r.encrypt(42)) === 42);
    ok('rsa e coprime', gcd(r.e, r.phi) === 1);
  }
  const es = euclidSteps(1071, 462);
  const lastNonZero = [...es].reverse().find((s) => s.r !== 0)!;
  ok('euclid 1071,462 → gcd 21', lastNonZero.r === 21, `steps=${JSON.stringify(es)}`);
}

console.log('graph algorithms');
{
  // graph: A-B, B-C, C-D, A-D, A-C weights 4,2,3,1,7
  const g: Graph = {
    directed: false,
    nodes: [
      { id: 'A', x: 0, y: 0 }, { id: 'B', x: 2, y: 0 },
      { id: 'C', x: 3, y: 1 }, { id: 'D', x: 1, y: 1.5 },
    ],
    edges: [
      { a: 'A', b: 'B', w: 4 }, { a: 'B', b: 'C', w: 2 },
      { a: 'C', b: 'D', w: 3 }, { a: 'A', b: 'D', w: 1 }, { a: 'A', b: 'C', w: 7 },
    ],
  };
  const bfs = bfsSteps(g, 'A');
  ok('bfs visits all 4', bfs[bfs.length - 1].visited.length === 4);
  const dfs = dfsSteps(g, 'A');
  ok('dfs finishes all 4', dfs[dfs.length - 1].visited.length === 4);
  const dij = dijkstraSteps(g, 'A');
  const lastD = dij[dij.length - 1].dist;
  ok('dijkstra A→D = 1', lastD['D'] === 1, `got ${lastD['D']}`);
  ok('dijkstra A→C = 4 (via D: 1+3)', lastD['C'] === 4, `got ${lastD['C']}`);
  const krus = kruskalSteps(g);
  ok('kruskal MST has 3 edges', krus[krus.length - 1].mstEdges.length === 3, `got ${krus[krus.length - 1].mstEdges.length}`);
  const gg: Graph = {
    directed: true,
    nodes: [{ id: '1', x: 0, y: 0 }, { id: '2', x: 1, y: 0 }, { id: '3', x: 2, y: 0 }],
    edges: [{ a: '1', b: '2', w: 1 }, { a: '1', b: '3', w: 1 }, { a: '2', b: '3', w: 1 }],
  };
  const topo = topoSteps(gg);
  ok('topo order valid', topo[topo.length - 1].order.length === 3 && topo[topo.length - 1].order[0] === '1');
  const colors = coloringSteps(g);
  const c = colors[colors.length - 1].colors;
  ok('coloring: A,B different', c['A'] !== c['B']);
  ok('coloring: A,D different', c['A'] !== c['D']);
  const cc = components({ ...g, edges: g.edges.slice(0, 2) });
  ok('components: 2 comps', cc.components.length === 2, `got ${cc.components.length}`);
}

console.log('linear algebra');
{
  const A: [number, number, number, number] = [2, 1, 1, 3];
  ok('det [[2,1],[1,3]] = 5', det2(A) === 5);
  const inv = inv2(A);
  if (inv) {
    const prod = mat2Mul(A, inv);
    ok('A·A⁻¹ = I', Math.abs(prod[0] - 1) < 1e-12 && Math.abs(prod[3] - 1) < 1e-12 && Math.abs(prod[1]) < 1e-12 && Math.abs(prod[2]) < 1e-12);
  } else ok('inv exists', false);
  const eig = eigen2([2, 0, 0, 3]);
  ok('eigen diag(2,3)', eig.real.length === 2 && Math.abs(eig.real[0].lambda - 3) < 1e-9 && Math.abs(eig.real[1].lambda - 2) < 1e-9);
  const eig2 = eigen2([0, -1, 1, 0]); // 90° rotation
  ok('rotation → complex eigenvalues', eig2.real.length === 0 && eig2.complex !== undefined);
  const sol = solveLinear([[2, 1], [1, -1]], [5, 0]);
  ok('solve 2x+y=5, x-y=0 → (5/3,5/3)', sol !== null && Math.abs(sol[0] - 5 / 3) < 1e-9 && Math.abs(sol[1] - 5 / 3) < 1e-9);
  const { rank } = rref([[1, 2, 3], [2, 4, 6], [1, 1, 1]]);
  ok('rank of dependent system = 2', rank === 2);
  // least squares fit y = 2x + 1
  const A2 = [[1, 0], [1, 1], [1, 2], [1, 3]];
  const b2 = [1, 3, 5, 7];
  const ls = leastSquares(A2, b2);
  ok('least squares recovers y=2x+1', ls !== null && Math.abs(ls[1] - 2) < 1e-9 && Math.abs(ls[0] - 1) < 1e-9);
}

console.log('statistics');
{
  ok('mean', mean([1, 2, 3, 4]) === 2.5);
  ok('std pop [1,2,3,4] ≈ 1.118', Math.abs(std([1, 2, 3, 4]) - Math.sqrt(1.25)) < 1e-12);
  ok('binom(50,2)=1225', binom(50, 2) === 1225);
  ok('normalCdf(0)=0.5', Math.abs(normalCdf2(0) - 0.5) < 1e-9);
  ok('normalCdf(1.96)≈0.975', Math.abs(normalCdf2(1.96) - 0.975) < 1e-3);
  ok('correlation perfect = 1', Math.abs(correlation([1, 2, 3], [2, 4, 6]) - 1) < 1e-12);
  const lr = linreg([1, 2, 3, 4], [3, 5, 7, 9]);
  ok('linreg slope 2', Math.abs(lr.b - 2) < 1e-9 && Math.abs(lr.a - 1) < 1e-9);
  ok('entropy uniform4 = 2', Math.abs(entropy([0.25, 0.25, 0.25, 0.25]) - 2) < 1e-12);
  const rng = mulberry32(42);
  let s = 0;
  for (let i = 0; i < 10000; i++) s += rng();
  ok('mulberry32 mean ≈ 0.5', Math.abs(s / 10000 - 0.5) < 0.02, `got ${s / 10000}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
