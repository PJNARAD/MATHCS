// ---------------------------------------------------------------------------
// Content audit.
//
//   npx tsx scripts/audit.ts          -> human-readable report
//   npx tsx scripts/audit.ts --json   -> machine-readable report
//
// Checks the content graph for gaps: dangling references between concepts,
// fields and paths; domains that are thin or missing practice; fields and paths
// that are not covered; and other coverage signals used for the content
// roadmap.
// ---------------------------------------------------------------------------

import { allConcepts, conceptMap, conceptsForDomain, topicsOf, standaloneConcepts } from '../src/lib/concepts';
import { domains } from '../src/data/domains';
import { fields } from '../src/data/fields';
import { paths } from '../src/data/paths';
import { books } from '../src/data/books';
import { snippets } from '../src/data/snippets';

const asJson = process.argv.includes('--json');

type Block = { t: string; [k: string]: unknown };

const dangling = {
  prerequisite: [] as string[],
  related: [] as string[],
  next: [] as string[],
  parent: [] as string[],
  fieldMapping: [] as string[],
  pathStage: [] as string[],
  fieldPath: [] as string[],
  pathField: [] as string[],
  snippetConcept: [] as string[],
};

for (const c of allConcepts) {
  for (const p of c.prerequisites) if (!conceptMap.has(p)) dangling.prerequisite.push(`${c.id} -> ${p}`);
  for (const r of c.related) if (!conceptMap.has(r)) dangling.related.push(`${c.id} -> ${r}`);
  for (const n of c.next ?? []) if (!conceptMap.has(n)) dangling.next.push(`${c.id} -> ${n}`);
  if (c.parent && !conceptMap.has(c.parent)) dangling.parent.push(`${c.id} -> ${c.parent}`);
}

for (const f of fields) {
  for (const m of f.mapping) if (!conceptMap.has(m.concept)) dangling.fieldMapping.push(`${f.id} -> ${m.concept}`);
  if (f.pathId && !paths.some((p) => p.id === f.pathId)) dangling.fieldPath.push(`${f.id} -> ${f.pathId}`);
}

for (const p of paths) {
  for (const stage of p.stages) for (const c of stage.concepts) if (!conceptMap.has(c)) dangling.pathStage.push(`${p.id}/${stage.title} -> ${c}`);
  if (p.fieldId && !fields.some((f) => f.id === p.fieldId)) dangling.pathField.push(`${p.id} -> ${p.fieldId}`);
}

for (const s of snippets) if (!conceptMap.has(s.conceptId)) dangling.snippetConcept.push(`${s.id} -> ${s.conceptId}`);

const domainRows = domains.map((d) => {
  const cs = conceptsForDomain(d.id);
  const practice = cs.reduce((n, c) => n + c.practice.length, 0);
  const vizBlocks = cs.reduce((n, c) => n + c.content.filter((b) => (b as Block).t === 'viz' || (b as Block).t === 'figure').length, 0);
  const snippetCount = snippets.filter((s) => conceptMap.get(s.conceptId)?.domain === d.id).length;
  const bookCount = books.filter((b) => b.domain === d.id).length;
  const words = cs.reduce(
    (n, c) => n + c.content.reduce((m, b) => m + JSON.stringify(b).split(/\s+/).length, 0),
    0,
  );
  return {
    id: d.id,
    name: d.name,
    concepts: cs.length,
    topics: topicsOf(d.id).length,
    standalone: standaloneConcepts(d.id).length,
    practice,
    viz: vizBlocks,
    snippets: snippetCount,
    books: bookCount,
    approxWords: words,
  };
});

const fieldRows = fields.map((f) => ({
  id: f.id,
  name: f.name,
  mapped: f.mapping.length,
  missing: f.mapping.filter((m) => !conceptMap.has(m.concept)).length,
  path: f.pathId ?? null,
  pathExists: f.pathId ? paths.some((p) => p.id === f.pathId) : null,
}));

const pathRows = paths.map((p) => {
  const cs = p.stages.flatMap((s) => s.concepts);
  return {
    id: p.id,
    title: p.title,
    fieldId: p.fieldId ?? null,
    stages: p.stages.length,
    concepts: cs.length,
    unique: new Set(cs).size,
    missing: cs.filter((c) => !conceptMap.has(c)).length,
  };
});

const levelCounts = allConcepts.reduce<Record<string, number>>((acc, c) => {
  acc[c.level] = (acc[c.level] ?? 0) + 1;
  return acc;
}, {});

