import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, Play, RotateCcw, Search, Terminal, X } from 'lucide-react';
import { snippets } from '../data/snippets';
import { runSnippet } from '../lib/runner';
import type { RunResult } from '../lib/runner';
import { domains } from '../data/domains';
import { conceptInfo } from '../lib/concept-loader';
import { useStore } from '../lib/store';

// ---------------------------------------------------------------------------
// Playground — run the code behind the concepts.
//
// Every snippet's declared output is produced by executing it (npm run
// snippets:verify, and the same check runs in the test suite), so the "verified"
// badge means exactly that.
// ---------------------------------------------------------------------------

export function PlaygroundPage() {
  const [query, setQuery] = useState('');
  const [params, setParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState(params.get('snippet') ?? snippets[0]?.id ?? '');
  const [result, setResult] = useState<RunResult | null>(null);
  const snippet = snippets.find((s) => s.id === selectedId) ?? snippets[0];

  const { state, recordSnippetRun } = useStore();
  const [draft, setDraft] = useState(snippet?.code ?? '');
  const [draftFor, setDraftFor] = useState(snippet?.id ?? '');

  // Keep the editor in sync when the selection changes.
  if (snippet && draftFor !== snippet.id) {
    setDraftFor(snippet.id);
    setDraft(snippet.code);
    setResult(null);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? snippets.filter((s) =>
          [s.title, s.blurb, s.id, s.conceptId, conceptInfo(s.conceptId)?.title ?? ''].join(' ').toLowerCase().includes(q),
        )
      : snippets;
    return list;
  }, [query]);

  const grouped = useMemo(() => {
    const byDomain = new Map<string, typeof snippets>();
    for (const s of filtered) {
      const domain = conceptInfo(s.conceptId)?.domain ?? 'other';
      const list = byDomain.get(domain) ?? [];
      list.push(s);
      byDomain.set(domain, list);
    }
    const order = domains.map((d) => d.id);
    return [...byDomain.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  }, [filtered]);

  const domainName = (id: string): string => domains.find((d) => d.id === id)?.short ?? id;
  const concept = snippet ? conceptInfo(snippet.conceptId) : undefined;

  const run = () => {
    if (!snippet) return;
    const r = runSnippet(draft);
    setResult(r);
    recordSnippetRun(snippet.id);
  };

  const select = (id: string): void => {
    setSelectedId(id);
    setParams({ snippet: id }, { replace: true });
  };

  const dirty = snippet ? draft !== snippet.code : false;
  const matchesVerified = result ? result.ok && result.logs.join('\n') === snippet?.output : null;
  const runCount = snippet ? state.snippetRuns[snippet.id]?.runs ?? 0 : 0;

  if (!snippet) return null;

  return (
    <div className="mx-auto max-w-wide px-4 py-10">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tightest text-ink font-serif">Playground</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink3">
          {snippets.length} runnable JavaScript snippets that implement the ideas on the concept pages. Each one's declared
          output comes from a real execution — the same check runs in the test suite, so nothing here is hand-waved. Edit any
          snippet and run it yourself; the verified output stays visible for comparison.
        </p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[19rem,minmax(0,1fr)]">
        {/* ---- list ------------------------------------------------------- */}
        <aside>
          <label className="relative block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink4" />
            <input
              className="input !pl-9"
              placeholder="Filter snippets…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="mt-3 max-h-[34rem] overflow-y-auto slim-scroll border border-line bg-surface">
            {grouped.map(([domain, list]) => (
              <div key={domain}>
                <div className="sticky top-0 border-b border-line bg-paper2/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink3 backdrop-blur">
                  {domainName(domain)}
                </div>
                {list.map((s) => {
                  const active = s.id === snippet.id;
                  const runs = state.snippetRuns[s.id]?.runs ?? 0;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => select(s.id)}
                      className={`block w-full border-b border-line px-3 py-2 text-left text-sm transition-colors ${
                        active ? 'bg-bluel text-blue' : 'text-ink2 hover:bg-paper2'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className={active ? 'font-medium' : ''}>{s.title}</span>
                        {runs > 0 && <span className="font-mono text-[10px] text-ink4">{runs}×</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-ink3">{conceptInfo(s.conceptId)?.title}</span>
                    </button>
                  );
                })}
              </div>
            ))}
            {grouped.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-ink3">No snippet matches “{query}”.</div>
            )}
          </div>
        </aside>

        {/* ---- detail ----------------------------------------------------- */}
        <section className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <h2 className="font-serif text-xl font-semibold text-ink">{snippet.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink2">{snippet.blurb}</p>
              {concept && (
                <Link to={`/concept/${concept.id}`} className="link-quiet mt-1 inline-flex items-center gap-1 text-xs">
                  {concept.title} <ArrowUpRight size={12} />
                </Link>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn-primary btn-sm" onClick={run}>
                <Play size={13} /> Run
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => { setDraft(snippet.code); setResult(null); }}
                disabled={!dirty}
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>

          <div className="mt-3 border border-line bg-surface">
            <div className="flex items-center justify-between gap-2 border-b border-line bg-paper2/60 px-3 py-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-ink2">
                <Terminal size={13} /> JavaScript
              </span>
              <span className="font-mono text-[11px] text-ink3">
                {runCount > 0 ? `you have run this ${runCount}×` : 'editable'}
              </span>
            </div>
            <textarea
              className="h-72 w-full resize-y bg-surface px-3 py-2 font-mono text-[12px] leading-relaxed text-ink focus:outline-none"
              spellCheck={false}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Snippet code"
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="border border-line bg-surface">
              <div className="flex items-center justify-between gap-2 border-b border-line bg-paper2/60 px-3 py-1.5">
                <span className="text-xs font-medium text-ink2">Verified output</span>
                <span className="chip border-moss/40 bg-mossl text-moss">executed in CI</span>
              </div>
              <pre className="overflow-x-auto slim-scroll px-3 py-2 font-mono text-[11px] leading-relaxed text-ink2">
                {snippet.output}
              </pre>
            </div>

            <div className="border border-line bg-surface">
              <div className="flex items-center justify-between gap-2 border-b border-line bg-paper2/60 px-3 py-1.5">
                <span className="text-xs font-medium text-ink2">Your run</span>
                {result && (
                  <span className={`chip ${result.ok ? 'border-moss/40 bg-mossl text-moss' : 'border-terracotta/40 bg-terracottal text-terracotta'}`}>
                    {result.ok ? `${result.ms} ms` : 'error'}
                  </span>
                )}
              </div>
              {!result ? (
                <p className="px-3 py-2 text-[11px] text-ink3">Press Run to execute this snippet in your browser.</p>
              ) : result.ok ? (
                <>
                  <pre className="overflow-x-auto slim-scroll px-3 py-2 font-mono text-[11px] leading-relaxed text-ink">
                    {result.logs.join('\n') || '(no output)'}
                  </pre>
                  <div className={`border-t px-3 py-1.5 text-[11px] ${matchesVerified ? 'border-moss/30 bg-mossl text-moss' : 'border-terracotta/30 bg-terracottal text-terracotta'}`}>
                    {matchesVerified ? (
                      <span className="inline-flex items-center gap-1"><Check size={12} /> matches the verified output</span>
                    ) : (
                      <span className="inline-flex items-center gap-1"><X size={12} /> differs from the verified output (your edit changed the result)</span>
                    )}
                  </div>
                </>
              ) : (
                <pre className="px-3 py-2 font-mono text-[11px] leading-relaxed text-terracotta">{result.error}</pre>
              )}
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-ink3">
            Snippets run with <code className="font-mono">new Function</code> in this tab: they are plain JavaScript, they can
            read the page's own environment, and a runaway loop would hang the tab. They are the site's reviewed snippets plus
            whatever you type — not a sandbox for untrusted code.
          </p>
        </section>
      </div>
    </div>
  );
}
