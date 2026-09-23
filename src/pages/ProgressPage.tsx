import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bookmark, Flame, RotateCcw, Target, TrendingUp,
} from 'lucide-react';
import { conceptIndex } from '../data/concept-index';
import { paths } from '../data/paths';
import { readPracticeIndex } from '../lib/reference-loader';
import { localDayKey, useStore } from '../lib/store';
import { useToast } from '../components/Toast';
import { LevelBadge } from '../components/ui';
import {
  EmptyState, GroupHeading, LibraryHeader, ProgressBar, StatTile, domainShort,
} from '../components/library';
import {
  closestToFinished, domainStats, formatPct, longestStreak, nextUp,
  overallStats, recentEntries, savedEntries, streakCalendar, unfinishedVisits, weakestDomains,
} from '../lib/progress';

// ---------------------------------------------------------------------------
// /progress — the dashboard over the store.
//
// Every number is computed from data the app already keeps (completed lessons,
// per-question records, bookmarks, recents, snippet runs, activity days) plus
// the two generated indexes, so the page needs no lesson body: it suspends on
// the practice manifest only, which is what maps a question id to a domain.
// ---------------------------------------------------------------------------

export function ProgressPage() {
  const { state, reset } = useStore();
  const { showToast } = useToast();
  const practice = readPracticeIndex();

  const todayKey = localDayKey(Date.now());
  const questionDomain = useMemo(
    () => new Map(practice.map((entry) => [entry.id, entry.domain] as const)),
    [practice],
  );

  const stats = useMemo(
    () => overallStats(conceptIndex, state, todayKey, Date.now(), (id) => questionDomain.get(id)),
    [state, todayKey, questionDomain],
  );
  const rows = useMemo(
    () => domainStats(conceptIndex, state, (id) => questionDomain.get(id)),
    [state, questionDomain],
  );
  const calendar = useMemo(() => streakCalendar(state.dayStamps, todayKey, 28), [state.dayStamps, todayKey]);
  const recommendations = useMemo(() => nextUp(conceptIndex, state.completed, 6), [state.completed]);
  const saved = useMemo(() => savedEntries(conceptIndex, state), [state]);
  const recent = useMemo(() => recentEntries(conceptIndex, state), [state]);
  const unfinished = useMemo(() => unfinishedVisits(conceptIndex, state, 4), [state]);
  const weak = useMemo(() => weakestDomains(rows, 3, 3), [rows]);
  const close = useMemo(() => closestToFinished(rows, 3), [rows]);

  const pathRows = useMemo(() => paths.map((path) => {
    const ids = path.stages.flatMap((stage) => stage.concepts);
    const unique = [...new Set(ids)];
    const done = unique.filter((id) => state.completed.includes(id)).length;
    return { path, total: unique.length, done, stages: path.stages.length };
  }).filter((row) => row.total > 0), [state.completed]);

  const fresh = stats.completed === 0 && stats.attempted === 0 && stats.daysActive === 0;

  return (
    <div>
      <LibraryHeader
        title="Your progress"
        lede="Lessons finished, questions answered, accuracy per domain and the streak you are defending. Everything is stored in this browser — nothing is sent anywhere."
        count={formatPct(stats.pct)}
        unit="of the curriculum"
      >
        <div className="no-print mt-5 flex flex-wrap gap-2">
          <Link to="/practice" className="btn-primary">
            <Target size={15} /> Start a practice session
          </Link>
          <Link to="/paths" className="btn-secondary">Browse learning paths</Link>
          <button
            type="button"
            className="btn-ghost btn-sm ml-auto"
            onClick={() => {
              reset();
              showToast('Progress cleared', { tone: 'info' });
            }}
          >
            <RotateCcw size={13} /> Reset progress
          </button>
        </div>
      </LibraryHeader>

      {fresh ? (
        <EmptyState
          title="Nothing recorded yet"
          hint="Open a lesson and mark it complete, or answer a few practice questions — this page fills in as you go."
          action={(
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/domain/discrete" className="btn-primary">Start with Discrete Math <ArrowRight size={15} /></Link>
              <Link to="/fields" className="btn-secondary">Find my field</Link>
            </div>
          )}
        />
      ) : (
        <div className="mx-auto max-w-wide px-4 py-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Lessons complete"
              value={`${stats.lessonsCompleted} / ${stats.lessons}`}
              hint={`${stats.completed} of ${stats.entries} entries including topic hubs`}
            />
            <StatTile
              label="Questions answered"
              value={`${stats.attempted} / ${stats.questions}`}
              hint={stats.accuracy === null ? 'no answers yet' : `${formatPct(stats.accuracy)} ever correct`}
            />
            <StatTile
              label="Current streak"
              value={(
                <span className="inline-flex items-center gap-1.5">
                  {stats.streak} <span className="text-base font-sans font-normal text-ink3">day{stats.streak === 1 ? '' : 's'}</span>
                  {stats.streak > 0 && <Flame size={18} className="text-terracotta" />}
                </span>
              )}
              hint={`best run ${stats.longestStreak} · ${stats.daysActive} active days`}
            />
            <StatTile
              label="Due for review"
              value={stats.due}
              hint={`${stats.missed} still shaky after the last attempt`}
            />
          </div>

          {/* Streak strip */}
          <section className="panel mt-6 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-ink">Last {calendar.length} days</h2>
              <span className="text-xs text-ink3">
                {stats.streak > 0
                  ? `Keep it alive: ${stats.streak} day${stats.streak === 1 ? '' : 's'} in a row`
                  : 'A day of reading or practice keeps the streak alive'}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {calendar.map((cell) => (
                <span
                  key={cell.key}
                  title={`${cell.key}${cell.active ? ' · active' : ''}${cell.isToday ? ' · today' : ''}`}
                  className={`h-4 w-4 border ${
                    cell.active
                      ? 'border-moss bg-moss'
                      : cell.isToday
                        ? 'border-bluep bg-bluel'
                        : 'border-line bg-paper2'
                  }`}
                />
              ))}
            </div>
          </section>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <div>
              {/* Domains */}
              <GroupHeading count={rows.length}>By domain</GroupHeading>
              <div className="border border-line bg-surface">
                <table className="w-full text-sm">
                  <caption className="sr-only">Lesson completion and practice accuracy per domain</caption>
                  <thead>
                    <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-ink3">
                      <th scope="col" className="px-3 py-2 font-semibold">Domain</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Lessons</th>
                      <th scope="col" className="px-3 py-2 font-semibold">Practice</th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {rows.map((row) => (
                      <tr key={row.domain} className="align-top transition-colors hover:bg-paper2/60">
                        <td className="px-3 py-2.5">
                          <Link to={`/domain/${row.domain}`} className="font-medium text-ink hover:text-blue transition-colors">
                            {row.name}
                          </Link>
                          <div className="mt-1.5 w-40 max-w-full">
                            <ProgressBar value={row.completed} max={row.entries} tone={row.pct === 1 ? 'moss' : 'blue'} />
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs text-ink2">
                          {row.lessonsCompleted}/{row.lessons}
                          <span className="ml-1 text-ink4">({formatPct(row.pct)})</span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs text-ink2">
                          {row.attempted}/{row.questions}
                          {row.missed > 0 && (
                            <Link
                              to={`/practice?domain=${row.domain}&mode=missed`}
                              className="ml-1.5 text-terracotta hover:underline"
                              title={`${row.missed} question${row.missed === 1 ? '' : 's'} to retry`}
                            >
                              {row.missed} shaky
                            </Link>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs text-ink2">
                          {formatPct(row.accuracy)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paths */}
              <GroupHeading count={pathRows.length}>Learning paths</GroupHeading>
              <ul className="space-y-2">
                {pathRows.map((row) => (
                  <li key={row.path.id}>
                    <Link
                      to={`/path/${row.path.id}`}
                      className="group flex items-center gap-3 border border-line bg-surface px-3.5 py-3 transition-colors hover:border-bluep hover:bg-bluel/30"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink group-hover:text-blue transition-colors">{row.path.title}</span>
                        <span className="mt-1.5 block w-full max-w-sm">
                          <ProgressBar value={row.done} max={row.total} tone={row.done === row.total ? 'moss' : 'blue'} />
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-xs text-ink3">{row.done}/{row.total}</span>
                      <ArrowRight size={15} className="shrink-0 text-ink4 group-hover:text-blue" />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Saved */}
              {saved.length > 0 && (
                <>
                  <GroupHeading count={saved.length}>Saved for later</GroupHeading>
                  <ul className="space-y-1.5">
                    {saved.map((entry) => (
                      <li key={entry.id} className="flex items-center gap-2 border border-line bg-surface px-3 py-2">
                        <Bookmark size={13} className="shrink-0 text-gold" />
                        <Link to={`/concept/${entry.id}`} className="min-w-0 flex-1 truncate text-sm text-ink hover:text-blue transition-colors">
                          {entry.title}
                        </Link>
                        <span className="shrink-0 text-[11px] text-ink4">{domainShort(entry.domain)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Recent */}
              {recent.length > 0 && (
                <>
                  <GroupHeading count={recent.length}>Recently opened</GroupHeading>
                  <ul className="space-y-1.5">
                    {recent.map((entry) => {
                      const done = state.completed.includes(entry.id);
                      return (
                        <li key={entry.id} className="flex items-center gap-2 border border-line bg-surface px-3 py-2">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${done ? 'bg-moss' : 'bg-gold'}`} />
                          <Link to={`/concept/${entry.id}`} className="min-w-0 flex-1 truncate text-sm text-ink hover:text-blue transition-colors">
                            {entry.title}
                          </Link>
                          <span className="shrink-0 text-[11px] text-ink4">{domainShort(entry.domain)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              {recommendations.length > 0 && (
                <section className="panel p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink3">
                    <TrendingUp size={13} /> Read next
                  </div>
                  <ol className="mt-2 space-y-2">
                    {recommendations.map((entry) => (
                      <li key={entry.id}>
                        <Link to={`/concept/${entry.id}`} className="group block">
                          <span className="block text-sm font-medium text-ink group-hover:text-blue transition-colors">
                            {entry.title}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5">
                            <LevelBadge level={entry.level} />
                            <span className="text-[11px] text-ink4">{domainShort(entry.domain)}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {unfinished.length > 0 && (
                <section className="panel p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3">Opened, not finished</div>
                  <ul className="mt-2 space-y-1.5">
                    {unfinished.map((entry) => (
                      <li key={entry.id}>
                        <Link to={`/concept/${entry.id}`} className="text-sm text-ink2 hover:text-blue transition-colors">
                          {entry.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {weak.length > 0 && (
                <section className="panel p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3">Needs work</div>
                  <ul className="mt-2 space-y-2">
                    {weak.map((row) => (
                      <li key={row.domain}>
                        <Link
                          to={`/practice?domain=${row.domain}&mode=missed`}
                          className="group flex items-baseline justify-between gap-2 text-sm text-ink2 hover:text-blue transition-colors"
                        >
                          <span>{row.name}</span>
                          <span className="font-mono text-xs text-terracotta">{formatPct(row.accuracy)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] leading-relaxed text-ink4">
                    Accuracy over at least three attempted questions.
                  </p>
                </section>
              )}

              {close.length > 0 && (
                <section className="panel p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3">Closest to finished</div>
                  <ul className="mt-2 space-y-2">
                    {close.map((row) => (
                      <li key={row.domain}>
                        <Link to={`/domain/${row.domain}`} className="group block">
                          <span className="flex items-baseline justify-between gap-2 text-sm text-ink2 group-hover:text-blue transition-colors">
                            <span>{row.name}</span>
                            <span className="font-mono text-xs text-ink3">{formatPct(row.pct)}</span>
                          </span>
                          <span className="mt-1 block"><ProgressBar value={row.completed} max={row.entries} /></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="panel p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3">Playground</div>
                <p className="mt-1.5 text-sm text-ink2">
                  {stats.snippetRuns === 0
                    ? 'No snippets run yet — the playground executes every snippet with its verified output.'
                    : `${stats.snippetRuns} snippet run${stats.snippetRuns === 1 ? '' : 's'} across ${Object.keys(state.snippetRuns).length} snippet${Object.keys(state.snippetRuns).length === 1 ? '' : 's'}.`}
                </p>
                <Link to="/playground" className="link-quiet mt-2 inline-block text-xs">Open the playground →</Link>
              </section>

              <section className="panel p-4 text-xs leading-relaxed text-ink3">
                Longest streak <strong className="text-ink">{longestStreak(state.dayStamps)}</strong> days ·
                active on <strong className="text-ink">{stats.daysActive}</strong> of the last
                {' '}<strong className="text-ink">{Math.max(stats.daysActive, calendar.length)}</strong> recorded days.
                A day counts when you open a lesson or answer a question.
              </section>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
