// ---------------------------------------------------------------------------
// Progress maths for the /progress dashboard and the /practice trainer.
//
// Everything here is pure: the caller passes the generated concept index and
// the learner's stored state, and gets numbers back. That keeps the dashboard
// testable without a DOM and means no page has to load a lesson body to draw a
// bar chart — the index carries the counts.
// ---------------------------------------------------------------------------

import type { ConceptIndexEntry } from './concept-index-file';
import type { ProgressState } from './store';
import { DAY_MS, isDue, isMissed } from './srs';
import { domains } from '../data/domains';

const DOMAIN_ORDER = new Map(domains.map((d, i) => [d.id, i] as const));

export const LEVEL_RANK: Record<string, number> = {
  foundational: 0,
  core: 1,
  advanced: 2,
};

const domainRank = (id: string): number => DOMAIN_ORDER.get(id) ?? DOMAIN_ORDER.size;

/** Non-hub entries are the lessons a learner actually finishes. */
export const lessonsOf = (index: ConceptIndexEntry[]): ConceptIndexEntry[] =>
  index.filter((entry) => !entry.topic);

export interface DomainStats {
  domain: string;
  name: string;
  short: string;
  entries: number;
  lessons: number;
  completed: number;
  lessonsCompleted: number;
  /** 0..1 over entries in the domain. */
  pct: number;
  questions: number;
  attempted: number;
  correct: number;
  missed: number;
  /** correct / attempted, or null when nothing has been attempted. */
  accuracy: number | null;
}

export interface OverallStats {
  entries: number;
  lessons: number;
  completed: number;
  lessonsCompleted: number;
  pct: number;
  questions: number;
  attempted: number;
  correct: number;
  missed: number;
  due: number;
  accuracy: number | null;
  bookmarks: number;
  snippetRuns: number;
  daysActive: number;
  streak: number;
  longestStreak: number;
  domainsTouched: number;
  domainsComplete: number;
}

const pct = (part: number, whole: number): number => (whole > 0 ? part / whole : 0);
const ratio = (part: number, whole: number): number | null => (whole > 0 ? part / whole : null);

/** Calendar-day number for a YYYY-MM-DD stamp; NaN-safe for malformed input. */
export function dayIndexOf(dayKey: string): number {
  const parsed = Date.parse(`${dayKey}T00:00:00Z`);
  return Number.isFinite(parsed) ? Math.round(parsed / DAY_MS) : Number.NaN;
}

/** Inverse of dayIndexOf: the YYYY-MM-DD stamp for a calendar-day number. */
export function dayKeyOfIndex(index: number): string {
  return new Date(index * DAY_MS).toISOString().slice(0, 10);
}

export interface DayCell {
  key: string;
  active: boolean;
  isToday: boolean;
}

/**
 * The last `days` calendar days, oldest first, marked with whether the learner
 * was active. This is what the dashboard's streak strip draws; keeping it here
 * means the strip and `currentStreak` can never disagree.
 */
export function streakCalendar(dayStamps: string[], todayKey: string, days = 21): DayCell[] {
  const active = new Set(dayStamps);
  const today = dayIndexOf(todayKey);
  if (!Number.isFinite(today)) return [];
  return Array.from({ length: Math.max(0, days) }, (_, offset) => {
    const key = dayKeyOfIndex(today - (days - 1 - offset));
    return { key, active: active.has(key), isToday: key === todayKey };
  });
}

/**
 * Consecutive active days ending at `todayKey`. A streak survives the current
 * day not having been studied yet — it only breaks once yesterday is missing,
 * so opening the site at 09:00 does not reset what you did at 23:00.
 */
