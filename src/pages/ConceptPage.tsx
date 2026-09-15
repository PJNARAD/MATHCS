import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight, Bookmark, Check, Circle, Clock3, ListTree, Play, Printer,
} from 'lucide-react';
import { domains } from '../data/domains';
import { fields } from '../data/fields';
import { conceptInfo, readConcept } from '../lib/concept-loader';
import { BlockView, ConceptLink, LevelBadge, PrereqLine } from '../components/ui';
import { useStore } from '../lib/store';
import { useToast } from '../components/Toast';
import { buildOutline, readingTimeLabel } from '../lib/reading';
import { snippetsForConcept } from '../data/snippets';
import { Practice } from '../components/ui';

export function ConceptPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const concept = readConcept(id);
  const {
    isComplete, toggleComplete, isBookmarked, toggleBookmark, visitConcept,
  } = useStore();
  const { showToast } = useToast();
  const conceptId = concept?.id;

  // Record the visit for the command palette's "recent" section.
  useEffect(() => {
    if (conceptId) visitConcept(conceptId);
  }, [conceptId, visitConcept]);

  const outline = concept ? buildOutline(concept.content) : [];
  const outlineByIndex = new Map(outline.map((entry) => [entry.index, entry.id]));
  const done = concept ? isComplete(concept.id) : false;
  const saved = concept ? isBookmarked(concept.id) : false;

  const markComplete = () => {
    if (!concept) return;
    const wasComplete = done;
    toggleComplete(concept.id);
    showToast(wasComplete ? 'Lesson marked incomplete' : 'Lesson marked complete', {
      tone: wasComplete ? 'info' : 'success',
      actionLabel: 'Undo',
      onAction: () => toggleComplete(concept.id),
    });
  };

  const toggleSaved = () => {
    if (!concept) return;
    const wasSaved = saved;
    toggleBookmark(concept.id);
    showToast(wasSaved ? 'Removed from saved lessons' : 'Lesson saved for later', {
      tone: wasSaved ? 'info' : 'success',
      actionLabel: 'Undo',
      onAction: () => toggleBookmark(concept.id),
    });
  };

  useEffect(() => {
    const isTyping = (target: EventTarget | null): boolean => {
      const element = target as HTMLElement | null;
      return Boolean(element && (
        element.tagName === 'INPUT'
        || element.tagName === 'TEXTAREA'
        || element.tagName === 'SELECT'
        || element.isContentEditable
        || element.closest('button,a,[role="button"]')
      ));
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      if (event.key.toLowerCase() === 'j' && concept?.next?.[0]) {
        event.preventDefault();
        navigate(`/concept/${concept.next[0]}`);
      } else if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        markComplete();
      } else if (event.key.toLowerCase() === 'b') {
        event.preventDefault();
        toggleSaved();
      } else if (event.key.toLowerCase() === 'p') {
        event.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [concept?.id, concept?.next, done, saved, navigate, toggleComplete, toggleBookmark, showToast, markComplete, toggleSaved]);

  if (!concept) {
    return (
      <div className="mx-auto max-w-content px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-ink font-serif">Concept not found</h1>
        <p className="mt-2 text-sm text-ink3">
          No concept with id “{id}” in this build. It may be on the roadmap.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back home</Link>
      </div>
    );
  }

  const domain = domains.find((d) => d.id === concept.domain);
  const snippets = snippetsForConcept(concept.id);
  const csFieldObjs = fields.filter((f) => concept.csFields.includes(f.id));

  return (
    <div className="concept-page">
      <div className="concept-hero border-b border-line bg-surface">
        <div className="mx-auto max-w-content px-4 py-8">
          <div className="chip mb-4">
            <Link to="/" className="hover:text-blue">Home</Link>
            <span>/</span>
            {domain && (
              <>
                <Link to={`/domain/${domain.id}`} className="hover:text-blue">{domain.short}</Link>
                <span>/</span>
              </>
            )}
            <span>{concept.title}</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tightest text-ink font-serif">{concept.title}</h1>
              <p className="mt-2 leading-7 text-ink2">{concept.summary}</p>
            </div>
            <div className="no-print flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleSaved}
                className={`btn-secondary ${saved ? 'border-gold text-gold' : ''}`}
                aria-pressed={saved}
                title="Save this lesson (B)"
              >
                <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={markComplete}
                className={
                  done
                    ? 'btn bg-moss text-onaccent hover:bg-mossl border border-moss'
                    : 'btn-secondary'
                }
                aria-pressed={done}
                title="Mark complete (C)"
              >
                {done ? <Check size={15} /> : <Circle size={15} />}
                {done ? 'Completed' : 'Mark complete'}
              </button>
              <button type="button" onClick={() => window.print()} className="btn-ghost btn-sm" title="Print lesson (P)">
                <Printer size={14} />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <LevelBadge level={concept.level} />
            {concept.tags?.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
            <span className="ml-1 inline-flex items-center gap-1 text-xs text-ink3" title="Estimated technical reading time">
              <Clock3 size={13} /> {readingTimeLabel(concept.content)}
            </span>
          </div>

          <div className="mt-3">
            <PrereqLine concept={concept} />
          </div>

          {csFieldObjs.length > 0 && (
            <div className="mt-3 text-xs text-ink3">
              Used in: {csFieldObjs.map((f, i) => (
                <React.Fragment key={f.id}>
                  {i > 0 && ' · '}
                  <Link to={`/field/${f.id}`} className="text-blue hover:text-blued underline decoration-line2 underline-offset-2">
                    {f.name}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          )}
          <div className="no-print mt-4 flex items-center gap-2 text-[11px] text-ink4">
            <span className="inline-flex items-center gap-1"><kbd className="kbd">J</kbd> next</span>
            <span><kbd className="kbd">C</kbd> complete</span>
            <span><kbd className="kbd">B</kbd> save</span>
            <span><kbd className="kbd">P</kbd> print</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-wide px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start">
          <article className="reading-content min-w-0 print-full">
            {concept.content.map((block, index) => (
              <BlockView key={index} block={block} anchorId={outlineByIndex.get(index)} />
            ))}

            {snippets.length > 0 && (
              <section className="mt-8 border border-line bg-surface">
                <div className="flex items-center gap-2 border-b border-line bg-paper2/60 px-4 py-2">
                  <Play size={13} className="text-blue" />
                  <span className="text-sm font-medium text-ink">Run the code</span>
                  <span className="text-[11px] text-ink3">verified in the playground</span>
                </div>
                <ul className="divide-y divide-line">
                  {snippets.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={`/playground?snippet=${s.id}`}
                        className="flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-paper2"
                      >
                        <span>
                          <span className="block text-sm font-medium text-ink">{s.title}</span>
                          <span className="mt-0.5 block text-xs text-ink3">{s.blurb}</span>
                        </span>
                        <span className="mt-0.5 shrink-0 font-mono text-[11px] text-blue">{s.id}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <PracticeSection conceptId={concept.id} />

            {(concept.next?.length || concept.related?.length) && (
              <footer className="no-print mt-10 border-t border-line pt-6 flex flex-wrap gap-x-10 gap-y-4">
                {concept.next && concept.next.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3 mb-2">Up next</div>
                    <div className="flex flex-col gap-1.5">
                      {concept.next.map((nid) => (
                        <ConceptLink key={nid} id={nid} />
                      ))}
                    </div>
                  </div>
                )}
                {concept.related && concept.related.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3 mb-2">Related</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {concept.related.map((rid) => (
                        <ConceptLink key={rid} id={rid} />
                      ))}
                    </div>
                  </div>
                )}
              </footer>
            )}

            {concept.next && concept.next.length > 0 && (
              <div className="no-print mt-8">
                <Link to={`/concept/${concept.next[0]}`} className="btn-primary group">
                  Continue: {conceptInfo(concept.next[0])?.title ?? concept.next[0]}
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </article>

          {outline.length > 0 && (
            <aside className="concept-toc order-first lg:order-last">
              <nav className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto" aria-label="On this page">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink3">
                  <ListTree size={13} /> On this page
                </div>
                <ol className="mt-2 border-l border-line pl-3">
                  {outline.map((entry) => (
                    <li key={entry.id}>
                      <a
                        href={`#${entry.id}`}
                        className="block py-1 text-xs leading-relaxed text-ink3 transition-colors hover:text-blue"
                      >
                        {entry.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function PracticeSection({ conceptId }: { conceptId: string }) {
  const c = readConcept(conceptId);
  if (!c) return null;
  return <Practice concept={c} />;
}
