import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { MathText } from './TeX';
import type { Block, Concept, Difficulty, Level, PracticeQ } from '../data/types';
import { getConcept } from '../lib/concepts';
import { useStore } from '../lib/store';

// ---------------------------------------------------------------------------
// Icons — content stores lucide icon names as strings; resolve them here.
// ---------------------------------------------------------------------------

type IconCmp = React.ComponentType<{ size?: number | string; className?: string; strokeWidth?: number | string }>;

const ICON_MAP = Lucide as unknown as Record<string, IconCmp>;

export function Icon({ name, size = 18, className }: { name: string; size?: number | string; className?: string }) {
  const Cmp = ICON_MAP[name] ?? ICON_MAP.Circle;
  if (!Cmp) return null;
  return <Cmp size={size} className={className} strokeWidth={1.75} />;
}

// ---------------------------------------------------------------------------
// RichText — plain content strings may contain:
//   `code`   inline code
//   **bold** bold (may itself contain math)
//   $math$   KaTeX (via MathText)
// ---------------------------------------------------------------------------

function renderSegment(text: string, key: string, bold: boolean): React.ReactNode {
  const node = <MathText key={key} text={text} />;
  return bold ? <strong key={key + '-b'} className="font-semibold text-ink">{node}</strong> : node;
}

export function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code key={i} className="font-mono text-[0.82em] bg-paper2 border border-line rounded px-1 py-px text-ink">
              {part.slice(1, -1)}
            </code>
          );
        }
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bp, j) => {
          if (bp.startsWith('**') && bp.endsWith('**') && bp.length > 4) {
            return renderSegment(bp.slice(2, -2), `${i}-${j}`, true);
          }
          if (!bp) return null;
          return renderSegment(bp, `${i}-${j}`, false);
        });
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Small display bits
// ---------------------------------------------------------------------------

const LEVEL_STYLE: Record<Level, string> = {
  foundational: 'bg-mossl text-moss',
  core: 'bg-bluel text-blue',
  advanced: 'bg-goldl text-gold',
};

export function LevelBadge({ level }: { level: Level }) {
  return <span className={`chip ${LEVEL_STYLE[level]}`}>{level}</span>;
}

const DIFF_STYLE: Record<Difficulty, string> = {
  easy: 'bg-mossl text-moss',
  medium: 'bg-goldl text-gold',
  hard: 'bg-terracottal text-terracotta',
};

export function DiffBadge({ diff }: { diff: Difficulty }) {
  return <span className={`chip ${DIFF_STYLE[diff]}`}>{diff}</span>;
}

/** Link to a concept, or a muted "coming soon" chip when the content isn't in this build. */
export function ConceptLink({ id, className }: { id: string; className?: string }) {
  const c = getConcept(id);
  if (!c) {
    return (
      <span className="chip cursor-default opacity-60" title="Content not yet published in this build">
        {id} · soon
      </span>
    );
  }
  return (
    <Link
      to={`/concept/${c.id}`}
      className={`text-blue hover:text-blued underline decoration-line2 underline-offset-2 hover:decoration-blue transition-colors ${className ?? ''}`}
    >
      {c.title}
    </Link>
  );
}