export function currentStreak(dayStamps: string[], todayKey: string): number {
  const days = new Set(dayStamps.map(dayIndexOf).filter((n) => Number.isFinite(n)));
  if (!days.size) return 0;
  const today = dayIndexOf(todayKey);
  if (!Number.isFinite(today)) return 0;
  let cursor = days.has(today) ? today : today - 1;
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

/** Longest run of consecutive active days ever recorded. */
export function longestStreak(dayStamps: string[]): number {
  const days = [...new Set(dayStamps.map(dayIndexOf).filter((n) => Number.isFinite(n)))].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let previous: number | null = null;
  for (const day of days) {
    run = previous !== null && day === previous + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}

/**
 * Per-domain roll-up. Completion comes from the concept index and the store;
 * accuracy comes from the practice records once `questionDomain` can map a
 * question id back to its domain (the generated practice index provides that).
 * Either way no lesson body is needed.
 */
export function domainStats(
  index: ConceptIndexEntry[],
  state: ProgressState,
  questionDomain?: (questionId: string) => string | undefined,
): DomainStats[] {
  const completed = new Set(state.completed);
  const rows = new Map<string, DomainStats>();

  for (const entry of index) {
    let row = rows.get(entry.domain);
    if (!row) {
      const meta = domains.find((d) => d.id === entry.domain);
      row = {
        domain: entry.domain,
        name: meta?.name ?? entry.domain,
        short: meta?.short ?? entry.domain,
        entries: 0,
        lessons: 0,
        completed: 0,
        lessonsCompleted: 0,
        pct: 0,
        questions: 0,
        attempted: 0,
        correct: 0,
        missed: 0,
        accuracy: null,
      };
      rows.set(entry.domain, row);
    }
    row.entries += 1;
    if (!entry.topic) row.lessons += 1;
    row.questions += entry.practiceCount;
    if (completed.has(entry.id)) {
      row.completed += 1;
      if (!entry.topic) row.lessonsCompleted += 1;
    }
  }

  // Practice records are keyed by question id, so folding them into a domain
  // needs the question -> domain map the generated practice index provides.
  if (questionDomain) {
    for (const [questionId, record] of Object.entries(state.practice)) {
      const domain = questionDomain(questionId);
      const row = domain ? rows.get(domain) : undefined;
      if (!row) continue;
      row.attempted += 1;
      if (record.right > 0) row.correct += 1;
      if (isMissed(record)) row.missed += 1;
    }
  }

  for (const row of rows.values()) {
    row.pct = pct(row.completed, row.entries);
    row.accuracy = ratio(row.correct, row.attempted);
  }

  return [...rows.values()].sort((a, b) => domainRank(a.domain) - domainRank(b.domain));
}

export function overallStats(
  index: ConceptIndexEntry[],
  state: ProgressState,
  todayKey: string,
  now: number = Date.now(),
  questionDomain?: (questionId: string) => string | undefined,
): OverallStats {
  const rows = domainStats(index, state, questionDomain);
  const lessons = lessonsOf(index);
  const completed = new Set(state.completed);
  const records = Object.values(state.practice);
  const attempted = records.length;
  const correct = records.filter((r) => r.right > 0).length;
  const missed = records.filter(isMissed).length;
  const due = records.filter((r) => isDue(r, now)).length;

  return {
    entries: index.length,
    lessons: lessons.length,
    completed: state.completed.length,
    lessonsCompleted: lessons.filter((entry) => completed.has(entry.id)).length,
    pct: pct(state.completed.length, index.length),
    questions: index.reduce((n, entry) => n + entry.practiceCount, 0),
    attempted,
    correct,
    missed,
    due,
    accuracy: ratio(correct, attempted),
    bookmarks: state.bookmarks.length,
    snippetRuns: Object.values(state.snippetRuns).reduce((n, r) => n + r.runs, 0),
    daysActive: state.dayStamps.length,
    streak: currentStreak(state.dayStamps, todayKey),
    longestStreak: longestStreak(state.dayStamps),
    domainsTouched: rows.filter((row) => row.completed > 0 || row.attempted > 0).length,
    domainsComplete: rows.filter((row) => row.entries > 0 && row.completed === row.entries).length,
  };
}

/** Domains with the lowest accuracy, ignoring ones with too little evidence. */
export function weakestDomains(rows: DomainStats[], minAttempts = 3, limit = 3): DomainStats[] {
  return rows
    .filter((row) => row.attempted >= minAttempts && row.accuracy !== null)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0) || b.attempted - a.attempted)
    .slice(0, limit);
}

