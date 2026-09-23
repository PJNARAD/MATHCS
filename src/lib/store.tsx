import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Progress store (localStorage-backed)
//
// v2 added bookmarks, recently-viewed concepts and playground run counts.
// v3 adds what the /progress dashboard and the /practice trainer need:
//   - dayStamps: the local calendar days the learner was active, so a streak
//     can be computed without a server
//   - richer practice records: right/wrong counts, the last result and the
//     timestamp of the last attempt, which is what spaced repetition schedules
//     from (see src/lib/srs.ts)
// Older payloads are migrated on read — see migrateProgress(), which is pure and
// covered by tests so an old key can never strand a learner's progress.
// ---------------------------------------------------------------------------

export interface PracticeRecord {
  /** True once the question has been answered correctly at least once. */
  correct: boolean;
  /** Total number of attempts, right or wrong. */
  attempts: number;
  /** Attempts the learner marked correct. */
  right: number;
  /** Attempts the learner marked wrong. */
  wrong: number;
  /** Result of the most recent attempt — "still shaky" is wrong && !lastCorrect. */
  lastCorrect: boolean;
  /** Epoch ms of the most recent attempt; 0 when the payload predates v3. */
  lastAt: number;
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
  dayStamps: string[]; // local YYYY-MM-DD activity days, ascending, capped
}

/** Shape of the v1 payload that shipped before bookmarks and recents. */
export interface ProgressV1 {
  completed?: unknown;
  practice?: unknown;
  fieldInterest?: unknown;
  pathStep?: unknown;
}

export const PROGRESS_VERSION = 3;
export const STORAGE_KEY = 'mathcs-progress-v3';
/** Older keys, newest first: loadProgress walks these when v3 is absent. */
export const LEGACY_KEYS = ['mathcs-progress-v2', 'mathcs-progress-v1'] as const;
/** Kept as an alias because v1 is the oldest payload anyone can still hold. */
export const LEGACY_KEY = LEGACY_KEYS[LEGACY_KEYS.length - 1];
export const RECENT_LIMIT = 8;
/** Two years of daily activity is far more than a streak display needs. */
export const DAY_STAMP_LIMIT = 730;

export const DEFAULT_PROGRESS: ProgressState = {
  version: PROGRESS_VERSION,
  completed: [],
  practice: {},
  fieldInterest: null,
  pathStep: {},
  bookmarks: [],
  recent: [],
  snippetRuns: {},
  dayStamps: [],
};

const stringArray = (v: unknown): string[] =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string'))] : [];

function nonNegativeInt(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0;
}

function migratePractice(raw: unknown): Record<string, PracticeRecord> {
  const out: Record<string, PracticeRecord> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const v = value as {
      correct?: unknown; attempts?: unknown; right?: unknown; wrong?: unknown;
      lastCorrect?: unknown; lastAt?: unknown;
    };
    const attempts = nonNegativeInt(v.attempts);
    const correct = v.correct === true;
    // A pre-v3 record only says "ever correct" plus a total. Reconstruct the
    // split conservatively: one success, the rest misses. That keeps an old
    // learner's history honest enough to schedule from without inventing data.
    const right = nonNegativeInt(v.right) || (correct ? Math.min(1, attempts || 1) : 0);
    const wrong = nonNegativeInt(v.wrong) || Math.max(0, attempts - right);
    out[key] = {
      correct,
      attempts,
      right,
      wrong,
      lastCorrect: typeof v.lastCorrect === 'boolean' ? v.lastCorrect : correct,
      lastAt: nonNegativeInt(v.lastAt),
    };
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
    out[key] = { runs: nonNegativeInt(v.runs), lastAt: nonNegativeInt(v.lastAt) };
  }
  return out;
}

const DAY_STAMP = /^\d{4}-\d{2}-\d{2}$/;

/** Activity days: sorted, de-duplicated, well-formed, and capped from the old end. */
export function normalizeDayStamps(raw: unknown, limit = DAY_STAMP_LIMIT): string[] {
  if (!Array.isArray(raw)) return [];
  const days = new Set(
    raw.filter((d): d is string => typeof d === 'string' && DAY_STAMP.test(d)),
  );
  return [...days].sort().slice(-limit);
}