export function PrereqLine({ concept }: { concept: Concept }) {
  if (!concept.prerequisites.length) return null;
  return (
    <div className="text-xs text-ink3">
      Requires:{' '}
      {concept.prerequisites.map((p, i) => (
        <React.Fragment key={p}>
          {i > 0 && ', '}
          <ConceptLink id={p} />
        </React.Fragment>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Content block renderer
// ---------------------------------------------------------------------------

function LabeledCard({
  label,
  labelClass,
  cardClass,
  title,
  children,
}: {
  label: string;
  labelClass: string;
  cardClass: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`my-5 border ${cardClass}`}>
      <div className={`flex items-center gap-2 px-4 pt-3 ${labelClass}`}>
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
        {title && <span className="text-sm font-medium text-ink">{title}</span>}
      </div>
      <div className="px-4 pb-4 pt-1 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function ProofDetails({ title, steps }: { title?: string; steps: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 border-t border-dashed border-line2 pt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost btn-sm text-blue"
        aria-expanded={open}
      >
        {open ? 'Hide proof' : `Show proof${title ? `: ${title}` : ''}`}
      </button>
      {open && (
        <ol className="mt-2 space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed">
              <span className="text-ink4 font-mono text-xs mt-0.5 w-4 shrink-0 text-right">{i + 1}.</span>
              <RichText text={s} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function BlockView({ block }: { block: Block }) {
  switch (block.t) {
    case 'h':
      return (
        <h2 className="mt-8 mb-3 text-xl font-semibold text-ink font-serif">{block.text}</h2>
      );
    case 'p':
      return (
        <p className="my-4 text-[0.94rem] leading-7 text-ink2">
          <RichText text={block.text} />
        </p>
      );
    case 'intuition':
      return (
        <LabeledCard label="Intuition" labelClass="text-blue" cardClass="border-bluep bg-bluel/40">
          {block.title && <div className="font-medium text-ink mb-1">{block.title}</div>}
          <RichText text={block.text} />
        </LabeledCard>
      );
    case 'def':
      return (
        <LabeledCard label="Definition" labelClass="text-gold" cardClass="border-[#e6dcc0] bg-goldl/50" title={block.title}>
          <RichText text={block.text} />
        </LabeledCard>
      );
    case 'formula':
      return (
        <LabeledCard label="Key formula" labelClass="text-blue" cardClass="border-line bg-white" title={block.name}>
          <MathText text={`$$${block.latex}$$`} />
          {block.note && (
            <div className="mt-2 text-xs text-ink3">
              <RichText text={block.note} />
            </div>
          )}
        </LabeledCard>
      );
    case 'props':
      return (
        <LabeledCard label="Properties" labelClass="text-moss" cardClass="border-line bg-paper2/50" title={block.title}>
          <ul className="space-y-2">
            {block.items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-moss shrink-0" />
                <span>
                  <span className="font-medium text-ink">{it.title}</span>
                  {it.text && <span> — <RichText text={it.text} /></span>}
                </span>
              </li>
            ))}
          </ul>
        </LabeledCard>
      );
    case 'ex':
      return (
        <LabeledCard label="Worked example" labelClass="text-terracotta" cardClass="border-[#ecd5cf] bg-terracottal/40" title={block.title}>
          <ol className="space-y-2">
            {block.steps.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-terracotta font-mono text-xs mt-0.5 w-4 shrink-0 text-right">{i + 1}.</span>
                <RichText text={s} />
              </li>
            ))}
          </ol>
          {block.result && (
            <div className="mt-3 border-t border-dashed border-[#e0c4bc] pt-2 text-sm">
              <span className="font-medium text-terracotta">Result: </span>
              <RichText text={block.result} />
            </div>
          )}
        </LabeledCard>
      );
    case 'thm':
      return (
        <LabeledCard label="Theorem" labelClass="text-blue" cardClass="border-bluep bg-white" title={block.name}>
          <RichText text={block.statement} />
          {block.proof && block.proof.length > 0 && (
            <ProofDetails title={block.proofTitle} steps={block.proof} />
          )}
        </LabeledCard>
      );
    case 'analogy':
      return (
        <LabeledCard label="Analogy" labelClass="text-gold" cardClass="border-line bg-paper2/60" title={block.title}>
          <RichText text={block.text} />
        </LabeledCard>
      );
    case 'cs':
      return (
        <LabeledCard label="Where computer science uses this" labelClass="text-moss" cardClass="border-line bg-mossl/40">
          {block.title && <div className="font-medium text-ink mb-1">{block.title}</div>}
          <ul className="space-y-2">
            {block.items.map((it, i) => (
              <li key={i} className="text-sm">
                <span className="font-semibold text-ink">{it.area}:</span>{' '}
                <RichText text={it.how} />
              </li>
            ))}
          </ul>
        </LabeledCard>
      );
    case 'callout': {
      const style =
        block.kind === 'warning'
          ? { border: 'border-[#ecd5cf]', bg: 'bg-terracottal/40', label: 'text-terracotta', name: 'Warning' }
          : block.kind === 'history'
            ? { border: 'border-line2', bg: 'bg-paper2/60', label: 'text-ink3', name: 'A historical note' }
            : { border: 'border-bluep', bg: 'bg-bluel/40', label: 'text-blue', name: 'Insight' };
      return (
        <div className={`my-5 border ${style.border} ${style.bg} px-4 py-3`}>
          <div className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${style.label}`}>{style.name}</div>
          <div className="text-sm leading-relaxed">
            <RichText text={block.text} />
          </div>
        </div>
      );
    }
    case 'list':
      return (
        <div className="my-4">
          {block.title && <div className="font-medium text-ink mb-2 text-sm">{block.title}</div>}
          <ul className="space-y-1.5">
            {block.items.map((it, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink2">
                <span className="mt-[0.6em] h-1 w-1 rounded-full bg-ink4 shrink-0" />
                <RichText text={it} />
              </li>
            ))}
          </ul>
        </div>
      );
    case 'table':
      return (
        <div className="my-5 overflow-x-auto slim-scroll">
          {block.title && <div className="font-medium text-ink mb-2 text-sm">{block.title}</div>}
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} className="border border-line bg-paper2 px-3 py-1.5 text-left font-semibold text-ink">
                    <RichText text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className={i % 2 ? 'bg-paper2/40' : 'bg-white'}>
                  {row.map((cell, j) => (
                    <td key={j} className="border border-line px-3 py-1.5 text-ink2">
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'viz':
      return <VizBlockLazy id={block.id} props={block.props} />;
    case 'figure':
      return (
        <figure className="my-5 border border-dashed border-line2 bg-paper2/40 px-4 py-6 text-center">
          <Icon name="Image" size={24} className="mx-auto text-ink4" />
          {block.title && <figcaption className="mt-2 text-sm font-medium text-ink">{block.title}</figcaption>}
          {block.caption && <figcaption className="mt-1 text-xs text-ink3">{block.caption}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
}

// Lazy import keeps viz code out of the initial parse of this module.
import { Viz } from './viz';
function VizBlockLazy({ id, props }: { id: string; props?: Record<string, unknown> }) {
  return <Viz id={id} props={props} />;
}

// ---------------------------------------------------------------------------
// Practice — interactive questions backed by the progress store
// ---------------------------------------------------------------------------

function MCQ({ q }: { q: PracticeQ }) {
  const { recordAnswer, practiceResult } = useStore();
  const done = practiceResult(q.id);
  const [picked, setPicked] = useState<number | null>(done?.correct ? q.correct ?? null : null);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    recordAnswer(q.id, i === (q.correct ?? -1));
  };

  return (
    <div>
      <div className="flex flex-col gap-1.5 mt-2">
        {q.options?.map((opt, i) => {
          const isCorrect = i === (q.correct ?? -1);
          const isPicked = i === picked;
          let cls = 'border-line2 hover:border-blue bg-white';
          if (picked !== null && isCorrect) cls = 'border-moss bg-mossl text-moss';
          else if (picked !== null && isPicked) cls = 'border-terracotta bg-terracottal text-terracotta';
          else if (picked !== null) cls = 'border-line bg-paper2 opacity-60';
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={`text-left px-3 py-2 text-sm border transition-colors ${cls} ${picked === null ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className="font-mono text-xs text-ink4 mr-2">{String.fromCharCode(65 + i)}.</span>
              <RichText text={opt} />
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={`mt-2 text-sm ${picked === (q.correct ?? -1) ? 'text-moss' : 'text-terracotta'}`}>
          {picked === (q.correct ?? -1) ? 'Correct. ' : 'Not quite. '}
          <span className="text-ink2">
            <RichText text={q.explain} />
          </span>
          {picked !== (q.correct ?? -1) && q.mistake && (
            <div className="mt-1 text-xs text-ink3 italic">Common mistake: <RichText text={q.mistake} /></div>
          )}
        </div>
      )}
    </div>
  );
}

function OpenEnded({ q }: { q: PracticeQ }) {
  const { recordAnswer } = useStore();
  const [show, setShow] = useState(false);

  return (
    <div>
      <button type="button" className="btn-ghost btn-sm mt-2" onClick={() => setShow((s) => !s)}>
        {show ? 'Hide answer' : 'Reveal answer'}
      </button>
      {show && (
        <div className="mt-2 border border-line bg-paper2/50 px-3 py-2 text-sm">
          {q.answer && (
            <div>
              <span className="font-medium text-ink">Answer: </span>
              <RichText text={q.answer} />
            </div>
          )}
          <div className="mt-1 text-ink2">
            <span className="font-medium text-ink">Why: </span>
            <RichText text={q.explain} />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" className="btn-secondary btn-sm" onClick={() => recordAnswer(q.id, true)}>
              I got this one
            </button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => recordAnswer(q.id, false)}>
              Still shaky
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Practice({ concept }: { concept: Concept }) {
  if (!concept.practice.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-ink font-serif mb-3">Practice</h2>
      <div className="space-y-4">
        {concept.practice.map((q) => (
          <div key={q.id} className="panel p-4">
            <div className="flex items-start gap-2">
              <DiffBadge diff={q.diff} />
              <span className="text-sm text-ink4 font-mono mt-0.5">{q.id}</span>
            </div>
            <p className="mt-2 text-[0.94rem] leading-7 text-ink">
              <RichText text={q.q} />
            </p>
            {q.type === 'mcq' || q.type === 'truefalse' ? <MCQ q={q} /> : <OpenEnded q={q} />}
          </div>
        ))}
      </div>
    </section>
  );
}
