// ---------------------------------------------------------------------------
// Spaced repetition for the practice trainer.
//
// Pure and DOM-free so the scheduling can be unit tested: given the store's
// practice records and a clock, decide what is due and in which order it should
// be asked. The schedule is the one CONTENT-ROADMAP.md §3 asked for — a missed
// question comes straight back, a question answered correctly once returns
// after a day, then three days, then seven.
//
// Nothing here reads localStorage or Date.now(): callers pass `now` in.
// ---------------------------------------------------------------------------

import type { PracticeRecord } from './store';
import { mulberry32 } from './stat';
import type { Difficulty } from '../data/types';

export const DAY_MS = 86_400_000;

/** Gap after the 1st, 2nd and 3rd+ success. Index by (right - 1), clamped. */
export const REVIEW_INTERVALS_MS: readonly number[] = [DAY_MS, 3 * DAY_MS, 7 * DAY_MS];

export type ReviewStage = 'new' | 'learning' | 'review' | 'mastered';

/** Ordering weight: a never-seen question outranks a due review. */
export const STAGE_WEIGHT: Record<ReviewStage, number> = {
  new: 3,
  learning: 2,
  review: 1,
  mastered: 0,
};

export const STAGE_LABEL: Record<ReviewStage, string> = {
  new: 'Not attempted yet',
  learning: 'Missed last time — due now',
  review: 'Learned — due for review',
  mastered: 'Solid — long review gap',
};

/** Which stage a record puts a question in. `undefined` means never attempted. */
export function stageOf(record: PracticeRecord | undefined): ReviewStage {
  if (!record || record.attempts === 0) return 'new';
  if (!record.lastCorrect) return 'learning';
  return record.right >= 3 ? 'mastered' : 'review';
}

/** Milliseconds a question should wait after its last attempt before returning. */
export function intervalFor(record: PracticeRecord | undefined): number {
  const stage = stageOf(record);
  if (stage === 'new' || stage === 'learning') return 0;
  if (!record) return 0;
  if (stage === 'mastered') return REVIEW_INTERVALS_MS[REVIEW_INTERVALS_MS.length - 1];
  const index = Math.min(Math.max(record.right - 1, 0), REVIEW_INTERVALS_MS.length - 1);
  return REVIEW_INTERVALS_MS[index];
}

/**
 * Milliseconds until the question is due; 0 means "ask it now". A pre-v3 record
 * has no timestamp, so it is treated as due rather than silently skipped —
 * losing a learner's review queue to a migration would be worse than an extra
 * question.
 */
export function dueInMs(record: PracticeRecord | undefined, now: number): number {
  if (!record || record.attempts === 0) return 0;
  if (!record.lastCorrect) return 0;
  if (!(record.lastAt > 0)) return 0;
  const remaining = record.lastAt + intervalFor(record) - now;
  return remaining > 0 ? remaining : 0;
}

export function isDue(record: PracticeRecord | undefined, now: number): boolean {
  return dueInMs(record, now) === 0;
}

/**
 * Sort key: higher is asked sooner. Due questions outrank everything else, and
 * within the due set a never-seen question outranks a missed one, which
 * outranks a routine review. Not-yet-due questions fall behind, ordered by how
 * soon they come back.
 */
export function priorityOf(record: PracticeRecord | undefined, now: number): number {
  const weight = STAGE_WEIGHT[stageOf(record)] * 1000;
  if (isDue(record, now)) {
    const attempts = record?.attempts ?? 0;
    return 1_000_000 + weight - Math.min(attempts, 999);
  }
  return weight - Math.round(dueInMs(record, now) / DAY_MS) * 10;
}

/** Anything the scheduler can order — it only needs the question id. */
export interface QueueItem {
  id: string;
}

/**
 * Order a pool of questions for a training session. Deterministic: equal
 * priority falls back to the question id, so a session is reproducible.
 */
export function sortQueue<T extends QueueItem>(
  items: T[],
  records: Record<string, PracticeRecord>,
  now: number,
): T[] {
  return [...items].sort((a, b) => {
    const delta = priorityOf(records[b.id], now) - priorityOf(records[a.id], now);
    return delta !== 0 ? delta : a.id.localeCompare(b.id);
  });
}

