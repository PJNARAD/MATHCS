import React, { useMemo, useState } from 'react';
import { BookOpenText } from 'lucide-react';
import { readGlossary } from '../lib/reference-loader';
import type { GlossaryEntry } from '../lib/reference-index-file';
import { domains } from '../data/domains';
import { RichText } from '../components/ui';
import {
  FilterRow, GroupHeading, LibraryHeader, SearchInput, SourceLink, domainShort, matchesQuery,
} from '../components/library';

// ---------------------------------------------------------------------------
// /glossary — every `def` block in the curriculum as one searchable dictionary.
//
// Generated content (src/data/glossary-index.ts, `npm run refindex:write`), so
// this page needs no authoring and cannot drift from the lessons: each entry
// deep-links to the exact block it was extracted from.
// ---------------------------------------------------------------------------

/** Grouping key: first letter of the term, or '#' for symbols and LaTeX. */
export function letterOf(term: string): string {
  const match = term.trim().match(/[A-Za-z]/);
  return match ? match[0].toUpperCase() : '#';
}

const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'];

function filterEntries(entries: GlossaryEntry[], query: string, domain: string): GlossaryEntry[] {
  return entries.filter((entry) => {
    if (domain !== 'all' && entry.domain !== domain) return false;
    return matchesQuery(query, [entry.term, entry.text]);
  });
}

export function GlossaryPage() {
  const entries = readGlossary();
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('all');

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

  const visible = useMemo(
    () => filterEntries(entries, query, domain),
    [entries, query, domain],
  );

  const grouped = useMemo(() => {
    const byLetter = new Map<string, GlossaryEntry[]>();
    for (const entry of visible) {
      const letter = letterOf(entry.term);
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), entry]);
    }
    for (const list of byLetter.values()) {
      list.sort((a, b) => a.term.localeCompare(b.term) || a.conceptId.localeCompare(b.conceptId));
    }
    return LETTERS
      .filter((letter) => byLetter.has(letter))
      .map((letter) => ({ letter, entries: byLetter.get(letter)! }));
  }, [visible]);

  const searching = query.trim().length > 0;

  return (
    <div>
      <LibraryHeader
        title="Glossary"
        lede="Every definition in the curriculum, in one alphabetical dictionary. Each entry links back to the lesson that teaches it, so a term you meet in a paper is one click from its full treatment."
        count={entries.length}
        unit="defined terms"
      />

      <div className="mx-auto max-w-wide px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
          <aside className="no-print lg:sticky lg:top-20 space-y-4">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search definitions…"
              resultLabel={`${visible.length} of ${entries.length} terms${domain === 'all' ? '' : ` in ${domainShort(domain)}`}`}
            />
            <div className="panel p-3">
              <FilterRow label="Domain" options={domainOptions} value={domain} onChange={setDomain} />
            </div>
            {!searching && (
              <nav className="panel p-3" aria-label="Jump to letter">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink3">Jump to</div>
                <div className="flex flex-wrap gap-1">
                  {LETTERS.map((letter) => {
                    const has = grouped.some((group) => group.letter === letter);
                    return (
                      <a
                        key={letter}
                        href={has ? `#letter-${letter === '#' ? 'symbols' : letter}` : undefined}
                        aria-disabled={!has}
                        className={`h-6 w-6 text-center font-mono text-[11px] leading-6 border transition-colors ${
                          has
                            ? 'border-line bg-surface text-ink2 hover:border-blue hover:text-blue'
                            : 'border-line/60 bg-paper2 text-ink4 cursor-default'
                        }`}
                      >
                        {letter}
                      </a>
                    );
                  })}
                </div>
              </nav>
            )}
          </aside>

          <div>
            {grouped.length === 0 ? (
              <div className="panel px-4 py-12 text-center">
                <BookOpenText size={22} className="mx-auto text-ink4" />
                <p className="mt-3 text-sm text-ink2">No definition matches “{query}”.</p>
                <p className="mt-1 text-xs text-ink3">
                  Try a shorter word — the search looks inside definition text as well as the term itself.
                </p>
              </div>
            ) : (
              grouped.map((group) => (
                <section
                  key={group.letter}
                  id={`letter-${group.letter === '#' ? 'symbols' : group.letter}`}
                  className="scroll-mt-24"
                >
                  <GroupHeading count={group.entries.length}>{group.letter}</GroupHeading>
                  <dl className="divide-y divide-line border border-line bg-surface">
                    {group.entries.map((entry) => (
                      <div key={`${entry.conceptId}-${entry.anchor}-${entry.term}`} className="px-4 py-3">
                        <dt className="font-medium text-ink">
                          <RichText text={entry.term} />
                        </dt>
                        <dd className="mt-1 text-sm leading-relaxed text-ink2">
                          <RichText text={entry.text} />
                        </dd>
                        <dd className="mt-1.5">
                          <SourceLink conceptId={entry.conceptId} anchor={entry.anchor} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
