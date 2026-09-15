# MathCS content roadmap

What is already here, what is missing, and what to write next — ordered by
impact. Every number below is produced by the audit script, not by memory:

```bash
npm run audit        # human-readable report
npm run audit:json   # machine-readable report
npm run verify       # typecheck + tests + snippet verification + SSR smoke
```

Refresh this document's numbers with `npm run audit` after any content change.

---

## 1. Where the content stands

| | |
|---|---|
| Concepts | **243** (34 hub topics, 209 lessons) |
| Domains | **15 / 15 published** |
| Practice questions | **342** — 180 easy, 130 medium, **32 hard** |
| Theorems with proofs | 71 `thm` blocks, 173 definition blocks |
| CS-application call-outs | 189 `cs` blocks |
| Interactive visualizations | 15 components, **24** used across content |
| Runnable, output-verified snippets | **49** |
| Learning paths / CS fields / books | 14 / 30 / 24 |
| Dangling cross-references | **0** |

CI enforces the good properties: every snippet's declared output is produced by
a real execution, every registered visualization must be reachable from some
concept, and the smoke test server-renders a route sample including the newest
lessons. `npm run audit` covers what the tests do not: coverage and depth.

### What was just added (this batch)

The **Relations** batch — four lessons plus the hub, brought to the
finished-lesson shape in `src/data/concepts/discrete-2.ts`:

- **`relations`** (hub): the classification table (which property combination
  names a preorder, equivalence relation, partial order, total order, lattice),
  a relational-reading example over an `orders` table, and its first practice
  questions.
- **`relation-basics`**: the counting formula ($2^{|A||B|}$ relations), a proof
  that composition is associative and that inversion reverses order, a
  matrix-multiplication worked example, and reachability/join applications.
- **`relation-properties`**: one table showing each property as pairs, matrix
  condition and digraph shape; closures (reflexive, symmetric, transitive); the
  vacuous-truth trap; proofs that transitivity is the closure condition
  $R \circ R \subseteq R$ and that symmetric + antisymmetric forces $R \subseteq \Delta$.
- **`equivalence-relations`**: the class equation, proofs that partitions
  biject with equivalence relations and that intersections (but not unions) of
  equivalence relations are equivalence relations, plus congruence, hashing and
  connected-components worked examples.
- **`partial-orders`**: Hasse diagrams, maximal vs maximum, chains and
  antichains, a proof of the linear-extension (topological ordering) theorem,
  and a divisibility-poset walkthrough that motivates lattices.

Supporting changes: 12 new practice questions (4 of them hard), 3 new verified
playground snippets (`relation-matrix`, `equivalence-classes`,
`linear-extension-count`), and `mistake`/`related` metadata on the questions
where a wrong answer is predictable. The four lessons are now the deepest on
the site (1.1k–1.6k words each) and are the reference implementation of the
"finished lesson" shape described in §2.

---

## 2. Priority 0 — depth: 148 lessons are still stubs

**This is the single largest content gap.** 148 of 209 lessons have four or
fewer content blocks — typically a definition and one CS note. The lessons are
correct but they are outlines, not teaching. The audit lists them by block count:

```bash
npm run audit | sed -n '/DEPTH/,$p'
```

Worst offenders (1–2 blocks): `differentiation-rules-calc`, `integration-techniques`,
`variance-covariance-prob`, `vector-basics`, `antiderivatives`, `ftoc`,
`definite-integral`, `diagonalization`, `basis-dimension`, `decidability`.

**Target shape for a finished lesson** (this is what the best existing lessons
do — the four Relations lessons, `divisibility-tests`, `matching`,
`binary-search`, `rsa-cryptography`):

1. `intuition` — one paragraph of plain-language motivation, no symbols.
2. `def` / `formula` — the precise statement with KaTeX.
3. `ex` — a worked example with numbered steps (224 already exist; add one to
   every lesson that lacks it).
4. `thm` with `proof` — for anything provable (71 exist). Where two theorems
   compete for space, the second one should be a *criterion* (a matrix or
   closure condition) rather than another statement.
