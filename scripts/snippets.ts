// ---------------------------------------------------------------------------
// Snippet output verifier / generator.
//
//   npm run snippets:verify   -> execute every snippet and compare with the
//                                declared output (exit 1 on any mismatch)
//   npm run snippets:write    -> regenerate every declared output from a real
//                                execution
//
// Both modes use the same runner as the browser playground, so a snippet can
// never claim output it does not actually produce.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync } from 'node:fs';
import { snippets } from '../src/data/snippets';
import { runSnippet } from '../src/lib/runner';

const FILE = 'src/data/snippets.ts';
const mode = process.argv[2] ?? 'verify';

const escapeForTs = (s: string): string => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');

let src = readFileSync(FILE, 'utf8');
let failures = 0;
let written = 0;

for (const snippet of snippets) {
  const result = runSnippet(snippet.code);
  const actual = result.logs.join('\n');

  if (!result.ok) {
    failures++;
    console.log(`  ✗ ${snippet.id} threw ${result.error}`);
    continue;
  }
  if (actual !== snippet.output) {
    if (mode === 'write') {
      const anchor = `id: '${snippet.id}',`;
      const at = src.indexOf(anchor);
      if (at < 0) {
        failures++;
        console.log(`  ✗ ${snippet.id} not found in ${FILE}`);
        continue;
      }
      const outAt = src.indexOf('output: ', at);
      const quoteStart = src.indexOf("'", outAt);
      let quoteEnd = quoteStart + 1;
      while (quoteEnd < src.length) {
        if (src[quoteEnd] === '\\') quoteEnd += 2;
        else if (src[quoteEnd] === "'") break;
        else quoteEnd++;
      }
      src = src.slice(0, quoteStart) + `'${escapeForTs(actual)}'` + src.slice(quoteEnd + 1);
      written++;
    } else {
      failures++;
      console.log(`  ✗ ${snippet.id} output differs`);
      console.log(`      declared: ${JSON.stringify(snippet.output)}`);
      console.log(`      actual:   ${JSON.stringify(actual)}`);
    }
  }
}

if (mode === 'write') {
  if (written > 0) {
    writeFileSync(FILE, src);
    console.log(`Updated ${written} snippet output${written === 1 ? '' : 's'} in ${FILE}.`);
  } else {
    console.log('All snippet outputs already match a real execution.');
  }
  process.exit(0);
}

const total = snippets.length;
if (failures > 0) {
  console.log(`\n${total - failures}/${total} snippets match their declared output, ${failures} failed.`);
  process.exit(1);
}
console.log(`All ${total} snippets match their declared output (executed, not eyeballed).`);
