import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Bookmark, Check, Circle, Play } from 'lucide-react';
import { domains } from '../data/domains';
import { fields } from '../data/fields';
import { getConcept } from '../lib/concepts';
import { BlockView, ConceptLink, LevelBadge, PrereqLine } from '../components/ui';
import { useStore } from '../lib/store';
import { snippetsForConcept } from '../data/snippets';

export function ConceptPage() {
  const { id = '' } = useParams();
  const concept = getConcept(id);
  const { isComplete, toggleComplete, isBookmarked, toggleBookmark, visitConcept } = useStore();
  const conceptId = concept?.id;

  // Record the visit for the command palette's "recent" section.
  useEffect(() => {
    if (conceptId) visitConcept(conceptId);
  }, [conceptId, visitConcept]);

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
  const done = isComplete(concept.id);
  const saved = isBookmarked(concept.id);
  const snippets = snippetsForConcept(concept.id);
  const csFieldObjs = fields.filter((f) => concept.csFields.includes(f.id));

  return (
    <div>
      <div className="border-b border-line bg-white">
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleBookmark(concept.id)}
                className={`btn-secondary ${saved ? 'border-gold text-gold' : ''}`}
                aria-pressed={saved}
              >
                <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => toggleComplete(concept.id)}
                className={
                  done
                    ? 'btn bg-moss text-white hover:bg-mossl border border-moss'
                    : 'btn-secondary'
                }
              >
                {done ? <Check size={15} /> : <Circle size={15} />}
                {done ? 'Completed' : 'Mark complete'}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <LevelBadge level={concept.level} />
            {concept.tags?.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
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
        </div>
      </div>

      <article className="mx-auto max-w-content px-4 py-8">
        {concept.content.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}

        {snippets.length > 0 && (
          <section className="mt-8 border border-line bg-white">
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
          <footer className="mt-10 border-t border-line pt-6 flex flex-wrap gap-x-10 gap-y-4">
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
          <div className="mt-8">
            <Link
              to={`/concept/${concept.next[0]}`}
              className="btn-primary group"
            >
              Continue: {getConcept(concept.next[0])?.title ?? concept.next[0]}
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </article>
    </div>
  );
}

// Imported lazily inside the module to keep the block renderer import graph clean.
import { Practice } from '../components/ui';
function PracticeSection({ conceptId }: { conceptId: string }) {
  const c = getConcept(conceptId);
  if (!c) return null;
  return <Practice concept={c} />;
}