5. `viz` — the interactive lab, where one exists.
6. `cs` — at least two concrete CS applications, with the concept name the
   application is hiding behind ("a join is composition", "the cycle check in
   Kruskal is an equivalence-class comparison").
7. `practice` — 3–4 questions including one `proof` or `numeric`, and a
   `mistake` field whenever a wrong answer is predictable.

**Suggested order** (highest-traffic domains first, since they sit on the
learning paths): number-theory (8 thin) → linear-algebra (20) → calculus (15) →
probability (13) → combinatorics (12) → graph-theory (10) → proofs (10) →
statistics (9) → formal (7) → numerical (6) → optimization (5) → geometry (5) →
abstract-algebra (5) → information-theory (5) → discrete (18, mostly short
sub-lessons under the Logic/Sets/Functions/Relations/Recursion/Asymptotics
hubs, and the current focus of the planned queue in §8).

Realistic pace: 4–5 lessons per batch, `npm run verify` after each batch. A
deepened lesson lands at 700–1,500 words of content plus practice; the four
Relations lessons are the current upper end of that range.

---

## 3. Priority 1 — practice coverage and difficulty

- **42 lessons have no practice questions at all** (`npm run audit` lists them).
  Definitions-without-exercises is the most common complaint about math sites;
  `venn-diagrams`, `matrix-basics`, `gaussian-elimination`, `rank-nullity`,
  `svd`, `turing-machines` are the most conspicuous.
- **Only 32 of 342 questions are hard.** The advanced half of the curriculum
  (SVD, decidability, Lagrange multipliers, channel capacity) is under-tested.
  Target ~15% hard, i.e. ~19 more hard questions. The Relations batch is the
  pattern to copy: its four hard questions are all `proof` questions, and each
  one asks for the *argument* rather than the answer.
- **Thin metadata**: 30 of 342 questions have a `mistake` field (the "common
  wrong answer" hint) and 11 use `related`. Both are rendered by the practice
  component and turn a quiz into teaching — the Relations questions show the
  intended use (`vacuous truth`, `maximal vs maximum`, "the properties
  correlate, so you cannot count choices independently").
- **No interleaved practice.** Every question lives inside its lesson. A
  `/practice` page that samples across completed lessons — the store already
  records attempts and correctness — would convert the site from a book into
  a trainer. Spaced repetition (re-surface missed questions after 1, 3, 7
  attempts) is a small amount of logic on top of existing state.

---

## 4. Priority 2 — interactivity: 219 of 243 concepts have no visualization

Only 15 visualization components exist, and the tests require every registered
one to be reachable from content. Best next candidates, each tied to concepts
that already exist and are heavily linked:

| Proposed visualization | Concepts it would serve |
|---|---|
| Union–find forest with compression animation | `union-find`, `kruskal-prims` |
| Residual-graph flow lab (augmenting paths, min cut) | `maximum-flow`, `max-flow-min-cut`, `network-flow` |
| Alternating-path matching explorer | `matching`, `bipartite-graphs` |
| Eigenvector/PCA playground (drag data, see axes) | `eigenvalues-eigenvectors`, `svd`, `pca-eigen-applications` |
| Derivative/integral slider (secants → tangent, Riemann sums) | `derivative`, `definite-integral`, `ftoc` |
| Matrix decomposition stepper (LU / QR / Gaussian elimination) | `gaussian-elimination`, `identity-inverses`, `determinants` |
| DFA/NFA simulator with regex input | `finite-automata`, `regular-languages` |
| Bayes net / conditional-probability tree | `conditional-probability`, `bayes-theorem` |
| Cryptographic toy (RSA, Diffie–Hellman, elliptic curve) | `rsa-cryptography`, `elliptic-curves`, `finite-fields` |
| Interpolation & error lab (floating point, stability) | `numerical-stability`, `floating-point`, `interpolation` |

Reuse the existing `VizShell` and visual tokens so dark mode keeps working;
`snippets:verify`-style discipline applies: the math shown must come from the
`src/lib/*` functions the tests already cover.

---

## 5. Priority 3 — reachability of what already exists

Content that is invisible to readers is content that does not exist. Three
high-leverage pages can be generated **from data already in the repo**:

1. **`/glossary`** — every `def` block (173 of them) as a browsable, searchable
   dictionary with a link back to its lesson. Also feeds the command palette
   (which currently indexes only pages).
2. **`/theorem-index`** — the 71 `thm` blocks with statements and proofs, grouped
   by domain, cross-linked to prerequisites. This is the site's "why the
   mathematics is true" library.
3. **`/applications`** — the 189 `cs` blocks as a "where is this used?" index,
   filterable by CS field; this is the site's strongest differentiator and today
   it is buried one scroll deep inside lessons.

Smaller reachability fixes:

- **74 concepts appear in no learning path.** Either add them to a path stage or
  mark them as reference material.
- **194 of 243 concepts have no runnable snippet.** The playground is the most
  distinctive part of the site; snippets are cheap to add (a snippet is ~15
  lines plus a verified output via `npm run snippets:write`).
- **`/progress`** — dashboard over the existing store: completed lessons per
  domain, practice accuracy, bookmarks, streak.
- **Per-domain printable cheat sheets** generated from `formula` + `def` blocks
  (the print stylesheet already exists via the concept page's `p` shortcut).
- **Shareability/SEO**: no `og:`/`twitter:` tags, no `sitemap.xml`, no
  `robots.txt`; page titles do not update per route. Cheap, external-facing win.

---

## 6. Priority 4 — new lesson topics per domain

The domains are live but unevenly deep. Topics that are currently missing and
are commonly expected by CS students (concept ids suggested):

- **discrete**: `amortized-analysis`, `lower-bounds`, `countability`,
  `diagonalization`, `cardinality`, `randomized-analysis`
- **graph-theory**: `strongly-connected-components`, `bridges-articulation`,
  `spectral-graph-theory`, `random-graphs`, `centrality-measures`,
  `tsp-approximation`
- **number-theory**: `quadratic-residues`, `primitive-roots`,
  `continued-fractions`, `pell-equation`
- **probability**: `concentration-inequalities` (Markov, Chebyshev, Chernoff),
  `randomized-algorithms`, `martingales`, `poisson-process`
- **statistics**: `causal-inference`, `experimental-design`,
  `regression-diagnostics`, `multiple-testing`
- **linear-algebra**: `lu-qr-decompositions`, `conditioning`,
  `graph-laplacian`, `matrix-calculus`, `tensors`
- **calculus**: `jacobian-hessian`, `vector-calculus`, `differential-equations`
- **optimization**: `kkt-duality`, `integer-programming`, `momentum-and-adam`,
  `stochastic-optimization`
- **geometry**: `quaternions-rotations`, `bezier-curves`,
  `barycentric-coordinates`, `voronoi-delaunay`, `projective-geometry`
- **abstract-algebra**: `cosets-lagrange`, `group-actions`, `homomorphisms`,
  `galois-theory-intro`, `reed-solomon-codes`
- **information-theory**: `kolmogorov-complexity`, `arithmetic-coding`,
  `rate-distortion`, `channel-coding-bounds`
- **numerical**: `fast-fourier-transform`, `eigenvalue-algorithms`,
  `sparse-linear-algebra`, `condition-number`
- **formal**: `pumping-lemma`, `np-completeness-reductions`, `rice-theorem`,
  `lambda-calculus`
- **proofs**: `invariants-monovariants`, `proof-by-construction`,
  `automated-theorem-proving`, `well-ordering-equivalents`
- **combinatorics**: `probabilistic-method`, `polya-counting`,
  `integer-partitions`, `matroids`, `extremal-combinatorics`

Domains currently under 8 concepts — `geometry` (6), `abstract-algebra` (6),
`information-theory` (6), `optimization` (7), `numerical` (7) — should reach the
size of `probability` (16+) before any brand-new domain is considered.

---

## 7. Priority 5 — integrity chores

- **Merge near-duplicates** (`npm run audit` flags them by slug similarity):
  `variance-covariance` vs `variance-covariance-prob`,
  `differentiation-rules` vs `differentiation-rules-calc`,
  `minimum-spanning-trees` vs `spanning-trees` (legitimately distinct — keep),
  plus `law-of-large-numbers` vs `law-of-large-numbers-stat` and
  `factors-multiples` vs `factors-and-multiple`.
- **Review the copied-suffix lessons** (`-calc`, `-prob`, `-stat`) — they look
  like accidental forks left by earlier authoring passes.
- **Reference metadata**: `mistake` and `related` fields on questions, and
  `tags` on concepts, are still thin (30 and 11 of 342).
- **Difficulty balance across levels**: 48 foundational / 135 core / 60 advanced
  is healthy, but several `advanced` lessons have thin content (a level label
  that content does not back up).

---

## 8. The planned queue

The current plan is a run of four depth passes over the discrete-mathematics
topic hubs, in order — each one takes a topic whose lessons are still outlines
and brings every lesson to the shape in §2. Sizes below are the *current*
content volume of each topic, so the table doubles as a thinness ranking.

| # | Batch | Lessons (+ hub) | Current size | What the pass adds |
|---|---|---|---|---|
| ✅ done | **Relations** | 4 | 6 196 words (after) | properties, classes, orders, criterion proofs, 12 questions, 3 snippets |
| 1 | **Boolean algebra** | 4 (`boolean-basics`, `de-morgans-laws`, `logic-gates`, `boolean-simplification`) | 1 133 words | proofs of the algebraic laws from the postulates, NAND/NOR universality, K-map worked examples, adder/mux hardware applications |
| 2 | **Recursion** | 5 (`recursive-definitions`, `recurrence-relations`, `solving-recurrences`, `recursion-trees`, `dynamic-programming`) | 1 494 words | structural-induction proofs, Master-Theorem case proofs, characteristic equations, recursion-tree sums, DP correctness and overlapping-subproblem criteria |
| 3 | **Asymptotics** | 4 (`asymptotic-notation`, `asymptotic-properties`, `growth-rates`, `binary-search`) | 2 130 words | limit-based proofs, counterexamples for the common errors, lower-bound arguments, the loop invariant and "binary search on the answer" |

`lattice-logic` (880 words) sits under Relations and was already at depth, so it
was left alone apart from removing its stray `*italic*` markup, which the
content renderer does not support (use `**bold**` or plain prose).

### Concepts-per-domain splitting (schedule after Boolean algebra)

The bundle is lazy-loaded per route, but the concept registry is not: every
lazy page that touches a concept imports `src/lib/concepts.ts`, which
statically pulls all 19 domain files. Measured with `npm run build` after the
Relations batch:

```
dist/assets/concepts-*.js   556.70 kB │ gzip: 190.07 kB   ← shared by nearly every route
dist/assets/ui-*.js         779.36 kB │ gzip: 138.12 kB
dist/assets/snippets-*.js    46.65 kB │ gzip:  16.40 kB
```

Every future content batch makes that shared chunk bigger, and it is paid for
by routes that need none of it (`/books`, `/playground`, the command palette's
index). Splitting it is now cheaper than after three more batches.

The shape of the work:

1. Add a generated **concept index** (`id → {title, domain, level, summary,
   prerequisites, related, next, hasPractice, hasSnippet}`) emitted by a script
   into a small `src/data/concept-index.ts`. The audit script already walks the
   same fields, so the generator can be extracted from `scripts/audit.ts`.
2. Point `ConceptLink`, the command palette, search, `/paths`, `/fields` and the
   home page at the index — they need titles and links, not lesson bodies.
3. Keep the domain files as the content source and load them through
   `import('../data/concepts/<domain>')`, resolved by an explicit
   `Record<domain, () => Promise<Concept[]>>` map (Vite cannot glob into a
   static `import()` anyway, and the explicit map keeps the chunk names stable).
4. `ConceptPage` and `DomainPage` become async: `useEffect` + cache, with the
   existing `Suspense` fallback and `Loading lesson` copy as the pending state.
   `getConcept(id)` stays synchronous *against the loaded cache* so the UI layer
   does not need a refactor — only the two pages that need bodies become async.
5. Tests: `tests/run.ts`, `tests/smoke.tsx` and `scripts/audit.ts` keep importing
   the static registry (they are not shipped), so they need only a renamed import
   path. Add one guard test that a domain module is not imported by
   `concept-index.ts`.

Success criterion: `/books` and `/playground` no longer download any lesson
bodies; `/concept/<id>` downloads one domain file instead of all nineteen; the
concepts chunk in `npm run build` splits into 19 domain chunks plus the index.

### Other backlog (unchanged)

1. **Glossary + theorem index pages** (~1 session, generated from 173 existing
   `def`/`thm` blocks) — new surfaces with no new authoring.
2. **Practice for the 42 lesson gaps** (~1 session) — every lesson then teaches
   and tests.
3. **The three graph-theory visualizations** (union–find, flow-residual,
   matching) — the newest lessons are the most interactive-needy and the graph
   engine already exists. A relation/Hasse-diagram lab would be the natural
   fifth, since the Relations lessons are the only topic of the four passes
   with no interactivity at all.
4. **Depth pass on number-theory and linear-algebra** (8 + 20 thin lessons) —
   the two domains that sit on the most learning paths.

Guardrails to keep: every batch ends with `npm run verify` (229 tests, 49
verified snippets, SSR smoke) and `npm run audit` must report **0 dangling
references** — regressions there mean a lesson was promised and not written.

