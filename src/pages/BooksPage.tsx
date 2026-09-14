import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { books } from '../data/books';
import { domains } from '../data/domains';
import { Icon } from '../components/ui';

export function BooksPage() {
  const domainOrder = domains.map((d) => d.id);
  const byDomain = new Map<string, typeof books>();
  for (const b of books) {
    const list = byDomain.get(b.domain) ?? [];
    list.push(b);
    byDomain.set(b.domain, list);
  }

  return (
    <div className="mx-auto max-w-wide px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tightest text-ink font-serif">Recommended books</h1>
      <p className="mt-2 text-sm text-ink3 max-w-2xl leading-relaxed">
        Hand-picked companions for each domain — what they cover, and why they're worth your money.
      </p>

      {domainOrder
        .filter((id) => byDomain.has(id))
        .map((domainId) => {
          const domain = domains.find((d) => d.id === domainId);
          const list = byDomain.get(domainId)!;
          return (
            <section key={domainId} className="mt-8">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center bg-paper2 border border-line text-ink2">
                  {domain ? <Icon name={domain.icon} size={16} /> : <BookOpen size={16} />}
                </span>
                <h2 className="text-lg font-semibold tracking-tightest text-ink font-serif">
                  {domain?.name ?? domainId}
                </h2>
                {domain && (
                  <Link to={`/domain/${domainId}`} className="link-quiet text-xs ml-1">
                    view domain →
                  </Link>
                )}
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {list.map((b, i) => (
                  <div key={i} className="panel p-4 flex gap-3">
                    <div className="flex h-16 w-12 shrink-0 items-center justify-center border border-line bg-gradient-to-b from-bluel to-paper2 text-blue">
                      <BookOpen size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-ink leading-snug">{b.title}</div>
                      <div className="text-xs text-ink3 mt-0.5">
                        {b.author} · <span className="chip !text-[10px] !py-0 align-middle">{b.level}</span>
                      </div>
                      <div className="mt-2 text-xs leading-relaxed text-ink2">{b.why}</div>
                      {b.covers.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {b.covers.map((c) => (
                            <span key={c} className="chip">{c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}
