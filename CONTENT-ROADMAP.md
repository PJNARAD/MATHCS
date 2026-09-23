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
| Practice questions | **401** — 196 easy, 154 medium, **51 hard** — all ids globally unique |
| Theorems / definitions | **92** `thm` blocks (**90** with written proofs), **178** `def` blocks |
| CS-application call-outs | **197** `cs` blocks · **460** individual call-outs |
| Interactive visualizations | 16 components, **27** used across content |
| Runnable, output-verified snippets | **63** |
| Learning paths / CS fields / books | 14 / 30 / 24 |
| Reader surfaces | 12 routes — lessons plus trainer, dashboard and three generated libraries |
| Guardrails | **391** assertions, 5 generated files checked for staleness, CI on every PR |
| Dangling cross-references | **0** |

CI (`.github/workflows/verify.yml`) enforces the good properties: every snippet's
declared output is produced by a real execution, every registered visualization
must be reachable from some concept, the smoke test server-renders a route sample
including the newest lessons, all five generated files must match the content,
and `npm run gates` fails a build in which any route downloads a lesson body or
a chunk outgrows its budget. `npm run audit` covers what the tests do not:
coverage and depth.

### What was just added (this batch)

The **learner surfaces + generated library + CI** batch. No new lesson prose: it
ships five routes built from content that already existed, the continuous
integration the roadmap had been promising, and the guardrails that keep them
honest. Test count 281 → **391**.

- **`/practice`** — the interleaved trainer §3 asked for. Questions are drawn
  from all 401 across every lesson, filtered by mode (smart review / new /
  missed / everything), domain, difficulty and scope (whole curriculum, lessons
  finished, lessons saved), and ordered by `src/lib/srs.ts`: a miss returns
  immediately, a success returns after 1, then 3, then 7 days. One question at a
  time, answered in place, with a session summary that lists what comes back.
- **`/progress`** — the dashboard over the store: completion per domain,
  practice accuracy per domain, a 28-day activity strip and streak, path
  progress, saved and recently opened lessons, "needs work" (lowest accuracy
  with at least three attempts), "closest to finished" and a **read next** list
  computed from prerequisites (`src/lib/progress.ts`, pure and tested).
- **`/glossary`** — all **178** `def` blocks as an A–Z dictionary with a search
  box that reads definition text, a domain filter and a jump-to-letter rail.
- **`/theorems`** — all **92** `thm` blocks, **90** with their proof steps
  behind the same disclosure a lesson uses, grouped by domain, with a
  "only theorems with a written proof" filter.
- **`/applications`** — all **460** `cs` call-outs, filterable by any of the 30
  CS fields, grouped by field (or by domain once a field is chosen). The site's
  differentiator is no longer buried one scroll deep inside a lesson.

Every library entry deep-links to the exact block it came from
(`/concept/partial-orders#section-definition-partial-order`); the anchors are
produced by the same `buildOutline()` that renders them, and a test fails if an
entry ever points at a block with no anchor.

**How the new pages stay cheap.** They need slices of content that no other route
needs, so each slice is generated into its own file and read through a suspending
loader (`src/lib/reference-loader.ts`), exactly like the concept index:

| Generated slice | Entries | gzip | Downloaded by |
|---|---|---|---|
| `glossary-index.ts` | 178 | 21.07 kB | `/glossary` only |
| `theorem-index.ts` | 92 | 24.11 kB | `/theorems` only |
| `applications-index.ts` | 460 | 31.11 kB | `/applications` only |
| `practice-index.ts` | 401 | **4.20 kB** | `/practice`, `/progress` |

The practice manifest carries question *metadata* only — id, lesson, domain,
difficulty, type — so a session is scheduled without downloading anything, and
each question's text arrives with the single domain chunk it belongs to. Loading
every domain chunk instead would have cost ≈675 kB raw for one glossary visit.
`npm run refindex:write` regenerates all four; `npm test` and
`npm run refindex:verify` fail if any is stale, and `npm run gates` fails if a
slice stops being lazily imported or outgrows its budget.

**Store v3.** `mathcs-progress-v3` adds what a streak and a schedule need:
`dayStamps` (local activity days, capped at 730) and richer practice records
(`right`, `wrong`, `lastCorrect`, `lastAt`). v1 and v2 payloads migrate on read —
an old record that only knew "ever correct, 2 attempts" is reconstructed as one
success and one miss rather than dropped — and `loadProgress` now walks all three
keys newest-first.

**A bug the manifest exposed.** Practice results are keyed by question id, and
22 ids were shared between two or three lessons (`bs-p1` belonged to
binary-search, boolean-simplification *and* bayesian-statistics; `der-p1` to
derangements and derivative), so answering one silently marked another. Renaming
23 ids across 14 lessons made all **401 unique**, and "practice question ids are
globally unique" is now a test.

