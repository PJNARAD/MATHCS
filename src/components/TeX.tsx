import React, { useMemo } from 'react';
import katex from 'katex';

// ---------------------------------------------------------------------------
// Math typesetting. Content strings may contain:
//   $...$   inline math
//   $$...$$ display math
// Everything outside math is rendered as plain text.
// ---------------------------------------------------------------------------

function texHtml(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: 'ignore',
      output: 'htmlAndMathml',
    });
  } catch {
    return tex;
  }
}

const MATH_RE = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

/** Renders a string with inline/display KaTeX math into React elements. */
export function MathText({ text, className }: { text: string; className?: string }) {
  const nodes = useMemo(() => {
    const out: React.ReactNode[] = [];
    let last = 0;
    let key = 0;
    let m: RegExpExecArray | null;
    MATH_RE.lastIndex = 0;
    while ((m = MATH_RE.exec(text)) !== null) {
      if (m.index > last) out.push(text.slice(last, m.index));
      if (m[1] !== undefined) {
        out.push(
          <span key={key++} className="block my-2 overflow-x-auto" dangerouslySetInnerHTML={{ __html: texHtml(m[1].trim(), true) }} />,
        );
      } else {
        out.push(
          <span key={key++} dangerouslySetInnerHTML={{ __html: texHtml(m[2], false) }} />,
        );
      }
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }, [text]);
  return <span className={className}>{nodes}</span>;
}

/** Renders pure LaTeX as display math (for formula cards). */
export function DisplayMath({ latex, className }: { latex: string; className?: string }) {
  const html = useMemo(() => texHtml(latex, true), [latex]);
  return <div className={`overflow-x-auto ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function InlineMath({ latex, className }: { latex: string; className?: string }) {
  const html = useMemo(() => texHtml(latex, false), [latex]);
  return <span dangerouslySetInnerHTML={{ __html: html }} className={className} />;
}
