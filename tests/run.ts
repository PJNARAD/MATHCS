/* Simple smoke tests for pure math libraries. Run: npm test */
import { parseExpr, sampleFunction } from '../src/lib/expression';
import { gcd, egcd, modPow, modInverse, isPrime, factorize, phi, rsaSetup, euclidSteps } from '../src/lib/numbertheory';
import { bfsSteps, dijkstraSteps, kruskalSteps, topoSteps, coloringSteps, components, dfsSteps } from '../src/lib/graph';
import type { Graph } from '../src/lib/graph';
import type { Block } from '../src/data/types';
import { eigen2, det2, inv2, rref, solveLinear, leastSquares, mat2Mul } from '../src/lib/linalg';
import { mean, std, binom, normalCdf2, correlation, linreg, entropy, mulberry32 } from '../src/lib/stat';
import { readFileSync, readdirSync } from 'node:fs';
import { allConcepts, conceptMap, getConcept } from '../src/lib/concepts';
import { serializeConceptIndex } from '../src/lib/concept-index-file';
import { conceptIndex } from '../src/data/concept-index';
import {
  clearConceptCache, domainsWithContent, loadableDomains, loadConcept, readConcept,
} from '../src/lib/concept-loader';
import { domains } from '../src/data/domains';
import { fields } from '../src/data/fields';
import { paths } from '../src/data/paths';
import { books } from '../src/data/books';
import { snippetById, snippets, snippetsForConcept } from '../src/data/snippets';
import { compareOutput, runSnippet } from '../src/lib/runner';
import { DEFAULT_PROGRESS, LEGACY_KEY, RECENT_LIMIT, STORAGE_KEY, loadProgress, migrateProgress } from '../src/lib/store';
import {
  DEFAULT_READER_PREFERENCES, READER_FONT_SIZES, READER_WIDTHS,
  nextThemePreference, parseReaderPreferences, parseThemePreference, readerCssVariables,
  resolveTheme, toggledThemePreference,
} from '../src/lib/preferences';
import { buildOutline, readingTimeLabel, readingTimeMinutes, wordCount } from '../src/lib/reading';
import { lossColor } from '../src/components/viz';
import { buildSearchDocs, fuzzyScore, scoreDoc, searchDocs } from '../src/lib/search';
import {
  TAYLOR_PRESETS, cosCoeffs, expCoeffs, sinCoeffs, getTaylorPreset, polyEval, sampleFn, taylorApprox, taylorError, taylorTerm,
  bayes, bayesCounts, huffmanCodes, huffmanDecode, huffmanEncode, isPrefixFree, cltRun, getPopulation, normalDraw, normalOverlay,
  gdRun, getLandscape, applyMap, getMapPreset, mapInfo, polygonArea2, transformedUnitSquare, turnDegrees,
} from '../src/lib/vizmath';

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

