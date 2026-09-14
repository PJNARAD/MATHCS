import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fields } from '../data/fields';
import { paths } from '../data/paths';
import { Icon, ConceptLink } from '../components/ui';

export function FieldsPage() {
  return (
    <div className="mx-auto max-w-wide px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tightest text-ink font-serif">Fields of computer science</h1>
      <p className="mt-2 text-sm text-ink3 max-w-2xl leading-relaxed">
        Each field maps to the exact slice of mathematics it stands on. Open one to see which
        concepts to study first and why.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => (
          <Link key={f.id} to={`/field/${f.id}`} className="group panel p-4 transition-shadow hover:shadow-pop hover:border-bluep">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-paper2 border border-line text-ink2 group-hover:bg-bluel group-hover:text-blue group-hover:border-bluep transition-colors">
                <Icon name={f.icon} size={20} />
              </span>
              <div>
                <div className="font-semibold text-ink group-hover:text-blue transition-colors">{f.name}</div>
                <div className="text-xs text-ink3">{f.oneLiner}</div>
              </div>
            </div>
            <div className="mt-3 text-[11px] font-medium text-blue">
              {f.mapping.length} mapped concepts {f.pathId ? '· has a learning path' : ''}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function FieldDetailPage() {
  const { id = '' } = useParams();
  const field = fields.find((f) => f.id === id);

  if (!field) {
    return (
      <div className="mx-auto max-w-content px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-ink font-serif">Field not found</h1>
        <Link to="/fields" className="btn-primary mt-6 inline-flex">All fields</Link>
      </div>
    );
  }

  const path = field.pathId ? paths.find((p) => p.id === field.pathId) : undefined;

  return (
    <div className="mx-auto max-w-wide px-4 py-10">
      <div className="chip mb-4">
        <Link to="/" className="hover:text-blue">Home</Link>
        <span>/</span>
        <Link to="/fields" className="hover:text-blue">CS Fields</Link>
        <span>/</span>
        <span>{field.name}</span>
      </div>

      <header className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-bluep bg-bluel text-blue">
          <Icon name={field.icon} size={26} />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tightest text-ink font-serif">{field.name}</h1>
          <p className="mt-1 text-ink2">{field.oneLiner}</p>
          <p className="mt-3 text-sm leading-7 text-ink3 max-w-3xl">{field.description}</p>
        </div>
      </header>

      {path && (
        <Link to={`/path/${path.id}`} className="btn-primary mt-6">
          Follow the “{path.title}” path <ArrowRight size={15} />
        </Link>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tightest text-ink font-serif">The mathematics it stands on</h2>
        <ul className="mt-3 space-y-2">
          {field.mapping.map((m) => (
            <li key={m.concept} className="panel px-4 py-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-sm font-medium w-full sm:w-56 shrink-0">
                <ConceptLink id={m.concept} />
              </span>
              <span className="text-xs leading-relaxed text-ink3 flex-1 min-w-[12rem]">{m.why}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
