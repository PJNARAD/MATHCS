import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Circle } from 'lucide-react';
import { paths } from '../data/paths';
import { fields } from '../data/fields';
import { getConcept } from '../lib/concepts';
import { Icon } from '../components/ui';
import { useStore } from '../lib/store';

export function PathsPage() {
  return (
    <div className="mx-auto max-w-wide px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tightest text-ink font-serif">Learning paths</h1>
      <p className="mt-2 text-sm text-ink3 max-w-2xl leading-relaxed">
        Sequenced routes through the curriculum, organized around where you want to end up.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {paths.map((p) => {
          const field = p.fieldId ? fields.find((f) => f.id === p.fieldId) : undefined;
          const total = p.stages.reduce((s, st) => s + st.concepts.length, 0);
          return (
            <Link key={p.id} to={`/path/${p.id}`} className="group panel p-5 transition-shadow hover:shadow-pop hover:border-bluep">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-paper2 border border-line text-ink2 group-hover:bg-bluel group-hover:text-blue group-hover:border-bluep transition-colors">
                  <Icon name={p.icon} size={21} />
                </span>
                <div>
                  <div className="font-semibold text-ink group-hover:text-blue transition-colors">{p.title}</div>
                  {field && <div className="text-xs text-ink3">for {field.name}</div>}
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink3">{p.description}</p>
              <div className="mt-3 text-[11px] font-medium text-blue">
                {p.stages.length} stages · {total} concepts
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function PathDetailPage() {
  const { id = '' } = useParams();
  const path = paths.find((p) => p.id === id);
  const { state } = useStore();

  if (!path) {
    return (
      <div className="mx-auto max-w-content px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-ink font-serif">Path not found</h1>
        <Link to="/paths" className="btn-primary mt-6 inline-flex">All paths</Link>
      </div>
    );
  }

  const total = path.stages.reduce((s, st) => s + st.concepts.length, 0);
  const done = path.stages.reduce(
    (s, st) => s + st.concepts.filter((c) => state.completed.includes(c)).length,
    0,
  );
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-wide px-4 py-10">
      <div className="chip mb-4">
        <Link to="/" className="hover:text-blue">Home</Link>
        <span>/</span>
        <Link to="/paths" className="hover:text-blue">Paths</Link>
        <span>/</span>
        <span>{path.title}</span>
      </div>

      <header className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-bluep bg-bluel text-blue">
          <Icon name={path.icon} size={26} />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tightest text-ink font-serif">{path.title}</h1>
          <p className="mt-2 text-sm leading-7 text-ink3 max-w-3xl">{path.description}</p>
          <div className="mt-4 max-w-md">
            <div className="flex justify-between text-xs text-ink3 mb-1">
              <span>{done} of {total} concepts complete</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-paper3 overflow-hidden">
              <div className="h-full bg-moss transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="mt-8 space-y-6">
        {path.stages.map((stage, i) => (
          <section key={i} className="panel p-5">
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-mono text-ink4">stage {i + 1}</span>
              <h2 className="text-lg font-semibold tracking-tightest text-ink font-serif">{stage.title}</h2>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {stage.concepts.map((cid) => {
                const c = getConcept(cid);
                const complete = state.completed.includes(cid);
                return (
                  <li key={cid} className="flex items-center gap-2.5">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center border ${
                        complete ? 'bg-moss border-moss text-onaccent' : 'bg-paper2 border-line2 text-transparent'
                      }`}
                    >
                      {complete ? <Check size={13} strokeWidth={3} /> : <Circle size={11} />}
                    </span>
                    {c ? (
                      <Link to={`/concept/${cid}`} className="text-sm text-ink hover:text-blue transition-colors">
                        {c.title}
                      </Link>
                    ) : (
                      <span className="text-sm text-ink4 italic" title="Not yet published in this build">
                        {cid} (coming soon)
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