console.log('visualization math');
{
  // ---- Taylor -------------------------------------------------------------
  ok('exp coefficients 0..3 = 1, 1, 1/2, 1/6', JSON.stringify(expCoeffs(3)) === JSON.stringify([1, 1, 0.5, 1 / 6]));
  const sinC = sinCoeffs(5);
  ok('sin coefficients k=1,3,5 = 1, -1/6, 1/120', sinC[1] === 1 && Math.abs(sinC[3] + 1 / 6) < 1e-15 && Math.abs(sinC[5] - 1 / 120) < 1e-15);
  ok('sin coefficients k=0,2,4 vanish (odd powers only)', sinC[0] === 0 && sinC[2] === 0 && sinC[4] === 0);
  ok('cos coefficients k=0,2 = 1, -1/2', cosCoeffs(2)[0] === 1 && cosCoeffs(2)[2] === -0.5);
  ok('polyEval [1,2,3] at 2 = 17', polyEval([1, 2, 3], 2) === 17);

  const sin = getTaylorPreset('sin');
  ok('P5(1) matches sin(1) to 2.5e-4', Math.abs(taylorApprox(sin, 5, 1) - Math.sin(1)) < 2.5e-4, `got ${taylorApprox(sin, 5, 1)}`);
  ok('P7(1) matches sin(1) to 1e-5', Math.abs(taylorApprox(sin, 7, 1) - Math.sin(1)) < 1e-5, `got ${taylorApprox(sin, 7, 1)}`);
  const near = [1, 3, 5, 7, 9].map((n) => taylorError(sin, n, [-1, 1]));
  ok('sin error near the centre shrinks with every order', near.every((e, i) => i === 0 || e < near[i - 1]), near.map((e) => e.toExponential(1)).join(' '));
  ok('sin error at n=9 near centre < 1e-6', near[4] < 1e-6);

  const exp = getTaylorPreset('exp');
  const expErr = [1, 3, 6, 12].map((n) => taylorError(exp, n));
  ok('exp error falls monotonically on [-3,3]', expErr.every((e, i) => i === 0 || e < expErr[i - 1]), expErr.map((e) => e.toExponential(1)).join(' '));
  ok('order-12 exp error < 1e-3', expErr[3] < 1e-3);

  const geom = getTaylorPreset('geom');
  const g2 = taylorApprox(geom, 6, 0.5);
  ok('geometric partial sum matches (1-x^7)/(1-x)', Math.abs(g2 - (1 - 0.5 ** 7) / (1 - 0.5)) < 1e-12, `got ${g2}`);
  ok('order is clamped to the available coefficients', taylorApprox(sin, 999, 1) === taylorApprox(sin, sin.coeffs.length - 1, 1));
  ok('taylorTerm gives the k-th term a_k (x-c)^k', Math.abs(taylorTerm(sin, 3, 2) + 8 / 6) < 1e-12);
  const plotted = sampleFn((x) => x * x, 0, 2, 4);
  ok('sampleFn returns n+1 points spanning the range', plotted.length === 5 && plotted[0][0] === 0 && plotted[4][0] === 2);

  // ---- Bayes --------------------------------------------------------------
  const rare = bayes({ prior: 0.001, sensitivity: 0.99, specificity: 0.95 });
  ok('rare disease posterior ≈ 1.94% (base-rate trap)', Math.abs(rare.posterior - 0.0194) < 5e-4, `got ${rare.posterior}`);
  const rc = bayesCounts(rare);
  ok('natural-frequency counts sum to the population', rc.tp + rc.fp + rc.fn + rc.tn === rare.population);
  ok('counts: 10 true positives among ~510 positives', rc.tp === 10 && rc.fp === 500);
  const mid = bayes({ prior: 0.008, sensitivity: 0.9, specificity: 0.91 });
  ok('screening posterior ≈ 7.5%', Math.abs(mid.posterior - 0.0747) < 2e-3, `got ${mid.posterior}`);
  const better = bayes({ prior: 0.01, sensitivity: 0.9, specificity: 0.91 });
  ok('posterior increases with the prior', better.posterior > mid.posterior);
  const perfect = bayes({ prior: 0.02, sensitivity: 1, specificity: 1 });
  ok('a perfect test makes a positive result conclusive', Math.abs(perfect.posterior - 1) < 1e-12);
  const useless = bayes({ prior: 0.02, sensitivity: 0.5, specificity: 0.5 });
  ok('an uninformative test leaves the posterior at the prior', Math.abs(useless.posterior - 0.02) < 1e-12, `got ${useless.posterior}`);
  ok('false discovery is the complement of the posterior', Math.abs(rare.posterior + rare.falseDiscovery - 1) < 1e-12);
  ok('P(+) agrees with the rounded (tp+fp)/N to a person', Math.abs(rare.pPositive - (rc.tp + rc.fp) / rare.population) < 1e-4);

  // ---- Huffman ------------------------------------------------------------
  const skew = huffmanCodes([
    { symbol: 'A', p: 0.7 }, { symbol: 'B', p: 0.1 }, { symbol: 'C', p: 0.1 }, { symbol: 'D', p: 0.1 },
  ]);
  ok('most likely symbol gets a 1-bit code', skew.lengths.A === 1, JSON.stringify(skew.codes));
  ok('Huffman codes are prefix-free', isPrefixFree(skew.codes));
  ok('Kraft sum equals 1 for this complete code', Math.abs(Object.values(skew.lengths).reduce((s, l) => s + 2 ** -l, 0) - 1) < 1e-12);
  ok('average length 1.5 beats the 2-bit fixed code', Math.abs(skew.avgLen - 1.5) < 1e-12);
  ok('entropy of the skewed source = 1.3568', Math.abs(skew.entropy - 1.35678) < 1e-4, `got ${skew.entropy}`);
  ok('H ≤ L < H + 1 (Shannon bound)', skew.avgLen >= skew.entropy && skew.avgLen < skew.entropy + 1);
  ok('redundancy is L - H', Math.abs(skew.redundancy - (skew.avgLen - skew.entropy)) < 1e-12);
  const msg = 'AAAAAABCD';
  const bits = huffmanEncode(msg, skew.codes);
  ok('encoding length = sum of the per-symbol code lengths', bits.length === [...msg].reduce((acc, c) => acc + skew.lengths[c], 0));
  ok('a message of mostly-likely symbols beats fixed-width 2-bit coding', bits.length < msg.length * 2, `${bits.length} vs ${msg.length * 2}`);
  ok('stream decodes back to the message', huffmanDecode(bits, skew.tree).text === msg);
  ok('every bit is consumed by the decode', huffmanDecode(bits, skew.tree).consumed === bits.length);
  const uniform4 = huffmanCodes([...'WXYZ'].map((s) => ({ symbol: s, p: 0.25 })));
  ok('uniform 4-symbol source → all codes 2 bits', Object.values(uniform4.lengths).every((l) => l === 2));
  ok('uniform source: average length equals the 2-bit entropy', Math.abs(uniform4.avgLen - uniform4.entropy) < 1e-12 && Math.abs(uniform4.entropy - 2) < 1e-12);
  ok('a single-symbol source still gets a code', huffmanCodes([{ symbol: 'A', p: 1 }]).codes.A === '0');
  ok('zero-probability symbols are dropped', huffmanCodes([{ symbol: 'A', p: 1 }, { symbol: 'B', p: 0 }]).codes.B === undefined);

  // ---- Central limit theorem ---------------------------------------------
  const one = cltRun({ populationId: 'exponential', n: 1, samples: 4000, seed: 3 });
  const popExp = getPopulation('exponential');
  ok('n = 1 reproduces the population spread (σ)', Math.abs(one.sdOfMeans - popExp.sd) < 0.05, `got ${one.sdOfMeans}`);
  ok('n = 1 histogram uses every sample', one.hist.reduce((s, b) => s + b.count, 0) <= one.means.length);
  const thirty = cltRun({ populationId: 'exponential', n: 30, samples: 4000, seed: 3 });
  ok('n = 30 spread matches σ/√n to 10%', Math.abs(thirty.sdOfMeans / thirty.theoreticalSe - 1) < 0.1, `ratio ${thirty.sdOfMeans / thirty.theoreticalSe}`);
  ok('mean of means ≈ population mean', Math.abs(thirty.meanOfMeans - popExp.mean) < 0.05);
  ok('σ/√n halves when n quadruples', Math.abs(thirty.theoreticalSe / one.theoreticalSe - Math.sqrt(1 / 30)) < 1e-12);
  const seeded = cltRun({ populationId: 'dice', n: 10, samples: 2000, seed: 11 });
  const seeded2 = cltRun({ populationId: 'dice', n: 10, samples: 2000, seed: 11 });
  ok('same seed → identical samples (reproducible demo)', seeded.means[0] === seeded2.means[0] && seeded.sdOfMeans === seeded2.sdOfMeans);
  const dice = getPopulation('dice');
  ok('die mean 3.5, sd √(35/12)', dice.mean === 3.5 && Math.abs(dice.sd - Math.sqrt(35 / 12)) < 1e-12);
  const overlay = normalOverlay(thirty.hist, thirty.meanOfMeans, thirty.theoreticalSe);
  ok('overlay has one value per histogram bin', overlay.length === thirty.hist.length);
  ok('overlay peaks near the centre of the distribution', overlay.indexOf(Math.max(...overlay)) > 12 && overlay.indexOf(Math.max(...overlay)) < 22);
  const bimodal = getPopulation('bimodal');
  ok('bimodal population has the documented sd', Math.abs(bimodal.sd - Math.sqrt(2.41)) < 1e-12);
  const nd = (() => { const r = mulberry32(5); const xs = Array.from({ length: 4000 }, () => normalDraw(r, 0, 1)); return std(xs); })();
  ok('normalDraw(rng, 0, 1) has sd ≈ 1', Math.abs(nd - 1) < 0.06, `got ${nd}`);

  // ---- Gradient descent ---------------------------------------------------
  const bowl = getLandscape('bowl');
  const okRun = gdRun(bowl, { lr: 0.1, steps: 60 });
  ok('bowl with lr = 0.1 converges to the minimum', !okRun.diverged && okRun.distanceToMin < 1e-3, `dist ${okRun.distanceToMin}`);
  ok('bowl loss decreases every step', okRun.path.every((s, i) => i === 0 || s.loss <= okRun.path[i - 1].loss + 1e-12));
  ok('path records at most steps + 1 iterates', okRun.path.length <= 61);
  const tooBig = gdRun(bowl, { lr: 1.5, steps: 40 });
  ok('bowl with lr = 1.5 diverges (needs lr < 2/λmax = 1)', tooBig.diverged);
  const ravine = getLandscape('ravine');
  const rav = gdRun(ravine, { lr: 0.03, steps: 80 });
  ok('ravine with a small step finds a low loss', !rav.diverged && rav.final.loss < 0.01, `loss ${rav.final.loss}`);
  const ravBig = gdRun(ravine, { lr: 0.1, steps: 40 });
  ok('ravine with lr = 0.1 diverges (λmax = 24 → lr < 0.083)', ravBig.diverged);
  ok('gradient norm at the minimum is 0', Math.hypot(...bowl.grad(bowl.min[0], bowl.min[1])) === 0);
  const rosen = getLandscape('banana');
  ok('Rosenbrock gradient vanishes at (1,1)', Math.hypot(...rosen.grad(1, 1)) < 1e-12);
  ok('Rosenbrock minimum is f(1,1) = 0', rosen.fn(1, 1) === 0);
  const rosenRun = gdRun(rosen, { lr: 0.002, steps: 150 });
  ok('Rosenbrock descent makes progress without diverging', !rosenRun.diverged && rosenRun.final.loss < rosen.fn(-1.3, 1.0), `loss ${rosenRun.final.loss}`);
  const custom = gdRun(bowl, { lr: 0.1, steps: 20, start: [0.5, -0.25] });
  ok('a custom start point is honoured', Math.abs(custom.path[0].x - 0.5) < 1e-12 && Math.abs(custom.path[0].y + 0.25) < 1e-12);

  // ---- Linear maps --------------------------------------------------------
  const stretch = getMapPreset('stretch');
  const info = mapInfo(stretch.matrix);
  ok('stretch det = 2 and area scale = 2', info.det === 2 && info.areaScale === 2);
  ok('stretch eigenvalues are 2 and 1', info.eigenvalues.map((e) => e.lambda).sort().join(',') === '1,2');
  ok('stretch does not flip orientation', !info.orientationFlipped);
  ok('shoelace area of the image square = |det|', Math.abs(polygonArea2(transformedUnitSquare(stretch.matrix))) / 2 === 2);
  const shear = getMapPreset('shear');
  ok('shear preserves area (det = 1)', mapInfo(shear.matrix).det === 1);
  ok('shear fixes the x-axis direction', turnDegrees(shear.matrix, [1, 0]) < 1e-9);
  const rot = getMapPreset('rotate');
  const rotInfo = mapInfo(rot.matrix);
  ok('rotate 30° has no real eigenvector', rotInfo.eigenvalues.length === 0 && rotInfo.complex !== undefined);
  ok('rotating (1,0) by 30° turns it 30°', Math.abs(turnDegrees(rot.matrix, [1, 0]) - 30) < 0.5, `got ${turnDegrees(rot.matrix, [1, 0])}`);
  ok('rotation preserves area (|det| = 1)', Math.abs(rotInfo.areaScale - 1) < 1e-12);
  const reflect = getMapPreset('reflect');
  ok('reflection flips orientation with |det| = 1', mapInfo(reflect.matrix).orientationFlipped && mapInfo(reflect.matrix).areaScale === 1);
  const squash = getMapPreset('squash');
  ok('projection is singular and collapses the square area to 0', mapInfo(squash.matrix).singular && polygonArea2(transformedUnitSquare(squash.matrix)) === 0);
  ok('golden preset has complex eigenvalues', mapInfo(getMapPreset('golden').matrix).complex !== undefined);
  ok('identity maps every point to itself', applyMap([1, 0, 0, 1], [2.5, -1.5]).join(',') === '2.5,-1.5');

  // ---- visualization registry --------------------------------------------
  const contentSources = readdirSync('src/data/concepts').map((f) => readFileSync(`src/data/concepts/${f}`, 'utf8')).join('\n');
  const usedViz = new Set([...contentSources.matchAll(/t: 'viz', id: '([a-z0-9-]+)'/g)].map((m) => m[1]));
  ok('content references at least 15 visualizations', usedViz.size >= 15, `got ${usedViz.size}`);
  const vizSrc = readFileSync('src/components/viz.tsx', 'utf8');
  const registryBlock = vizSrc.slice(vizSrc.indexOf('const REGISTRY'), vizSrc.indexOf('export function Viz'));
  const registered = new Set(
    registryBlock.split('\n').map((l) => l.match(/^\s*'?([a-z0-9-]+)'?:/)).filter(Boolean).map((m) => m![1]),
  );
  const missing = [...usedViz].filter((id) => !registered.has(id));
  ok('every viz id used in content is registered', missing.length === 0, `missing: ${missing.join(', ')}`);
  const unused = [...registered].filter((id) => !usedViz.has(id));
  ok('every registered viz is reachable from some concept', unused.length === 0, `unused: ${unused.join(', ')}`);
  const badProps = [...vizSrc.matchAll(/if \(!Cmp\)/g)].length;
  ok('the Viz fallback still exists for unknown ids', badProps === 1);
  const wanted = ['matrix-transform', 'taylor', 'bayes', 'clt', 'gradient-descent', 'huffman'];
  ok('the six new visualizations are all registered', wanted.every((w) => registered.has(w)), `have ${[...registered].join(', ')}`);
  const optSrc = readFileSync('src/data/concepts/optimization.ts', 'utf8');
  ok('gradient descent concept shows the gradient descent viz', /id: 'gradient-descent'/.test(optSrc) && !/prime-explorer/.test(optSrc));
}

