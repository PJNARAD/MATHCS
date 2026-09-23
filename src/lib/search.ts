// ---------------------------------------------------------------------------
// Search for the command palette (pure + DOM-free so it can be unit tested).
//
// Scoring is a small fuzzy matcher: subsequence match with bonuses for word
// boundaries and consecutive runs, plus a preference for shorter titles. This
// is what makes "gra des" land on "Gradient Descent" while "zz" matches
// nothing at all.
// ---------------------------------------------------------------------------

import { conceptIndex } from '../data/concept-index';
import { domains } from '../data/domains';
import { fields } from '../data/fields';
import { paths } from '../data/paths';
import { books } from '../data/books';

export type DocKind = 'concept' | 'domain' | 'field' | 'path' | 'book' | 'page';

export interface SearchDoc {
  id: string;
  kind: DocKind;
  title: string;
  subtitle?: string;
  keywords?: string;
  href: string;
}

export const KIND_LABEL: Record<DocKind, string> = {
  concept: 'Concept',
  domain: 'Domain',
  field: 'CS field',
  path: 'Path',
  book: 'Book',
  page: 'Page',
};

const WORD_BOUNDARY = /[\s\-_/.,'’()]/;

/**
 * Score how well `query` matches `target`. `null` means "no match at all".
 * Higher is better; the numbers are arbitrary but ordered deliberately:
 * exact > prefix > word-boundary subsequence > scattered subsequence.
 */
export function fuzzyScore(query: string, target: string): number | null {
  const q = query.toLowerCase().replace(/\s+/g, '');
  const t = target.toLowerCase();
  if (!q) return 0;
  if (t === q) return 1000;
  if (t.startsWith(q)) return 800 - Math.min(100, t.length);
  if (t.includes(q)) return 600 - Math.min(100, t.length);

  let score = 0;
  let qi = 0;
  let lastHit = -2;
  let run = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] !== q[qi]) continue;
    const boundary = i === 0 || WORD_BOUNDARY.test(t[i - 1]);
    run = i === lastHit + 1 ? run + 1 : 1;
    score += 10 + (boundary ? 14 : 0) + (run > 1 ? 8 : 0);
    lastHit = i;
    qi++;
  }
  if (qi < q.length) return null;
  return score - Math.min(30, Math.floor(t.length / 6));
}

export interface ScoredDoc {
  doc: SearchDoc;
  score: number;
}

/** Best score across the doc's title, subtitle and keyword blob. */
export function scoreDoc(query: string, doc: SearchDoc): number | null {
  const title = fuzzyScore(query, doc.title);
  const sub = doc.subtitle ? fuzzyScore(query, doc.subtitle) : null;
  const keys = doc.keywords ? fuzzyScore(query, doc.keywords) : null;
  const best = Math.max(title ?? -1, (sub ?? -1) * 0.6, (keys ?? -1) * 0.55);
  return best < 0 ? null : best;
}

export function searchDocs(query: string, docs: SearchDoc[], limit = 12): ScoredDoc[] {
  if (!query.trim()) return [];
  const hits: ScoredDoc[] = [];
  for (const doc of docs) {
    const score = scoreDoc(query, doc);
    if (score !== null) hits.push({ doc, score });
  }
  return hits
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.doc.title.localeCompare(b.doc.title)))
    .slice(0, limit);
}

/** Everything the palette can jump to, built from the real content data. */
export function buildSearchDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const c of conceptIndex) {
    docs.push({
      id: c.id,
      kind: 'concept',
      title: c.title,
      subtitle: c.summary,
      keywords: [c.domain, ...(c.tags ?? []), ...c.csFields, c.level].join(' '),
      href: `/concept/${c.id}`,
    });
  }
  for (const d of domains) {
    docs.push({ id: d.id, kind: 'domain', title: d.name, subtitle: d.tagline, keywords: d.short, href: `/domain/${d.id}` });
  }
  for (const f of fields) {
    docs.push({ id: f.id, kind: 'field', title: f.name, subtitle: f.oneLiner, keywords: f.description, href: `/field/${f.id}` });
  }
  for (const p of paths) {
    docs.push({
      id: p.id,
      kind: 'path',
      title: p.title,
      subtitle: p.description,
      keywords: p.stages.map((s) => s.title).join(' '),
      href: `/path/${p.id}`,
    });
  }
  books.forEach((b, i) => {
    docs.push({
      id: `book-${i}`,
      kind: 'book',
      title: b.title,
      subtitle: `${b.author} · ${b.level}`,
      keywords: b.covers.join(' ') + ' ' + b.why,
      href: '/books',
    });
  });
  const pages: { title: string; href: string; subtitle: string; keywords: string }[] = [
    { title: 'Home', href: '/', subtitle: 'All domains', keywords: 'start index overview' },
    { title: 'CS Fields', href: '/fields', subtitle: 'Where the math gets used', keywords: 'applications careers' },
    { title: 'Learning Paths', href: '/paths', subtitle: 'Staged curricula', keywords: 'roadmap study plan' },
    { title: 'Books', href: '/books', subtitle: 'Recommended reading', keywords: 'textbooks library' },
    { title: 'Playground', href: '/playground', subtitle: 'Run the code behind the concepts', keywords: 'snippets javascript runner code' },
    { title: 'Practice Trainer', href: '/practice', subtitle: 'Interleaved questions on a spaced-repetition schedule', keywords: 'quiz drill review questions trainer srs revision' },
    { title: 'Progress', href: '/progress', subtitle: 'Streak, accuracy, completion and what to read next', keywords: 'dashboard stats streak bookmarks completed progress' },
    { title: 'Glossary', href: '/glossary', subtitle: 'Every definition in the curriculum, A–Z', keywords: 'dictionary definitions terms vocabulary glossary' },
    { title: 'Theorem Index', href: '/theorems', subtitle: 'Statements and proofs, grouped by domain', keywords: 'theorems proofs lemmas rigour true why' },
    { title: 'Applications', href: '/applications', subtitle: 'Where computer science uses each idea', keywords: 'applications industry uses cs fields applied' },
  ];
  for (const p of pages) docs.push({ id: `page-${p.href}`, kind: 'page', ...p });

  return docs;
}
