import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, Check, Layers, RotateCcw, Target, X,
} from 'lucide-react';
import { domains } from '../data/domains';
import { conceptInfo, readConcept } from '../lib/concept-loader';
import { readPracticeIndex } from '../lib/reference-loader';
import type { PracticeIndexEntry } from '../lib/reference-index-file';
import type { Difficulty } from '../data/types';
import { useStore } from '../lib/store';
import { PracticeQuestion } from '../components/ui';
import {
  EmptyState, FilterRow, LibraryHeader, ProgressBar, StatTile, domainShort,
} from '../components/library';
import {
  SESSION_MODES, buildSession, dueCount, dueLabel, formatStageCounts, stageCounts,
  type SessionMode,
} from '../lib/srs';

// ---------------------------------------------------------------------------
// /practice — the interleaved trainer.
//
// Every lesson keeps its own questions; this page asks them across lessons, in
// the order spaced repetition says they should come back (src/lib/srs.ts). It
// schedules from the generated practice manifest, so the queue is built without
// downloading anything, and each question's text is fetched with the single
// domain chunk it belongs to — one lesson body at a time, through the same lazy
// loader a concept page uses.
// ---------------------------------------------------------------------------

type Scope = 'all' | 'completed' | 'saved';

const SCOPES: { id: Scope; label: string }[] = [
  { id: 'all', label: 'Whole curriculum' },
  { id: 'completed', label: 'Lessons I finished' },
  { id: 'saved', label: 'Lessons I saved' },
];

const SESSION_SIZES = [5, 10, 20, 50];
const DIFFICULTIES: (Difficulty | 'all')[] = ['all', 'easy', 'medium', 'hard'];

interface Answer {
  id: string;
  correct: boolean;
}

/** Why a mode can come back empty, in the learner's own terms. */
const EMPTY_POOL_REASON: Record<SessionMode, (poolSize: number, diff: Difficulty | 'all') => string> = {
  review: (poolSize, diff) =>
    `Every question in this pool (${poolSize}${diff === 'all' ? '' : `, ${diff}`}) is inside its review gap — nothing is due yet. Come back later, or switch to “Everything”.`,
  new: () => 'You have attempted every question in this pool. Switch to “Smart review” to keep them warm, or widen the domain.',
  missed: () => 'Nothing here was missed on its last attempt. Widen the domain, or pick “Smart review”.',
  all: (poolSize) => `This pool is empty (${poolSize} questions) — relax the scope or the domain filter.`,
};

/** One question, loaded through the concept's own lazy chunk. */
function TrainerQuestion({
  entry, onResult,
}: {
  entry: PracticeIndexEntry;
  onResult: (correct: boolean) => void;
}) {
  const concept = readConcept(entry.conceptId);
  const question = concept?.practice.find((q) => q.id === entry.id);

  if (!concept || !question) {
    // The manifest and the lesson disagree — a stale generated file. Say so
    // rather than rendering an empty card, and point at the lesson anyway.
    return (
      <div className="panel border-terraline bg-terracottal/30 p-4 text-sm text-ink2">
        Question <span className="font-mono text-xs">{entry.id}</span> is not in
        {' '}<Link to={`/concept/${entry.conceptId}`} className="link-quiet">{concept?.title ?? entry.conceptId}</Link>.
        Run <span className="font-mono text-xs">npm run refindex:write</span> to refresh the practice manifest.
      </div>
    );
  }

  return (
    <PracticeQuestion
      q={question}
      fresh
      onResult={onResult}
      meta={(
        <span className="inline-flex items-center gap-1.5">
          <span className="text-ink4">{domainShort(entry.domain)}</span>
          <Link
            to={`/concept/${concept.id}`}
            className="text-blue hover:text-blued underline decoration-line2 underline-offset-2"
          >
            {concept.title}
          </Link>
        </span>
      )}
    />
  );
}

function QuestionFallback() {
  return (
    <div className="panel animate-pulse p-4">
      <div className="h-3 w-24 bg-paper2" />
      <div className="mt-3 h-3 w-full bg-paper2" />
      <div className="mt-2 h-3 w-2/3 bg-paper2" />
    </div>
  );
}

