// ---------------------------------------------------------------------------
// Reference index generator.
//
//   npm run refindex:write    -> regenerate the four generated slices from the
//                                content files (the single source of truth)
//   npm run refindex:verify   -> fail if any committed slice is stale
//
// Slices: glossary (every `def`), theorems (every `thm` + proof), applications
// (every `cs` item) and the practice manifest (question metadata). Each is its
// own lazily-imported chunk, so /glossary, /theorems, /applications and
// /practice download only what they draw — and no other route downloads any of
// it. tests/run.ts runs the same comparison, which is what makes it safe to
// treat the generated files as checked-in data.
// ---------------------------------------------------------------------------

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { allConcepts } from '../src/lib/concepts';
import { REFERENCE_FILES } from '../src/lib/reference-index-file';

const mode = process.argv[2] ?? 'verify';

let stale = 0;
let missing = 0;

for (const file of REFERENCE_FILES) {
  const generated = file.serialize(allConcepts);
  const rows = generated.split('\n').filter((line) => line.startsWith('  { ')).length;

  if (mode === 'write') {
    writeFileSync(file.path, generated);
    const bytes = Buffer.byteLength(generated, 'utf8');
    console.log(`Wrote ${rows} ${file.label} entries to ${file.path} (${(bytes / 1024).toFixed(1)} kB).`);
    continue;
  }

  if (!existsSync(file.path)) {
    missing += 1;
    console.log(`  x ${file.path} is missing - run npm run refindex:write`);
    continue;
  }
  if (readFileSync(file.path, 'utf8') !== generated) {
    stale += 1;
    console.log(`  x ${file.path} is stale - run npm run refindex:write`);
    continue;
  }
  console.log(`${file.label} index matches the content files (${rows} entries).`);
}

if (mode === 'write') process.exit(0);
if (stale || missing) process.exit(1);
