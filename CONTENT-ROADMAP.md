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
| Route payload | **no route downloads lesson bodies** (see §8) |
| Domains | **15 / 15 published** |
| Practice questions | **353** — 182 easy, 135 medium, **36 hard** |
| Theorems with proofs | 74 `thm` blocks, 174 definition blocks |
| CS-application call-outs | 190 `cs` blocks |
| Interactive visualizations | 15 components, **24** used across content |
| Runnable, output-verified snippets | **52** |
| Learning paths / CS fields / books | 14 / 30 / 24 |
| Dangling cross-references | **0** |

CI enforces the good properties: every snippet's declared output is produced by
a real execution, every registered visualization must be reachable from some
concept, and the smoke test server-renders a route sample including the newest
lessons. `npm run audit` covers what the tests do not: coverage and depth.

### What was just added (this batch)

The **Boolean algebra** batch — the hub and its four child lessons, brought to
the finished-lesson shape (the same treatment the Relations batch received):

- **`boolean-algebra`** (hub): the five postulates, the “one algebra, four
  readings” table (bits / propositions / sets / gates), the multiplexer example
  read four ways, and its first practice questions.
- **`boolean-basics`**: the full law table as dual pairs, a proof of the minterm
  (sum-of-products) expansion, a truth-table-to-canonical-form worked example,
  and a proof of idempotence from the postulates alone.
- **`de-morgans-laws`**: a proof from the postulates via uniqueness of
  complements, negation push-down in a query planner, and the automata contrast
  (negating a formula is free; complementing a DFA needs determinization).
- **`logic-gates`**: gate table, a constructive proof that {NAND} is
  functionally complete, a full adder assembled gate by gate, and gate-library
  vocabulary (fan-in, depth, tri-state) plus the Apollo NOR-gate history note.
- **`boolean-simplification`**: the laws that do the work, the consensus theorem
  with proof, a 3-variable K-map minimization (ten literals → one), a
  don’t-care example, and the warning that two-level minimization is NP-hard.

Supporting changes: 11 new practice questions (4 hard, all `proof`), 3 new
verified playground snippets (`boolean-laws`, `nand-universal`,
`kmap-minimize`), and the removal of the last stray `*italic*` markup in this
topic — the content renderer supports `**bold**`, `code`, and math only.

---

## 2. Priority 0 — depth: 144 lessons are still stubs

**This is the single largest content gap.** 144 of 209 lessons have four or
fewer content blocks — typically a definition and one CS note. The lessons are
correct but they are outlines, not teaching. The audit lists them by block count:

```bash
npm run audit | sed -n '/DEPTH/,$p'
```

Worst offenders (1–2 blocks): `differentiation-rules-calc`, `integration-techniques`,
`variance-covariance-prob`, `vector-basics`, `antiderivatives`, `ftoc`,
`definite-integral`, `diagonalization`, `basis-dimension`, `decidability`.

**Target shape for a finished lesson** (this is what the best existing lessons
do — the nine Relations and Boolean algebra lessons, `divisibility-tests`, `matching`,
`binary-search`, `rsa-cryptography`):

1. `intuition` — one paragraph of plain-language motivation, no symbols.
2. `def` / `formula` — the precise statement with KaTeX.
3. `ex` — a worked example with numbered steps (229 already exist; add one to
   every lesson that lacks it).
4. `thm` with `proof` — for anything provable (74 exist). Where two theorems
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
- **Only 36 of 353 questions are hard.** The advanced half of the curriculum
  (SVD, decidability, Lagrange multipliers, channel capacity) is under-tested.
  Target ~15% hard, i.e. ~17 more hard questions. The Relations and Boolean
  batches are the pattern to copy: their eight hard questions are all `proof`
  questions, and each one asks for the argument rather than the answer.
