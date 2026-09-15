import type { Block } from '../data/types';

// A reading speed that is comfortable for technical prose, rather than the
// 300+ wpm often used for ordinary fiction. Keeping this here makes the
// estimate deterministic and easy to explain in tests and documentation.
export const READING_WPM = 220;

export interface OutlineEntry {
  id: string;
  label: string;
  index: number;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
  return slug || 'section';
}

/**
 * Give the authored structure a useful outline. Most lessons use labelled
 * cards rather than h blocks, so only looking for headings would make the TOC
 * disappear on almost every concept page.
 */
export function outlineLabel(block: Block): string | null {
  switch (block.t) {
    case 'h': return block.text;
    case 'intuition': return block.title ? `Intuition: ${block.title}` : 'Intuition';
    case 'def': return block.title ? `Definition: ${block.title}` : 'Definition';
    case 'formula': return block.name ? `Key formula: ${block.name}` : 'Key formula';
    case 'props': return block.title ? `Properties: ${block.title}` : 'Properties';
    case 'ex': return block.title ? `Worked example: ${block.title}` : 'Worked example';
    case 'thm': return block.name ? `Theorem: ${block.name}` : 'Theorem';
    case 'analogy': return block.title ? `Analogy: ${block.title}` : 'Analogy';
    case 'cs': return block.title ? `CS application: ${block.title}` : 'CS application';
    case 'callout': return block.kind === 'warning' ? 'Warning' : block.kind === 'history' ? 'Historical note' : 'Insight';
    case 'list': return block.title ? `List: ${block.title}` : null;
    case 'table': return block.title ? `Table: ${block.title}` : null;
    case 'viz': return null;
    case 'figure': return block.title ? `Figure: ${block.title}` : null;
    case 'p': return null;
  }
}

export function buildOutline(blocks: Block[]): OutlineEntry[] {
  const used = new Map<string, number>();
  const result: OutlineEntry[] = [];
  blocks.forEach((block, index) => {
    const label = outlineLabel(block);
    if (!label) return;
    const base = `section-${slugify(label)}`;
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    result.push({
      id: count === 0 ? base : `${base}-${count + 1}`,
      label,
      index,
    });
  });
  return result;
}

function blockText(block: Block): string {
  switch (block.t) {
    case 'h':
    case 'p':
    case 'intuition':
    case 'def':
    case 'analogy':
    case 'callout':
      return [
        'title' in block ? block.title : '',
        'text' in block ? block.text : '',
      ].filter(Boolean).join(' ');
    case 'formula':
      return [block.name, block.latex, block.note ?? ''].join(' ');
    case 'props':
      return [block.title ?? '', ...block.items.flatMap((item) => [item.title, item.text])].join(' ');
    case 'ex':
      return [block.title, ...block.steps, block.result ?? ''].join(' ');
    case 'thm':
      return [block.name, block.statement, ...(block.proof ?? [])].join(' ');
    case 'cs':
      return [block.title ?? '', ...block.items.flatMap((item) => [item.area, item.how])].join(' ');
    case 'list':
      return [block.title ?? '', ...block.items].join(' ');
    case 'table':
      return [block.title ?? '', ...block.head, ...block.rows.flat()].join(' ');
    case 'viz':
      return '';
    case 'figure':
      return [block.title ?? '', block.caption ?? ''].join(' ');
  }
}

/** Count authored words without trying to interpret the embedded TeX. */
export function wordCount(blocks: Block[]): number {
  const text = blocks.map(blockText).join(' ');
  return (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
}

export function readingTimeMinutes(blocks: Block[], wpm = READING_WPM): number {
  if (wpm <= 0 || !Number.isFinite(wpm)) return 1;
  return Math.max(1, Math.ceil(wordCount(blocks) / wpm));
}

export function readingTimeLabel(blocks: Block[], wpm = READING_WPM): string {
  const words = wordCount(blocks);
  const minutes = readingTimeMinutes(blocks, wpm);
  return `${minutes} min read · ${words.toLocaleString()} words`;
}