**CI.** `.github/workflows/verify.yml` runs typecheck, the 391 assertions,
snippet-output verification, both index freshness checks and the SSR smoke on
every push to `main` and every pull request, then builds and runs
`scripts/ci-gates.mjs`: zero dangling references, every domain published, no
orphan concepts, no route downloads a lesson body, the initial shell contains no
lesson body and no generated slice, every slice is reached only through a dynamic
`import()`, and ten chunk budgets (ratchets set just above today's size, meant to
be lowered as `ui.tsx` and `discrete-2` are split). `npm run ci` is the same
sequence locally.

### Previous batch: the Calculus core

The first depth pass outside discrete, aimed at the five worst stubs in the
audit: calculus 784 → **3 509 words**, 7 → **34 practice** questions (6 new hard
`proof` questions), and the depth list 139 → **133**.

- **`differentiation-rules`**: intuition, the chain rule in Leibniz form, full
  proofs of the product rule and the chain rule (using the helper-function
  argument that avoids dividing by zero), a chain-inside-product example, and
  the sigmoid derivative $\sigma' = \sigma(1-\sigma)$ with the vanishing-gradient
  consequence.
- **`differentiation-rules-calc`** was a one-line alias flagged as a near-duplicate.
  It is now a distinct lesson, **The Chain Rule on Computation Graphs**: one
  neuron differentiated by hand and checked by finite differences, forward vs
  reverse mode, and the cheap-gradient theorem proved. The near-duplicate pair is gone.
- **`antiderivatives`**: “antiderivatives differ by a constant” proved from the MVT
  (including why the interval hypothesis matters for $\ln|x|$), and projectile
  motion from acceleration to position.
- **`definite-integral`**: $\int_0^1 x^2$ from the definition, a left/right/midpoint
  table, and the theorem that monotone functions are integrable.
- **`ftoc`**: both parts proved, Part I combined with the chain rule, the
  $\int_{-1}^1 x^{-2}$ trap, and prefix sums / integral images as the discrete FTC.
- **`integration-techniques`**: parts and substitution proved from product/chain +
  FTC, three worked examples, and a “which technique?” table.

Supporting changes: 2 new verified snippets (`riemann-convergence`, which produces
the Riemann table in the lesson, and `backprop-gradient-check`).

---

## 2. Priority 0 — depth: 133 lessons are still stubs

**This is the single largest content gap.** 133 of 209 lessons have four or
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

- **37 lessons have no practice questions at all** (`npm run audit` lists them;
  51 concepts including hub topics). Definitions-without-exercises is the most
  common complaint about math sites; `venn-diagrams`, `matrix-basics`,
  `gaussian-elimination`, `rank-nullity`, `svd`, `turing-machines` are the most
  conspicuous. These lessons are also invisible to `/practice`, which can only
  ask what exists.
- **Only 51 of 401 questions are hard (12.7%).** The advanced half of the
  curriculum (SVD, decidability, Lagrange multipliers, channel capacity) is
  under-tested. Target ~15% hard, i.e. ~10 more hard questions. The four depth
  batches are the pattern to copy: their hard questions are almost all `proof`
  questions, and each one asks for the argument rather than the answer. By type
  the pool is 147 `short`, 116 `numeric`, 79 `proof`, 36 `mcq`, 23 `truefalse` —
  the trainer asks all five, but only the last two can be graded without the
  learner marking themselves.
