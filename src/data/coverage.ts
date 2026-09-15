// Keep the shell's coverage copy independent from the large concept registry.
// This list is updated with each published domain so the header/footer never
// pulls every lesson into the initial JavaScript chunk.
export const publishedDomainIds = [
  'discrete',
  'proofs',
  'number-theory',
  'combinatorics',
  'graph-theory',
  'probability',
  'statistics',
  'linear-algebra',
  'calculus',
  'optimization',
  'geometry',
  'abstract-algebra',
  'information-theory',
  'numerical',
  'formal',
] as const;

export const publishedDomainCount = publishedDomainIds.length;
