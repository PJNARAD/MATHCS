// ---------------------------------------------------------------------------
// Concept access for the shipped app.
//
// Two levels of detail, deliberately separated:
//
//   conceptInfo(id)   cheap, from the generated index - title, summary, domain,
//                     level, links, counts. No lesson body. This is what link
//                     components, search, the palette, the domain and path
//                     pages use, so those routes never download content.
//
//   readConcept(id)   the full lesson. Returns undefined for an unknown id and
//                     *suspends* (throws the loading promise) while the domain
//                     chunk is on its way - React's Suspense boundary shows the
//                     fallback and re-renders when it resolves. Server-side this
//                     works too: renderToPipeableStream's onAllReady waits for
//                     the promise, so a concept page can never render as an
//                     empty shell (tests/smoke.tsx relies on exactly that).
//
// The domain modules are loaded with dynamic import(), one chunk per domain:
// Vite cannot glob into a static import(), and listing the loaders explicitly
// keeps chunk names stable. tests/run.ts asserts that every domain in the index
// has a loader and that the loader set matches the domains a reader can reach.
// ---------------------------------------------------------------------------

import type { Concept } from '../data/types';
import { conceptIndex, conceptIndexById } from '../data/concept-index';
import type { ConceptIndexEntry } from './concept-index-file';

export type { ConceptIndexEntry };

// ---- the index (shipped) ---------------------------------------------------

export const totalConcepts = conceptIndex.length;
export const totalPracticeCount = conceptIndex.reduce((n, e) => n + e.practiceCount, 0);
export const domainsWithContent: Set<string> = new Set(conceptIndex.map((e) => e.domain));

/** Index entry for a concept id, or undefined when the id is not published. */
export function conceptInfo(id: string): ConceptIndexEntry | undefined {
  return conceptIndexById.get(id);
}

export function hasConcept(id: string): boolean {
  return conceptIndexById.has(id);
}

export function conceptsInDomain(domain: string): ConceptIndexEntry[] {
  return conceptIndex.filter((e) => e.domain === domain);
}

/** Hub topics of a domain, in authoring order. */
export function topicsInDomain(domain: string): ConceptIndexEntry[] {
  return conceptsInDomain(domain).filter((e) => e.topic);
}

/** Non-topic concepts whose parent is the given topic. */
export function childrenOfTopic(parentId: string, domain: string): ConceptIndexEntry[] {
  return conceptIndex.filter((e) => e.domain === domain && e.parent === parentId && !e.topic);
}

/** Concepts with no parent, or a parent that is not a hub topic of this domain. */
export function standaloneInDomain(domain: string): ConceptIndexEntry[] {
  const topicIds = new Set(topicsInDomain(domain).map((t) => t.id));
  return conceptsInDomain(domain).filter((e) => !e.topic && (!e.parent || !topicIds.has(e.parent)));
}

// ---- lesson bodies (lazy, one chunk per domain) ----------------------------

type DomainLoader = () => Promise<Concept[]>;

const DOMAIN_LOADERS: Record<string, DomainLoader> = {
  discrete: () => Promise.all([import('../data/concepts/discrete-1'), import('../data/concepts/discrete-2')])
    .then(([a, b]) => [...a.discrete1, ...b.discrete2]),
  proofs: () => import('../data/concepts/proofs').then((m) => m.proofs),
  combinatorics: () => import('../data/concepts/combinatorics').then((m) => m.combinatorics),
  'graph-theory': () => Promise.all([
    import('../data/concepts/graph-theory-1'),
    import('../data/concepts/graph-theory-2'),
    import('../data/concepts/graph-algorithms'),
  ]).then(([a, b, c]) => [...a.graphTheory1, ...b.graphTheory2, ...c.graphAlgorithms]),
  'number-theory': () => Promise.all([import('../data/concepts/number-theory-1'), import('../data/concepts/number-theory-2')])
    .then(([a, b]) => [...a.numberTheory1, ...b.numberTheory2]),
  probability: () => import('../data/concepts/probability').then((m) => m.probability),
  statistics: () => import('../data/concepts/statistics').then((m) => m.statistics),
  'linear-algebra': () => import('../data/concepts/linear-algebra').then((m) => m.linearAlgebra),
  calculus: () => import('../data/concepts/calculus').then((m) => m.calculus),
  optimization: () => import('../data/concepts/optimization').then((m) => m.optimization),
  geometry: () => import('../data/concepts/geometry').then((m) => m.geometry),
  'abstract-algebra': () => import('../data/concepts/abstract-algebra').then((m) => m.abstractAlgebra),
  'information-theory': () => import('../data/concepts/information-theory').then((m) => m.informationTheory),
  numerical: () => import('../data/concepts/numerical').then((m) => m.numerical),
  formal: () => import('../data/concepts/formal').then((m) => m.formal),
};

/** Domains a lesson body can be loaded for — used by the tests as a guard. */
export const loadableDomains = Object.keys(DOMAIN_LOADERS).sort();

const loaded = new Map<string, Map<string, Concept>>();
const pending = new Map<string, Promise<Map<string, Concept>>>();

function loadDomain(domain: string): Promise<Map<string, Concept>> {
  const cache = loaded.get(domain);
  if (cache) return Promise.resolve(cache);
  const inFlight = pending.get(domain);
  if (inFlight) return inFlight;

  const loader = DOMAIN_LOADERS[domain];
  if (!loader) return Promise.reject(new Error(`No concept loader for domain "${domain}"`));

  const promise = loader().then(
    (concepts) => {
      const map = new Map(concepts.map((c) => [c.id, c]));
      loaded.set(domain, map);
      pending.delete(domain);
      return map;
    },
    (error) => {
      pending.delete(domain);
      throw error;
    },
  );
  pending.set(domain, promise);
  return promise;
}

/** Load one lesson, resolving as soon as its domain chunk is in memory. */
export async function loadConcept(id: string): Promise<Concept | undefined> {
  const info = conceptIndexById.get(id);
  if (!info) return undefined;
  const map = await loadDomain(info.domain);
  return map.get(id);
}

/**
 * Synchronous read for render: undefined for an unknown id, the lesson when it
 * is already loaded, and a thrown promise (React Suspense) otherwise.
 */
export function readConcept(id: string): Concept | undefined {
  const info = conceptIndexById.get(id);
  if (!info) return undefined;
  const map = loaded.get(info.domain);
  if (map) return map.get(id);
  throw loadDomain(info.domain);
}

/** Drop every cached chunk (tests only: keeps each test able to start cold). */
export function clearConceptCache(): void {
  loaded.clear();
  pending.clear();
}