const difficulty = allConcepts.flatMap((c) => c.practice).reduce<Record<string, number>>((acc, q) => {
  acc[q.diff] = (acc[q.diff] ?? 0) + 1;
  return acc;
}, {});

// Lessons that are still stubs: real lessons (not hub topics) with very few
// content blocks. These are the highest-value writing work in the project.
const THIN_BLOCKS = 4;
const isHub = (c: { topic?: boolean }) => Boolean(c.topic);
const thinLessons = allConcepts
  .filter((c) => !isHub(c) && c.content.length <= THIN_BLOCKS)
  .map((c) => ({ id: c.id, domain: c.domain, blocks: c.content.length, practice: c.practice.length }))
  .sort((a, b) => a.blocks - b.blocks || a.id.localeCompare(b.id));

/** Non-hub lessons with no practice questions at all. */
const lessonsWithoutPractice = allConcepts
  .filter((c) => !isHub(c) && c.practice.length === 0)
  .map((c) => `${c.id} (${c.domain})`);

/**
 * Near-duplicate concepts: two non-hub lessons in the same domain whose slugs
 * share most of their tokens (jaccard >= 0.6) or whose titles are identical,
 * and which are not in a parent/child relationship. These are candidates for
 * merging — real content collisions rather than hub/child structure.
 */
const duplicates: { a: string; b: string; domain: string; similarity: number }[] = [];
const tokens = (id: string): Set<string> => new Set(id.split('-').filter((t) => t !== 'and'));
const jaccard = (a: Set<string>, b: Set<string>): number => {
  const inter = [...a].filter((t) => b.has(t)).length;
  return inter / (a.size + b.size - inter);
};
for (const c of allConcepts) {
  if (isHub(c)) continue;
  for (const o of allConcepts) {
    if (o.id <= c.id || o.domain !== c.domain || isHub(o)) continue;
    if (c.parent === o.id || o.parent === c.id) continue;
    const similarity = jaccard(tokens(c.id), tokens(o.id));
    const sameTitle = o.title.toLowerCase() === c.title.toLowerCase();
    if (sameTitle || similarity >= 0.6) {
      duplicates.push({ a: c.id, b: o.id, domain: c.domain, similarity: Number(similarity.toFixed(2)) });
    }
  }
}
duplicates.sort((a, b) => b.similarity - a.similarity);

// Concepts with no practice at all, or no CS-field tag, or no snippet.
const noPractice = allConcepts.filter((c) => c.practice.length === 0).map((c) => c.id);
const noCsField = allConcepts.filter((c) => c.csFields.length === 0).map((c) => c.id);
const noSnippet = allConcepts.filter((c) => !snippets.some((s) => s.conceptId === c.id)).map((c) => c.id);
const noViz = allConcepts.filter((c) => !c.content.some((b) => (b as Block).t === 'viz')).map((c) => c.id);
const noRelated = allConcepts.filter((c) => c.related.length === 0).map((c) => c.id);
const noNext = allConcepts.filter((c) => !c.next || c.next.length === 0).map((c) => c.id);

const orphanConcepts = allConcepts
  .filter((c) => c.related.length === 0 && c.prerequisites.length === 0 && !(c.next ?? []).length && !c.parent)
  .map((c) => c.id);

const domainsWithoutContent = domains.filter((d) => !conceptsForDomain(d.id).length).map((d) => d.id);
const fieldsWithoutPath = fields.filter((f) => !f.pathId).map((f) => f.id);
const domainsWithoutBook = domains.filter((d) => !books.some((b) => b.domain === d.id)).map((d) => d.id);
const conceptsNotInAnyPath = allConcepts
  .filter((c) => !paths.some((p) => p.stages.some((s) => s.concepts.includes(c.id))))
  .map((c) => c.id);