console.log('progress store v2 + migration');
{
  const v1 = {
    completed: ['a', 'b', 'a'],
    practice: { q1: { correct: true, attempts: 2 } },
    fieldInterest: 'ml',
    pathStep: { p1: 3 },
  };
  const migrated = migrateProgress(v1);
  ok('migration stamps version 2', migrated.version === 2, `got ${migrated.version}`);
  ok('migration keeps completed (and de-duplicates)', JSON.stringify(migrated.completed) === '["a","b"]', JSON.stringify(migrated.completed));
  ok('migration keeps practice records', migrated.practice.q1.correct === true && migrated.practice.q1.attempts === 2);
  ok('migration keeps fieldInterest', migrated.fieldInterest === 'ml');
  ok('migration keeps pathStep', migrated.pathStep.p1 === 3);
  ok('migration seeds the v2-only fields', migrated.bookmarks.length === 0 && migrated.recent.length === 0 && Object.keys(migrated.snippetRuns).length === 0);
  ok('migration is idempotent', JSON.stringify(migrateProgress(migrated)) === JSON.stringify(migrated));

  const junk = migrateProgress({ completed: 'nope', practice: { q: { attempts: -4, correct: 'yes' } }, fieldInterest: 42, pathStep: { p: 'x', r: 2.7 }, recent: 'no' });
  ok('junk completed becomes an empty list', JSON.stringify(junk.completed) === '[]');
  ok('junk fieldInterest becomes null', junk.fieldInterest === null);
  ok('negative attempts clamp to 0', junk.practice.q.attempts === 0);
  ok('truthy-but-not-true correct becomes false', junk.practice.q.correct === false);
  ok('string pathStep entries are dropped', junk.pathStep.p === undefined && junk.pathStep.r === 2);
  ok('non-array recent becomes an empty list', junk.recent.length === 0);
  ok('migrateProgress survives null/string/number input', [null, undefined, 'x', 7, [], true].every((v) => migrateProgress(v).version === 2));

  const withRecent = migrateProgress({
    recent: [
      { id: 'old', at: 1 }, { id: 'new', at: 9 }, { id: 'old', at: 5 }, { id: 42, at: 3 }, { at: 4 },
      ...Array.from({ length: 12 }, (_, i) => ({ id: `r${i}`, at: 100 + i })),
    ],
  });
  ok('recent is sorted newest-first', withRecent.recent[0].at >= withRecent.recent[1].at);
  ok('recent is capped at the limit', withRecent.recent.length === RECENT_LIMIT, `got ${withRecent.recent.length}`);
  ok('duplicate recent ids collapse onto the newest visit', withRecent.recent.filter((r) => r.id === 'old').length === 0 || withRecent.recent.find((r) => r.id === 'old')?.at === 5);
  const dupe = migrateProgress({ recent: [{ id: 'x', at: 1 }, { id: 'x', at: 7 }] });
  ok('a duplicated id keeps its most recent timestamp', dupe.recent.length === 1 && dupe.recent[0].at === 7, JSON.stringify(dupe.recent));
  ok('malformed recent entries are dropped', withRecent.recent.every((r) => typeof r.id === 'string' && Number.isFinite(r.at)));

  const runs = migrateProgress({ snippetRuns: { s1: { runs: 3.9, lastAt: 10 }, s2: { runs: 'x' }, s3: 5 } });
  ok('snippet run counts are floored', runs.snippetRuns.s1.runs === 3);
  ok('bad snippet run counts become 0', runs.snippetRuns.s2.runs === 0 && runs.snippetRuns.s2.lastAt === 0);
  ok('non-object snippet runs are dropped', runs.snippetRuns.s3 === undefined);

  // fake storage: reads v1 out of the legacy key
  const fake = (data: Record<string, string>) => ({
    getItem: (k: string) => (k in data ? data[k] : null),
  });
  const fromV1 = loadProgress(fake({ [LEGACY_KEY]: JSON.stringify(v1) }));
  ok('loadProgress migrates a v1 payload from the legacy key', fromV1.completed.join() === 'a,b' && fromV1.version === 2);
  const fromV2 = loadProgress(fake({ [LEGACY_KEY]: JSON.stringify(v1), [STORAGE_KEY]: JSON.stringify({ ...DEFAULT_PROGRESS, bookmarks: ['zz'] }) }));
  ok('loadProgress prefers the v2 key when both exist', fromV2.bookmarks.join() === 'zz');
  const corrupt = loadProgress({ getItem: () => '{not json' });
  ok('corrupt JSON falls back to defaults', corrupt.completed.length === 0 && corrupt.version === 2);
  const empty = loadProgress({ getItem: () => null });
  ok('empty storage falls back to defaults', JSON.stringify(empty) === JSON.stringify(DEFAULT_PROGRESS));
}

