import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { domains } from '../data/domains';
import { fields } from '../data/fields';
import { paths } from '../data/paths';
import { books } from '../data/books';
import { allConcepts, domainsWithContent, totalConcepts } from '../lib/concepts';
import { Icon } from '../components/ui';

export function HomePage() {
  const practiceCount = allConcepts.reduce((s, c) => s + c.practice.length, 0);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-wide px-4 py-14 md:py-20">
          <div className="max-w-2xl">
            <div className="chip bg-bluel text-blue border-bluep mb-4">
              An interactive mathematics laboratory for CS students
            </div>
            <h1 className="text-4xl font-semibold tracking-tightest text-ink font-serif">
              MathCS — the mathematics <span className="text-blue">behind</span> computer science
            </h1>
            <p className="mt-4 text-lg leading-8 text-ink2">
              Logic, proofs, number theory, combinatorics, and graphs — taught the way a
              computer scientist needs them: with intuition first, rigor second, and a concrete
              CS application attached to every idea.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/domain/discrete" className="btn-primary">
                Start with Discrete Math <ArrowRight size={15} />
              </Link>
              <Link to="/fields" className="btn-secondary">
                Find my field
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink3">
              <span><strong className="text-ink font-semibold">{totalConcepts}</strong> concepts</span>
              <span><strong className="text-ink font-semibold">{domainsWithContent.size}</strong> domains live</span>
              <span><strong className="text-ink font-semibold">{fields.length}</strong> CS fields mapped</span>
              <span><strong className="text-ink font-semibold">{practiceCount}</strong> practice problems</span>
            </div>
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="mx-auto max-w-wide px-4 py-12">
        <h2 className="text-2xl font-semibold tracking-tightest text-ink font-serif">Domains</h2>
        <p className="mt-1 text-sm text-ink3">
          Five domains are fully built; the rest are on the roadmap.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => {
            const live = domainsWithContent.has(d.id);
            return (
              <Link
                key={d.id}
                to={`/domain/${d.id}`}
                className={`group panel p-4 transition-shadow hover:shadow-pop ${live ? 'hover:border-bluep' : 'opacity-70'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center border ${live ? 'bg-bluel border-bluep text-blue' : 'bg-paper2 border-line text-ink4'}`}>
                    <Icon name={d.icon} size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-ink group-hover:text-blue transition-colors">
                      {d.name}
                    </div>
                    <div className="mt-0.5 text-xs text-ink3 leading-relaxed">{d.tagline}</div>
                    <div className="mt-2">
                      {live ? (
                        <span className="chip bg-mossl text-moss border-[#cfe0d4]">content ready</span>
                      ) : (
                        <span className="chip">coming soon</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Fields */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-wide px-4 py-12">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tightest text-ink font-serif">
                Explore by CS field
              </h2>
              <p className="mt-1 text-sm text-ink3">
                Every field of computer science rests on a slice of mathematics. Pick yours.
              </p>
            </div>
            <Link to="/fields" className="link-quiet text-sm whitespace-nowrap">
              All {fields.length} fields →
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {fields.slice(0, 8).map((f) => (
              <Link key={f.id} to={`/field/${f.id}`} className="group panel p-3.5 transition-shadow hover:shadow-pop hover:border-bluep">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-paper2 border border-line text-ink2 group-hover:bg-bluel group-hover:text-blue group-hover:border-bluep transition-colors">
                    <Icon name={f.icon} size={17} />
                  </span>
                  <span className="text-sm font-semibold text-ink group-hover:text-blue transition-colors">{f.name}</span>
                </div>
                <div className="mt-2 text-xs leading-relaxed text-ink3">{f.oneLiner}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Paths */}
      <section className="mx-auto max-w-wide px-4 py-12">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tightest text-ink font-serif">Learning paths</h2>
            <p className="mt-1 text-sm text-ink3">Curated routes from first principles to your goal.</p>
          </div>
          <Link to="/paths" className="link-quiet text-sm whitespace-nowrap">
            All paths →
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {paths.map((p) => (
            <Link key={p.id} to={`/path/${p.id}`} className="group panel p-4 transition-shadow hover:shadow-pop hover:border-bluep">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-paper2 border border-line text-ink2 group-hover:bg-bluel group-hover:text-blue group-hover:border-bluep transition-colors">
                  <Icon name={p.icon} size={18} />
                </span>
                <span className="font-semibold text-ink group-hover:text-blue transition-colors">{p.title}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink3 line-clamp-2">{p.description}</p>
              <div className="mt-2 text-[11px] font-medium text-blue">
                {p.stages.length} stages · {p.stages.reduce((s, st) => s + st.concepts.length, 0)} concepts
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Books */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-wide px-4 py-12 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold tracking-tightest text-ink font-serif">Recommended books</h2>
            <p className="mt-1 text-sm text-ink3">
              {books.length} hand-picked books, organized by domain — with what each one covers and why it's worth your money.
            </p>
          </div>
          <Link to="/books" className="btn-primary">
            Browse books <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
