import React from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { conceptInfo } from '../lib/concept-loader';
import { domains } from '../data/domains';

// ---------------------------------------------------------------------------
// Shared chrome for the three generated library pages (/glossary, /theorems,
// /applications) and the dashboard (/progress). Keeping it in one module means
// the pages stay small and the filter behaviour cannot drift between them; the
// module is imported only by those routes, so no other page pays for it.
// ---------------------------------------------------------------------------

const domainById = new Map(domains.map((d) => [d.id, d] as const));

export function domainShort(domain: string): string {
  return domainById.get(domain)?.short ?? domain;
}

export function LibraryHeader({
  title, lede, count, unit, children,
}: {
  title: string;
  lede: string;
  /** A number for a library page, "3 / 10" for a session, "42%" for a dashboard. */
  count: React.ReactNode;
  unit: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto max-w-wide px-4 py-10">
        <div className="chip mb-4">
          <Link to="/" className="hover:text-blue">Home</Link>
          <span>/</span>
          <span>{title}</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tightest text-ink font-serif">{title}</h1>
            <p className="mt-2 leading-7 text-ink2">{lede}</p>
          </div>
          <div className="text-right">
            <div className="font-serif text-3xl font-semibold text-blue">{count}</div>
            <div className="text-[11px] uppercase tracking-wider text-ink3">{unit}</div>
          </div>
        </div>
        {children}
      </div>
    </header>
  );
}

export function SearchInput({
  value, onChange, placeholder, resultLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  resultLabel?: string;
}) {
  return (
    <div className="relative">
      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink4" />
      <input
        type="search"
        className="input pl-9 pr-9"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-ink4 hover:text-ink"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
      {resultLabel && <div className="mt-1.5 text-[11px] text-ink3">{resultLabel}</div>}
    </div>
  );
}

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

/** A row of mutually exclusive chips — "all" plus one entry per bucket. */
export function FilterRow({
  label, options, value, onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-ink3">{label}</span>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={`px-2 py-0.5 text-[11px] font-medium border transition-colors ${
              active
                ? 'bg-ink text-paper border-ink'
                : 'bg-surface text-ink2 border-line hover:border-ink3 hover:text-ink'
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`ml-1 font-mono ${active ? 'text-paper/70' : 'text-ink4'}`}>{option.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Link to the exact block a generated entry was extracted from. */
export function SourceLink({
  conceptId, anchor, prefix = 'in',
}: {
  conceptId: string;
  anchor: string;
  prefix?: string;
}) {
  const info = conceptInfo(conceptId);
  if (!info) return <span className="text-xs text-ink4">{conceptId}</span>;
  return (
    <span className="text-xs text-ink3">
      {prefix}{' '}
      <Link
        to={`/concept/${conceptId}#${anchor}`}
        className="text-blue hover:text-blued underline decoration-line2 underline-offset-2 hover:decoration-blue transition-colors"
      >
        {info.title}
      </Link>
      <Link to={`/domain/${info.domain}`} className="ml-1.5 text-ink4 hover:text-ink2 transition-colors">
        {domainShort(info.domain)}
      </Link>
    </span>
  );
}

export function DomainChip({ domain }: { domain: string }) {
  return (
    <Link
      to={`/domain/${domain}`}
      className="chip hover:border-bluep hover:text-blue transition-colors"
      title={`All ${domainShort(domain)} lessons`}
    >
      {domainShort(domain)}
    </Link>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint: string; action?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-content px-4 py-16 text-center">
      <h2 className="font-serif text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink3">{hint}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, max, tone = 'blue' }: { value: number; max: number; tone?: 'blue' | 'moss' | 'gold' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const bar = tone === 'moss' ? 'bg-moss' : tone === 'gold' ? 'bg-gold' : 'bg-blue';
  return (
    <div className="h-1.5 w-full overflow-hidden bg-paper2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="panel p-4">
      <div className="font-serif text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-ink3">{label}</div>
      {hint && <div className="mt-1 text-xs text-ink3">{hint}</div>}
    </div>
  );
}

/** Section heading used inside the library pages. */
export function GroupHeading({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <h2 className="mt-10 mb-3 flex items-baseline gap-2 border-b border-line pb-2 font-serif text-xl font-semibold tracking-tightest text-ink first:mt-0">
      {children}
      {count !== undefined && <span className="font-mono text-xs font-normal text-ink4">{count}</span>}
    </h2>
  );
}

/**
 * Which entries a free-text query keeps. Substring matching on every field the
 * page cares about: a library page must find "euler" inside "Euler's totient
 * function" *and* a phrase buried in a definition's body, and the command
 * palette's fuzzy scorer (which lives with the palette's own dependencies) is
 * the wrong tool for the second half of that.
 */
export function matchesQuery(query: string, fields: string[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) => field.toLowerCase().includes(q));
}
