import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Clock, CornerDownLeft, Search } from 'lucide-react';
import { KIND_LABEL, buildSearchDocs, searchDocs } from '../lib/search';
import type { SearchDoc } from '../lib/search';
import { useStore } from '../lib/store';

// ---------------------------------------------------------------------------
// Command palette (⌘K / Ctrl-K, or "/" anywhere outside a text field).
// Jumps to any concept, domain, CS field, path, book or page in the build.
// ---------------------------------------------------------------------------

interface Item {
  doc: SearchDoc;
  note?: string;
}

const SUGGESTED = ['/', '/fields', '/paths', '/books', '/playground'];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const selRef = useRef<HTMLButtonElement>(null);
  const { state, toggleBookmark, isBookmarked } = useStore();

  const docs = useMemo(() => buildSearchDocs(), []);

  const items = useMemo<Item[]>(() => {
    if (query.trim()) {
      return searchDocs(query, docs, 10).map(({ doc }) => ({ doc }));
    }
    const items: Item[] = [];
    const recent = state.recent
      .map((r) => docs.find((d) => d.kind === 'concept' && d.id === r.id))
      .filter((d): d is SearchDoc => Boolean(d))
      .slice(0, 4);
    for (const doc of recent) items.push({ doc, note: 'recent' });
    for (const id of state.bookmarks.slice(0, 3)) {
      const doc = docs.find((d) => d.kind === 'concept' && d.id === id);
      if (doc && !recent.includes(doc)) items.push({ doc, note: 'saved' });
    }
    for (const href of SUGGESTED) {
      const doc = docs.find((d) => d.href === href);
      if (doc && !items.some((i) => i.doc === doc)) items.push({ doc, note: 'go' });
    }
    return items;
  }, [query, docs, state.recent, state.bookmarks]);

  // Global shortcut
  useEffect(() => {
    const isTyping = (el: EventTarget | null): boolean => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable;
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
        return;
      }
      if (e.key === '/' && !open && !isTyping(e.target)) {
        e.preventDefault();
        onOpenChange(true);
        return;
      }
      if (e.key === 'Escape' && open) onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  // Reset on open, and focus the field
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSel(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (open) selRef.current?.scrollIntoView({ block: 'nearest' });
  }, [sel, open]);

  if (!open) return null;

  const go = (doc: SearchDoc): void => {
    onOpenChange(false);
    navigate(doc.href);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/25 px-4 pt-[12vh] backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search MathCS"
        className="w-full max-w-xl border border-line2 bg-white shadow-pop"
      >
        <div className="flex items-center gap-2 border-b border-line px-3 py-2">
          <Search size={15} className="text-ink4" />
          <input
            ref={inputRef}
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink4 focus:outline-none"
            placeholder="Search concepts, domains, fields, paths, books…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSel(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, items.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = items[sel];
                if (item) go(item.doc);
              } else if (e.key === 'Escape') {
                onOpenChange(false);
              }
            }}
          />
          <kbd className="hidden shrink-0 border border-line2 bg-paper2 px-1.5 py-0.5 font-mono text-[10px] text-ink3 sm:block">
            Esc
          </kbd>
        </div>

        <ul className="max-h-[26rem] overflow-y-auto slim-scroll py-1">
          {items.length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-ink3">
              Nothing matches “{query}”. Try a concept like <span className="font-mono">bayes</span> or{' '}
              <span className="font-mono">dijkstra</span>.
            </li>
          )}
          {items.map((item, i) => {
            const active = i === sel;
            const saved = item.doc.kind === 'concept' && isBookmarked(item.doc.id);
            return (
              <li key={`${item.doc.kind}-${item.doc.id}`}>
                <button
                  ref={active ? selRef : undefined}
                  type="button"
                  onMouseEnter={() => setSel(i)}
                  onClick={() => go(item.doc)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                    active ? 'bg-bluel' : 'hover:bg-paper2'
                  }`}
                >
                  <span className="w-[4.5rem] shrink-0 text-[10px] font-semibold uppercase tracking-wider text-ink4">
                    {item.note ?? KIND_LABEL[item.doc.kind]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">
                      {item.doc.title}
                      {item.note === 'recent' && <Clock size={11} className="ml-1.5 inline text-ink4" />}
                    </span>
                    {item.doc.subtitle && (
                      <span className="block truncate text-[11px] text-ink3">{item.doc.subtitle}</span>
                    )}
                  </span>
                  {item.doc.kind === 'concept' && (
                    <span
                      role="button"
                      tabIndex={-1}
                      title={saved ? 'Remove bookmark' : 'Save for later'}
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(item.doc.id); }}
                      className={`shrink-0 p-1 ${saved ? 'text-gold' : 'text-ink4 hover:text-gold'}`}
                    >
                      <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
                    </span>
                  )}
                  {active && <CornerDownLeft size={13} className="shrink-0 text-blue" />}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between gap-2 border-t border-line bg-paper2/60 px-3 py-1.5 text-[10px] text-ink3">
          <span className="font-mono">↑↓ move · ⏎ open · ⌘K toggle</span>
          <span>{items.length > 0 ? `${items.length} result${items.length === 1 ? '' : 's'}` : ''}</span>
        </div>
      </div>
    </div>
  );
}
