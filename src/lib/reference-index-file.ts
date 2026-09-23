// ---------------------------------------------------------------------------
// The reference indexes: definitions, theorems, CS applications and the
// practice manifest, derived from the lessons but shipped separately.
//
// The three "library" pages (/glossary, /theorems, /applications) and the
// trainer (/practice) need slices of content that no other route needs. Two
// options were on the table:
//
//   1. load every domain chunk (≈675 kB raw) to read 178 definitions, or
//   2. generate exactly the slices those pages need, one file per page, each
//      reached through a dynamic import() so it is its own chunk.
//
// This module is option 2, and it follows the concept-index pattern exactly:
// the serializer lives here (not in scripts/) so tests can regenerate a file in
// memory and fail if the committed copy is stale.
//
// Anchors come from buildOutline(), the same function ConceptPage uses to place
// `id` attributes, so every entry deep-links to the block it was extracted
// from — /concept/partial-orders#section-definition-partial-order.
// ---------------------------------------------------------------------------

import type { Concept, Difficulty, QuestionType } from '../data/types';
import { buildOutline } from './reading';

/** One `def` block: a term and its definition, with a link back to the lesson. */
export interface GlossaryEntry {
  term: string;
  text: string;
  conceptId: string;
  domain: string;
  anchor: string;
}

/** One `thm` block: statement plus its proof steps when the lesson has them. */
export interface TheoremEntry {
  name: string;
  statement: string;
  proofTitle?: string;
  proof: string[];
  conceptId: string;
  domain: string;
  anchor: string;
}

/** One item of a `cs` block: where a piece of mathematics is actually used. */
export interface ApplicationEntry {
  area: string;
  how: string;
  conceptId: string;
  domain: string;
  anchor: string;
  csFields: string[];
}

/**
 * One practice question's *metadata*: enough to filter, schedule and label a
 * question without downloading the lesson that contains its text. The trainer
 * loads the question body lazily, one domain chunk at a time.
 */
export interface PracticeIndexEntry {
  id: string;
  conceptId: string;
  domain: string;
  diff: Difficulty;
  type: QuestionType;
}

interface Extracted {
  glossary: GlossaryEntry[];
  theorems: TheoremEntry[];
  applications: ApplicationEntry[];
  practice: PracticeIndexEntry[];
}

/** Walk every lesson once and pull out the four slices. */
export function extractReferences(concepts: Concept[]): Extracted {
  const glossary: GlossaryEntry[] = [];
  const theorems: TheoremEntry[] = [];
  const applications: ApplicationEntry[] = [];
  const practice: PracticeIndexEntry[] = [];

  for (const concept of concepts) {
    const anchors = new Map(buildOutline(concept.content).map((entry) => [entry.index, entry.id]));

    concept.content.forEach((block, index) => {
      // A block the outline does not label has no anchor to point at; those are
      // `p`, `viz` and unlabelled lists, none of which the library pages show.
      const anchor = anchors.get(index);
      if (block.t === 'def' && anchor) {
        glossary.push({ term: block.title, text: block.text, conceptId: concept.id, domain: concept.domain, anchor });
      } else if (block.t === 'thm' && anchor) {
        const entry: TheoremEntry = {
          name: block.name,
          statement: block.statement,
          proof: block.proof ?? [],
          conceptId: concept.id,
          domain: concept.domain,
          anchor,
        };
        if (block.proofTitle) entry.proofTitle = block.proofTitle;
        theorems.push(entry);
      } else if (block.t === 'cs' && anchor) {
        for (const item of block.items) {
          applications.push({
            area: item.area,
            how: item.how,
            conceptId: concept.id,
            domain: concept.domain,
            anchor,
            csFields: concept.csFields,
          });
        }
      }
    });

    for (const question of concept.practice) {
      practice.push({
        id: question.id,
        conceptId: concept.id,
        domain: concept.domain,
        diff: question.diff,
        type: question.type,
      });
    }
  }

  return { glossary, theorems, applications, practice };
}

const HEADER = [
  '// ---------------------------------------------------------------------------',
  '// GENERATED FILE - do not edit by hand.',
  '//',
];

function fileLines(comment: string[], typeImport: string, exportName: string, rows: string[], trailing: string[] = []): string {
  return [
    ...HEADER,
    ...comment,
    '// ---------------------------------------------------------------------------',
    '',
    `import type { ${typeImport} } from '../lib/reference-index-file';`,
    '',
    `export const ${exportName}: ${typeImport}[] = [`,
    ...rows,
    '];',
    '',
    ...trailing,
  ].join('\n');
}

