// ---------------------------------------------------------------------------
// Route weight report (built output).
//
//   node scripts/route-size.mjs        (after `npm run build`)
//
// Answers the question the bundle split was about: what does a route actually
// download, and could it reach a lesson body at all? Static imports are the
// download; dynamic import() targets are listed separately because they are
// fetched only if the code path runs (that is the whole point of the split).
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const DIR = 'dist/assets';
const files = readdirSync(DIR).filter((f) => f.endsWith('.js'));
const size = new Map(files.map((f) => [f, gzipSync(readFileSync(`${DIR}/${f}`)).length]));

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

const fmt = (n) => `${(n / 1024).toFixed(1)} kB`;
const isDomainChunk = (f) => /^(discrete-1|discrete-2|proofs|combinatorics|graph-theory-1|graph-theory-2|graph-algorithms|number-theory-1|number-theory-2|probability|statistics|linear-algebra|calculus|optimization|geometry|abstract-algebra|information-theory|numerical|formal)-/.test(f);
const pretty = (f) => f.replace(/-[A-Za-z0-9_-]{8,}\.js$/, '');

const shell = closure(entry);
console.log(`shell (index.html + app entry): ${fmt([...shell].reduce((s, f) => s + size.get(f), 0))} over ${shell.size} files\n`);

const routes = [
  ['/books', ['BooksPage']],
  ['/playground', ['PlaygroundPage']],
  ['/paths', ['PathsPage']],
  ['/domain/discrete', ['DomainPage']],
  ['/concept/partial-orders', ['ConceptPage']],
  ['/concept/bayes-theorem', ['ConceptPage']],
];

for (const [route, chunks] of routes) {
  const seeds = [...shell];
  for (const c of chunks) {
    const file = files.find((f) => f.startsWith(`${c}-`));
    if (file) seeds.push(file);
  }
  const stat = closure(seeds);
  const bytes = [...stat].reduce((s, f) => s + size.get(f), 0);
  const bodies = [...stat].filter(isDomainChunk);
  const reachable = new Set();
  for (const f of stat) for (const d of deps.get(f)?.dynamicDeps ?? []) if (isDomainChunk(d)) reachable.add(pretty(d));
  console.log(`${route.padEnd(24)} downloads ${fmt(bytes).padStart(9)}  |  lesson bodies in download: ${bodies.length ? bodies.map(pretty).join(', ') : 'none'}`);
  if (reachable.size) console.log(`${' '.repeat(24)} can lazy-load ${reachable.size} domain chunks at runtime (a concept page fetches exactly one)`);
}
