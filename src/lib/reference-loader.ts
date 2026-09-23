// ---------------------------------------------------------------------------
// Lazy access to the generated reference slices.
//
// Same contract as concept-loader, one level up: `read*()` returns the data
// when its chunk is in memory and *throws the loading promise* otherwise, so a
// page can call it during render inside the app's Suspense boundary. Pipeable
// SSR waits for the thrown promise (onAllReady), which is why the smoke test
// can assert that /glossary really renders terms rather than a spinner.
//
// The pending promise is cached per slice — React re-renders on every throw,
// and a fresh promise each time would loop forever.
// ---------------------------------------------------------------------------

import type {
  ApplicationEntry, GlossaryEntry, PracticeIndexEntry, TheoremEntry,
} from './reference-index-file';

export type { ApplicationEntry, GlossaryEntry, PracticeIndexEntry, TheoremEntry };

interface Slice<T> {
  /** Promise form: resolves with the slice, loading it if needed. */
  load(): Promise<T>;
  /** Render form: the slice, or a thrown promise for Suspense to catch. */
  read(): T;
  /** True once the chunk is in memory. */
  isLoaded(): boolean;
  /** Drop the chunk (tests only, so each case can start cold). */
  clear(): void;
}

function lazySlice<T>(fetcher: () => Promise<T>): Slice<T> {
  let data: T | null = null;
  let pending: Promise<T> | null = null;

  const load = (): Promise<T> => {
    if (data !== null) return Promise.resolve(data);
    if (!pending) {
      pending = fetcher().then(
        (value) => { data = value; return value; },
        (error) => { pending = null; throw error; },
      );
    }
    return pending;
  };

  return {
    load,
    read: () => {
      if (data !== null) return data;
      throw load();
    },
    isLoaded: () => data !== null,
    clear: () => { data = null; pending = null; },
  };
}

const glossarySlice = lazySlice<GlossaryEntry[]>(
  () => import('../data/glossary-index').then((m) => m.glossaryIndex),
);
const theoremSlice = lazySlice<TheoremEntry[]>(
  () => import('../data/theorem-index').then((m) => m.theoremIndex),
);
const applicationSlice = lazySlice<ApplicationEntry[]>(
  () => import('../data/applications-index').then((m) => m.applicationIndex),
);
const practiceSlice = lazySlice<PracticeIndexEntry[]>(
  () => import('../data/practice-index').then((m) => m.practiceIndex),
);

export const readGlossary = glossarySlice.read;
export const loadGlossary = glossarySlice.load;
export const readTheorems = theoremSlice.read;
export const loadTheorems = theoremSlice.load;
export const readApplications = applicationSlice.read;
export const loadApplications = applicationSlice.load;
export const readPracticeIndex = practiceSlice.read;
export const loadPracticeIndex = practiceSlice.load;

/** The slices a page can suspend on, for tests and for cache clearing. */
export const referenceSlices = {
  glossary: glossarySlice,
  theorems: theoremSlice,
  applications: applicationSlice,
  practice: practiceSlice,
};

export function clearReferenceCache(): void {
  for (const slice of Object.values(referenceSlices)) slice.clear();
}

/**
 * Question id -> domain, for folding practice records into per-domain numbers
 * without loading a lesson. Returns undefined until the manifest is loaded, so
 * callers that only have the concept index still work (they just lose the
 * accuracy column).
 */
export function practiceDomainMap(): Map<string, string> {
  return new Map(readPracticeIndex().map((entry) => [entry.id, entry.domain] as const));
}
