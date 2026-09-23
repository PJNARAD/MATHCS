// ---------------------------------------------------------------------------
// CI gates.
//
//   node scripts/ci-gates.mjs        (after `npm run build`)
//
// `npm run verify` proves the *content* is consistent. This script proves the
// properties the bundle split was designed for, which only a built output can
// show, plus the one content invariant the roadmap treats as a hard rule
// (zero dangling references). Every gate prints what it measured, so a failure
// says which number moved and by how much.
//
// Budgets are ratchets: they sit just above today's measurement so a regression
// fails the build, and they are meant to be lowered as chunks get split.
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';

const DIR = 'dist/assets';
let failures = 0;

const gate = (name, passed, detail = '') => {
  if (!passed) failures += 1;
  console.log(`  ${passed ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const kb = (bytes) => `${(bytes / 1024).toFixed(2)} kB`;

// ---- 1. content: zero dangling references ---------------------------------

console.log('\ncontent');
{
  const stdout = execFileSync('npx', ['tsx', 'scripts/audit.ts', '--json'], { encoding: 'utf8' });
  const report = JSON.parse(stdout.slice(stdout.indexOf('{')));
  const dangling = Object.entries(report.dangling)
    .filter(([, list]) => list.length > 0)
    .map(([kind, list]) => `${kind} (${list.length}): ${list.slice(0, 5).join(', ')}`);
  gate('no dangling cross-references', dangling.length === 0, dangling.join(' | ') || `${Object.keys(report.dangling).length} reference kinds checked`);

  gate('every domain is published', report.gaps.domainsWithoutContent.length === 0, report.gaps.domainsWithoutContent.join(', '));
  gate('every CS field has a learning path', report.gaps.fieldsWithoutPath.length === 0, report.gaps.fieldsWithoutPath.join(', '));
  gate('no concept is orphaned (no links at all)', report.gaps.orphanConcepts.length === 0, report.gaps.orphanConcepts.join(', '));
  console.log(`    ${report.totals.concepts} concepts · ${report.totals.practice} questions · ${report.totals.snippets} snippets · ${report.thinLessons.length} thin lessons`);
}

// ---- 2. delivery: what the built output actually downloads -----------------

if (!existsSync(DIR)) {
  console.log(`\n  ✗ ${DIR} is missing - run npm run build before the gates`);
  process.exit(1);
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.js'));
const gzip = new Map(files.map((f) => [f, gzipSync(readFileSync(`${DIR}/${f}`)).length]));
const pretty = (f) => f.replace(/-[A-Za-z0-9_-]{8,}\.js$/, '');

const deps = new Map();
for (const f of files) {
  const src = readFileSync(`${DIR}/${f}`, 'utf8');
  const staticDeps = new Set();
  const dynamicDeps = new Set();
  for (const m of src.matchAll(/from"\.\/([A-Za-z0-9_.-]+\.js)"/g)) staticDeps.add(m[1]);
  for (const m of src.matchAll(/import"\.\/([A-Za-z0-9_.-]+\.js)"/g)) staticDeps.add(m[1]);
  for (const m of src.matchAll(/import\("\.\/([A-Za-z0-9_.-]+\.js)"\)/g)) dynamicDeps.add(m[1]);
  for (const m of src.matchAll(/import\("\.\.\/([A-Za-z0-9_.-]+\.js)"\)/g)) dynamicDeps.add(m[1]);
  deps.set(f, { staticDeps: [...staticDeps], dynamicDeps: [...dynamicDeps] });
}

const entry = [...readFileSync('dist/index.html', 'utf8').matchAll(/\/assets\/([A-Za-z0-9_.-]+\.js)/g)].map((m) => m[1]);

function closure(seed) {
  const seen = new Set();
  const stack = [...seed];
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f) || !deps.has(f)) continue;
    seen.add(f);
    stack.push(...deps.get(f).staticDeps);
  }
  return seen;
}

const chunk = (prefix) => files.find((f) => f.startsWith(`${prefix}-`));
const isDomainChunk = (f) => /^(discrete-1|discrete-2|proofs|combinatorics|graph-theory-1|graph-theory-2|graph-algorithms|number-theory-1|number-theory-2|probability|statistics|linear-algebra|calculus|optimization|geometry|abstract-algebra|information-theory|numerical|formal)-/.test(f);
const SLICES = ['glossary-index', 'theorem-index', 'applications-index', 'practice-index'];
const isSlice = (f) => SLICES.some((slice) => f.startsWith(`${slice}-`));

const shell = closure(entry);
const shellBytes = [...shell].reduce((sum, f) => sum + gzip.get(f), 0);

console.log('\ndelivery — the split');
gate('the initial shell downloads no lesson body', [...shell].filter(isDomainChunk).length === 0,
  [...shell].filter(isDomainChunk).map(pretty).join(', '));
gate('the initial shell downloads no generated reference slice', [...shell].filter(isSlice).length === 0,
  [...shell].filter(isSlice).map(pretty).join(', '));
gate('every generated slice is its own lazily-imported chunk',
  SLICES.every((slice) => Boolean(chunk(slice))),
  SLICES.map((slice) => `${slice}: ${chunk(slice) ? kb(gzip.get(chunk(slice))) + ' gzip' : 'MISSING'}`).join(' · '));

// The property that keeps one page's library from being billed to another: a
// slice must be reached through a dynamic import() and never a static one. Vite
// hoists the reader into whatever chunk the pages share, so the importers are
// reported rather than hard-coded per page.
for (const slice of SLICES) {
  const file = chunk(slice);
  if (!file) continue;
  const staticImporters = files.filter((f) => deps.get(f)?.staticDeps.includes(file)).map(pretty);
  const dynamicImporters = files.filter((f) => deps.get(f)?.dynamicDeps.includes(file)).map(pretty);
  gate(`the ${slice} slice is only ever dynamically imported`,
    staticImporters.length === 0 && dynamicImporters.length > 0,
    staticImporters.length
      ? `statically imported by ${staticImporters.join(', ')}`
      : `fetched on demand via ${dynamicImporters.join(', ')}`);
}

const ROUTES = [
  ['/', ['Home']],
  ['/fields', ['FieldsPage']],
  ['/paths', ['PathsPage']],
  ['/books', ['BooksPage']],
  ['/playground', ['PlaygroundPage']],
  ['/domain/discrete', ['DomainPage']],
  ['/concept/partial-orders', ['ConceptPage']],
  ['/glossary', ['GlossaryPage']],
  ['/theorems', ['TheoremsPage']],
  ['/applications', ['ApplicationsPage']],
  ['/practice', ['PracticePage']],
  ['/progress', ['ProgressPage']],
];

console.log('\ndelivery — per route');
const routeBytes = new Map();
for (const [route, chunks] of ROUTES) {
  const pageChunk = chunks.map(chunk).filter(Boolean);
  gate(`route chunk exists for ${route}`, pageChunk.length === chunks.length, chunks.join(', '));
  const stat = closure([...shell, ...pageChunk]);
  const bodies = [...stat].filter(isDomainChunk);
  const bytes = [...stat].reduce((sum, f) => sum + gzip.get(f), 0);
  routeBytes.set(route, bytes);
  gate(`${route.padEnd(22)} downloads no lesson body`, bodies.length === 0,
    `${kb(bytes)} gzip${bodies.length ? ` · lesson bodies: ${bodies.map(pretty).join(', ')}` : ''}`);
}

console.log('\ndelivery — budgets (gzip, ratchet down as chunks are split)');
const BUDGETS = [
  ['ui', 150, 'shared by every page: the lesson renderer still lives here'],
  ['concept-index', 32, 'titles, summaries and links — no lesson content'],
  ['vendor', 58, 'react + react-dom + router'],
  ['katex', 80, 'math typesetting'],
  ['discrete-2', 65, 'largest lazy domain chunk'],
  ['glossary-index', 26, 'every definition'],
  ['theorem-index', 30, 'every theorem and proof'],
  ['applications-index', 38, 'every CS call-out'],
  ['practice-index', 8, 'question metadata for the trainer'],
];
for (const [name, budgetKb, why] of BUDGETS) {
  const file = chunk(name);
  if (!file) {
    gate(`${name} chunk exists`, false, 'not found in dist/assets');
    continue;
  }
  const actual = gzip.get(file) / 1024;
  gate(`${name.padEnd(20)} ≤ ${budgetKb} kB`, actual <= budgetKb, `${actual.toFixed(2)} kB — ${why}`);
}

const entryChunk = entry.find((f) => f.startsWith('index-'));
if (entryChunk) {
  const actual = gzip.get(entryChunk) / 1024;
  gate('app entry          ≤ 12 kB', actual <= 12, `${actual.toFixed(2)} kB — the shell before any route loads`);
}
gate('initial shell      ≤ 145 kB', shellBytes / 1024 <= 145, `${kb(shellBytes)} over ${shell.size} files`);

const heaviestRoute = [...routeBytes.entries()].sort((a, b) => b[1] - a[1])[0];
if (heaviestRoute) {
  gate('no route exceeds 345 kB', heaviestRoute[1] / 1024 <= 345,
    `heaviest is ${heaviestRoute[0]} at ${kb(heaviestRoute[1])}`);
}

console.log(failures === 0 ? '\nGATES OK' : `\nGATE FAILURES: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