/** A stable shuffle for "mix it up" sessions — seeded, so it is testable. */
export function shuffled<T>(items: T[], seed: number): T[] {
  const random = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type SessionMode = 'review' | 'new' | 'missed' | 'all';

export const SESSION_MODES: { id: SessionMode; label: string; hint: string }[] = [
  { id: 'review', label: 'Smart review', hint: 'Due questions first, then new ones' },
  { id: 'new', label: 'New only', hint: 'Questions you have not attempted' },
  { id: 'missed', label: 'Missed', hint: 'Questions your last answer got wrong' },
  { id: 'all', label: 'Everything', hint: 'The whole pool, in curriculum order' },
];

/** Questions the learner's last attempt got wrong — the "still shaky" set. */
export function isMissed(record: PracticeRecord | undefined): boolean {
  return Boolean(record && record.attempts > 0 && !record.lastCorrect);
}

export interface SessionOptions {
  mode?: SessionMode;
  limit?: number;
  difficulty?: Difficulty | 'all';
  /** Shuffle the pool before scheduling (a seed keeps it reproducible). */
  seed?: number;
}

/**
 * Pick the questions for one session. Filtering happens before scheduling, so
 * "missed" cannot be swamped by new questions and "new" cannot show a repeat.
 */
export function buildSession<T extends QueueItem & { diff?: Difficulty }>(
  pool: T[],
  records: Record<string, PracticeRecord>,
  now: number,
  options: SessionOptions = {},
): T[] {
  const { mode = 'review', limit = 10, difficulty = 'all', seed } = options;
  let items = difficulty === 'all' ? pool : pool.filter((item) => item.diff === difficulty);
  if (seed !== undefined) items = shuffled(items, seed);

  switch (mode) {
    case 'new':
      items = items.filter((item) => !records[item.id] || records[item.id].attempts === 0);
      break;
    case 'missed':
      items = items.filter((item) => isMissed(records[item.id]));
      break;
    case 'all':
      return items.slice(0, Math.max(0, limit));
    case 'review':
    default:
      items = sortQueue(items, records, now);
      break;
  }
  return items.slice(0, Math.max(0, limit));
}

/** How many questions sit in each stage — the trainer's headline numbers. */
export function stageCounts(
  ids: string[],
  records: Record<string, PracticeRecord>,
): Record<ReviewStage, number> {
  const counts: Record<ReviewStage, number> = { new: 0, learning: 0, review: 0, mastered: 0 };
  for (const id of ids) counts[stageOf(records[id])] += 1;
  return counts;
}

/**
 * The stage counts as display rows, in the order a learner should read them:
 * what is waiting, what came back wrong, what is in rotation, what is solid.
 */
export function formatStageCounts(
  counts: Record<ReviewStage, number>,
): { stage: ReviewStage; label: string; count: number }[] {
  const labels: Record<ReviewStage, string> = {
    new: 'Never attempted',
    learning: 'Missed — due now',
    review: 'In review rotation',
    mastered: 'Solid (7-day gap)',
  };
  return (['new', 'learning', 'review', 'mastered'] as ReviewStage[])
    .map((stage) => ({ stage, label: labels[stage], count: counts[stage] }));
}

/** How many of the pool are due right now. */
export function dueCount(
  ids: string[],
  records: Record<string, PracticeRecord>,
  now: number,
): number {
  return ids.filter((id) => isDue(records[id], now)).length;
}

/** "in 3 d", "today", "now" — the label shown next to a queued question. */
export function dueLabel(record: PracticeRecord | undefined, now: number): string {
  const stage = stageOf(record);
  if (stage === 'new') return 'new';
  const wait = dueInMs(record, now);
  if (wait === 0) return stage === 'learning' ? 'missed — due now' : 'due now';
  const days = Math.round(wait / DAY_MS);
  return days <= 0 ? 'due now' : `in ${days} d`;
}