- **Thin metadata**: 65 of 401 questions have a `mistake` field (the "common
  wrong answer" hint) and 57 use `related`. Both are rendered by the practice
  component and turn a quiz into teaching — the Relations and Boolean questions
  show the intended use (`vacuous truth`, `maximal vs maximum`, "the properties
  correlate, so you cannot count choices independently").
- ~~**No interleaved practice.**~~ **Done — `/practice` ships.** Questions are
  drawn across every lesson and ordered by `src/lib/srs.ts`: a miss returns
  immediately, a success returns after 1, then 3, then 7 days. Modes are smart
  review / new only / missed only / everything, filtered by domain, difficulty
  and scope (whole curriculum, lessons finished, lessons saved), and
  `/practice?domain=calculus&mode=missed` is a shareable link the dashboard uses
  for its "needs work" rows. What is still missing is the content side of this
  bullet: 37 lessons have no questions to contribute, and only 51 of 401 are
  hard.

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
high-leverage pages **generated from data already in the repo** — all three now
ship, plus the dashboard:

1. ~~**`/glossary`**~~ **Done** — all 178 `def` blocks as a searchable A–Z
   dictionary (the search reads definition text, not just the term), with a
   domain filter, a jump-to-letter rail and a deep link to the source block. All
   five new routes are in the command palette.
2. ~~**`/theorems`**~~ **Done** — all 92 `thm` blocks, 90 of them with their
   proof steps behind the lesson's own disclosure, grouped by domain. This is the
   site's "why the mathematics is true" library.
3. ~~**`/applications`**~~ **Done** — all 460 `cs` call-outs, filterable by any
   of the 30 CS fields.
4. ~~**`/progress`**~~ **Done** — completion and accuracy per domain, streak and
   activity strip, path progress, saved and recent lessons, weakest domains and a
   prerequisite-aware "read next" list.

What reachability still needs:

- **Tags are populated on 0 of 243 concepts.** `ConceptPage` renders
  `concept.tags` chips and `search.ts` indexes them as keywords, so the feature
  is dead code until the field is filled. It is generated-index-friendly (the
  serializer already carries `tags`) and would give the library pages a second
  filtering axis.
- **Search cannot see inside a lesson.** The palette matches titles, summaries
  and keywords only: "Hasse" appears in 3 lesson bodies and returns none of them,
  "vacuous" in 4. A generated body index — the same trick the glossary uses, one
  lazy chunk — would fix it.
- **The header has no small-screen layout.** Brand + search + six nav links +
  two controls with no breakpoint handling; the nav now scrolls instead of
  overflowing, which is a patch, not a design.
- **No `og:`/`twitter:` tags, no `sitemap.xml`, no `robots.txt`** for 243
  indexable lesson URLs plus five new library routes.

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

- **Merge near-duplicates.** `npm run audit` now flags exactly two pairs by slug
  similarity: `variance-covariance` vs `variance-covariance-prob` and
  `minimum-spanning-trees` vs `spanning-trees` (the latter legitimately distinct
  — keep). `differentiation-rules-calc` was rewritten as its own lesson in the
  Calculus batch, and `law-of-large-numbers`/`-stat` and
  `factors-multiples`/`factors-and-multiple` no longer trip the threshold, but
  they are still worth a read for overlap.
- **Review the copied-suffix lessons** (`-calc`, `-prob`, `-stat`) — they look
  like accidental forks left by earlier authoring passes. Two of them
  (`variance-covariance-prob`, `law-of-large-numbers-stat`) are 1–2 block stubs,
  so merging them into their siblings would also shrink the depth list.
- **Reference metadata**: `mistake` and `related` are on 65 and 57 of 401
  questions, and **`tags` are on 0 of 243 concepts** — the concept page renders
  tag chips and the palette indexes them as search keywords, so that field is
  currently dead weight in both.
- **Practice ids are unique again** (this batch): 22 ids were shared between
  lessons, which made one answer write two records. A test now fails if any two
  questions anywhere in the curriculum share an id — keep new ids prefixed with
  something specific to the lesson (`bsimp-p1`, not `bs-p1`).
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

### Other backlog

1. **Practice for the 37 lesson gaps** (~1 session) — every lesson then teaches
   and tests, and `/practice` stops having empty corners of the curriculum.
2. **Depth pass on number-theory and linear-algebra** (8 + 20 thin lessons) —
   the two domains that sit on the most learning paths; the four discrete passes
   are the template.
3. **The three graph-theory visualizations** (union–find, flow-residual,
   matching) — the newest lessons are the most interactive-needy and the graph
   engine already exists. A relation/Hasse-diagram lab would be the natural
   fifth, since the Relations lessons are the only topic of the four passes
   with no interactivity at all.
4. **Split `ui.tsx`** — the shell pieces from the lesson renderer (see above).
   It is the largest remaining shared download at 138 kB gzip per route, and
   `npm run gates` now holds a 150 kB ratchet on it: lower the budget when the
   split lands.
5. **Split `discrete-2` by topic** — see the note at the end of the split
   section; 176.24 kB raw / 59.38 kB gzip is the one lazy chunk that is out of
   line, and the gate holds it at 65 kB.
6. **Populate `tags`** on concepts and add a **full-text body index** for the
   palette (both described in §5).
7. **SEO and sharing**: `sitemap.xml`, `robots.txt`, per-route `og:`/`twitter:`
   meta for 243 lessons and five library routes.
8. **Learner data portability**: export/import progress as JSON, and per-lesson
   notes. The store is versioned and migrated, so both are additive.

Guardrails to keep: every batch ends with `npm run ci` (391 tests, 63 verified
snippets, five generated files checked for staleness, SSR smoke over every route
including the five new ones, then a build and the delivery gates) and
`npm run audit` must report **0 dangling references** — regressions there mean a
lesson was promised and not written. After any content change, regenerate both
index families:

```bash
npm run index:write && npm run refindex:write && npm run ci
```