console.log('palette search');
{
  ok('empty query scores 0, not null', fuzzyScore('', 'anything') === 0);
  ok('exact match beats everything', fuzzyScore('bayes', 'Bayes') === 1000);
  ok('case is ignored', fuzzyScore('BAYES', 'bayes') === 1000);
  ok('prefix beats mid-word match', (fuzzyScore('grad', 'gradient descent') ?? 0) > (fuzzyScore('grad', 'conjugate gradient') ?? 0));
  ok('substring beats scattered subsequence', (fuzzyScore('ent', 'gradient') ?? 0) > (fuzzyScore('ent', 'eigenvalue notation') ?? 0));
  ok('a missing letter is not a match', fuzzyScore('xyz', 'bayes theorem') === null);
  ok('subsequence matches across words', fuzzyScore('byth', 'Bayes Theorem') !== null);
  ok('spaces in the query are ignored', fuzzyScore('gra des', 'Gradient Descent') !== null);
  ok('word-boundary hits score higher than mid-word hits', (fuzzyScore('bc', 'back propagation') ?? 0) > 0);

  const docs = buildSearchDocs();
  ok('index covers every concept', docs.filter((d) => d.kind === 'concept').length === allConcepts.length);
  ok('index covers every domain', docs.filter((d) => d.kind === 'domain').length === domains.length);
  ok('index covers every CS field', docs.filter((d) => d.kind === 'field').length === fields.length);
  ok('index covers every path', docs.filter((d) => d.kind === 'path').length === paths.length);
  ok('index covers every book', docs.filter((d) => d.kind === 'book').length === books.length);
  ok('index includes the static pages', docs.filter((d) => d.kind === 'page').length === 5);
  ok('every doc has a route', docs.every((d) => d.href.startsWith('/')));
  ok('every concept doc points at a real concept', docs.filter((d) => d.kind === 'concept').every((d) => getConcept(d.id) !== undefined));
  ok('doc ids are unique', new Set(docs.map((d) => `${d.kind}-${d.id}`)).size === docs.length);
  ok('every route in the index is one the app serves', docs.every((d) => /\/(concept|domain|field|path)\/[a-z0-9-]+$/.test(d.href) || ['/', '/fields', '/paths', '/books', '/playground'].includes(d.href)));

  ok('empty query returns no results', searchDocs('', docs).length === 0);
  ok('whitespace-only query returns no results', searchDocs('   ', docs).length === 0);
  const grad = searchDocs('gradient descent', docs);
  ok('the gradient descent concept ranks first for its own name', grad[0]?.doc.id === 'gradient-descent', grad[0]?.doc.title);
  const bayes = searchDocs('bayes', docs);
  ok('bayes finds the theorem concept', bayes.some((h) => h.doc.id === 'bayes-theorem'));
  ok('results are ordered by score', bayes.every((h, i) => i === 0 || h.score <= bayes[i - 1].score));
  ok('the limit is honoured', searchDocs('a', docs, 3).length === 3);
  ok('nonsense finds nothing', searchDocs('qqzzxx', docs).length === 0);
  ok('a typo-free substring finds a book', searchDocs('knuth', docs).some((h) => h.doc.kind === 'book'));
  ok('scoreDoc discounts subtitle matches', (scoreDoc('sorting', { id: 'x', kind: 'concept', title: 'Algorithm', subtitle: 'sorting', href: '/concept/x' }) ?? 0) > 0);
}