export function PracticePage() {
  const manifest = readPracticeIndex();
  const { state } = useStore();
  const [params, setParams] = useSearchParams();

  const [mode, setMode] = useState<SessionMode>(
    (params.get('mode') as SessionMode | null) ?? 'review',
  );
  const [domain, setDomain] = useState(params.get('domain') ?? 'all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>(
    (params.get('diff') as Difficulty | null) ?? 'all',
  );
  const [scope, setScope] = useState<Scope>('all');
  const [size, setSize] = useState(10);

  const [phase, setPhase] = useState<'setup' | 'session' | 'done'>('setup');
  const [queue, setQueue] = useState<PracticeIndexEntry[]>([]);
  const [cursor, setCursor] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const records = state.practice;
  const now = Date.now();

  // A notice describes the filters that produced it; changing one clears it.
  useEffect(() => { setNotice(null); }, [mode, domain, difficulty, scope, size]);

  /** The pool the current filters describe, in curriculum order. */
  const pool = useMemo(() => {
    const completed = new Set(state.completed);
    const saved = new Set(state.bookmarks);
    return manifest.filter((entry) => {
      if (domain !== 'all' && entry.domain !== domain) return false;
      if (scope === 'completed' && !completed.has(entry.conceptId)) return false;
      if (scope === 'saved' && !saved.has(entry.conceptId)) return false;
      return true;
    });
  }, [manifest, domain, scope, state.completed, state.bookmarks]);

  const counts = useMemo(() => stageCounts(pool.map((entry) => entry.id), records), [pool, records]);
  const due = useMemo(() => dueCount(pool.map((entry) => entry.id), records, now), [pool, records, now]);

  const domainOptions = useMemo(() => {
    const totals = new Map<string, number>();
    for (const entry of manifest) totals.set(entry.domain, (totals.get(entry.domain) ?? 0) + 1);
    return [
      { id: 'all', label: 'All domains', count: manifest.length },
      ...domains
        .filter((d) => totals.has(d.id))
        .map((d) => ({ id: d.id, label: d.short, count: totals.get(d.id) ?? 0 })),
    ];
  }, [manifest]);

  const start = () => {
    const session = buildSession(pool, records, now, { mode, limit: size, difficulty });
    if (!session.length) {
      // "Nothing to ask" is an answer, not a broken button: say which filter
      // emptied the pool so the learner knows what to relax.
      setNotice(EMPTY_POOL_REASON[mode](pool.length, difficulty));
      return;
    }
    setNotice(null);
    setQueue(session);
    setCursor(0);
    setAnswers([]);
    setPhase('session');
  };

  /** Keep the URL shareable: /practice?domain=calculus&mode=missed */
  useEffect(() => {
    const next = new URLSearchParams();
    if (domain !== 'all') next.set('domain', domain);
    if (mode !== 'review') next.set('mode', mode);
    if (difficulty !== 'all') next.set('diff', difficulty);
    const current = params.toString();
    if (current !== next.toString()) setParams(next, { replace: true });
  }, [domain, mode, difficulty, params, setParams]);

  const current = queue[cursor];
  const answered = answers.find((a) => a.id === current?.id);
  const correctCount = answers.filter((a) => a.correct).length;
  const missedThisSession = answers.filter((a) => !a.correct);

  const advance = () => {
    if (cursor + 1 >= queue.length) setPhase('done');
    else setCursor(cursor + 1);
  };

  // Enter (or J) moves on once the learner has answered — the same vocabulary
  // the lesson page uses for "next".
  useEffect(() => {
    if (phase !== 'session' || !answered) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return;
      if (event.key === 'Enter' || event.key.toLowerCase() === 'j') {
        event.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, answered, cursor, queue.length]);

  if (phase === 'session' && current) {
    return (
      <div>
        <LibraryHeader
          title="Practice session"
          lede={`${SESSION_MODES.find((m) => m.id === mode)?.label ?? mode} · ${domain === 'all' ? 'every domain' : domainShort(domain)}${difficulty === 'all' ? '' : ` · ${difficulty}`}`}
          count={`${cursor + 1} / ${queue.length}`}
          unit={`${correctCount} correct so far`}
        />
        <div className="mx-auto max-w-content px-4 py-8">
          <div className="no-print mb-4">
            <ProgressBar value={cursor + (answered ? 1 : 0)} max={queue.length} tone={answered?.correct ? 'moss' : 'blue'} />
          </div>

          <div className="no-print mb-3 flex flex-wrap items-center gap-2 text-xs text-ink3">
            <span className="chip">{dueLabel(records[current.id], now)}</span>
            <span className="font-mono">{current.type}</span>
            <span className="ml-auto flex items-center gap-2">
              <button type="button" className="btn-ghost btn-sm" onClick={advance}>
                Skip <ArrowRight size={13} />
              </button>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setPhase('done')}
                title="Finish and see the summary"
              >
                <X size={13} /> End session
              </button>
            </span>
          </div>

          <Suspense fallback={<QuestionFallback />}>
            <TrainerQuestion
              key={current.id}
              entry={current}
              onResult={(correct) => setAnswers((prev) => [...prev.filter((a) => a.id !== current.id), { id: current.id, correct }])}
            />
          </Suspense>

          {answered && (
            <div className="no-print mt-4 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-primary" onClick={advance}>
                {cursor + 1 >= queue.length ? 'See summary' : 'Next question'} <ArrowRight size={15} />
              </button>
              <span className="text-xs text-ink3">
                <kbd className="kbd">Enter</kbd> or <kbd className="kbd">J</kbd> to continue
              </span>
              <Link to={`/concept/${current.conceptId}`} className="link-quiet ml-auto text-xs">
                Read the lesson →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'done' && answers.length > 0) {
    const accuracy = answers.length ? correctCount / answers.length : 0;
    return (
      <div>
        <LibraryHeader
          title="Session complete"
          lede="Answers are saved in this browser, and the schedule in src/lib/srs.ts decides when each question comes back: a miss returns immediately, a first success returns in a day, then three, then seven."
          count={`${correctCount} / ${answers.length}`}
          unit="correct this session"
        />
        <div className="mx-auto max-w-content px-4 py-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile label="Accuracy" value={`${Math.round(accuracy * 100)}%`} />
            <StatTile label="Answered" value={answers.length} hint={`${queue.length} in the queue`} />
            <StatTile label="To retry" value={missedThisSession.length} hint="missed on the last attempt" />
          </div>

          {missedThisSession.length > 0 && (
            <section className="panel mt-6 p-4">
              <h2 className="text-sm font-semibold text-ink">These come back next session</h2>
              <ul className="mt-2 space-y-1.5">
                {missedThisSession.map((answer) => {
                  const entry = manifest.find((item) => item.id === answer.id);
                  const info = entry ? conceptInfo(entry.conceptId) : undefined;
                  return (
                    <li key={answer.id} className="flex items-center gap-2 text-sm">
                      <X size={13} className="shrink-0 text-terracotta" />
                      <span className="font-mono text-[11px] text-ink4">{answer.id}</span>
                      {info && (
                        <Link to={`/concept/${info.id}`} className="truncate text-ink2 hover:text-blue transition-colors">
                          {info.title}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={() => { setPhase('setup'); setAnswers([]); setQueue([]); }}>
              <RotateCcw size={15} /> Another session
            </button>
            <Link to="/progress" className="btn-secondary">See my progress</Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- setup -------------------------------------------------------------
  return (
    <div>
      <LibraryHeader
        title="Practice trainer"
        lede="Questions from every lesson, interleaved and scheduled: what you missed comes back first, what you know returns on a 1 / 3 / 7 day cycle. Nothing is downloaded until a question is asked."
        count={manifest.length}
        unit="questions in the curriculum"
      />

      <div className="mx-auto max-w-wide px-4 py-8">
        {pool.length === 0 ? (
          <EmptyState
            title="No questions match those filters"
            hint="Widen the scope — “Lessons I finished” and “Lessons I saved” are empty until you complete or save something."
            action={<button type="button" className="btn-primary" onClick={() => { setScope('all'); setDomain('all'); }}>Reset filters</button>}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <div className="space-y-5">
              <section className="panel p-4">
                <h2 className="text-sm font-semibold text-ink">What to ask</h2>
                <div className="mt-3 space-y-3">
                  <FilterRow
                    label="Mode"
                    options={SESSION_MODES.map((m) => ({ id: m.id, label: m.label }))}
                    value={mode}
                    onChange={(next) => setMode(next as SessionMode)}
                  />
                  <p className="text-xs text-ink3">{SESSION_MODES.find((m) => m.id === mode)?.hint}</p>
                  <FilterRow label="Domain" options={domainOptions} value={domain} onChange={setDomain} />
                  <FilterRow
                    label="Difficulty"
                    options={DIFFICULTIES.map((d) => ({
                      id: d,
                      label: d === 'all' ? 'Any' : d,
                      count: d === 'all' ? pool.length : pool.filter((entry) => entry.diff === d).length,
                    }))}
                    value={difficulty}
                    onChange={(next) => setDifficulty(next as Difficulty | 'all')}
                  />
                  <FilterRow
                    label="Scope"
                    options={SCOPES.map((s) => ({
                      id: s.id,
                      label: s.label,
                      count: s.id === 'all'
                        ? manifest.length
                        : s.id === 'completed'
                          ? manifest.filter((entry) => state.completed.includes(entry.conceptId)).length
                          : manifest.filter((entry) => state.bookmarks.includes(entry.conceptId)).length,
                    }))}
                    value={scope}
                    onChange={(next) => setScope(next as Scope)}
                  />
                  <FilterRow
                    label="Length"
                    options={SESSION_SIZES.map((n) => ({ id: String(n), label: `${n} questions` }))}
                    value={String(size)}
                    onChange={(next) => setSize(Number(next))}
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                  <button type="button" className="btn-primary" onClick={start}>
                    <Target size={15} /> Start session
                  </button>
                  <span className="text-xs text-ink3">
                    {due} of {pool.length} questions in this pool are due now.
                  </span>
                </div>
                {notice && (
                  <p className="mt-3 border border-goldline bg-goldl/50 px-3 py-2 text-xs leading-relaxed text-ink2" role="status">
                    {notice}
                  </p>
                )}
              </section>
            </div>

            <aside className="space-y-4">
              <section className="panel p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink3">
                  <Layers size={13} /> This pool
                </div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {formatStageCounts(counts).map((row) => (
                    <li key={row.stage} className="flex items-baseline justify-between gap-2">
                      <span className="text-ink2">{row.label}</span>
                      <span className="font-mono text-xs text-ink3">{row.count}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-line pt-2 text-[11px] leading-relaxed text-ink4">
                  A question is “due” when its gap has elapsed: immediately after a miss, then 1, 3 and 7 days after
                  each success.
                </p>
              </section>

              <section className="panel p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3">So far</div>
                <ul className="mt-2 space-y-1.5 text-sm text-ink2">
                  <li className="flex items-baseline justify-between gap-2">
                    <span>Lessons complete</span>
                    <span className="font-mono text-xs">{state.completed.length}</span>
                  </li>
                  <li className="flex items-baseline justify-between gap-2">
                    <span>Questions attempted</span>
                    <span className="font-mono text-xs">{Object.keys(records).length}</span>
                  </li>
                  <li className="flex items-baseline justify-between gap-2">
                    <span>Ever correct</span>
                    <span className="font-mono text-xs">
                      {Object.values(records).filter((r) => r.right > 0).length}
                    </span>
                  </li>
                </ul>
                <Link to="/progress" className="link-quiet mt-3 inline-flex items-center gap-1 text-xs">
                  <Check size={12} /> Open the dashboard
                </Link>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