export function serializeGlossaryIndex(concepts: Concept[]): string {
  const rows = extractReferences(concepts).glossary.map((e) => `  { term: ${JSON.stringify(e.term)}, text: ${JSON.stringify(e.text)}, conceptId: ${JSON.stringify(e.conceptId)}, domain: ${JSON.stringify(e.domain)}, anchor: ${JSON.stringify(e.anchor)} },`);
  return fileLines(
    [
      `// Every \`def\` block in the curriculum as a browsable dictionary: ${rows.length} terms`,
      '// with a deep link back to the lesson block it came from. Run',
      '//   npm run refindex:write',
      "// after any content change; `npm test` fails if this file goes stale.",
    ],
    'GlossaryEntry',
    'glossaryIndex',
    rows,
  );
}

export function serializeTheoremIndex(concepts: Concept[]): string {
  const rows = extractReferences(concepts).theorems.map((e) => {
    const parts = [
      `name: ${JSON.stringify(e.name)}`,
      `statement: ${JSON.stringify(e.statement)}`,
    ];
    if (e.proofTitle) parts.push(`proofTitle: ${JSON.stringify(e.proofTitle)}`);
    parts.push(
      `proof: ${JSON.stringify(e.proof)}`,
      `conceptId: ${JSON.stringify(e.conceptId)}`,
      `domain: ${JSON.stringify(e.domain)}`,
      `anchor: ${JSON.stringify(e.anchor)}`,
    );
    return `  { ${parts.join(', ')} },`;
  });
  return fileLines(
    [
      `// Every \`thm\` block — ${rows.length} theorems with their statements and the proof`,
      '// steps the lesson carries. Run',
      '//   npm run refindex:write',
      "// after any content change; `npm test` fails if this file goes stale.",
    ],
    'TheoremEntry',
    'theoremIndex',
    rows,
  );
}

export function serializeApplicationsIndex(concepts: Concept[]): string {
  const rows = extractReferences(concepts).applications.map((e) => `  { area: ${JSON.stringify(e.area)}, how: ${JSON.stringify(e.how)}, conceptId: ${JSON.stringify(e.conceptId)}, domain: ${JSON.stringify(e.domain)}, anchor: ${JSON.stringify(e.anchor)}, csFields: ${JSON.stringify(e.csFields)} },`);
  return fileLines(
    [
      `// Every item of every \`cs\` block — ${rows.length} "where is this used?" call-outs,`,
      '// tagged with the CS fields the lesson belongs to so the page can filter. Run',
      '//   npm run refindex:write',
      "// after any content change; `npm test` fails if this file goes stale.",
    ],
    'ApplicationEntry',
    'applicationIndex',
    rows,
  );
}

export function serializePracticeIndex(concepts: Concept[]): string {
  const rows = extractReferences(concepts).practice.map((e) => `  { id: ${JSON.stringify(e.id)}, conceptId: ${JSON.stringify(e.conceptId)}, domain: ${JSON.stringify(e.domain)}, diff: ${JSON.stringify(e.diff)}, type: ${JSON.stringify(e.type)} },`);
  return fileLines(
    [
      `// Practice metadata for all ${rows.length} questions: id, lesson, domain, difficulty`,
      '// and type — never the question text, which the trainer loads lazily with the',
      "// lesson it belongs to. Run",
      '//   npm run refindex:write',
      "// after any content change; `npm test` fails if this file goes stale.",
    ],
    'PracticeIndexEntry',
    'practiceIndex',
    rows,
    [
      '/** Map for O(1) lookups by question id; built once at module load. */',
      'export const practiceIndexById: Map<string, PracticeIndexEntry> = new Map(practiceIndex.map((e) => [e.id, e]));',
      '',
    ],
  );
}

/** Every generated reference file, in one place for the writer and the guards. */
export const REFERENCE_FILES = [
  { path: 'src/data/glossary-index.ts', serialize: serializeGlossaryIndex, label: 'glossary' },
  { path: 'src/data/theorem-index.ts', serialize: serializeTheoremIndex, label: 'theorems' },
  { path: 'src/data/applications-index.ts', serialize: serializeApplicationsIndex, label: 'applications' },
  { path: 'src/data/practice-index.ts', serialize: serializePracticeIndex, label: 'practice' },
] as const;
