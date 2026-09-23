import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { readApplications } from '../lib/reference-loader';
import type { ApplicationEntry } from '../lib/reference-index-file';
import { domains } from '../data/domains';
import { fields } from '../data/fields';
import { RichText } from '../components/ui';
import {
  FilterRow, GroupHeading, LibraryHeader, SearchInput, SourceLink, domainShort, matchesQuery,
} from '../components/library';

// ---------------------------------------------------------------------------
// /applications — "where is this used?" for the whole curriculum.
//
// Every item of every `cs` block, filterable by CS field. This is the site's
// strongest differentiator and it used to live one scroll deep inside lessons;
// the page is generated from the lessons (npm run refindex:write), so it grows
// by itself as content is written.
// ---------------------------------------------------------------------------

export function ApplicationsPage() {
  const entries = readApplications();
  const [query, setQuery] = useState('');
  const [field, setField] = useState('all');
  const [domain, setDomain] = useState('all');

  const fieldOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of entries) for (const id of entry.csFields) counts.set(id, (counts.get(id) ?? 0) + 1);
    return [
      { id: 'all', label: 'Every field', count: entries.length },
      ...fields
        .filter((f) => counts.has(f.id))
        .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))
        .map((f) => ({ id: f.id, label: f.name, count: counts.get(f.id) ?? 0 })),
    ];
  }, [entries]);

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
    if (field !== 'all' && !entry.csFields.includes(field)) return false;
    if (domain !== 'all' && entry.domain !== domain) return false;
    return matchesQuery(query, [entry.area, entry.how]);
  }), [entries, query, field, domain]);

  /** With a field chosen, group by domain; otherwise group by CS field. */
  const grouped = useMemo(() => {
    if (field === 'all') {
      const byField = new Map<string, ApplicationEntry[]>();
      for (const entry of visible) {
        for (const id of entry.csFields) byField.set(id, [...(byField.get(id) ?? []), entry]);
      }
      return fields
        .filter((f) => byField.has(f.id))
        .map((f) => ({ id: f.id, heading: f.name, sub: f.oneLiner, entries: byField.get(f.id)! }));
    }
    const byDomain = new Map<string, ApplicationEntry[]>();
    for (const entry of visible) byDomain.set(entry.domain, [...(byDomain.get(entry.domain) ?? []), entry]);
    return domains
      .filter((d) => byDomain.has(d.id))
      .map((d) => ({ id: d.id, heading: d.name, sub: d.tagline, entries: byDomain.get(d.id)! }));
  }, [visible, field]);

  const activeField = fields.find((f) => f.id === field);

  return (
    <div>
      <LibraryHeader
        title="Applications"
        lede="Every “where computer science uses this” call-out in the curriculum, gathered into one index. Filter by the field you care about and the mathematics behind it is one click away."
        count={entries.length}
        unit={`call-outs · ${fields.length} fields`}
      />

      <div className="mx-auto max-w-wide px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <aside className="no-print lg:sticky lg:top-20 space-y-4">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search applications…"
              resultLabel={`${visible.length} of ${entries.length} call-outs`}
            />
            <div className="panel space-y-3 p-3">
              <FilterRow label="Domain" options={domainOptions} value={domain} onChange={setDomain} />
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink3">CS field</div>
                <div className="slim-scroll max-h-72 overflow-y-auto pr-1">
                  <ul className="space-y-0.5">
                    {fieldOptions.map((option) => {
                      const active = option.id === field;
                      return (
                        <li key={option.id}>
                          <button
                            type="button"
                            onClick={() => setField(option.id)}
                            aria-pressed={active}
                            className={`flex w-full items-center justify-between gap-2 px-2 py-1 text-left text-xs transition-colors ${
                              active ? 'bg-ink text-paper' : 'text-ink2 hover:bg-paper2 hover:text-ink'
                            }`}
                          >
                            <span className="truncate">{option.label}</span>
                            <span className={`font-mono ${active ? 'text-paper/70' : 'text-ink4'}`}>{option.count}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          <div>
            {activeField && (
              <div className="panel mb-6 p-4">
                <div className="text-sm font-medium text-ink">{activeField.name}</div>
                <p className="mt-1 text-xs leading-relaxed text-ink3">{activeField.description}</p>
                <Link to={`/field/${activeField.id}`} className="link-quiet mt-2 inline-block text-xs">
                  Open the {activeField.name} map →
                </Link>
              </div>
            )}

            {grouped.length === 0 ? (
              <div className="panel px-4 py-12 text-center">
                <Compass size={22} className="mx-auto text-ink4" />
                <p className="mt-3 text-sm text-ink2">No application matches those filters.</p>
                <p className="mt-1 text-xs text-ink3">Try a broader field, or search for a technique instead of a product.</p>
              </div>
            ) : (
              grouped.map((group) => (
                <section key={group.id} className="scroll-mt-24">
                  <GroupHeading count={group.entries.length}>
                    {group.heading}
                    <span className="text-xs font-normal text-ink4">· {group.sub}</span>
                  </GroupHeading>
                  <ul className="divide-y divide-line border border-line bg-surface">
                    {group.entries.map((entry, i) => (
                      <li key={`${entry.conceptId}-${entry.anchor}-${i}`} className="px-4 py-3">
                        <div className="text-sm">
                          <span className="font-semibold text-ink">{entry.area}: </span>
                          <span className="text-ink2"><RichText text={entry.how} /></span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <SourceLink conceptId={entry.conceptId} anchor={entry.anchor} prefix="from" />
                          <span className="text-[11px] text-ink4">{domainShort(entry.domain)}</span>
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
