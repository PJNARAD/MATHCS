// ---------------------------------------------------------------------------
// Concept index generator.
//
//   npm run index:write    -> regenerate src/data/concept-index.ts from the
//                             content files (the single source of truth)
//   npm run index:verify   -> fail if the committed index is stale
//
// The index is what the shipped app reads for titles, summaries and link
// targets, so no route has to download a single lesson body to draw a list.
// tests/run.ts runs the same comparison, which is what makes it safe to treat
// the generated file as checked-in data.
// ---------------------------------------------------------------------------

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import type { Concept } from '../src/data/types';
import { allConcepts } from '../src/lib/concepts';
import { serializeConceptIndex } from '../src/lib/concept-index-file';

const mode = process.argv[2] ?? 'verify';
const FILE = 'src/data/concept-index.ts';

const generated = serializeConceptIndex(allConcepts);

if (mode === 'write') {
  writeFileSync(FILE, generated);
  const bytes = Buffer.byteLength(generated, 'utf8');
  console.log(`Wrote ${allConcepts.length} index entries to ${FILE} (${(bytes / 1024).toFixed(1)} kB).`);
  process.exit(0);
}

if (!existsSync(FILE)) {
  console.log(`  x ${FILE} is missing - run npm run index:write`);
  process.exit(1);
}

const committed = readFileSync(FILE, 'utf8');
if (committed !== generated) {
  console.log(`  x ${FILE} is stale - run npm run index:write`);
  process.exit(1);
}
console.log(`Concept index matches the content files (${allConcepts.length} entries).`);
