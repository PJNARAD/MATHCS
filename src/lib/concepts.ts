// ---------------------------------------------------------------------------
// Central concept registry — aggregates every content file into one list and
// provides lookup/grouping helpers used across pages.
// ---------------------------------------------------------------------------

import type { Concept } from '../data/types';
import { discrete1 } from '../data/concepts/discrete-1';
import { discrete2 } from '../data/concepts/discrete-2';
import { proofs } from '../data/concepts/proofs';
import { combinatorics } from '../data/concepts/combinatorics';
import { graphTheory1 } from '../data/concepts/graph-theory-1';
import { graphTheory2 } from '../data/concepts/graph-theory-2';
import { numberTheory1 } from '../data/concepts/number-theory-1';
import { numberTheory2 } from '../data/concepts/number-theory-2';
import { probability } from '../data/concepts/probability';
import { statistics } from '../data/concepts/statistics';
import { linearAlgebra } from '../data/concepts/linear-algebra';
import { calculus } from '../data/concepts/calculus';
import { optimization } from '../data/concepts/optimization';
import { geometry } from '../data/concepts/geometry';
import { abstractAlgebra } from '../data/concepts/abstract-algebra';
import { informationTheory } from '../data/concepts/information-theory';
import { numerical } from '../data/concepts/numerical';
import { formal } from '../data/concepts/formal';

export const allConcepts: Concept[] = [
  ...discrete1,
  ...discrete2,
  ...proofs,
  ...combinatorics,
  ...graphTheory1,
  ...graphTheory2,
  ...numberTheory1,
  ...numberTheory2,
  ...probability,
  ...statistics,
  ...linearAlgebra,
  ...calculus,
  ...optimization,
  ...geometry,
  ...abstractAlgebra,
  ...informationTheory,
  ...numerical,
  ...formal,
];

export const conceptMap: Map<string, Concept> = new Map(allConcepts.map((c) => [c.id, c]));

export const getConcept = (id: string): Concept | undefined => conceptMap.get(id);

/** All concepts in a domain, in authoring order. */
export function conceptsForDomain(domain: string): Concept[] {
  return allConcepts.filter((c) => c.domain === domain);
}

/** Top-level hub topics (topic: true) of a domain, in authoring order. */
export function topicsOf(domain: string): Concept[] {
  return conceptsForDomain(domain).filter((c) => c.topic);
}

/** Non-topic concepts whose parent is the given topic. */
export function childrenOf(parentId: string, domain: string): Concept[] {
  return allConcepts.filter((c) => c.domain === domain && c.parent === parentId && !c.topic);
}

/**
 * Concepts that don't sit under a topic (standalone, or whose parent topic
 * isn't present in this build). Kept so no content silently disappears.
 */
export function standaloneConcepts(domain: string): Concept[] {
  const topicIds = new Set(topicsOf(domain).map((t) => t.id));
  return conceptsForDomain(domain).filter((c) => {
    if (c.topic) return false;
    return !c.parent || !topicIds.has(c.parent);
  });
}

export const totalConcepts = allConcepts.length;

export const domainsWithContent = new Set(allConcepts.map((c) => c.domain));
