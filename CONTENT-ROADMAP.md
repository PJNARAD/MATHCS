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
| Practice questions | **374** — 185 easy, 144 medium, **45 hard** |
| Theorems with proofs | 85 `thm` blocks, 177 definition blocks |
| CS-application call-outs | 191 `cs` blocks |
| Interactive visualizations | 16 components, **27** used across content |
| Runnable, output-verified snippets | **61** |
| Learning paths / CS fields / books | 14 / 30 / 24 |
| Dangling cross-references | **0** |

CI enforces the good properties: every snippet's declared output is produced by
a real execution, every registered visualization must be reachable from some
concept, and the smoke test server-renders a route sample including the newest
lessons. `npm run audit` covers what the tests do not: coverage and depth.

### What was just added (this batch)

The **Asymptotics** batch — the last of the four depth passes, and the one that
closes the queue: 2 130 → **6 894 words**, 21 → 42 blocks, 8 → 18 practice.

- **`asymptotics`** (hub): what the unit-cost RAM model counts and what it hides,
  the best/average/worst table for five standard algorithms, an exact nested-loop
  count that becomes $\Theta(n^2)$, and the theorem that makes “constants do not
  matter” precise ($f \in o(g)$ loses to any constant factor eventually).
- **`asymptotic-notation`**: the definitions read as a game, a “disprove the
  bound” worked example ($n^2 \notin O(n)$), the five notations side by side
  ($O, \Omega, \Theta, o, \omega$), a truth table of true/false statements, and
  a proof that $\Theta$ is an equivalence relation.
- **`asymptotic-properties`**: the sum and product rules stated for sets of
  functions, both proved with explicit constants, the pipeline example, and an
  amortized-analysis example (dynamic-array doubling) that is the sum rule
  applied to a sequence of operations.
- **`growth-rates`**: the hierarchy with the practical “wall” table ($n^2$ at
  $10^6$ is 17 minutes, $2^n$ is unusable past $n = 40$), the limit test proved
  from the $\epsilon$-definition, polynomial/exponential separation proved by
  ratios, and an awkward-function comparison done by taking logarithms.
- **`binary-search`**: the element-search lesson now also carries a full
  “binary search on the answer” worked example (minimum ship capacity in $d$
  days), a numeric estimate of its cost, and the decision-tree lower bound
  $\lceil \log_2(n+1) \rceil$ proved — so the lesson contains the algorithm, its
  optimality, and its generalization.

Supporting changes: 10 new practice questions, 3 new verified snippets
(`growth-race`, `amortized-append`, `binary-search-halving`) — the third verifies
the halving bound numerically for every $n \le 4096$ — and a duplicate snippet id
found while adding them (`binary-search-steps` existed already), now renamed so
the uniqueness test stays meaningful. The concepts-per-domain split still has its
own section in §8.

---

## 2. Priority 0 — depth: 139 lessons are still stubs

**This is the single largest content gap.** 139 of 209 lessons have four or
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
- **Only 45 of 374 questions are hard.** The advanced half of the curriculum
  (SVD, decidability, Lagrange multipliers, channel capacity) is under-tested.
  Target ~15% hard, i.e. ~11 more hard questions. The four depth batches are the
  pattern to copy: their hard questions are almost all
  `proof` questions, and each one asks for the argument rather than the answer.