console.log('snippet runner');
{
  ok('captures console.log', runSnippet('console.log(1 + 1)').logs[0] === '2');
  ok('joins multiple arguments with spaces', runSnippet('console.log("a", 1, true)').logs[0] === 'a 1 true');
  ok('captures several lines in order', JSON.stringify(runSnippet('console.log("x"); console.log("y");').logs) === '["x","y"]');
  ok('arrays format like a console', runSnippet('console.log([1, 2, 3])').logs[0] === '[ 1, 2, 3 ]');
  ok('objects format as JSON', runSnippet('console.log({ a: 1 })').logs[0] === '{"a":1}');
  ok('null and undefined are labelled', runSnippet('console.log(null, undefined)').logs[0] === 'null undefined');
  const boom = runSnippet('console.log("before"); throw new Error("boom");');
  ok('a throwing snippet reports the error instead of crashing', !boom.ok && /boom/.test(boom.error ?? ''));
  ok('output before the throw is kept', boom.logs[0] === 'before');
  ok('run timing is recorded', runSnippet('console.log(1)').ms >= 0);
  ok('snippets cannot see the module scope', runSnippet('console.log(typeof require)').logs[0] === 'undefined');
  const cmp = compareOutput(runSnippet('console.log("hi")'), 'hi');
  ok('compareOutput matches identical output', cmp.matches && cmp.actual === 'hi');
  ok('compareOutput flags a failed run', !compareOutput(runSnippet('throw new Error("x")'), '').matches);
}

