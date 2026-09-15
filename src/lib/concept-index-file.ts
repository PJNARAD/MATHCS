// ---------------------------------------------------------------------------
// The concept index, minus the content.
//
// Every shipped route needs concept *titles, summaries and link targets* — the
// command palette, search, the domain pages, the path pages, the home page, and
// every ConceptLink inside a lesson. None of that needs the lesson bodies, but
// before this split they all imported the registry, which statically pulled all
// nineteen domain files into one shared chunk (580 kB / 198 kB gzip, and growing
// with every content batch).
//
// `serializeConceptIndex` turns the real content into the compact generated
// file `src/data/concept-index.ts`; `ConceptIndexEntry` is the shape both sides
// use. Keeping the serializer here (not in scripts/) means tests can regenerate
// the index in memory and compare it with the committed file.
// ---------------------------------------------------------------------------

import type { Concept, Level } from '../data/types';

export interface ConceptIndexEntry {
  id: string;
  title: string;
  domain: string;
  level: Level;
  summary: string;
  topic: boolean;
  parent?: string;
  csFields: string[];
  tags?: string[];
  prerequisites: string[];
  related: string[];
  next?: string[];
  practiceCount: number;
  blockCount: number;
}

export function toIndexEntry(c: Concept): ConceptIndexEntry {
  const entry: ConceptIndexEntry = {
    id: c.id,
    title: c.title,
    domain: c.domain,
    level: c.level,
    summary: c.summary,
    topic: Boolean(c.topic),
    csFields: c.csFields,
    prerequisites: c.prerequisites,
    related: c.related,
    practiceCount: c.practice.length,
    blockCount: c.content.length,
  };
  if (c.parent) entry.parent = c.parent;
  if (c.tags && c.tags.length) entry.tags = c.tags;
  if (c.next && c.next.length) entry.next = c.next;
  return entry;
}

/** Pretty-printed TypeScript for `src/data/concept-index.ts`. */
export function serializeConceptIndex(concepts: Concept[]): string {
  const entries = concepts.map(toIndexEntry);
  const lines = entries.map((e) => {
    const parts = [
      `id: ${JSON.stringify(e.id)}`,
      `title: ${JSON.stringify(e.title)}`,
      `domain: ${JSON.stringify(e.domain)}`,
      `level: ${JSON.stringify(e.level)}`,
      `summary: ${JSON.stringify(e.summary)}`,
      `topic: ${e.topic}`,
    ];
    if (e.parent) parts.push(`parent: ${JSON.stringify(e.parent)}`);
    parts.push(`csFields: ${JSON.stringify(e.csFields)}`);
    if (e.tags) parts.push(`tags: ${JSON.stringify(e.tags)}`);
    parts.push(`prerequisites: ${JSON.stringify(e.prerequisites)}`);
    parts.push(`related: ${JSON.stringify(e.related)}`);
    if (e.next) parts.push(`next: ${JSON.stringify(e.next)}`);
    parts.push(`practiceCount: ${e.practiceCount}`);
    parts.push(`blockCount: ${e.blockCount}`);
    return `  { ${parts.join(', ')} },`;
  });
  return [
    '// ---------------------------------------------------------------------------',
    '// GENERATED FILE - do not edit by hand.',
    '//',
    '// The light-weight concept index: id, title, domain, level, summary, links and',
    '// counts for every concept, with none of the lesson content. Run',
    '//   npm run index:write',
    '// after any content change; `npm test` fails if this file goes stale.',
    '// ---------------------------------------------------------------------------',
    '',
    "import type { ConceptIndexEntry } from '../lib/concept-index-file';",
    '',
    'export const conceptIndex: ConceptIndexEntry[] = [',
    ...lines,
    '];',
    '',
    '/** Map for O(1) lookups; built once at module load. */',
    'export const conceptIndexById: Map<string, ConceptIndexEntry> = new Map(conceptIndex.map((e) => [e.id, e]));',
    '',
  ].join('\n');
}
