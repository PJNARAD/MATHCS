import type { Concept } from '../types';

// ---------------------------------------------------------------------------
// GRAPH THEORY — 3: MST algorithms, union–find, max flow, min cut, matching.
//
// These lessons fill the gaps the rest of the curriculum already pointed at:
// `minimum-spanning-trees` links to kruskal-prims and union-find, `network-flow`
// links to maximum-flow, max-flow-min-cut and matching, and `bipartite-graphs`
// links to matching. Until this file existed those links were dead ends.
// ---------------------------------------------------------------------------

export const gtMstAlgorithms: Concept[] = [
  {
    id: 'kruskal-prims',
    title: 'Kruskal’s and Prim’s Algorithms',
    domain: 'graph-theory',
    parent: 'minimum-spanning-trees',
    summary:
      'The two greedy algorithms that build a minimum spanning tree: Kruskal sorts edges and unions components (union–find), Prim grows one tree outward from a root (priority queue). Both are correct by the same cut property.',
    level: 'core',
    csFields: ['algorithms-dsa', 'competitive-programming', 'computer-networks', 'distributed-systems'],
    prerequisites: ['minimum-spanning-trees'],
    related: ['minimum-spanning-trees', 'union-find', 'dijkstra'],
    next: ['union-find'],
    content: [
      {
        t: 'intuition',
        text: 'The MST problem asks for the cheapest set of edges that connects everything. Greed is provably optimal here — but there are two different greedy orders, and they feel completely different. Kruskal works **globally**: consider the cheapest edge in the whole graph; keep it unless it closes a cycle. Prim works **locally**: stand at one vertex and repeatedly take the cheapest edge that leaves the territory you have already claimed. Both are correct because of the cut property — the cheapest edge across any cut must be in some MST.',
      },
      {
        t: 'def',
        title: 'Kruskal’s algorithm',
        text: 'Sort the edges by weight. Scan them in increasing order and add an edge iff its endpoints are in different components (test and merge with union–find). Stop after n − 1 edges. Correctness: at the moment an edge $e$ is accepted, $e$ is the lightest edge across the cut separating its two components, so the cut property forces it into every MST (of the contracted graph, hence of the original one). Complexity: $O(E \\log E)$ for the sort, plus near-constant union–find work — the sort dominates.',
      },
      {
        t: 'ex',
        title: 'Kruskal on a six-vertex graph',
        steps: [
          'Vertices A…F. Edges sorted: BC 2, DE 2, AD 3, CF 3, AB 4, EF 4, BD 5, BE 7, AC 8.',
          'Take BC (2) → {B,C}.',
          'Take DE (2) → {D,E}.',
          'Take AD (3) → merges {A} with {D,E} → {A,D,E}.',
          'Take CF (3) → merges {B,C} with {A,D,E,F?} — at this point F is alone, so CF joins F to {B,C}: {B,C,F}.',
          'Take AB (4)? A and B are already connected (A–D–E … D–E; and B–C–F; wait: A connects to B via A–D–E? no) — after AD, components are {A,D,E} and {B,C,F}: AB joins them at cost 4, giving 5 edges. F? F is in {B,C,F}; the tree is complete.',
          'Total = 2 + 2 + 3 + 3 + 4 = 14. The edges AB, BC, CF, AD, DE form the MST — EF (4) and AC (8) would close cycles.',
        ],
        result: 'Five edges for six vertices: always n − 1 edges in a spanning tree.',
      },
      {
        t: 'def',
        title: 'Prim’s algorithm',
        text: 'Start from any vertex; mark it visited. Repeatedly add the lightest edge from a visited vertex to an unvisited one, and mark the new vertex visited. Every added edge is lightest across the cut (visited, unvisited), so the cut property again certifies optimality. With a binary heap the running time is $O(E \\log V)$; with a Fibonacci heap, $O(E + V \\log V)$.',
      },
      {
        t: 'table',
        title: 'Which algorithm when',
        head: ['', 'Kruskal', 'Prim'],
        rows: [
          ['Grows', 'a forest (many components that merge)', 'one tree from a root'],
          ['Data structure', 'sorted edge list + union–find', 'priority queue of crossing edges'],
          ['Complexity', 'O(E log E) — mostly the sort', 'O(E log V) with a binary heap'],
          ['Best for', 'sparse graphs; when edges arrive pre-sorted; distributed settings', 'dense graphs; adjacency-matrix implementations'],
          ['Natural output', 'minimum spanning forest (works on disconnected graphs too)', 'requires a connected graph'],
        ],
      },
      {
        t: 'viz', id: 'graph-editor', props: { preset: 'mst' },
      },
      {
        t: 'callout', kind: 'insight',
        text: 'Kruskal and Prim are the same theorem wearing different clothes. Both add an edge only when it is provably the lightest across some cut: Kruskal’s cut is “this component versus everything else it might join”, Prim’s is “the grown tree versus the unexplored remainder”. Dijkstra completes the family — identical to Prim except that it minimizes distance-from-source rather than edge weight, which is why Prim and Dijkstra look nearly the same in code and solve different problems.',
      },
      {
        t: 'cs', items: [
          { area: 'Clustering', how: 'Run Kruskal and stop before the last k − 1 edges: you have k clusters (single-linkage clustering) — the standard trick in image segmentation and market segmentation.' },
          { area: 'Distributed MST', how: 'Borůvka’s algorithm — the third classic, which Kruskal generalizes — is the basis of distributed and parallel MST algorithms because each component can merge simultaneously without global sorting.' },
          { area: 'Approximation', how: 'The MST is the first step of the 2-approximation for metric TSP, and the skeleton of Steiner-tree approximations.' },
        ],
      },
    ],
    practice: [
      { id: 'kp-p1', q: 'A connected weighted graph has 12 vertices and all edge weights distinct. How many edges does Kruskal add, and how many does it reject?', type: 'numeric', diff: 'easy', answer: '11 added; every other edge is rejected',
        explain: 'Any spanning tree on 12 vertices has exactly 11 edges; Kruskal stops once 11 are accepted.',
      },
      { id: 'kp-p2', q: 'On a dense graph (E ≈ V²), which algorithm is usually faster in practice, and why?', type: 'short', diff: 'medium',
        answer: 'Prim with a priority queue. Kruskal’s O(E log E) pays for sorting a quadratic number of edges (log E ≈ 2 log V), while Prim’s O(E log V) touches each edge once and uses a heap of size V.',
        explain: 'On dense graphs E log V beats E log E; on sparse graphs the two are nearly tied and Kruskal’s simplicity wins.',
      },
      { id: 'kp-p3', q: 'Run Prim from A on: AB 1, AC 4, BC 2, BD 3, CD 5. Give the edges chosen and the total weight.', type: 'short', diff: 'medium',
        answer: 'From A the only edge is AB (1) → tree {A,B}. Cheapest crossing edge: BC (2) → {A,B,C}. Crossing now: AC 4, BD 3, CD 5 → take BD (3). MST = {AB, BC, BD}, total 6. (Kruskal gives the same tree: AB 1, BC 2, BD 3, then AC/CD rejected.)',
        explain: 'Both algorithms can pick different intermediate edges, but both end at the same weight — and here the same tree, since the weights are distinct.',
      },
    ],
  },
  {
    id: 'union-find',
    title: 'Union–Find (Disjoint Set Union)',
    domain: 'graph-theory',
    parent: 'kruskal-prims',
    summary:
      'The data structure for “which group is this element in?”: parent pointers, union by size or rank, and path compression. Amortized O(α(n)) per operation — effectively constant for any n that fits in memory.',
    level: 'core',
    csFields: ['algorithms-dsa', 'competitive-programming', 'databases', 'compilers'],
    prerequisites: ['trees', 'kruskal-prims'],
    related: ['kruskal-prims', 'minimum-spanning-trees', 'equivalence-relations'],
    content: [
      {
        t: 'intuition',
        text: 'Union–find maintains a partition of a set under two operations: `find(x)` — which group is x in? — and `union(x, y)` — merge two groups. The naive implementation is a forest of parent pointers where the root is the group’s name; the party trick is that two cheap optimizations make the amortized cost essentially constant. This is why Kruskal’s algorithm is “really” just a sort: the union–find maintenance is invisible next to it.',
      },
      {
        t: 'def',
        title: 'The operations',
        text: 'Each element has a pointer to its parent; a root points to itself and names the component. $\\texttt{find}(x)$ walks parent pointers to the root. $\\texttt{union}(x, y)$ calls find on both and points one root at the other. Everything hinges on keeping the trees shallow.',
      },
      {
        t: 'props',
        title: 'The two optimizations',
        items: [
          { title: 'Union by size (or rank)', text: 'Attach the smaller tree under the larger root. This alone bounds tree height by $\\log n$: the depth of any element at most doubles each time it is moved, and it can only be moved $\\log n$ times.' },
          { title: 'Path compression', text: 'During `find(x)`, point every visited node directly at the root. Future finds on those nodes are one step. This flattens the tree during normal use, so the structure pays for itself.' },
          { title: 'Together: inverse Ackermann', text: 'Union by rank plus path compression gives an amortized $O(\\alpha(n))$ per operation, where $\\alpha$ is the inverse Ackermann function. $\\alpha(n) \\le 4$ for every n smaller than the number of atoms in the observable universe — so “linear-time” algorithms that use union–find are linear in practice.' },
        ],
      },
      {
        t: 'formula',
        name: 'Amortized cost',
        latex: 'T(n) = O(m \\cdot \\alpha(n)), \\qquad \\alpha(n) \\le 4 \\text{ for all practical } n',
        note: 'm operations on n elements. The bound is not A(k) but α — the inverse of the Ackermann function — and it is tight: Tarjan showed Ω(α(n)) is achievable.',
      },
      {
        t: 'ex',
        title: 'Kruskal’s bookkeeping, step by step',
        steps: [
          'Start: each of {A, B, C, D} is its own singleton component.',
          'union(A, B): sizes 1 and 1 → attach B under A. Components: {A,B}, {C}, {D}.',
          'union(C, D): attach D under C. Components: {A,B}, {C,D}.',
          'find(A) = A, find(C) = C → different, so an edge A–C would be accepted and union(A, C) merges the two: sizes 2 and 2 → attach C under A.',
          'Now a later edge B–C: find(B) walks B → A (root), find(C) walks C → A (root) — same component, so the edge is rejected as a cycle.',
        ],
        result: 'Two finds per edge plus one union per accepted edge — that is the entire cost of Kruskal beyond sorting.',
      },
      {
        t: 'callout', kind: 'history',
        text: 'Union–find was invented by Bernard Galler and Michael Fischer in 1964 and analyzed by Robert Tarjan in 1975, who proved the α(n) bound and its optimality. It is one of the oldest “amortized analysis” results — a data structure whose cost is not per-operation constant but provably near-constant on average over any sequence, which is all an algorithm ever needs.',
      },
      {
        t: 'cs', items: [
          { area: 'Query optimization', how: 'Databases maintain equivalence classes of columns (equalities from WHERE clauses) with union–find to eliminate redundant joins.' },
          { area: 'Compilers', how: 'Alias analysis, unification in type inference, and register allocation coalescing all reason over “these two things are the same” partitions.' },
          { area: 'Image processing', how: 'Connected-component labeling of pixels is a union–find sweep over neighbouring pixels.' },
          { area: 'Network tools', how: 'Incremental connectivity: adding edges while asking “are u and v connected?” is union–find — the online version of Kruskal.' },
        ],
      },
    ],
    practice: [
      { id: 'uf-p1', q: 'Start with singletons {1}…{6}. Apply: union(1,2), union(3,4), union(1,3), union(5,6). Then find(4). What is the answer?', type: 'numeric', diff: 'easy', answer: '1 (the root of the component {1,2,3,4})',
        explain: 'After the three unions, 1–2, 3–4 and the two pairs merged all live in one component with root 1 under union by size; 5–6 form a separate component.',
      },
      { id: 'uf-p2', q: 'Why does union by size alone bound the height of every tree by log₂ n?', type: 'proof', diff: 'medium',
        answer: 'An element’s depth increases by 1 only when its tree is attached under another root, and that happens only when the other tree is at least as large. So each depth increase at least doubles the size of the component containing the element. Since the size never exceeds n, there can be at most log₂ n such doublings — the depth is ≤ log₂ n.',
        explain: 'The doubling argument is the standard potential/monotonicity proof for the log bound; path compression only makes depths smaller.',
      },
      { id: 'uf-p3', q: 'Kruskal’s algorithm runs on a graph with 10⁶ edges. Roughly what fraction of its running time is union–find work?', type: 'short', diff: 'medium',
        answer: 'A negligible fraction: the sort is Θ(E log E) ≈ 10⁶ · 20 = 2 × 10⁷ elementary steps, while 10⁶ union–find operations cost about 10⁶ · α(n) ≤ 4 × 10⁶ near-constant steps. So the sort is the algorithm; union–find is the bookkeeping.',
        explain: 'This is why Kruskal is described as “sort, then sweep” — the α(n) factor never changes the asymptotic picture.',
      },
    ],
  },
];