console.log('playground snippets');
{
  ok('there are at least 35 snippets', snippets.length >= 35, `got ${snippets.length}`);
  ok('snippet ids are unique', new Set(snippets.map((s) => s.id)).size === snippets.length);
  const badConcept = snippets.filter((s) => !conceptMap.has(s.conceptId)).map((s) => `${s.id}->${s.conceptId}`);
  ok('every snippet is attached to a real concept', badConcept.length === 0, badConcept.join(', '));
  ok('every snippet has a title and blurb', snippets.every((s) => s.title.length > 3 && s.blurb.length > 10));
  ok('every snippet declares an output', snippets.every((s) => s.output.trim().length > 0));
  ok('no snippet imports anything', snippets.every((s) => !/\b(import|require)\s*\(?/.test(s.code)));

  let allMatch = true;
  let threw: string[] = [];
  let mismatched: string[] = [];
  for (const s of snippets) {
    const r = runSnippet(s.code);
    if (!r.ok) { allMatch = false; threw.push(s.id); continue; }
    if (r.logs.join('\n') !== s.output) { allMatch = false; mismatched.push(s.id); }
  }
  ok('every snippet executes without throwing', threw.length === 0, threw.join(', '));
  ok('every snippet output matches a real execution', allMatch, `mismatched: ${mismatched.join(', ')}`);
  ok('snippets are deterministic across runs', snippets.every((s) => { const a = runSnippet(s.code).logs.join('\n'); const b = runSnippet(s.code).logs.join('\n'); return a === b; }));

  const covered = new Set(snippets.map((s) => s.conceptId));
  ok('snippets span at least 12 domains', new Set(snippets.map((s) => getConcept(s.conceptId)?.domain)).size >= 12, `got ${new Set(snippets.map((s) => getConcept(s.conceptId)?.domain)).size}`);
  ok('at least 25 distinct concepts have a runnable snippet', covered.size >= 25, `got ${covered.size}`);
  ok('snippetsForConcept finds the euclid snippet', snippetsForConcept('euclidean-algorithm').some((s) => s.id === 'euclid-gcd'));
  ok('snippetsForConcept is empty for a concept with no snippet', snippetsForConcept('no-such-concept').length === 0);
  ok('snippetById round-trips', snippetById(snippets[0].id)?.id === snippets[0].id);
}


console.log('bundle D preference and reading helpers');
{
  ok('system resolves to light when the OS is light', resolveTheme('system', false) === 'light');
  ok('system resolves to dark when the OS is dark', resolveTheme('system', true) === 'dark');
  ok('explicit theme wins over the OS', resolveTheme('light', true) === 'light' && resolveTheme('dark', false) === 'dark');
  ok('theme parser rejects corrupt storage', parseThemePreference('sepia') === 'system');
  ok('theme cycle is light → dark → system → light', nextThemePreference('light') === 'dark' && nextThemePreference('dark') === 'system' && nextThemePreference('system') === 'light');
  ok('two-state toggle follows the resolved theme', toggledThemePreference('light') === 'dark' && toggledThemePreference('dark') === 'light');

  const blocks: Block[] = [
    { t: 'p', text: 'A short introduction with five words.' },
    { t: 'h', text: 'The main idea' },
    { t: 'def', title: 'A definition', text: 'A useful definition.' },
    { t: 'props', title: 'Important facts', items: [{ title: 'First', text: 'A fact.' }] },
    { t: 'formula', name: 'The formula', latex: 'a+b', note: 'Add the terms.' },
    { t: 'props', title: 'Important facts', items: [{ title: 'Second', text: 'Another fact.' }] },
    { t: 'viz', id: 'truth-table' },
  ];
  const outline = buildOutline(blocks);
  ok('outline includes authored headings and labelled cards', outline.length === 5);
  ok('outline includes properties cards, not just h blocks', outline.some((entry) => entry.label.startsWith('Properties')));
  ok('duplicate section labels receive stable unique anchors', new Set(outline.map((entry) => entry.id)).size === outline.length && outline[4].id.endsWith('-2'));
  ok('outline keeps source block indexes for anchors', outline.map((entry) => entry.index).join(',') === '1,2,3,4,5');
  ok('word count ignores interactive blocks', wordCount(blocks) > 10 && readingTimeMinutes(blocks, 10) === Math.ceil(wordCount(blocks) / 10));
  ok('reading time is always at least one minute', readingTimeMinutes([]) === 1 && readingTimeLabel(blocks).includes('min read'));
  ok('reader preferences reject malformed values', JSON.stringify(parseReaderPreferences({ fontSize: 'huge', width: 'infinite' })) === JSON.stringify(DEFAULT_READER_PREFERENCES));
  const vars = readerCssVariables({ fontSize: 'xl', width: 'wide' });
  ok('reader controls resolve to the documented CSS variables', vars['--reader-font-size'] === READER_FONT_SIZES.xl && vars['--reader-width'] === READER_WIDTHS.wide);
}

console.log('bundle D token and delivery guards');
{
  const css = readFileSync('src/index.css', 'utf8');
  const tailwind = readFileSync('tailwind.config.js', 'utf8');
  const app = readFileSync('src/App.tsx', 'utf8');
  const index = readFileSync('index.html', 'utf8');
  const vizSrc = readFileSync('src/components/viz.tsx', 'utf8');
  const sw = readFileSync('public/sw.js', 'utf8');
  const manifest = readFileSync('public/manifest.webmanifest', 'utf8');
  ok('light and dark palettes define the core semantic tokens', ['--color-paper', '--color-surface', '--color-ink', '--color-line'].every((token) => css.includes(token)) && css.includes("[data-theme='dark']"));
  ok('Tailwind colors consume CSS variables instead of fixed hex values', tailwind.includes('rgb(var(--color-paper)') && !/paper:\s*['"]#/.test(tailwind));
  ok('the shell has route-level lazy imports and a Suspense boundary', app.includes('lazy(() => import') && app.includes('<Suspense fallback'));
  ok('the no-flash script runs before the app module', index.indexOf('mathcs-theme') < index.indexOf('/src/main.tsx'));
  ok('visualization hex literals were replaced by semantic SVG tokens', !/#[0-9A-Fa-f]{3,8}/.test(vizSrc) && vizSrc.includes('svgColor'));
  ok('gradient descent exposes a distinct dark heatmap ramp', lossColor(0, 'light') !== lossColor(0, 'dark') && lossColor(1, 'light') !== lossColor(1, 'dark'));
  ok('manifest advertises maskable icons', manifest.includes('purpose') && manifest.includes('maskable') && manifest.includes('icon-512.png'));
  ok('service worker caches the shell and serves deep links offline', sw.includes("event.request.mode === 'navigate'") && sw.includes('caches.match(SHELL)') && sw.includes('staleWhileRevalidate'));
  ok('production-only service-worker registration is guarded', readFileSync('src/main.tsx', 'utf8').includes('import.meta.env.PROD'));
}

console.log('concept index + lazy domain loading (bundle split)');
{
  const committed = readFileSync('src/data/concept-index.ts', 'utf8');
  ok('the committed concept index matches the content files', committed === serializeConceptIndex(allConcepts));
  ok('the index has one entry per concept', conceptIndex.length === allConcepts.length);
  ok('index ids match the registry exactly, in order', conceptIndex.every((e, i) => e.id === allConcepts[i].id));
  ok('index titles, domains and levels match the registry',
    conceptIndex.every((e, i) => e.title === allConcepts[i].title && e.domain === allConcepts[i].domain && e.level === allConcepts[i].level));
  ok('index counts match the registry',
    conceptIndex.every((e, i) => e.practiceCount === allConcepts[i].practice.length && e.blockCount === allConcepts[i].content.length));
  ok('the index carries no lesson content', conceptIndex.every((e) => !('content' in e) && !('practice' in e)));

  // Nothing the app ships may pull the whole registry in: that is the split.
  const shipped = readdirSync('src', { recursive: true })
    .filter((f): f is string => typeof f === 'string' && /\.tsx?$/.test(f))
    .map((f) => `src/${f}`);
  const offenders = shipped.filter((f) => /from '[^']*lib\/concepts'/.test(readFileSync(f, 'utf8')));
  ok('no shipped module imports the static registry', offenders.length === 0, offenders.join(', '));
  ok('the shipped index imports no domain module', !/data\/concepts/.test(readFileSync('src/data/concept-index.ts', 'utf8')));
  const loaderSrc = readFileSync('src/lib/concept-loader.ts', 'utf8');
  ok('the loader reaches content only through dynamic import()',
    /import\('\.\.\/data\/concepts\//.test(loaderSrc) && !/from '\.\.\/data\/concepts\//.test(loaderSrc));
  ok('every domain in the index has a lazy loader', [...domainsWithContent].every((d) => loadableDomains.includes(d)));
  ok('no loader is dead weight', loadableDomains.length === domainsWithContent.size);

  // The lazy path returns real lessons, and suspends before it can.
  clearConceptCache();
  ok('readConcept returns undefined for an unknown id', readConcept('no-such-concept') === undefined);
  let suspended = false;
  try {
    readConcept('partial-orders');
  } catch (thrown) {
    suspended = typeof (thrown as { then?: unknown } | null)?.then === 'function';
  }
  ok('readConcept suspends (throws a promise) before the chunk arrives', suspended);
  const body = await loadConcept('partial-orders');
  ok('loadConcept returns the real lesson with its content', body?.id === 'partial-orders' && body.content.length === 8 && body.practice.length === 5);
  ok('once loaded, readConcept is synchronous', readConcept('partial-orders')?.title === body?.title);

  let bodiesMatch = true;
  for (const domain of domainsWithContent) {
    const entry = conceptIndex.find((e) => e.domain === domain)!;
    const concept = await loadConcept(entry.id);
    if (!concept || concept.title !== entry.title || concept.content.length !== entry.blockCount) bodiesMatch = false;
  }
  ok('every domain loads through the lazy loader', true);
  ok('loaded bodies match the index entry they stand for', bodiesMatch);
  ok('loading an unknown concept resolves to undefined', (await loadConcept('no-such-concept')) === undefined);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