- **Thin metadata**: 58 of 374 questions have a `mistake` field (the "common
  wrong answer" hint) and 54 use `related`. Both are rendered by the practice
  component and turn a quiz into teaching — the Relations and Boolean questions
  show the intended use (`vacuous truth`, `maximal vs maximum`, "the properties
  correlate, so you cannot count choices independently").
- **No interleaved practice.** Every question lives inside its lesson. A
  `/practice` page that samples across completed lessons — the store already
  records attempts and correctness — would convert the site from a book into
  a trainer. Spaced repetition (re-surface missed questions after 1, 3, 7
  attempts) is a small amount of logic on top of existing state.

---

## 4. Priority 2 — interactivity: 216 of 243 concepts have no visualization

Only 16 visualization components exist, and the tests require every registered
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

1. **`/glossary`** — every `def` block (177 of them) as a browsable, searchable
   dictionary with a link back to its lesson. Also feeds the command palette
   (which currently indexes only pages).
2. **`/theorem-index`** — the 85 `thm` blocks with statements and proofs, grouped
   by domain, cross-linked to prerequisites. This is the site's "why the
   mathematics is true" library.
3. **`/applications`** — the 191 `cs` blocks as a "where is this used?" index,
   filterable by CS field; this is the site's strongest differentiator and today
   it is buried one scroll deep inside lessons.

Smaller reachability fixes:

- **74 concepts appear in no learning path.** Either add them to a path stage or
  mark them as reference material.
- **186 of 243 concepts have no runnable snippet.** The playground is the most
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
  `tags` on concepts, are still thin (58 and 54 of 374).
- **Difficulty balance across levels**: 48 foundational / 135 core / 60 advanced
  is healthy, but several `advanced` lessons have thin content (a level label
  that content does not back up).

---

## 8. The planned queue

The queue was a run of four depth passes over the discrete-mathematics topic
hubs, in order, plus the bundle split they made urgent. **All of it is done**: the
five discrete hubs whose lessons were outlines (Relations, Boolean algebra,
Recursion, Asymptotics) now hold 5–7 k words each, at the lesson shape in §2. The
numbers below are before → after for each pass.

What comes next is the next queue, not another row in this table: the
`ui.tsx` split and (now pressing — see the note at the end of the split section)
splitting the `discrete-2` loader entry by topic, then the domain-level work in
§2 and §3 (number-theory and linear-algebra are the biggest thin clusters).

| # | Batch | Lessons (+ hub) | Size before → after | What the pass added |
|---|---|---|---|---|
| ✅ done | **Relations** | 4 | 6 196 words, 40 blocks, 19 questions | the property families, criterion proofs, class/partition theorem, linear-extension theorem, 3 snippets |
| ✅ done | **Boolean algebra** | 4 | 1 133 → **5 089 words**, 17 → 33 blocks, 7 → 18 questions | the postulates and law table, minterm theorem, De Morgan from uniqueness of complements, {NAND} completeness, consensus + K-map work, 3 snippets |
| ✅ done | **Recursion** | 5 (`recursive-definitions`, `recurrence-relations`, `solving-recurrences`, `recursion-trees`, `dynamic-programming`) | 1 494 → **6 946 words**, 24 → 53 blocks, 7 → 18 questions | three obligations + termination-by-descent, structural induction, unrolling lemma, Master Theorem with tree proof, Binet, level-sum regime theorem, last-decision DP correctness, 5 snippets |
| ✅ done | **Asymptotics** | 4 (`asymptotic-notation`, `asymptotic-properties`, `growth-rates`, `binary-search`) | 2 130 → **6 894 words**, 21 → 42 blocks, 8 → 18 questions | RAM-model framing, the five notations and their truth table, sum/product rules proved, the limit test and $\epsilon$-proofs, the "wall" table, binary search on the answer, decision-tree lower bound, 3 snippets |
| ✅ done | **Concepts-per-domain split** | 15 domain chunks + generated index | 580.79 kB shared chunk → 115.04 kB index + lazy domains | every route stops downloading lesson bodies (see below) |

`lattice-logic` (880 words) sits under Relations and was already at depth, so it
was left alone apart from removing its stray `*italic*` markup, which the
content renderer does not support (use `**bold**` or plain prose). The first four
finished batches (Relations, Boolean algebra, Recursion, and the split itself)
are all in this PR; the three depth topics each ended with at least one snippet
per lesson.

### Lattice interactivity — done in a follow-up PR

The `lattice-logic` lesson now carries the **lattice explorer**: an interactive
Hasse-diagram component with three presets — **D₃₆** (the 3×3 exponent grid of
the divisors of 36 = 2²·3²), **D₃₀** (the cube B₃ of the divisors of
30 = 2·3·5), and **N₅** (the pentagon, the smallest non-distributive lattice).
Clicking two elements computes their meet (gcd) and join (lcm) from the same
pure functions in `src/lib/vizmath.ts` the unit tests cover, and highlights the
interval between them. A verified playground snippet (`lattice-d36`) rebuilds
the grid, its 12 cover edges, and a meet/join pair; the master guide's diagram
section (§9) gained the D₃₀ and N₅ Hasse diagrams, and its engine section
(§15) a fourth entry with a Birkhoff distributivity checker.

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
| `concepts-*.js` 580.79 kB / 198.41 kB gzip, imported by every route | `concept-index-*.js` **115.08 kB / 27.50 kB gzip**, no lesson content |
| — | 15 domain chunks (6.4 kB → **175.7 kB** raw), fetched one per concept page |
| every route downloaded all lesson bodies | **no route downloads any lesson body** |

Measured with `npm run build` + `node scripts/route-size.mjs`:

```
/books                    downloads 305.5 kB │ gzip │ lesson bodies in download: none
/playground               downloads 189.8 kB │ gzip │ lesson bodies in download: none
/paths                    downloads 311.7 kB │ gzip │ lesson bodies in download: none
/domain/discrete          downloads 302.8 kB │ gzip │ lesson bodies in download: none
/concept/partial-orders   downloads 333.2 kB │ gzip │ lesson bodies in download: none
                          + one domain chunk fetched at render time (discrete-2, 175.70 kB)
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

**What the split did not fix, and what the first batch after it revealed.**

- `ui-*.js` (779.34 kB / 138.12 kB gzip) is now the heaviest shared chunk and
  every route pays it, because `ui.tsx` holds both the shell pieces (`Icon`,
  chips, `ConceptLink`) and the lesson renderer (`BlockView`, `Practice`).
  Splitting that module is the next size win — a `/books` visitor does not need
  the block renderer — and it is a smaller, purely mechanical change than this
  one was.
- The lazy granularity is one chunk **per loader entry**, and `discrete-2` is a
  single entry covering the Boolean, Recursion and Asymptotics topics. The
  Recursion and Asymptotics batches grew it from 110.20 kB to **175.70 kB
  (59.11 kB gzip)** — the largest lazy chunk by a factor of two, and above the
  180 kB line the previous revision of this document set as the trigger. A
  concept page still fetches exactly one chunk, so nothing *broke*; the cost is
  paid by a reader of any discrete lesson. **Next batch, recommended:** split
  `src/data/concepts/discrete-2.ts` into per-topic files
  (`discrete-boolean.ts`, `discrete-recursion.ts`, `discrete-asymptotics.ts`),
  add three `DOMAIN_LOADERS` entries, and regenerate the index — a mechanical
  change, no content edits, and the guard tests already cover it (index ↔ body
  agreement, one loader per domain, no dead loaders).

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
   the two domains that sit on the most learning paths; the four discrete passes
   are the template.
5. **Split `ui.tsx`** — the shell pieces from the lesson renderer (see above).
   It is the largest remaining shared download at 138 kB gzip per route.
6. **Split `discrete-2` by topic** — see the note at the end of the split
   section; 175.70 kB raw is the one lazy chunk that is out of line.

Guardrails to keep: every batch ends with `npm run verify` (247 tests, 60
verified snippets, index freshness, SSR smoke) and `npm run audit` must report **0 dangling
references** — regressions there mean a lesson was promised and not written.

