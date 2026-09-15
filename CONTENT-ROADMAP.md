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
| Practice questions | **330** — 178 easy, 124 medium, **28 hard** |
| Theorems with proofs | 66 `thm` blocks, 171 definition blocks |
| CS-application call-outs | 189 `cs` blocks |
| Interactive visualizations | 15 components, **24** used across content |
| Runnable, output-verified snippets | **46** |
| Learning paths / CS fields / books | 14 / 30 / 24 |
| Dangling cross-references | **0** |

CI enforces the good properties: every snippet's declared output is produced by
a real execution, every registered visualization must be reachable from some
concept, and the smoke test server-renders a route sample including the newest
lessons. `npm run audit` covers what the tests do not: coverage and depth.

### What was just added (this batch)

The audit found ten cross-links pointing at concepts that did not exist — the
curriculum was promising lessons it never wrote (`network-flow → maximum-flow`,
`bipartite-graphs → matching`, `dot-product → cosine-similarity`,
`partial-orders → lattice-logic`, `root-finding → binary-search`,
`minimum-spanning-trees → kruskal-prims, union-find`, …). All ten now resolve:

- **Graph theory** (`src/data/concepts/graph-algorithms.ts`): Kruskal & Prim,
  Union–Find, Maximum Flow, Max-Flow Min-Cut, Bipartite Matching & Hall's theorem.
- **Linear algebra**: Cosine Similarity and Vector Angles.
- **Discrete math**: Lattices (meets, joins, Knaster–Tarski, dataflow analysis)
  and Binary Search and the Logarithmic Bound.
- 23 new practice questions, 4 new verified playground snippets
  (union–find, binary search, cosine similarity, Edmonds–Karp), 6 books filling
  the statistics/geometry/abstract-algebra gaps, and roadmap copy on the home
  page and footer corrected (the old text still claimed domains were "on the
  roadmap" with 15/15 live).

---

## 2. Priority 0 — depth: 152 lessons are still stubs

**This is the single largest content gap.** 152 of 209 lessons have four or
fewer content blocks — typically a definition and one CS note. The lessons are
correct but they are outlines, not teaching. The audit lists them by block count:

```bash
npm run audit | sed -n '/DEPTH/,$p'
```

Worst offenders (1–2 blocks): `differentiation-rules-calc`, `integration-techniques`,
`variance-covariance-prob`, `vector-basics`, `antiderivatives`, `ftoc`,
`definite-integral`, `diagonalization`, `basis-dimension`, `decidability`.

**Target shape for a finished lesson** (this is what the best existing lessons
do — see `network-flow`, `minimum-spanning-trees`, `rsa-cryptography`):

1. `intuition` — one paragraph of plain-language motivation, no symbols.
2. `def` / `formula` — the precise statement with KaTeX.
3. `ex` — a worked example with numbered steps (208 already exist; add one to
   every lesson that lacks it).
4. `thm` with `proof` — for anything provable (63 exist).
5. `viz` — the interactive lab, where one exists.
6. `cs` — at least two concrete CS applications.
7. `practice` — 2–3 questions including one `proof` or `numeric`.

**Suggested order** (highest-traffic domains first, since they sit on the
learning paths): number-theory (8 thin) → linear-algebra (20) → calculus (15) →
probability (13) → combinatorics (12) → graph-theory (10) → proofs (10) →
statistics (9) → formal (7) → numerical (6) → optimization (5) → geometry (5) →
abstract-algebra (5) → information-theory (5) → discrete (27, mostly short
sub-lessons under Logic/Sets/Functions hubs).

Realistic pace: 5–8 lessons per batch, `npm run verify` after each batch.

---

## 3. Priority 1 — practice coverage and difficulty

- **42 lessons have no practice questions at all** (`npm run audit` lists them).
  Definitions-without-exercises is the most common complaint about math sites;
  `venn-diagrams`, `matrix-basics`, `gaussian-elimination`, `rank-nullity`,
  `svd`, `turing-machines` are the most conspicuous.
- **Only 28 of 330 questions are hard.** The advanced half of the curriculum
  (SVD, decidability, Lagrange multipliers, channel capacity) is under-tested.
  Target ~15% hard, i.e. ~22 more hard questions.
- **Almost no metadata**: 21 of 330 questions have a `mistake` field (the
  "common wrong answer" hint) and **0** use `related`. Both are rendered by the
  practice component and turn a quiz into teaching.
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

1. **`/glossary`** — every `def` block (171 of them) as a browsable, searchable
   dictionary with a link back to its lesson. Also feeds the command palette
   (which currently indexes only pages).
2. **`/theorem-index`** — the 66 `thm` blocks with statements and proofs, grouped
   by domain, cross-linked to prerequisites. This is the site's "why the
   mathematics is true" library.
3. **`/applications`** — the 189 `cs` blocks as a "where is this used?" index,
   filterable by CS field; this is the site's strongest differentiator and today
   it is buried one scroll deep inside lessons.

Smaller reachability fixes:

- **74 concepts appear in no learning path.** Either add them to a path stage or
  mark them as reference material.
- **197 of 243 concepts have no runnable snippet.** The playground is the most
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
  `tags` on concepts, are almost unused (21 and 0 of 330).
- **Difficulty balance across levels**: 48 foundational / 135 core / 60 advanced
  is healthy, but several `advanced` lessons have thin content (a level label
  that content does not back up).

---

## 8. Recommended next batch

If the goal is the largest visible improvement per unit of writing:

1. **Glossary + theorem index pages** (~1 session, generated from 237 existing
   `def`/`thm` blocks) — new surfaces with no new authoring.
2. **Practice for the 42 lesson gaps** (~1 session) — every lesson then teaches
   and tests.
3. **The three graph-theory visualizations** (union–find, flow-residual,
   matching) — the newest lessons are the most interactive-needy and the graph
   engine already exists.
4. **Depth pass on number-theory and linear-algebra** (8 + 20 thin lessons) —
   the two domains that sit on the most learning paths.

Guardrails to keep: every batch ends with `npm run verify` (229 tests, 46+
verified snippets, SSR smoke) and `npm run audit` must report **0 dangling
references** — regressions there mean a lesson was promised and not written.
