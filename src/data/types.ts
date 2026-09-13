// ---------------------------------------------------------------------------
// MathCS data model
// ---------------------------------------------------------------------------

export type Level = 'foundational' | 'core' | 'advanced';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Domain {
  id: string;
  name: string;
  short: string;
  tagline: string;
  description: string;
  icon: string; // lucide icon name
}

// ---- content blocks -------------------------------------------------------

export type Block =
  | { t: 'h'; text: string }
  | { t: 'p'; text: string }
  | { t: 'intuition'; title?: string; text: string }
  | { t: 'def'; title: string; text: string }
  | { t: 'formula'; name: string; latex: string; note?: string }
  | { t: 'props'; title?: string; items: { title: string; text: string }[] }
  | { t: 'ex'; title: string; steps: string[]; result?: string }
  | { t: 'thm'; name: string; statement: string; proofTitle?: string; proof?: string[] }
  | { t: 'analogy'; title?: string; text: string }
  | { t: 'cs'; title?: string; items: { area: string; how: string }[] }
  | { t: 'callout'; kind: 'insight' | 'warning' | 'history'; text: string }
  | { t: 'list'; title?: string; items: string[] }
  | { t: 'table'; title?: string; head: string[]; rows: string[][] }
  | { t: 'viz'; id: string; props?: Record<string, unknown> }
  | { t: 'figure'; id: string; title?: string; caption?: string };

export type QuestionType = 'mcq' | 'numeric' | 'short' | 'proof' | 'truefalse';

export interface PracticeQ {
  id: string;
  q: string;
  type: QuestionType;
  diff: Difficulty;
  options?: string[];
  correct?: number; // index into options (mcq / truefalse)
  answer?: string; // model answer (numeric / short / proof)
  explain: string;
  mistake?: string;
  related?: string; // concept id
}

// ---- curriculum nodes ------------------------------------------------------

export interface Concept {
  id: string;
  title: string;
  domain: string;
  parent?: string; // parent concept id (topic hub or another concept)
  topic?: boolean; // marks a hub topic
  summary: string;
  level: Level;
  csFields: string[];
  prerequisites: string[];
  related: string[];
  next?: string[];
  tags?: string[];
  content: Block[];
  practice: PracticeQ[];
}

// ---- CS fields -------------------------------------------------------------

export interface CSField {
  id: string;
  name: string;
  icon: string;
  oneLiner: string;
  description: string;
  mapping: { concept: string; why: string }[];
  pathId?: string;
}

// ---- learning paths ---------------------------------------------------------

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  fieldId?: string;
  stages: { title: string; concepts: string[] }[];
}

export interface Book {
  title: string;
  author: string;
  domain: string;
  level: string;
  covers: string[];
  why: string;
}
