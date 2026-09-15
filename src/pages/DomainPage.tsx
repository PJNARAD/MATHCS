import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { domains } from '../data/domains';
import { childrenOf, conceptsForDomain, standaloneConcepts, topicsOf } from '../lib/concepts';
import type { Concept } from '../data/types';
import { Icon, LevelBadge } from '../components/ui';
import { useStore } from '../lib/store';

function ConceptRow({ concept }: { concept: Concept }) {
  const { isComplete } = useStore();
  const done = isComplete(concept.id);
  return (
    <li>
      <Link
        to={`/concept/${concept.id}`}
        className="group flex items-start gap-3 border border-line bg-surface px-3.5 py-3 transition-colors hover:border-bluep hover:bg-bluel/30"
      >
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
            done ? 'bg-moss border-moss text-onaccent' : 'bg-paper2 border-line2 text-transparent'
          }`}
        >
          <Check size={13} strokeWidth={3} />
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-ink group-hover:text-blue transition-colors">{concept.title}</span>
            <LevelBadge level={concept.level} />
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-ink3 line-clamp-2">{concept.summary}</span>
        </span>
        <ChevronRight size={16} className="ml-auto mt-1 text-ink4 shrink-0 group-hover:text-blue" />
      </Link>
    </li>
  );
}

function TopicSection({ topic, children }: { topic: Concept; children: Concept[] }) {
  const { isComplete } = useStore();
  const done = isComplete(topic.id);
  return (
    <section className="mt-8 first:mt-0">
      <Link to={`/concept/${topic.id}`} className="group block">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tightest text-ink font-serif group-hover:text-blue transition-colors">
            {topic.title}
          </h2>
          <LevelBadge level={topic.level} />
          {done && <span className="chip bg-mossl text-moss border-mossline">completed</span>}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-ink2 line-clamp-2">{topic.summary}</p>
      </Link>
      {children.length > 0 && (
        <ul className="mt-3 space-y-2">
          {children.map((c) => (
            <ConceptRow key={c.id} concept={c} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function DomainPage() {
  const { id = '' } = useParams();
  const domain = domains.find((d) => d.id === id);

  if (!domain) {
    return (
      <div className="mx-auto max-w-content px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-ink font-serif">Domain not found</h1>
        <p className="mt-2 text-sm text-ink3">No domain with id “{id}”.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back home</Link>
      </div>
    );
  }

  const concepts = conceptsForDomain(domain.id);
  const topics = topicsOf(domain.id);
  const standalones = standaloneConcepts(domain.id);

  return (
    <div className="mx-auto max-w-wide px-4 py-10">
      <div className="chip mb-4">
        <Link to="/" className="hover:text-blue">Home</Link>
        <span>/</span>
        <span>{domain.short}</span>
      </div>
      <header className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-bluep bg-bluel text-blue">
          <Icon name={domain.icon} size={26} />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tightest text-ink font-serif">{domain.name}</h1>
          <p className="mt-1 text-ink2">{domain.tagline}</p>
          <p className="mt-3 text-sm leading-7 text-ink3 max-w-3xl">{domain.description}</p>
          {concepts.length > 0 && (
            <p className="mt-3 text-xs text-ink4">
              {concepts.length} concepts in this domain · topics are hub pages with the full treatment.
            </p>
          )}
        </div>
      </header>

      {concepts.length === 0 ? (
        <div className="mt-10 border border-dashed border-line2 bg-paper2/40 px-6 py-12 text-center">
          <Icon name={domain.icon} size={28} className="mx-auto text-ink4" />
          <h2 className="mt-3 text-lg font-semibold text-ink font-serif">Coming soon</h2>
          <p className="mt-1 text-sm text-ink3">
            The {domain.name.toLowerCase()} curriculum is in the roadmap — not yet published in this build.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {topics.map((t) => (
            <TopicSection key={t.id} topic={t}>
              {childrenOf(t.id, domain.id)}
            </TopicSection>
          ))}
          {standalones.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold tracking-tightest text-ink font-serif mb-3">Standalone concepts</h2>
              <ul className="space-y-2">
                {standalones.map((c) => (
                  <ConceptRow key={c.id} concept={c} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