- **Thin metadata**: 36 of 353 questions have a `mistake` field (the "common
  wrong answer" hint) and 11 use `related`. Both are rendered by the practice
  component and turn a quiz into teaching — the Relations and Boolean questions
  show the intended use (`vacuous truth`, `maximal vs maximum`, "the properties
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

1. **`/glossary`** — every `def` block (174 of them) as a browsable, searchable
   dictionary with a link back to its lesson. Also feeds the command palette
   (which currently indexes only pages).
2. **`/theorem-index`** — the 74 `thm` blocks with statements and proofs, grouped
   by domain, cross-linked to prerequisites. This is the site's "why the
   mathematics is true" library.
3. **`/applications`** — the 190 `cs` blocks as a "where is this used?" index,
   filterable by CS field; this is the site's strongest differentiator and today
   it is buried one scroll deep inside lessons.

Smaller reachability fixes:

- **74 concepts appear in no learning path.** Either add them to a path stage or
  mark them as reference material.
- **191 of 243 concepts have no runnable snippet.** The playground is the most
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
  `tags` on concepts, are still thin (36 and 18 of 353).
- **Difficulty balance across levels**: 48 foundational / 135 core / 60 advanced
  is healthy, but several `advanced` lessons have thin content (a level label
  that content does not back up).

---

## 8. The planned queue

The current plan is a run of four depth passes over the discrete-mathematics
topic hubs, in order — each one takes a topic whose lessons are still outlines
and brings every lesson to the shape in §2. Sizes below are the *current*
content volume of each topic, so the table doubles as a thinness ranking.

| # | Batch | Lessons (+ hub) | Size before → after | What the pass added |
|---|---|---|---|---|
| ✅ done | **Relations** | 4 | 6 196 words, 40 blocks, 19 questions | the property families, criterion proofs, class/partition theorem, linear-extension theorem, 3 snippets |
| ✅ done | **Boolean algebra** | 4 | 1 133 → **5 089 words**, 17 → 33 blocks, 7 → 18 questions | the postulates and law table, minterm theorem, De Morgan from uniqueness of complements, {NAND} completeness, consensus + K-map work, 3 snippets |
| 1 | **Recursion** | 5 (`recursive-definitions`, `recurrence-relations`, `solving-recurrences`, `recursion-trees`, `dynamic-programming`) | 1 494 words | structural-induction proofs, Master-Theorem case proofs, characteristic equations, recursion-tree sums, DP correctness and overlapping-subproblem criteria |
| 2 | **Asymptotics** | 4 (`asymptotic-notation`, `asymptotic-properties`, `growth-rates`, `binary-search`) | 2 130 words | limit-based proofs, counterexamples for the common errors, lower-bound arguments, the loop invariant and "binary search on the answer" |
| ✅ done | **Concepts-per-domain split** | 15 domain chunks + generated index | 580.79 kB shared chunk → 114.93 kB index + lazy domains | every route stops downloading lesson bodies (see below) |

`lattice-logic` (880 words) sits under Relations and was already at depth, so it
was left alone apart from removing its stray `*italic*` markup, which the
content renderer does not support (use `**bold**` or plain prose). Both finished
batches are also the two topics that now have a snippet per lesson.

### Concepts-per-domain splitting — done in this batch

**The problem.** The bundle was lazy-loaded per route, but the concept registry
was not: every page that touched a concept imported `src/lib/concepts.ts`, which
statically pulled all nineteen domain files into one shared chunk. That chunk was
556.70 kB (190.07 kB gzip) after the Relations pass and 580.79 kB (198.41 kB
gzip) after Boolean algebra — +24 kB from one batch of five lessons, paid for by
every route, including `/books` and `/playground`, which need none of it.

**The split.**

| Before | After |
|---|---|
| `concepts-*.js` 580.79 kB / 198.41 kB gzip, imported by every route | `concept-index-*.js` **114.93 kB / 27.47 kB gzip**, no lesson content |
| — | 15 domain chunks (6.4 kB → 110.2 kB raw), fetched one per concept page |
| every route downloaded all lesson bodies | **no route downloads any lesson body** |

Measured with `npm run build` + `node scripts/route-size.mjs`:

```
/books                    downloads 305.5 kB │ gzip │ lesson bodies in download: none
/playground               downloads 186.8 kB │ gzip │ lesson bodies in download: none
/paths                    downloads 311.6 kB │ gzip │ lesson bodies in download: none
/domain/discrete          downloads 302.8 kB │ gzip │ lesson bodies in download: none
/concept/partial-orders   downloads 330.3 kB │ gzip │ lesson bodies in download: none
                          + one domain chunk fetched at render time (discrete-2)
```

**How it works.**

1. `src/lib/concept-index-file.ts` — the index shape (`ConceptIndexEntry`) and
   the serializer that turns real content into the generated file.
2. `src/data/concept-index.ts` — **generated** by `npm run index:write`
   (243 entries: id, title, domain, level, summary, topic/parent, csFields,
   prerequisites/related/next, practice and block counts). `npm test` and
   `npm run index:verify` both fail if it goes stale.
3. `src/lib/concept-loader.ts` — the shipped access path: `conceptInfo(id)` for
   titles/summaries, `conceptsInDomain` / `topicsInDomain` / `childrenOfTopic` /
   `standaloneInDomain` for the domain pages, and the lazy body readers
   `readConcept(id)` (suspends, React Suspense) and `loadConcept(id)` (promise).
   The domain modules are reached only through `import('../data/concepts/…')`,
   with an explicit loader map so chunk names stay stable.
4. `ConceptPage` renders `readConcept(id)`; SSR streams it correctly because
   `renderToPipeableStream`'s `onAllReady` waits for the thrown promise, so a
   lesson can still never render as an empty shell — `tests/smoke.tsx` keeps
   asserting that. `DomainPage` needs no async at all now: it reads the index.
5. `src/lib/concepts.ts` stays as the static registry for tests and scripts, and
   a guard test fails if any module under `src/` imports it.

**Guardrails added** (18 new assertions in `tests/run.ts`): the committed index
matches a fresh serialization; ids/titles/domains/levels/counts agree with the
registry; no shipped module imports the registry; the shipped index imports no
domain module; the loader uses only dynamic `import()`; every domain in the index
has a loader and no loader is dead weight; `readConcept` suspends before load,
returns synchronously after, and returns `undefined` for unknown ids; every
domain loads a body whose title and block count match its index entry.

**What the split did not fix.** `ui-*.js` is now the heaviest shared chunk
(779.34 kB / 138.12 kB gzip) and every route pays it, because `ui.tsx` holds both
the shell pieces (`Icon`, chips, `ConceptLink`) and the lesson renderer
(`BlockView`, `Practice`). Splitting that module is the next size win — a
`/books` visitor does not need the block renderer — and it is a smaller, purely
mechanical change than this one was.

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
   the two domains that sit on the most learning paths, and the two that now
   also carry the heaviest lazy chunks (number-theory 105 kB, linear-algebra
   26 kB raw).
5. **Split `ui.tsx`** — the shell pieces from the lesson renderer (see above).
   It is the largest remaining shared download at 138 kB gzip per route.

Guardrails to keep: every batch ends with `npm run verify` (229 tests, 52
verified snippets, SSR smoke) and `npm run audit` must report **0 dangling
references** — regressions there mean a lesson was promised and not written.

