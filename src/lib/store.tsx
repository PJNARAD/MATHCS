import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Progress store (localStorage-backed)
//
// v2 adds bookmarks, recently-viewed concepts and playground run counts.
// v1 payloads are migrated on read — see migrateProgress(), which is pure and
// covered by tests so an old key can never strand a learner's progress.
// ---------------------------------------------------------------------------

export interface PracticeRecord {
  correct: boolean;
  attempts: number;
}

export interface ProgressState {
  version: number;
  completed: string[]; // concept ids marked complete
  practice: Record<string, PracticeRecord>;
  fieldInterest: string | null;
  pathStep: Record<string, number>; // pathId -> next step index
  bookmarks: string[]; // concept ids saved for later
  recent: { id: string; at: number }[]; // most recent first, capped
  snippetRuns: Record<string, { runs: number; lastAt: number }>; // playground ids
}

/** Shape of the v1 payload that shipped before this change. */
export interface ProgressV1 {
  completed?: unknown;
  practice?: unknown;
  fieldInterest?: unknown;
  pathStep?: unknown;
}

export const STORAGE_KEY = 'mathcs-progress-v2';
export const LEGACY_KEY = 'mathcs-progress-v1';
export const RECENT_LIMIT = 8;

export const DEFAULT_PROGRESS: ProgressState = {
  version: 2,
  completed: [],
  practice: {},
  fieldInterest: null,
  pathStep: {},
  bookmarks: [],
  recent: [],
  snippetRuns: {},
};

const stringArray = (v: unknown): string[] =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string'))] : [];

function migratePractice(raw: unknown): Record<string, PracticeRecord> {
  const out: Record<string, PracticeRecord> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const v = value as { correct?: unknown; attempts?: unknown };
    const attempts = typeof v.attempts === 'number' && Number.isFinite(v.attempts)
      ? Math.max(0, Math.floor(v.attempts))
      : 0;
    out[key] = { correct: v.correct === true, attempts };
  }
  return out;
}

function migratePathStep(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'number' && Number.isFinite(value)) out[key] = Math.max(0, Math.floor(value));
  }
  return out;
}

function migrateRecent(raw: unknown): { id: string; at: number }[] {
  if (!Array.isArray(raw)) return [];
  // Duplicates collapse onto the most recent visit, not the first seen.
  const newest = new Map<string, number>();
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const { id, at } = item as { id?: unknown; at?: unknown };
    if (typeof id !== 'string') continue;
    const when = typeof at === 'number' && Number.isFinite(at) ? at : 0;
    newest.set(id, Math.max(newest.get(id) ?? Number.NEGATIVE_INFINITY, when));
  }
  return [...newest.entries()]
    .map(([id, at]) => ({ id, at }))
    .sort((a, b) => b.at - a.at)
    .slice(0, RECENT_LIMIT);
}

function migrateSnippetRuns(raw: unknown): Record<string, { runs: number; lastAt: number }> {
  const out: Record<string, { runs: number; lastAt: number }> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const v = value as { runs?: unknown; lastAt?: unknown };
    out[key] = {
      runs: typeof v.runs === 'number' && Number.isFinite(v.runs) ? Math.max(0, Math.floor(v.runs)) : 0,
      lastAt: typeof v.lastAt === 'number' && Number.isFinite(v.lastAt) ? v.lastAt : 0,
    };
  }
  return out;
}

/**
 * Accept anything that might be sitting in localStorage — a v1 payload, a v2
 * payload, a half-written blob, or junk — and return a valid v2 state.
 */
export function migrateProgress(raw: unknown): ProgressState {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PROGRESS };
  const r = raw as Record<string, unknown>;
  return {
    version: 2,
    completed: stringArray(r.completed),
    practice: migratePractice(r.practice),
    fieldInterest: typeof r.fieldInterest === 'string' ? r.fieldInterest : null,
    pathStep: migratePathStep(r.pathStep),
    bookmarks: stringArray(r.bookmarks),
    recent: migrateRecent(r.recent),
    snippetRuns: migrateSnippetRuns(r.snippetRuns),
  };
}

function safeRead(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

/** Read v2, falling back to migrating the v1 key exactly once. */
export function loadProgress(storage?: { getItem: (k: string) => string | null }): ProgressState {
  const read = storage
    ? (k: string) => {
        try {
          const raw = storage.getItem(k);
          return raw ? JSON.parse(raw) : undefined;
        } catch {
          return undefined;
        }
      }
    : safeRead;
  const current = read(STORAGE_KEY);
  if (current && typeof current === 'object') return migrateProgress(current);
  const legacy = read(LEGACY_KEY);
  if (legacy && typeof legacy === 'object') return migrateProgress(legacy);
  return { ...DEFAULT_PROGRESS };
}

function load(): ProgressState {
  if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS };
  const loaded = loadProgress(localStorage);
  // If we recovered a v1 payload, persist it under the v2 key right away.
  if (loaded.completed.length > 0 || Object.keys(loaded.practice).length > 0) safeWrite(STORAGE_KEY, loaded);
  return loaded;
}

interface StoreCtx {
  state: ProgressState;
  toggleComplete: (id: string) => void;
  toggleBookmark: (id: string) => void;
  recordAnswer: (qid: string, correct: boolean) => void;
  setFieldInterest: (id: string | null) => void;
  setPathStep: (pathId: string, step: number) => void;
  visitConcept: (id: string) => void;
  recordSnippetRun: (id: string) => void;
  reset: () => void;
  isComplete: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  recentIds: () => string[];
  practiceResult: (qid: string) => PracticeRecord | undefined;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => load());

  useEffect(() => {
    safeWrite(STORAGE_KEY, state);
  }, [state]);

  const api = useMemo<StoreCtx>(() => ({
    state,
    toggleComplete: (id) =>
      setState((s) => ({
        ...s,
        completed: s.completed.includes(id) ? s.completed.filter((x) => x !== id) : [...s.completed, id],
      })),
    toggleBookmark: (id) =>
      setState((s) => ({
        ...s,
        bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter((x) => x !== id) : [id, ...s.bookmarks],
      })),
    recordAnswer: (qid, correct) =>
      setState((s) => {
        const prev = s.practice[qid];
        return {
          ...s,
          practice: {
            ...s.practice,
            [qid]: {
              correct: (prev?.correct ?? false) || correct,
              attempts: (prev?.attempts ?? 0) + 1,
            },
          },
        };
      }),
    setFieldInterest: (id) => setState((s) => ({ ...s, fieldInterest: id })),
    setPathStep: (pathId, step) => setState((s) => ({ ...s, pathStep: { ...s.pathStep, [pathId]: step } })),
    visitConcept: (id) =>
      setState((s) => {
        if (s.recent[0]?.id === id) return s;
        const at = Date.now();
        return { ...s, recent: [{ id, at }, ...s.recent.filter((r) => r.id !== id)].slice(0, RECENT_LIMIT) };
      }),
    recordSnippetRun: (id) =>
      setState((s) => {
        const prev = s.snippetRuns[id];
        return {
          ...s,
          snippetRuns: { ...s.snippetRuns, [id]: { runs: (prev?.runs ?? 0) + 1, lastAt: Date.now() } },
        };
      }),
    reset: () => setState({ ...DEFAULT_PROGRESS }),
    isComplete: (id) => state.completed.includes(id),
    isBookmarked: (id) => state.bookmarks.includes(id),
    recentIds: () => state.recent.map((r) => r.id),
    practiceResult: (qid) => state.practice[qid],
  }), [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
