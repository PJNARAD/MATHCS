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
import {
  DAY_STAMP_LIMIT, DEFAULT_PROGRESS, LEGACY_KEY, LEGACY_KEYS, PROGRESS_VERSION, RECENT_LIMIT, STORAGE_KEY,
  loadProgress, localDayKey, migrateProgress, nextPracticeRecord, normalizeDayStamps,
} from '../src/lib/store';
import type { PracticeRecord } from '../src/lib/store';
import {
  DAY_MS, REVIEW_INTERVALS_MS, SESSION_MODES, buildSession, dueCount, dueLabel, dueInMs, intervalFor,
  isDue, isMissed, priorityOf, shuffled, sortQueue, stageCounts, stageOf, formatStageCounts,
} from '../src/lib/srs';
import {
  closestToFinished, currentStreak, dayIndexOf, dayKeyOfIndex, domainStats, formatPct, lessonsOf,
  longestStreak, nextUp, overallStats, recentEntries, savedEntries, streakCalendar, unfinishedVisits,
  weakestDomains,
} from '../src/lib/progress';
import {
  REFERENCE_FILES, extractReferences, serializeApplicationsIndex, serializeGlossaryIndex,
  serializePracticeIndex, serializeTheoremIndex,
} from '../src/lib/reference-index-file';
import type { ConceptIndexEntry } from '../src/lib/concept-index-file';
import {
  clearReferenceCache, loadApplications, loadGlossary, loadPracticeIndex, loadTheorems,
  practiceDomainMap, readApplications, readGlossary, readPracticeIndex, readTheorems, referenceSlices,
} from '../src/lib/reference-loader';
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
  LATTICE_PRESETS, getLatticePreset, divisorLattice,
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