/** Domains closest to finished — what a "keep going" nudge should point at. */
export function closestToFinished(rows: DomainStats[], limit = 3): DomainStats[] {
  return rows
    .filter((row) => row.completed > 0 && row.completed < row.entries)
    .sort((a, b) => b.pct - a.pct || domainRank(a.domain) - domainRank(b.domain))
    .slice(0, limit);
}

/**
 * What to read next. A lesson is recommended once every prerequisite is either
 * completed or a hub topic (hubs are navigation, not lessons), with a boost for
 * lessons a finished one points at and for domains already under way.
 */
export function nextUp(
  index: ConceptIndexEntry[],
  completedIds: string[],
  limit = 6,
): ConceptIndexEntry[] {
  const done = new Set(completedIds);
  const byId = new Map(index.map((entry) => [entry.id, entry] as const));
  const pointedAt = new Set<string>();
  for (const entry of index) {
    if (!done.has(entry.id)) continue;
    for (const next of entry.next ?? []) pointedAt.add(next);
  }
  const startedDomains = new Set(
    index.filter((entry) => done.has(entry.id)).map((entry) => entry.domain),
  );

  const scored = index
    .filter((entry) => !entry.topic && !done.has(entry.id))
    .map((entry) => {
      const prerequisites = entry.prerequisites.filter((id) => byId.has(id));
      const ready = prerequisites.every((id) => done.has(id) || byId.get(id)?.topic === true);
      let score = 0;
      if (pointedAt.has(entry.id)) score += 8;
      if (ready) score += 4;
      if (startedDomains.has(entry.domain)) score += 2;
      score += LEVEL_RANK[entry.level] === 0 ? 1 : 0;
      return { entry, score, ready };
    })
    .filter((candidate) => candidate.ready || pointedAt.has(candidate.entry.id));

  // Nothing is "ready" only when a learner has finished everything reachable,
  // so the fallback still has to exclude finished lessons — otherwise a
  // completed curriculum would keep recommending itself.
  const pool = scored.length
    ? scored.sort((a, b) =>
        b.score - a.score
        || domainRank(a.entry.domain) - domainRank(b.entry.domain)
        || a.entry.id.localeCompare(b.entry.id)).map((candidate) => candidate.entry)
    : lessonsOf(index)
        .filter((entry) => !done.has(entry.id))
        .sort((a, b) =>
          a.prerequisites.length - b.prerequisites.length
          || LEVEL_RANK[a.level] - LEVEL_RANK[b.level]
          || domainRank(a.domain) - domainRank(b.domain)
          || a.id.localeCompare(b.id));

  return pool.slice(0, Math.max(0, limit));
}

/** Saved lessons, newest first — the store already keeps bookmarks that way. */
export function savedEntries(index: ConceptIndexEntry[], state: ProgressState): ConceptIndexEntry[] {
  const byId = new Map(index.map((entry) => [entry.id, entry] as const));
  return state.bookmarks
    .map((id) => byId.get(id))
    .filter((entry): entry is ConceptIndexEntry => Boolean(entry));
}

/** Recently opened lessons, most recent first. */
export function recentEntries(index: ConceptIndexEntry[], state: ProgressState): ConceptIndexEntry[] {
  const byId = new Map(index.map((entry) => [entry.id, entry] as const));
  return state.recent
    .map((visit) => byId.get(visit.id))
    .filter((entry): entry is ConceptIndexEntry => Boolean(entry));
}

/** Lessons started (visited) but not finished — the "go back and close it" list. */
export function unfinishedVisits(
  index: ConceptIndexEntry[],
  state: ProgressState,
  limit = 5,
): ConceptIndexEntry[] {
  const done = new Set(state.completed);
  return recentEntries(index, state).filter((entry) => !entry.topic && !done.has(entry.id)).slice(0, limit);
}

/** "42%" — one decimal only when it is not a round number. */
export function formatPct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  const scaled = value * 100;
  return `${scaled >= 10 || Math.round(scaled) === scaled ? Math.round(scaled) : scaled.toFixed(1)}%`;
}