const report = {
  thinLessons,
  lessonsWithoutPractice,
  duplicates,
  totals: {
    concepts: allConcepts.length,
    domains: domains.length,
    domainsLive: domains.length - domainsWithoutContent.length,
    fields: fields.length,
    paths: paths.length,
    books: books.length,
    snippets: snippets.length,
    practice: allConcepts.reduce((n, c) => n + c.practice.length, 0),
    levels: levelCounts,
    practiceDifficulty: difficulty,
  },
  gaps: {
    domainsWithoutContent,
    fieldsWithoutPath,
    domainsWithoutBook,
    conceptsWithoutPractice: noPractice,
    conceptsWithoutCsField: noCsField,
    conceptsWithoutSnippet: noSnippet,
    conceptsWithoutVisualization: noViz,
    conceptsWithoutRelated: noRelated,
    conceptsWithoutNext: noNext,
    conceptsNotInAnyPath,
    orphanConcepts,
  },
  dangling,
  domains: domainRows,
  fields: fieldRows,
  paths: pathRows,
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const { totals, gaps } = report;
  console.log('MATHCS CONTENT AUDIT');
  console.log('='.repeat(60));
  console.log(
    `${totals.concepts} concepts · ${totals.practice} practice questions · ${totals.snippets} snippets · ` +
      `${totals.domainsLive}/${totals.domains} domains live · ${totals.fields} CS fields · ${totals.paths} paths · ${totals.books} books`,
  );
  console.log(`levels: ${JSON.stringify(totals.levels)}   practice: ${JSON.stringify(totals.practiceDifficulty)}`);

  console.log('\nPER DOMAIN');
  console.log('  concepts  topics  standalone  practice  viz  snippets  books  ~words  domain');
  for (const d of [...domainRows].sort((a, b) => a.concepts - b.concepts)) {
    console.log(
      `  ${String(d.concepts).padStart(8)}  ${String(d.topics).padStart(6)}  ${String(d.standalone).padStart(10)}  ` +
        `${String(d.practice).padStart(8)}  ${String(d.viz).padStart(3)}  ${String(d.snippets).padStart(8)}  ` +
        `${String(d.books).padStart(5)}  ${String(d.approxWords).padStart(6)}  ${d.id}`,
    );
  }

  console.log('\nGAPS');
  console.log(`  domains without content      : ${gaps.domainsWithoutContent.length ? gaps.domainsWithoutContent.join(', ') : 'none'}`);
  console.log(`  fields without a path        : ${gaps.fieldsWithoutPath.length ? gaps.fieldsWithoutPath.join(', ') : 'none'}`);
  console.log(`  domains without a book       : ${gaps.domainsWithoutBook.length ? gaps.domainsWithoutBook.join(', ') : 'none'}`);
  console.log(`  concepts without practice    : ${gaps.conceptsWithoutPractice.length}`);
  console.log(`  concepts without CS field tag: ${gaps.conceptsWithoutCsField.length}`);
  console.log(`  concepts without a snippet   : ${gaps.conceptsWithoutSnippet.length} / ${totals.concepts}`);
  console.log(`  concepts without a viz       : ${gaps.conceptsWithoutVisualization.length} / ${totals.concepts}`);
  console.log(`  concepts not in any path     : ${gaps.conceptsNotInAnyPath.length}`);
  console.log(`  orphan concepts (no links)   : ${gaps.orphanConcepts.length ? gaps.orphanConcepts.join(', ') : 'none'}`);

  const danglingCount = Object.values(dangling).reduce((n, list) => n + list.length, 0);
  console.log(`\nDEPTH (non-hub lessons with <= ${THIN_BLOCKS} content blocks): ${thinLessons.length}`);
  for (const t of thinLessons.slice(0, 15)) {
    console.log(`  ${t.id.padEnd(34)} ${t.domain.padEnd(18)} blocks=${t.blocks} practice=${t.practice}`);
  }
  if (thinLessons.length > 15) console.log(`  … and ${thinLessons.length - 15} more`);

  console.log(`\nLESSONS WITH NO PRACTICE: ${lessonsWithoutPractice.length}`);
  console.log(`  ${lessonsWithoutPractice.slice(0, 12).join(', ')}${lessonsWithoutPractice.length > 12 ? ' …' : ''}`);

  console.log(`\nNEAR-DUPLICATE CONCEPT PAIRS: ${duplicates.length}`);
  for (const d of duplicates.slice(0, 10)) console.log(`  ${d.domain}: ${d.a} / ${d.b} (${d.similarity})`);
  if (duplicates.length > 10) console.log(`  … and ${duplicates.length - 10} more`);

  console.log(`\nDANGLING REFERENCES: ${danglingCount}`);
  for (const [kind, list] of Object.entries(dangling)) {
    if (list.length) console.log(`  ${kind} (${list.length}): ${list.slice(0, 12).join(', ')}${list.length > 12 ? ' …' : ''}`);
  }
}