console.log('progress store v3 + migration');
{
  const v1 = {
    completed: ['a', 'b', 'a'],
    practice: { q1: { correct: true, attempts: 2 } },
    fieldInterest: 'ml',
    pathStep: { p1: 3 },
  };
  const migrated = migrateProgress(v1);
  ok('migration stamps the current version', migrated.version === PROGRESS_VERSION, `got ${migrated.version}`);
  ok('migration keeps completed (and de-duplicates)', JSON.stringify(migrated.completed) === '["a","b"]', JSON.stringify(migrated.completed));
  ok('migration keeps practice records', migrated.practice.q1.correct === true && migrated.practice.q1.attempts === 2);
  ok('migration keeps fieldInterest', migrated.fieldInterest === 'ml');
  ok('migration keeps pathStep', migrated.pathStep.p1 === 3);
  ok('migration seeds the newer fields', migrated.bookmarks.length === 0 && migrated.recent.length === 0
    && Object.keys(migrated.snippetRuns).length === 0 && migrated.dayStamps.length === 0);
  ok('migration is idempotent', JSON.stringify(migrateProgress(migrated)) === JSON.stringify(migrated));

  // A pre-v3 record only knew "ever correct" plus a total. The split is
  // reconstructed as one success and the rest misses, so an existing learner's
  // review queue survives the upgrade instead of being thrown away.
  ok('an old record is reconstructed as one success and the rest misses',
    migrated.practice.q1.right === 1 && migrated.practice.q1.wrong === 1);
  ok('an old record keeps its ever-correct verdict as the last result', migrated.practice.q1.lastCorrect === true);
  ok('a record with no timestamp migrates to 0, never NaN', migrated.practice.q1.lastAt === 0);
  const wrongOnly = migrateProgress({ practice: { q: { correct: false, attempts: 3 } } });
  ok('a never-correct record keeps every attempt as a miss',
    wrongOnly.practice.q.wrong === 3 && wrongOnly.practice.q.right === 0 && wrongOnly.practice.q.lastCorrect === false);

  const junk = migrateProgress({ completed: 'nope', practice: { q: { attempts: -4, correct: 'yes' } }, fieldInterest: 42, pathStep: { p: 'x', r: 2.7 }, recent: 'no' });
  ok('junk completed becomes an empty list', JSON.stringify(junk.completed) === '[]');
  ok('junk fieldInterest becomes null', junk.fieldInterest === null);
  ok('negative attempts clamp to 0', junk.practice.q.attempts === 0);
  ok('truthy-but-not-true correct becomes false', junk.practice.q.correct === false);
  ok('string pathStep entries are dropped', junk.pathStep.p === undefined && junk.pathStep.r === 2);
  ok('non-array recent becomes an empty list', junk.recent.length === 0);
  ok('migrateProgress survives null/string/number input',
    [null, undefined, 'x', 7, [], true].every((v) => migrateProgress(v).version === PROGRESS_VERSION));

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

  // ---- v3: activity days -------------------------------------------------
  const stamps = migrateProgress({ dayStamps: ['2026-03-05', '2026-03-01', '2026-03-05', 'not-a-day', 7, '2026-3-1'] });
  ok('day stamps are de-duplicated and sorted', JSON.stringify(stamps.dayStamps) === '["2026-03-01","2026-03-05"]', JSON.stringify(stamps.dayStamps));
  ok('malformed day stamps are dropped', stamps.dayStamps.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)));
  const many = Array.from({ length: DAY_STAMP_LIMIT + 40 }, (_, i) => new Date(Date.UTC(2024, 0, 1 + i)).toISOString().slice(0, 10));
  const capped = normalizeDayStamps(many);
  ok('day stamps are capped from the old end', capped.length === DAY_STAMP_LIMIT
    && capped[capped.length - 1] === many[many.length - 1] && !capped.includes(many[0]));
  ok('non-array day stamps become an empty list', normalizeDayStamps('nope').length === 0 && normalizeDayStamps(undefined).length === 0);

  // ---- v3: the record an answer produces ---------------------------------
  const first = nextPracticeRecord(undefined, false, 1000);
  ok('a first miss records one attempt and one wrong',
    first.attempts === 1 && first.wrong === 1 && first.right === 0 && first.correct === false && first.lastCorrect === false);
  const second = nextPracticeRecord(first, true, 2000);
  ok('a later success does not erase the earlier miss',
    second.correct === true && second.lastCorrect === true && second.right === 1 && second.wrong === 1 && second.attempts === 2);
  const third = nextPracticeRecord(second, true, 3000);
  ok('successes accumulate so the schedule can lengthen', third.right === 2 && third.wrong === 1 && third.lastAt === 3000);
  ok('a bad timestamp cannot overwrite the last attempt time', nextPracticeRecord(third, true, Number.NaN).lastAt === 3000);
  ok('the store key moved with the version', STORAGE_KEY === `mathcs-progress-v${PROGRESS_VERSION}` && LEGACY_KEYS[0] === 'mathcs-progress-v2');

  ok('localDayKey formats a timestamp as a local YYYY-MM-DD',
    /^\d{4}-\d{2}-\d{2}$/.test(localDayKey(Date.now())) && localDayKey(new Date(2026, 0, 5, 12).getTime()) === '2026-01-05');

  // fake storage: reads whichever key the payload was written under
  const fake = (data: Record<string, string>) => ({
    getItem: (k: string) => (k in data ? data[k] : null),
  });
  const fromV1 = loadProgress(fake({ [LEGACY_KEY]: JSON.stringify(v1) }));
  ok('loadProgress migrates a v1 payload from the oldest key', fromV1.completed.join() === 'a,b' && fromV1.version === PROGRESS_VERSION);
  const fromV2 = loadProgress(fake({ [LEGACY_KEYS[0]]: JSON.stringify({ completed: ['x'], bookmarks: ['zz'] }) }));
  ok('loadProgress migrates a v2 payload and keeps its bookmarks', fromV2.bookmarks.join() === 'zz' && fromV2.version === PROGRESS_VERSION);
  const newest = loadProgress(fake({
    [LEGACY_KEY]: JSON.stringify(v1),
    [LEGACY_KEYS[0]]: JSON.stringify({ completed: ['x'] }),
    [STORAGE_KEY]: JSON.stringify({ ...DEFAULT_PROGRESS, completed: ['current'] }),
  }));
  ok('loadProgress prefers the current key when all three exist', newest.completed.join() === 'current');
  const corrupt = loadProgress({ getItem: () => '{not json' });
  ok('corrupt JSON falls back to defaults', corrupt.completed.length === 0 && corrupt.version === PROGRESS_VERSION);
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
  const STATIC_PAGES = ['/', '/fields', '/paths', '/books', '/playground', '/practice', '/progress', '/glossary', '/theorems', '/applications'];
  ok('index includes every static page the app serves', docs.filter((d) => d.kind === 'page').length === STATIC_PAGES.length,
    `got ${docs.filter((d) => d.kind === 'page').length}`);
  ok('every static route is in the palette', STATIC_PAGES.every((href) => docs.some((d) => d.kind === 'page' && d.href === href)));
  ok('every doc has a route', docs.every((d) => d.href.startsWith('/')));
  ok('every concept doc points at a real concept', docs.filter((d) => d.kind === 'concept').every((d) => getConcept(d.id) !== undefined));
  ok('doc ids are unique', new Set(docs.map((d) => `${d.kind}-${d.id}`)).size === docs.length);
  // Derived from the router rather than a hand-kept list, so a palette entry
  // can never point at a route the app does not render.
  const routePaths = [...readFileSync('src/App.tsx', 'utf8').matchAll(/<Route path="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((route) => route !== '*');
  const routePatterns = routePaths.map((route) => new RegExp(`^${route.replace(/:[^/]+/g, '[a-z0-9-]+$')}$`));
  ok('the router declares every documented route', STATIC_PAGES.every((href) => routePaths.includes(href)));
  ok('every route in the index is one the app serves',
    docs.every((d) => routePatterns.some((pattern) => pattern.test(d.href))),
    docs.filter((d) => !routePatterns.some((pattern) => pattern.test(d.href))).map((d) => d.href).join(', '));

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

console.log('lattice math (D36, D30, N5)');
{
  type Lat = { meet: number[][]; join: number[][] };
  const le = (p: Lat, a: number, b: number): boolean => p.meet[a][b] === a;
  /** distributive law a ∧ (b ∨ c) = (a ∧ b) ∨ (a ∧ c), for every triple */
  const isDistributiveTable = (p: Lat): boolean => {
    const n = p.meet.length;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
      if (p.meet[i][p.join[j][k]] !== p.join[p.meet[i][j]][p.meet[i][k]]) return false;
    }
    return true;
  };

  for (const p of LATTICE_PRESETS) {
    const n = p.elements.length;
    let idem = true, sym = true, assoc = true, abs = true, meetLeJoin = true;
    for (let i = 0; i < n; i++) {
      idem = idem && p.meet[i][i] === i && p.join[i][i] === i;
      for (let j = 0; j < n; j++) {
        sym = sym && p.meet[i][j] === p.meet[j][i] && p.join[i][j] === p.join[j][i];
        meetLeJoin = meetLeJoin && le(p, p.meet[i][j], p.join[i][j]);
        abs = abs && p.join[i][p.meet[i][j]] === i && p.meet[i][p.join[i][j]] === i;
        for (let k = 0; k < n; k++) {
          assoc = assoc
            && p.meet[p.meet[i][j]][k] === p.meet[i][p.meet[j][k]]
            && p.join[p.join[i][j]][k] === p.join[i][p.join[j][k]];
        }
      }
    }
    ok(`${p.id}: meet/join tables form a lattice (idempotent, commutative, associative, absorbing)`,
      idem && sym && assoc && abs);
    ok(`${p.id}: meet ≤ join for every pair`, meetLeJoin);
    // covers are strict rank-raising steps and a meet of the pair is the lower end
    ok(`${p.id}: every cover is strict and rank-raising`,
      p.covers.every(([u, v]) => u !== v && p.rank[v] > p.rank[u] && le(p, u, v)));
    // bottoms and tops really are least/greatest
    const bi = p.elements.findIndex((e) => e.label === p.bottom);
    const ti = p.elements.findIndex((e) => e.label === p.top);
    ok(`${p.id}: declared ⊥ is least and ⊤ is greatest`,
      bi >= 0 && ti >= 0 && p.elements.every((_, i) => le(p, bi, i) && le(p, i, ti)));
    // every pair has a meet and a join (the defining property of a lattice)
    ok(`${p.id}: every pair has a join and a meet`,
      p.elements.every((_, i) => p.elements.every((_, j) =>
        le(p, p.meet[i][j], i) && le(p, p.meet[i][j], j) && le(p, i, p.join[i][j]) && le(p, j, p.join[i][j]))));
  }

  const idxOf = (p: (typeof LATTICE_PRESETS)[number], label: string): number =>
    p.elements.findIndex((e) => e.label === label);

  const d36 = getLatticePreset('d36');
  ok('D36 has the nine divisors of 36 in order',
    d36.elements.map((e) => e.label).join(' ') === '1 2 3 4 6 9 12 18 36');
  ok('D36 has 12 cover edges (each multiplies by one prime)', d36.covers.length === 12);
  ok('D36 ranks: 1:0 2:1 3:1 4:2 6:2 9:2 12:3 18:3 36:4',
    d36.rank.join(' ') === '0 1 1 2 2 2 3 3 4');
  ok('D36 is graded: every cover raises the rank by exactly 1',
    d36.covers.every(([u, v]) => d36.rank[v] === d36.rank[u] + 1));
  ok('D36: 12 ∧ 18 = 6 and 12 ∨ 18 = 36 (gcd / lcm)',
    d36.elements[d36.meet[idxOf(d36, '12')][idxOf(d36, '18')]].label === '6'
    && d36.elements[d36.join[idxOf(d36, '12')][idxOf(d36, '18')]].label === '36');
  ok('D36: 4 ∧ 6 = 2 and 4 ∨ 6 = 12',
    d36.elements[d36.meet[idxOf(d36, '4')][idxOf(d36, '6')]].label === '2'
    && d36.elements[d36.join[idxOf(d36, '4')][idxOf(d36, '6')]].label === '12');
  ok('D36 is distributive (product of two chains)', isDistributiveTable(d36));

  const d30 = getLatticePreset('d30');
  ok('D30 has the eight divisors of 30 in order',
    d30.elements.map((e) => e.label).join(' ') === '1 2 3 5 6 10 15 30');
  ok('D30 has 12 cover edges (a cube)', d30.covers.length === 12);
  ok('D30 is graded: every cover raises the rank by exactly 1',
    d30.covers.every(([u, v]) => d30.rank[v] === d30.rank[u] + 1));
  // Boolean: every element has a unique complement
  const top30 = idxOf(d30, '30'), bot30 = idxOf(d30, '1');
  ok('D30 (B3): every element has exactly one complement',
    d30.elements.every((_, i) =>
      d30.elements.filter((__, c) => d30.join[i][c] === top30 && d30.meet[i][c] === bot30).length === 1));
  ok('D30 is distributive (a Boolean algebra)', isDistributiveTable(d30));

  const n5 = getLatticePreset('n5');
  ok('N5 has five elements and five cover edges', n5.elements.length === 5 && n5.covers.length === 5);
  ok('N5 is not graded (a ⊤-cover of a jumps two ranks)',
    !n5.covers.every(([u, v]) => n5.rank[v] === n5.rank[u] + 1));
  ok('N5: a ∧ b = 0 and a ∨ b = 1 (a is incomparable to b)',
    n5.elements[n5.meet[idxOf(n5, 'a')][idxOf(n5, 'b')]].label === '0'
    && n5.elements[n5.join[idxOf(n5, 'a')][idxOf(n5, 'b')]].label === '1');
  ok('N5 fails distributivity: c ∧ (a ∨ b) = c but (c ∧ a) ∨ (c ∧ b) = b', !isDistributiveTable(n5));

  const L = divisorLattice(36);
  ok('divisorLattice(36) covers are single-prime steps',
    L.covers.every(([lo, hi]) => hi / lo === 2 || hi / lo === 3));
  const L60 = divisorLattice(60);
  ok('divisorLattice(60) has 12 elements and the right height (Ω(60) = 4)',
    L60.elements.length === 12 && Math.max(...L60.rank) === 4);
  let threw = false;
  try { divisorLattice(2 * 3 * 5 * 7); } catch { threw = true; }
  ok('divisorLattice rejects >3 distinct primes', threw);
}

console.log('generated reference indexes (glossary, theorems, applications, practice)');
{
  const extracted = extractReferences(allConcepts);
  const countBlocks = (t: string): number =>
    allConcepts.reduce((n, c) => n + c.content.filter((b) => (b as Block).t === t).length, 0);
  const csItems = allConcepts.reduce(
    (n, c) => n + c.content.reduce((m, b) => m + ((b as Block).t === 'cs' ? ((b as { items: unknown[] }).items.length) : 0), 0),
    0,
  );
  const questions = allConcepts.reduce((n, c) => n + c.practice.length, 0);

  ok('the committed glossary matches the content files',
    readFileSync('src/data/glossary-index.ts', 'utf8') === serializeGlossaryIndex(allConcepts));
  ok('the committed theorem index matches the content files',
    readFileSync('src/data/theorem-index.ts', 'utf8') === serializeTheoremIndex(allConcepts));
  ok('the committed applications index matches the content files',
    readFileSync('src/data/applications-index.ts', 'utf8') === serializeApplicationsIndex(allConcepts));
  ok('the committed practice manifest matches the content files',
    readFileSync('src/data/practice-index.ts', 'utf8') === serializePracticeIndex(allConcepts));

  ok('every def block becomes a glossary entry', extracted.glossary.length === countBlocks('def'),
    `${extracted.glossary.length} vs ${countBlocks('def')}`);
  ok('every thm block becomes a theorem entry', extracted.theorems.length === countBlocks('thm'));
  ok('every cs item becomes an application entry', extracted.applications.length === csItems,
    `${extracted.applications.length} vs ${csItems}`);
  ok('every question appears in the practice manifest', extracted.practice.length === questions);

  // The bug this manifest made visible: two lessons both calling a question
  // "bs-p1" means one answer writes both records, because the store is keyed by
  // question id. Uniqueness is now a guarded property.
  const ids = extracted.practice.map((entry) => entry.id);
  ok('practice question ids are globally unique', new Set(ids).size === ids.length,
    `${new Set(ids).size} unique of ${ids.length}`);
  ok('every concept keeps its own question ids distinct',
    allConcepts.every((c) => new Set(c.practice.map((q) => q.id)).size === c.practice.length));

  // Anchors are produced by the same outline builder ConceptPage renders with,
  // so a deep link can never point at a block that has no id attribute.
  const anchorsOf = new Map(allConcepts.map((c) => [c.id, new Set(buildOutline(c.content).map((e) => e.id))]));
  const anchored = [...extracted.glossary, ...extracted.theorems, ...extracted.applications];
  ok('every generated entry deep-links to a real anchor in its lesson',
    anchored.every((entry) => anchorsOf.get(entry.conceptId)?.has(entry.anchor)),
    anchored.filter((entry) => !anchorsOf.get(entry.conceptId)?.has(entry.anchor)).slice(0, 3).map((e) => `${e.conceptId}#${e.anchor}`).join(', '));
  ok('every entry points at a published concept',
    anchored.every((entry) => conceptMap.has(entry.conceptId)) && extracted.practice.every((e) => conceptMap.has(e.conceptId)));
  ok('entries carry the domain of their lesson',
    anchored.every((entry) => conceptMap.get(entry.conceptId)?.domain === entry.domain));
  ok('the manifest carries no question text',
    extracted.practice.every((entry) => !('q' in entry) && !('explain' in entry) && !('answer' in entry) && !('options' in entry)));
  ok('theorems keep the proof steps the lesson wrote',
    extracted.theorems.filter((t) => t.proof.length > 0).length
      === allConcepts.reduce((n, c) => n + c.content.filter((b) => b.t === 'thm' && (b.proof ?? []).length > 0).length, 0));

  // Delivery guards, mirroring the concept-index ones.
  for (const file of REFERENCE_FILES) {
    const src = readFileSync(file.path, 'utf8');
    ok(`the ${file.label} slice imports neither the registry nor a domain module`,
      !/lib\/concepts'/.test(src) && !/data\/concepts\//.test(src));
    ok(`the ${file.label} slice is data only (no React, no loader)`,
      !/from 'react'/.test(src) && !/concept-loader/.test(src));
  }
  const loaderSrc = readFileSync('src/lib/reference-loader.ts', 'utf8');
  ok('the reference loader reaches the slices only through dynamic import()',
    (loaderSrc.match(/import\('\.\.\/data\/(glossary|theorem|applications|practice)-index'\)/g) ?? []).length === REFERENCE_FILES.length
    && !/from '\.\.\/data\/(glossary|theorem|applications|practice)-index'/.test(loaderSrc));
  ok('no shipped page imports a generated slice statically',
    readdirSync('src/pages').every((f) => !/from '\.\.\/data\/(glossary|theorem|applications|practice)-index'/.test(readFileSync(`src/pages/${f}`, 'utf8'))));

  // The suspending read contract, same as readConcept.
  clearReferenceCache();
  ok('every slice starts cold', Object.values(referenceSlices).every((slice) => !slice.isLoaded()));
  let suspended = 0;
  for (const read of [readGlossary, readTheorems, readApplications, readPracticeIndex]) {
    try { read(); } catch (thrown) { if (typeof (thrown as { then?: unknown } | null)?.then === 'function') suspended += 1; }
  }
  ok('each reader suspends (throws a promise) before its chunk arrives', suspended === REFERENCE_FILES.length, `got ${suspended}`);
  const [glossary, theorems, applications, practice] = await Promise.all([
    loadGlossary(), loadTheorems(), loadApplications(), loadPracticeIndex(),
  ]);
  ok('once loaded, the readers are synchronous',
    readGlossary().length === glossary.length && readTheorems().length === theorems.length
    && readApplications().length === applications.length && readPracticeIndex().length === practice.length);
  ok('the loaded slices are the extracted ones',
    glossary.length === extracted.glossary.length && practice.length === extracted.practice.length);
  ok('practiceDomainMap resolves every question to its domain',
    practiceDomainMap().size === practice.length && practice.every((e) => practiceDomainMap().get(e.id) === e.domain));
}

console.log('spaced repetition (practice trainer schedule)');
{
  const now = Date.UTC(2026, 2, 10, 12);
  const day = DAY_MS;
  const rec = (over: Partial<PracticeRecord> = {}): PracticeRecord => ({
    correct: false, attempts: 0, right: 0, wrong: 0, lastCorrect: false, lastAt: 0, ...over,
  });
  const seen = rec({ correct: true, attempts: 1, right: 1, lastCorrect: true, lastAt: now });
  const twice = rec({ correct: true, attempts: 2, right: 2, lastCorrect: true, lastAt: now });
  const solid = rec({ correct: true, attempts: 3, right: 3, lastCorrect: true, lastAt: now });
  const missed = rec({ attempts: 1, wrong: 1, lastCorrect: false, lastAt: now - 10 * day });

  ok('the schedule is 1 / 3 / 7 days', JSON.stringify([...REVIEW_INTERVALS_MS]) === JSON.stringify([day, 3 * day, 7 * day]));
  ok('an unattempted question is new and due now', stageOf(undefined) === 'new' && isDue(undefined, now));
  ok('a miss is "learning" and comes straight back', stageOf(missed) === 'learning' && isDue(missed, now) && intervalFor(missed) === 0);
  ok('one success waits a day', stageOf(seen) === 'review' && intervalFor(seen) === day);
  ok('two successes wait three days', intervalFor(twice) === 3 * day);
  ok('three successes wait a week and count as mastered', stageOf(solid) === 'mastered' && intervalFor(solid) === 7 * day);
  ok('a question is due exactly when its gap has elapsed',
    !isDue(rec({ ...seen, lastAt: now - day + 1000 }), now) && isDue(rec({ ...seen, lastAt: now - day }), now));
  ok('dueInMs counts down to the gap and never goes negative',
    dueInMs(seen, now) === day && dueInMs(rec({ ...seen, lastAt: now - 1000 }), now) === day - 1000
    && dueInMs(rec({ ...seen, lastAt: now - 2 * day }), now) === 0);
  ok('a pre-v3 record with no timestamp is treated as due, not dropped',
    isDue(rec({ correct: true, attempts: 2, right: 1, lastCorrect: true, lastAt: 0 }), now));
  ok('a wrong answer after a right one re-opens the question',
    isMissed(rec({ correct: true, attempts: 2, right: 1, wrong: 1, lastCorrect: false, lastAt: now }))
    && !isMissed(rec({ correct: true, attempts: 2, right: 2, wrong: 0, lastCorrect: true, lastAt: now })));

  const pool = [
    { id: 'q-solid', diff: 'easy' as const, conceptId: 'a' },
    { id: 'q-missed', diff: 'medium' as const, conceptId: 'a' },
    { id: 'q-new', diff: 'hard' as const, conceptId: 'b' },
    { id: 'q-seen', diff: 'easy' as const, conceptId: 'b' },
  ];
  const records: Record<string, PracticeRecord> = {
    'q-solid': { ...solid, lastAt: now - 8 * day },
    'q-missed': missed,
    'q-seen': { ...seen, lastAt: now - 2 * day },
  };

  const ordered = sortQueue(pool, records, now).map((item) => item.id);
  ok('the queue asks new first, then the miss, then the overdue review',
    ordered[0] === 'q-new' && ordered[1] === 'q-missed' && ordered[2] === 'q-seen', ordered.join(' → '));
  ok('a long-mastered question goes last', ordered[ordered.length - 1] === 'q-solid', ordered.join(' → '));
  ok('equal priority falls back to the question id, so a session is reproducible',
    JSON.stringify(sortQueue(pool, {}, now)) === JSON.stringify(sortQueue(pool, {}, now))
    && sortQueue(pool, {}, now).map((i) => i.id).join() === 'q-missed,q-new,q-seen,q-solid');
  ok('priority ranks a new question above a due review', priorityOf(undefined, now) > priorityOf(missed, now));
  ok('a question that is not due scores below every due one', priorityOf(solid, now) < priorityOf(missed, now));

  ok('buildSession honours the limit', buildSession(pool, records, now, { limit: 2 }).length === 2);
  ok('buildSession "new" returns only unattempted questions',
    buildSession(pool, records, now, { mode: 'new', limit: 10 }).map((i) => i.id).join() === 'q-new');
  ok('buildSession "missed" returns only last-attempt-wrong questions',
    buildSession(pool, records, now, { mode: 'missed', limit: 10 }).map((i) => i.id).join() === 'q-missed');
  ok('buildSession "all" keeps curriculum order',
    buildSession(pool, records, now, { mode: 'all', limit: 10 }).map((i) => i.id).join() === pool.map((i) => i.id).join());
  ok('buildSession filters difficulty before scheduling',
    buildSession(pool, records, now, { difficulty: 'hard', limit: 10 }).every((i) => i.diff === 'hard')
    && buildSession(pool, records, now, { difficulty: 'easy', limit: 10 }).length === 2);
  ok('a zero or negative limit yields an empty session', buildSession(pool, records, now, { limit: 0 }).length === 0);
  ok('a seeded shuffle is reproducible and keeps every item',
    JSON.stringify(shuffled(pool, 7)) === JSON.stringify(shuffled(pool, 7))
    && new Set(shuffled(pool, 7).map((i) => i.id)).size === pool.length);
  ok('every documented session mode is one buildSession accepts',
    SESSION_MODES.map((m) => m.id).join() === 'review,new,missed,all');

  const counts = stageCounts(pool.map((i) => i.id), records);
  ok('stageCounts adds up to the pool', Object.values(counts).reduce((a, b) => a + b, 0) === pool.length);
  ok('stageCounts sees one of each stage here', counts.new === 1 && counts.learning === 1 && counts.review === 1 && counts.mastered === 1);
  ok('formatStageCounts labels every stage', formatStageCounts(counts).length === 4 && formatStageCounts(counts).every((row) => row.label.length > 0));
  // q-new is unattempted, q-missed was missed, q-seen is past its one-day gap
  // and q-solid is past its seven-day gap: the whole pool is askable.
  ok('dueCount counts what is askable right now', dueCount(pool.map((i) => i.id), records, now) === 4);
  ok('dueCount drops to zero when every gap is still running',
    dueCount(['q-seen'], { 'q-seen': rec({ ...seen, lastAt: now }) }, now) === 0);
  ok('dueLabel says "new", "due now" and "in N d"',
    dueLabel(undefined, now) === 'new'
    && dueLabel(missed, now).includes('due now')
    && dueLabel(rec({ ...seen, lastAt: now - 1000 }), now) === 'in 1 d');
}

console.log('progress maths (dashboard)');
{
  const entry = (over: Partial<ConceptIndexEntry> & { id: string; domain: string }): ConceptIndexEntry => ({
    title: over.id, summary: '', level: 'core', topic: false, csFields: [], prerequisites: [], related: [],
    practiceCount: 0, blockCount: 4, ...over,
  });
  const fixture: ConceptIndexEntry[] = [
    entry({ id: 'logic', domain: 'discrete', level: 'foundational', topic: true, next: ['props'] }),
    entry({ id: 'props', domain: 'discrete', level: 'foundational', parent: 'logic', prerequisites: ['logic'], next: ['ops'], practiceCount: 2 }),
    entry({ id: 'ops', domain: 'discrete', level: 'core', parent: 'logic', prerequisites: ['props'], practiceCount: 3 }),
    entry({ id: 'adv', domain: 'discrete', level: 'advanced', prerequisites: ['ops'], practiceCount: 1 }),
    entry({ id: 'gcd', domain: 'number-theory', level: 'foundational', practiceCount: 2 }),
  ];
  const questionDomain = (qid: string): string | undefined => (qid.startsWith('nt-') ? 'number-theory' : 'discrete');
  const state = {
    ...DEFAULT_PROGRESS,
    completed: ['props'],
    practice: {
      'p1': { correct: true, attempts: 1, right: 1, wrong: 0, lastCorrect: true, lastAt: 1000 },
      'p2': { correct: false, attempts: 2, right: 0, wrong: 2, lastCorrect: false, lastAt: 1000 },
      'nt-1': { correct: true, attempts: 1, right: 1, wrong: 0, lastCorrect: true, lastAt: 1000 },
    },
    bookmarks: ['adv', 'gcd', 'not-published'],
    recent: [{ id: 'ops', at: 3 }, { id: 'props', at: 2 }, { id: 'gone', at: 1 }],
    dayStamps: ['2026-03-03', '2026-03-04', '2026-03-05'],
  };

  ok('dayIndexOf and dayKeyOfIndex round-trip', dayKeyOfIndex(dayIndexOf('2026-03-05')) === '2026-03-05');
  ok('a streak counts consecutive days', currentStreak(['2026-03-03', '2026-03-04', '2026-03-05'], '2026-03-05') === 3);
  ok('a streak survives today not being studied yet', currentStreak(['2026-03-04'], '2026-03-05') === 1);
  ok('a streak breaks once yesterday is missing', currentStreak(['2026-03-02'], '2026-03-05') === 0);
  ok('duplicate stamps do not inflate a streak', currentStreak(['2026-03-05', '2026-03-05'], '2026-03-05') === 1);
  ok('an empty history has no streak', currentStreak([], '2026-03-05') === 0);
  ok('the longest streak finds the best run, not the latest',
    longestStreak(['2026-01-01', '2026-01-02', '2026-02-10', '2026-02-11', '2026-02-12']) === 3);
  const calendar = streakCalendar(['2026-03-04', '2026-03-05'], '2026-03-05', 7);
  ok('the streak calendar ends today and is the requested length',
    calendar.length === 7 && calendar[6].isToday && calendar[6].key === '2026-03-05');
  ok('the streak calendar marks exactly the active days',
    calendar.filter((cell) => cell.active).map((cell) => cell.key).join() === '2026-03-04,2026-03-05');

  ok('lessonsOf excludes hub topics', lessonsOf(fixture).length === 4);
  const rows = domainStats(fixture, state, questionDomain);
  ok('domainStats returns one row per domain, in curriculum order',
    rows.length === 2 && rows[0].domain === 'discrete' && rows[1].domain === 'number-theory');
  ok('domainStats counts entries, lessons and questions',
    rows[0].entries === 4 && rows[0].lessons === 3 && rows[0].questions === 6);
  ok('domainStats counts completion', rows[0].completed === 1 && rows[0].lessonsCompleted === 1 && Math.abs(rows[0].pct - 0.25) < 1e-9);
  ok('domainStats folds practice into the right domain',
    rows[0].attempted === 2 && rows[0].correct === 1 && rows[1].attempted === 1 && rows[1].correct === 1);
  ok('domainStats flags a question missed on its last attempt', rows[0].missed === 1 && rows[1].missed === 0);
  ok('accuracy is null, never NaN, when nothing was attempted',
    domainStats(fixture, DEFAULT_PROGRESS)[0].accuracy === null);
  ok('domainStats works without a question map (completion only)',
    domainStats(fixture, state).every((row) => row.attempted === 0 && row.accuracy === null));

  const overall = overallStats(fixture, state, '2026-03-05', Date.UTC(2026, 2, 5, 12), questionDomain);
  ok('overallStats reports the curriculum totals',
    overall.entries === 5 && overall.lessons === 4 && overall.questions === 8 && overall.completed === 1);
  ok('overallStats reports practice totals', overall.attempted === 3 && overall.correct === 2 && overall.missed === 1);
  ok('overallStats carries the streak and the active days', overall.streak === 3 && overall.daysActive === 3 && overall.longestStreak === 3);
  ok('overallStats counts the domains a learner has touched', overall.domainsTouched === 2 && overall.domainsComplete === 0);

  const fresh = nextUp(fixture, [], 6);
  ok('nextUp never recommends a hub topic', !fresh.some((e) => e.topic));
  ok('nextUp treats a hub prerequisite as satisfied', fresh.some((e) => e.id === 'props'));
  ok('nextUp hides lessons whose real prerequisites are unfinished', !fresh.some((e) => e.id === 'adv'));
  const after = nextUp(fixture, ['props'], 6);
  ok('nextUp puts what a finished lesson points at first', after[0].id === 'ops', after.map((e) => e.id).join(','));
  ok('nextUp never recommends a finished lesson', !after.some((e) => e.id === 'props'));
  ok('nextUp is empty once everything is done',
    nextUp(fixture, ['props', 'ops', 'adv', 'gcd'], 6).length === 0);
  ok('nextUp honours its limit', nextUp(fixture, [], 1).length === 1);

  ok('weakestDomains needs evidence before it judges',
    weakestDomains(rows, 3).length === 0 && weakestDomains(rows, 2)[0].domain === 'discrete');
  ok('closestToFinished ranks the domain nearest done',
    closestToFinished(domainStats(fixture, { ...state, completed: ['props', 'ops', 'adv', 'gcd'] }))[0].domain === 'discrete');
  ok('savedEntries drops ids that are not published',
    savedEntries(fixture, state).map((e) => e.id).join() === 'adv,gcd');
  ok('recentEntries keeps store order and drops unknown ids',
    recentEntries(fixture, state).map((e) => e.id).join() === 'ops,props');
  ok('unfinishedVisits skips lessons already completed',
    unfinishedVisits(fixture, state).map((e) => e.id).join() === 'ops');
  ok('formatPct renders a missing ratio as an em dash',
    formatPct(null) === '—' && formatPct(0.25) === '25%' && formatPct(1) === '100%');
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
