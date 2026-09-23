import React, { useMemo, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { readTheorems } from '../lib/reference-loader';
import type { TheoremEntry } from '../lib/reference-index-file';
import { domains } from '../data/domains';
import { RichText, ProofDetails } from '../components/ui';
import {
  FilterRow, GroupHeading, LibraryHeader, SearchInput, SourceLink, domainShort, matchesQuery,
} from '../components/library';

// ---------------------------------------------------------------------------
// /theorems — the "why the mathematics is true" library.
//
// Every `thm` block in the curriculum with its statement and, where the lesson
// carries one, its proof steps. Generated from the lessons
// (npm run refindex:write), grouped by domain, and each entry deep-links to the
// block it came from.
// ---------------------------------------------------------------------------

export function TheoremsPage() {
  const entries = readTheorems();
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('all');
  const [provedOnly, setProvedOnly] = useState(false);

  const proved = entries.filter((entry) => entry.proof.length > 0).length;

  const domainOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of entries) counts.set(entry.domain, (counts.get(entry.domain) ?? 0) + 1);
    return [
      { id: 'all', label: 'All domains', count: entries.length },
      ...domains
        .filter((d) => counts.has(d.id))
        .map((d) => ({ id: d.id, label: d.short, count: counts.get(d.id) ?? 0 })),
    ];
  }, [entries]);

  const visible = useMemo(() => entries.filter((entry) => {
    if (domain !== 'all' && entry.domain !== domain) return false;
    if (provedOnly && entry.proof.length === 0) return false;
    return matchesQuery(query, [entry.name, entry.statement, entry.proofTitle ?? '', ...entry.proof]);
  }), [entries, query, domain, provedOnly]);

  const grouped = useMemo(() => {
    const byDomain = new Map<string, TheoremEntry[]>();
    for (const entry of visible) byDomain.set(entry.domain, [...(byDomain.get(entry.domain) ?? []), entry]);
    return domains
      .filter((d) => byDomain.has(d.id))
      .map((d) => ({ domain: d, entries: byDomain.get(d.id)! }));
  }, [visible]);

  return (
    <div>
      <LibraryHeader
        title="Theorem index"
        lede="Every theorem in the curriculum with its statement — and the proof, where the lesson writes one out. This is the site's answer to “why is that true?”, gathered in one place instead of scattered through 209 lessons."
        count={entries.length}
        unit={`${proved} with proofs`}
      />

      <div className="mx-auto max-w-wide px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
          <aside className="no-print lg:sticky lg:top-20 space-y-4">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search theorems and proofs…"
              resultLabel={`${visible.length} of ${entries.length} theorems`}
            />
            <div className="panel space-y-3 p-3">
              <FilterRow label="Domain" options={domainOptions} value={domain} onChange={setDomain} />
              <label className="flex cursor-pointer items-center gap-2 text-xs text-ink2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-current"
                  checked={provedOnly}
                  onChange={(event) => setProvedOnly(event.target.checked)}
                />
                Only theorems with a written proof
              </label>
            </div>
          </aside>

          <div>
            {grouped.length === 0 ? (
              <div className="panel px-4 py-12 text-center">
                <ScrollText size={22} className="mx-auto text-ink4" />
                <p className="mt-3 text-sm text-ink2">No theorem matches those filters.</p>
                <p className="mt-1 text-xs text-ink3">Clear the search, or switch the domain back to “All domains”.</p>
              </div>
            ) : (
              grouped.map((group) => (
                <section key={group.domain.id} className="scroll-mt-24">
                  <GroupHeading count={group.entries.length}>
                    {group.domain.name}
                    <span className="text-xs font-normal text-ink4">· {domainShort(group.domain.id)}</span>
                  </GroupHeading>
                  <ul className="space-y-3">
                    {group.entries.map((entry) => (
                      <li
                        key={`${entry.conceptId}-${entry.anchor}-${entry.name}`}
                        className="border border-bluep bg-surface"
                      >
                        <div className="flex items-center gap-2 px-4 pt-3 text-blue">
                          <span className="text-[11px] font-semibold uppercase tracking-wider">Theorem</span>
                          <span className="min-w-0 text-sm font-medium text-ink">{entry.name}</span>
                          {entry.proof.length === 0 && (
                            <span className="ml-auto shrink-0 text-[11px] text-ink4">statement only</span>
                          )}
                        </div>
                        <div className="px-4 pb-3 pt-2 text-sm leading-relaxed text-ink2">
                          <RichText text={entry.statement} />
                          {entry.proof.length > 0 && <ProofDetails title={entry.proofTitle} steps={entry.proof} />}
                          <div className="mt-2">
                            <SourceLink conceptId={entry.conceptId} anchor={entry.anchor} prefix="proved in" />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