/**
 * Accept anything that might be sitting in localStorage — a v1 payload, a v2
 * payload, a half-written blob, or junk — and return a valid current state.
 */
export function migrateProgress(raw: unknown): ProgressState {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PROGRESS };
  const r = raw as Record<string, unknown>;
  return {
    version: PROGRESS_VERSION,
    completed: stringArray(r.completed),
    practice: migratePractice(r.practice),
    fieldInterest: typeof r.fieldInterest === 'string' ? r.fieldInterest : null,
    pathStep: migratePathStep(r.pathStep),
    bookmarks: stringArray(r.bookmarks),
    recent: migrateRecent(r.recent),
    snippetRuns: migrateSnippetRuns(r.snippetRuns),
    dayStamps: normalizeDayStamps(r.dayStamps),
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

type Reader = (key: string) => unknown;

/** Read the current key, falling back to each legacy key in turn. */
export function loadProgress(storage?: { getItem: (k: string) => string | null }): ProgressState {
  const read: Reader = storage
    ? (k) => {
        try {
          const raw = storage.getItem(k);
          return raw ? JSON.parse(raw) : undefined;
        } catch {
          return undefined;
        }
      }
    : safeRead;
  for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) {
    const payload = read(key);
    if (payload && typeof payload === 'object') return migrateProgress(payload);
  }
  return { ...DEFAULT_PROGRESS };
}

function load(): ProgressState {
  if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS };
  const loaded = loadProgress(localStorage);
  // If we recovered an older payload, persist it under the current key right
  // away so the migration happens exactly once.
  const hasHistory = loaded.completed.length > 0
    || Object.keys(loaded.practice).length > 0
    || loaded.dayStamps.length > 0;
  if (hasHistory) safeWrite(STORAGE_KEY, loaded);
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

/**
 * The next practice record for a question. Pure so the trainer, the tests and
 * the store all agree on what an attempt means.
 */
export function nextPracticeRecord(
  previous: PracticeRecord | undefined,
  correct: boolean,
  at: number,
): PracticeRecord {
  const prev = previous ?? { correct: false, attempts: 0, right: 0, wrong: 0, lastCorrect: false, lastAt: 0 };
  return {
    correct: prev.correct || correct,
    attempts: prev.attempts + 1,
    right: prev.right + (correct ? 1 : 0),
    wrong: prev.wrong + (correct ? 0 : 1),
    lastCorrect: correct,
    lastAt: Number.isFinite(at) && at > 0 ? at : prev.lastAt,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => load());

  useEffect(() => {
    safeWrite(STORAGE_KEY, state);
  }, [state]);

  const api = useMemo<StoreCtx>(() => {
    /** Reading a lesson or answering a question both count as an active day. */
    const stampToday = (s: ProgressState): string[] => {
      const key = localDayKey(Date.now());
      return s.dayStamps[s.dayStamps.length - 1] === key
        ? s.dayStamps
        : normalizeDayStamps([...s.dayStamps, key]);
    };

    return {
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
        setState((s) => ({
          ...s,
          practice: { ...s.practice, [qid]: nextPracticeRecord(s.practice[qid], correct, Date.now()) },
          dayStamps: stampToday(s),
        })),
      setFieldInterest: (id) => setState((s) => ({ ...s, fieldInterest: id })),
      setPathStep: (pathId, step) => setState((s) => ({ ...s, pathStep: { ...s.pathStep, [pathId]: step } })),
      visitConcept: (id) =>
        setState((s) => {
          const dayStamps = stampToday(s);
          if (s.recent[0]?.id === id) return dayStamps === s.dayStamps ? s : { ...s, dayStamps };
          const at = Date.now();
          return {
            ...s,
            dayStamps,
            recent: [{ id, at }, ...s.recent.filter((r) => r.id !== id)].slice(0, RECENT_LIMIT),
          };
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
    };
  }, [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

/** Local calendar day (YYYY-MM-DD) for a timestamp — the unit a streak counts. */
export function localDayKey(at: number): string {
  const d = new Date(at);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