export const gtFlowAlgorithms: Concept[] = [
  {
    id: 'maximum-flow',
    title: 'Maximum Flow: Ford–Fulkerson and Edmonds–Karp',
    domain: 'graph-theory',
    parent: 'network-flow',
    summary:
      'How a max flow is actually computed: build the residual graph, find an augmenting path, push the bottleneck, repeat. Ford–Fulkerson picks any path; Edmonds–Karp insists on shortest paths for an O(VE²) bound; Dinic adds level graphs.',
    level: 'advanced',
    csFields: ['algorithms-dsa', 'computer-networks', 'competitive-programming', 'theoretical-cs'],
    prerequisites: ['network-flow'],
    related: ['network-flow', 'max-flow-min-cut', 'matching', 'dijkstra'],
    next: ['max-flow-min-cut'],
    content: [
      {
        t: 'intuition',
        text: 'Greedily saturating paths is not enough — a bad early choice can block the optimal flow. The fix is the single most important idea in flow theory: allow **undoing**. The residual graph records, for each edge, how much more can be pushed forward and how much of the current flow can be pushed back. An augmenting path in the residual graph is a legal modification of the flow, and “keep augmenting until no path exists” is exactly Ford–Fulkerson.',
      },
      {
        t: 'def',
        title: 'Residual graph and augmenting path',
        text: 'Given a flow $f$ on a network with capacities $c$, the **residual capacity** of edge $(u,v)$ is $c_f(u,v) = c(u,v) - f(u,v)$ forward, plus $f(v,u)$ on the reverse edge (the amount of flow that can be cancelled). The **residual graph** contains every edge with positive residual capacity. An **augmenting path** is an s–t path in it; its **bottleneck** is the minimum residual capacity along the path. Pushing the bottleneck along the path keeps conservation and capacities valid and increases the flow value by exactly that bottleneck.',
      },
      {
        t: 'ex',
        title: 'Why a reverse edge is the whole trick',
        steps: [
          'Network: s→a (10), s→b (10), a→b (1), a→t (10), b→t (10). Greedy picks s→a→b→t and pushes 1 (bottleneck a→b).',
          'Now s→a can push 9 more, but a→b is saturated: naive augmentation stalls at flow 1 + 9 = 10 (s→a→t) or 9 (s→b→t)… total 19 with the first unit.',
          'With residual edges: augment s→b→a→t. The edge b→a exists only because 1 unit of flow uses a→b — pushing along b→a cancels it.',
          'Cancel that unit and reroute: s→a→t gets 10, s→b→t gets 10, total 20 — the min cut {s}→{a,b} has capacity 20, so this is optimal.',
        ],
        result: 'Choosing badly early is harmless: augmentation can always undo it. That is why the greedy loop is correct.',
      },
      {
        t: 'props',
        title: 'The algorithm family',
        items: [
          { title: 'Ford–Fulkerson (1956)', text: 'Any augmenting path (typically DFS). Terminates with a max flow when capacities are integers, in at most $f^*$ augmentations where $f^*$ is the max flow value — exponential in the input size in the worst case, since $f^*$ can be huge. With irrational capacities it can even fail to terminate.' },
          { title: 'Edmonds–Karp (1972)', text: 'Always augment along a **shortest** (fewest-edges) path, found by BFS. Then the shortest-path length never decreases, and the number of augmentations is bounded by $O(VE)$ — polynomial regardless of capacities. Total: $O(VE^2)$.' },
          { title: 'Dinic (1970)', text: 'Build the level graph (BFS distances), push blocking flows along it, repeat. $O(V^2E)$, and $O(E\\sqrt{V})$ on unit-capacity networks — which is why Hopcroft–Karp for bipartite matching is Dinic in disguise.' },
          { title: 'Push–relabel', text: 'Instead of paths, move “excess” locally downhill in a height labelling. $O(V^3)$ worst case, often the fastest in practice on dense networks.' },
        ],
      },
      {
        t: 'table',
        title: 'Complexity at a glance',
        head: ['Algorithm', 'Augmentation rule', 'Bound'],
        rows: [
          ['Ford–Fulkerson', 'any path', 'O(E · f*) — pseudo-polynomial'],
          ['Edmonds–Karp', 'shortest path (BFS)', 'O(V E²)'],
          ['Dinic', 'blocking flow in a level graph', 'O(V² E); O(E√V) for unit capacities'],
          ['Push–relabel', 'local excess/discharge', 'O(V³)'],
        ],
      },
      {
        t: 'callout', kind: 'warning',
        text: 'Integrality is automatic, not an extra assumption: if all capacities are integers, every augmentation pushes an integer bottleneck, so the algorithm returns an integer max flow. That innocent fact is the engine behind assignment problems, bipartite matching, and the integrality half of max-flow min-cut. It also explains the classic pitfall — capacities like 10⁹ make $f^*$ augmentations unthinkable, so use Edmonds–Karp or Dinic, not naive DFS.',
      },
      {
        t: 'cs', items: [
          { area: 'Network provisioning', how: 'Bandwidth planning asks “what is the max throughput from this data centre?” — run Dinic and also report the min cut, which names the exact links to upgrade.' },
          { area: 'Assignment and scheduling', how: 'Tasks to machines, workers to shifts, packets to time slots: all are bipartite matchings, which are max flows with unit capacities.' },
          { area: 'Image segmentation', how: 'Graph-cut segmentation solves one min-cut per image; the cut edges are exactly the object boundaries.' },
          { area: 'Data engineering', how: 'Project selection, maximum closure, and fair allocation problems reduce to min cut — a workhorse transformation in operations research.' },
        ],
      },
    ],
    practice: [
      { id: 'mf-p1', q: 's→a capacity 3, a→t capacity 2, s→b capacity 2, b→t capacity 3, a→b capacity 1. What is the max flow from s to t?', type: 'numeric', diff: 'medium', answer: '4',
        explain: 'The cut ({s,a,b},{t}) has capacity 2 + 3 = 5; the cut ({s},{a,b,t}) has capacity 5 too. Direct push: s→a→t (2) + s→b→t (2) = 4, and a→t/b→t saturate at 2 each… precisely, t can receive at most 2 (a→t) + 3 (b→t) = 5, but s can send at most 3 + 2 = 5. Compute: push s→b→t = 2, s→a→t = 2 (a→t full). Residual: s→a has 1 left, a→b has 1, b→t has 1 left → augment s→a→b→t by 1 more: total 5. Min cut {s}: 3 + 2 = 5. Max flow = 5.',
      },
      { id: 'mf-p2', q: 'Why does Ford–Fulkerson with ordinary DFS fail to run in polynomial time even on integer capacities?', type: 'short', diff: 'hard',
        answer: 'Its augmentation bound is O(E · f*) — proportional to the value of the flow on the edge, not to the number of bits needed to write the capacities. A network with capacities in the billions can therefore need billions of augmentations, each cheap, so the running time is pseudo-polynomial. Edmonds–Karp’s shortest-path rule caps the count at O(VE) and removes the dependence on f*.',
        explain: 'Pseudo-polynomial means “polynomial in the numbers, not in the encoded input size”. Choosing the right augmenting path is what fixes it.',
      },
      { id: 'mf-p3', q: 'An augmenting path in the residual graph uses the reverse of edge e. What does that mean physically?', type: 'short', diff: 'medium',
        answer: 'It means the algorithm is cancelling some of the flow currently carried by e — rerouting those units elsewhere. Push–back through a reverse edge is the mathematical expression of “undo a previous decision”, and it is what allows a greedy algorithm to reach the global optimum.',
        explain: 'Residual reverse edges represent the reversible part of the current flow, which is why augmentation never traps the search.',
      },
    ],
  },
  {
    id: 'max-flow-min-cut',
    title: 'Max-Flow Min-Cut: Duality and Its Corollaries',
    domain: 'graph-theory',
    parent: 'maximum-flow',
    summary:
      'The value of a maximum flow equals the capacity of a minimum cut. The theorem is a dual certificate: a flow is optimal exactly when some cut is saturated, which is why it powers Menger, Hall, and linear-programming duality.',
    level: 'advanced',
    csFields: ['theoretical-cs', 'algorithms-dsa', 'computer-networks', 'competitive-programming'],
    prerequisites: ['maximum-flow'],
    related: ['network-flow', 'maximum-flow', 'matching', 'linear-programming'],
    next: ['matching'],
    content: [
      {
        t: 'intuition',
        text: 'Flows and cuts are opposites: a flow is a **packing** problem (how much can I route?), a cut is a **covering** problem (how cheaply can I block every route?). No flow can exceed any cut — obvious. The theorem says the best packing and the cheapest blocking are exactly equal, so a provably optimal flow comes with a matching certificate of optimality: the saturated cut. This pattern — optimum of one problem equals optimum of its dual — reappears as LP duality, and flow is where it is easiest to see.',
      },
      {
        t: 'def',
        title: 'Cut',
        text: 'A **cut** $(S, T)$ of a flow network partitions the vertices with $s \\in S$ and $t \\in T$. Its **capacity** is the sum of the capacities of the edges from S to T: $c(S,T) = \\sum_{u \\in S, v \\in T} c(u,v)$. A **minimum cut** is one of least capacity. (Edges from T to S do not count — even though a real flow can push back along them, the net contribution is non-positive.)',
      },
      {
        t: 'thm',
        name: 'Max-flow min-cut theorem (Ford–Fulkerson)',
        statement: 'For every flow network, the maximum flow value equals the minimum cut capacity.',
        proofTitle: 'Proof',
        proof: [
          '**(Weak duality.)** For any flow f and any cut (S, T), the net flow across the cut equals the value of f: flow is conserved at every internal vertex, so all internal cancellations vanish and only the net s-side outflow survives.',
          'Bound it: net flow across (S,T) is at most the sum of the capacities of edges S → T, because reverse flow subtracts and cannot help. So value(f) ≤ c(S,T) for every f and every cut: max flow ≤ min cut.',
          '**(Achieving equality.)** Run any max-flow algorithm to completion and let f be the result; define S as the set of vertices reachable from s in the residual graph, and T as the rest.',
          'By definition t ∉ S (otherwise another augmenting path exists and f is not maximal), so (S,T) is a cut.',
          'No residual edge goes from S to T — that would make its head reachable. Hence every original edge u → v with u ∈ S, v ∈ T is saturated: f(u,v) = c(u,v).',
          'Also every edge v → u from T to S carries zero flow (else its residual reverse edge would cross S → T). So the net flow across the cut is exactly the sum of the saturated forward capacities: value(f) = c(S,T).',
          'Therefore max flow = value(f) = c(S,T) ≥ min cut, which with weak duality gives equality.',
        ],
      },
      {
        t: 'props',
        title: 'Corollaries you have already met',
        items: [
          { title: 'Menger’s theorem', text: 'The maximum number of pairwise edge-disjoint s–t paths equals the minimum number of edges whose removal disconnects s from t — read off by giving every edge capacity 1. The vertex version follows by splitting each vertex into in/out with capacity 1.' },
          { title: 'Hall’s marriage theorem', text: 'A bipartite graph has a perfect matching on the left iff every set of left vertices has at least as many neighbours. It follows from max flow on the unit-capacity assignment network: a deficient set of left vertices is exactly a small cut.' },
          { title: 'König’s theorem', text: 'In a bipartite graph, max matching = min vertex cover, again via flow/min-cut. (In general graphs, matching is still polynomial but needs blossom techniques — the flow reduction is bipartite magic.)' },
          { title: 'LP duality', text: 'Max flow is a linear program and min cut is its dual; the theorem says both optima coincide, which is strong duality for this pair. Flow is the friendliest introduction to why duality works at all.' },
        ],
      },
      {
        t: 'analogy',
        title: 'The water-and-pipes picture',
        text: 'Water flows from a source to a sink through pipes of fixed diameters. The maximum throughput is limited by the narrowest “bottleneck cross-section” — a set of pipes whose removal separates source from sink. Max-flow min-cut says there is always a cross-section whose total diameter exactly matches the throughput you achieved: no slack between what you can push and what could be blocked.',
      },
      {
        t: 'cs', items: [
          { area: 'Network resilience', how: 'Min cut = the smallest set of links whose failure disconnects the network (edge connectivity) — the number an operator wants to raise by adding redundancy. With unit capacities the same computation gives link-disjoint backup paths.' },
          { area: 'Bottleneck diagnosis', how: 'When a flow is saturated, the residual-reachable set names the bottleneck: those crossing edges are precisely what to upgrade. This is how capacity planning reports “why” and not just “how much”.' },
          { area: 'Computer vision', how: 'Min-cut on a pixel graph with source/sink terminals is graph-cut segmentation and stereo matching — combinatorial optimisation carrying the load in image processing.' },
          { area: 'Competitive programming', how: 'The reduction toolkit: bipartite matching, project selection, maximum closure, and dag partitioning are all “build a flow network, read the min cut” exercises.' },
        ],
      },
    ],
    practice: [
      { id: 'mc-p1', q: 'A network has source capacity 6 out of s and sink capacity 5 into t. What are the bounds on the max flow?', type: 'short', diff: 'easy',
        answer: 'Both are upper bounds on the max flow: the cut {s} vs rest has capacity 6, and the cut rest vs {t} has capacity 5. So max flow ≤ 5, and equality is attained iff a flow of 5 can be routed without internal bottlenecks — which is exactly what the algorithm checks.',
        explain: 'Capacity into the sink is always a cut; so is capacity out of the source. The smaller one caps the answer immediately.',
      },
      { id: 'mc-p2', q: 'After running a max-flow algorithm on a small network, the residual graph has reachable-from-s set {s, a, b}. What is the max flow value if all edges from {s,a,b} to {c, t} are saturated with total capacity 7?', type: 'numeric', diff: 'medium', answer: '7',
        explain: 'The reachable set defines the min cut; the saturated forward edges have total capacity equal to the max flow by the theorem.',
      },
      { id: 'mc-p3', q: 'Explain why Menger’s theorem is “max-flow min-cut with unit capacities”.', type: 'short', diff: 'hard',
        answer: 'Give every edge capacity 1. An integral max flow decomposes into edge-disjoint unit s–t paths (flow conservation at internal vertices means each unit entering leaves; following units yields paths), so flow value = number of edge-disjoint paths. A cut of capacity k is a set of k edges meeting every s–t path, i.e. a disconnecting set. The theorem max flow = min cut therefore says max edge-disjoint paths = min disconnecting edges — Menger exactly.',
        explain: 'The reduction is the prototype for turning a structural question about paths into an optimisation question about capacities.',
      },
    ],
  },
  {
    id: 'matching',
    title: 'Bipartite Matching and Hall’s Theorem',
    domain: 'graph-theory',
    parent: 'bipartite-graphs',
    summary:
      'Pairing left vertices with right vertices using disjoint edges. Augmenting paths give a polynomial algorithm; Hall’s condition characterizes when everyone can be matched; König ties matching to vertex cover.',
    level: 'advanced',
    csFields: ['algorithms-dsa', 'theoretical-cs', 'competitive-programming', 'computer-networks'],
    prerequisites: ['bipartite-graphs', 'maximum-flow'],
    related: ['bipartite-graphs', 'network-flow', 'maximum-flow', 'graph-coloring'],
    content: [
      {
        t: 'intuition',
        text: 'Bipartite matching is the mathematics of assignment: workers to jobs, students to schools, ads to slots, packets to switch outputs. The shape of the problem is always the same — two sides, edges that mean “these two can be paired”, and the goal of pairing as many as possible without sharing. Because the graph is bipartite, the greedy “take any free edge” fails but a patient improvement step (augmenting paths) succeeds, and the whole thing reduces to max flow.',
      },
      {
        t: 'def',
        title: 'Matching',
        text: 'A **matching** M in a graph is a set of edges no two of which share a vertex. In a bipartite graph $G = (L \\cup R, E)$ a matching pairs each matched left vertex with a distinct right vertex. A **maximum matching** has the largest possible size; a **perfect matching** (on the left) matches every vertex of L. An **augmenting path** for M is a path that starts and ends at unmatched vertices and alternates unmatched/matched edges — flipping M along such a path increases the matching by one.',
      },
      {
        t: 'thm',
        name: 'Hall’s marriage theorem',
        statement: 'A bipartite graph with parts L and R has a matching saturating L iff for every subset S ⊆ L, |N(S)| ≥ |S|, where N(S) is the set of neighbours of S.',
        proofTitle: 'Proof sketch (the flow/min-cut route)',
        proof: [
          'Build the unit-capacity network: source → each left vertex (capacity 1), each left vertex → each of its neighbours in R (capacity 1), each right vertex → sink (capacity 1).',
          'A matching saturating L exists iff this network has a flow of value |L| (an integral flow decomposes into unit paths, i.e. a matching, and conversely).',
          'By max-flow min-cut, flow |L| is impossible iff some cut has capacity < |L|.',
          'Take any cut (S,T). Let A ⊆ L be left vertices on the sink side and B ⊆ R the right vertices on the source side. The cut’s capacity is |L \\ A| (source edges to A) + |B| (right→sink edges) + edges from L∩S to R\\B that are not present… carefully: an edge from a left vertex in S to a right vertex not in S would cross the cut, but infinite? No — such an edge has capacity 1 and only matters when the head is on the sink side. The minimal choice for a given B forces all left vertices whose neighbours lie inside B to be on the sink side as well; that set is exactly N⁻¹(B).',
          'So the cut capacity is |L| − |S| + |N(S)| for the set S = L \\ A, and it is < |L| precisely when |N(S)| < |S|.',
          'Conclusion: a matching saturating L fails exactly when some S has |N(S)| < |S|. That is Hall’s condition, proved by flow duality.',
        ],
      },
      {
        t: 'ex',
        title: 'An augmenting path in action',
        steps: [
          'Left {1, 2, 3}: 1 can take {a, b}, 2 can take {a}, 3 can take {b}.',
          'Greedy: match 1–a. Then 2 has only a (taken) — no free edge.',
          'Augmenting path from 2: 2 → a (matched edge a–1) → 1 → b (free). Flip it: 2–a, 1–b. Matching size grows from 1 to 2.',
          'Now all three left vertices: 3 wants b, which is taken by 1, whose only alternatives are a — taken by 2, whose only alternative is a. No augmenting path exists, so the maximum matching has size 2.',
        ],
        result: 'Hall’s certificate: S = {2, 3} has N(S) = {a, b}, |N(S)| = 2 = |S|; but S = {1, 2, 3} has N(S) = {a, b}, and 2 < 3 — so no matching saturates L. The visual "stuck" state is exactly a deficient set.',
      },
      {
        t: 'props',
        title: 'Around the theorem',
        items: [
          { title: 'König’s theorem', text: 'In a bipartite graph, the maximum matching size equals the minimum vertex cover size. (In general graphs equality fails: a triangle has matching 1 and vertex cover 2.) The proof is again the min-cut of the assignment network.' },
          { title: 'Algorithm', text: 'Repeatedly search for an augmenting path (BFS/DFS alternating through matched edges). Each augmentation adds one to the matching; the search is linear in edges, giving $O(VE)$ total — the Hungarian-style augmenting-path algorithm that predates flow theory.' },
          { title: 'Hopcroft–Karp', text: 'Find a maximal set of shortest augmenting paths at once (a blocking flow in the unit-capacity network). $O(E\\sqrt{V})$ — the standard competitive-programming implementation, and literally Dinic specialised to unit capacities.' },
          { title: 'Weighted version', text: 'The assignment problem asks for a maximum-weight perfect matching. The Hungarian algorithm solves it in $O(V^3)$ and is the same alternating-path idea with potentials; it is the standard solver behind min-cost routing and resource allocation.' },
        ],
      },
      {
        t: 'cs', items: [
          { area: 'Job assignment', how: 'Assign applicants to positions or tasks to machines respecting eligibility — the canonical bipartite matching, with Hungarian for “best overall” rather than “most pairs”.' },
          { area: 'Switch scheduling', how: 'Input-queued routers match input ports to output ports every time slot (iSLIP and friends) to keep throughput high; each slot is one more matching.' },
          { area: 'Ad allocation and markets', how: 'Online ad slots to advertisers, and stable-marriage-style school choice, are matchings with preferences — the area of market design.' },
          { area: 'Proofs about graphs', how: 'Hall’s condition certifies the existence of systems of distinct representatives, and appears as a lemma inside results on regular bipartite decompositions and latin squares.' },
        ],
      },
    ],
    practice: [
      { id: 'ma-p1', q: 'Left {1,2,3}, right {a,b}. Edges: 1–a, 1–b, 2–a, 3–b. What is the maximum matching size, and which Hall set proves it is not 3?', type: 'short', diff: 'easy',
        answer: 'Size 2. Any matching uses distinct right vertices, and there are only 2 of them, so at most 2 left vertices can be matched. Hall certificate: S = {1,2,3} has N(S) = {a,b}, and |N(S)| = 2 < 3 = |S| — the deficiency is immediate from the right-hand side being too small.',
        explain: 'A matching saturating L requires |N(L)| ≥ |L|, which is obvious here — always check the whole-left set first.',
      },
      { id: 'ma-p2', q: 'M is a matching with an augmenting path P. Show that flipping M along P gives a matching one edge larger.', type: 'proof', diff: 'medium',
        answer: 'P alternates unmatched and matched edges and starts and ends at unmatched vertices, so it has odd length with one more unmatched edge than matched edges. Flipping means removing the matched edges of P and adding its unmatched edges: the opposite endpoint sets stay disjoint (interior vertices of P were matched exactly once before and once after; endpoints were unmatched before and become matched), so the result is still a matching, and its size grew by (|P|+1)/2 − (|P|−1)/2 = 1. QED.',
        explain: 'The counting argument is the standard one: swapping equal-length alternating runs changes occupancy only at the endpoints.',
      },
      { id: 'ma-p3', q: 'Why does a matching saturating L in the unit-capacity network correspond exactly to an integral max flow of value |L|?', type: 'short', diff: 'hard',
        answer: 'Given a matching, send one unit along s → left → right → t for each matched pair. Capacity 1 on each endpoint edge guarantees no vertex is used twice, and internal conservation holds — a valid flow of value |M|. Conversely, an integral flow of value |L| decomposes into unit s–t paths (integrality from integer capacities), and each path is s → ℓ → r → t; distinct paths use distinct ℓ (capacity 1 out of s) and distinct r (capacity 1 into t), so they form a matching saturating L.',
        explain: 'The two directions are why bipartite matching is a flow problem rather than merely “like” one — capacity 1 encodes “used at most once”.',
      },
    ],
  },
];

export const graphAlgorithms: Concept[] = [
  ...gtMstAlgorithms,
  ...gtFlowAlgorithms,
];
