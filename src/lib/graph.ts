// ---------------------------------------------------------------------------
// Graph algorithms with step-by-step traces (pure, no UI)
// ---------------------------------------------------------------------------

export interface GNode { id: string; x: number; y: number }
export interface GEdge { a: string; b: string; w: number }
export interface Graph {
  nodes: GNode[];
  edges: GEdge[];
  directed: boolean;
}

export function adjacency(g: Graph): Map<string, { to: string; w: number }[]> {
  const adj = new Map<string, { to: string; w: number }[]>();
  for (const nd of g.nodes) adj.set(nd.id, []);
  for (const e of g.edges) {
    adj.get(e.a)?.push({ to: e.b, w: e.w });
    if (!g.directed) adj.get(e.b)?.push({ to: e.a, w: e.w });
  }
  return adj;
}

// ---------------- BFS ----------------
export interface BFSStep {
  visit?: string;
  enqueue?: string;
  edge?: [string, string];
  discovered: string[];
  visited: string[];
  queue: string[];
  message: string;
}

export function bfsSteps(g: Graph, source: string): BFSStep[] {
  const adj = adjacency(g);
  const steps: BFSStep[] = [];
  const visited = new Set<string>();
  const discovered: string[] = [];
  const queue: string[] = [];
  const order: string[] = [];

  const snap = (message: string, extra?: Partial<BFSStep>) => {
    steps.push({
      discovered: [...discovered],
      visited: [...order],
      queue: [...queue],
      message,
      ...extra,
    });
  };

  if (!g.nodes.find((n) => n.id === source)) return steps;
  discovered.push(source);
  queue.push(source);
  snap(`Enqueue source "${source}".`, { enqueue: source });

  while (queue.length) {
    const u = queue.shift()!;
    visited.add(u);
    order.push(u);
    snap(`Visit "${u}".`, { visit: u });
    for (const { to } of adj.get(u) || []) {
      if (!discovered.includes(to)) {
        discovered.push(to);
        queue.push(to);
        snap(`Discover "${to}" via ${u} → ${to}.`, { enqueue: to, edge: [u, to] });
      }
    }
  }
  snap('BFS complete. Visit order: ' + order.join(' → '));
  return steps;
}

// ---------------- DFS (iterative, deterministic) ----------------
export interface DFSStep {
  push?: string;
  pop?: string;
  visited: string[];
  stack: string[];
  message: string;
}

export function dfsSteps(g: Graph, source: string): DFSStep[] {
  const adj = adjacency(g);
  const steps: DFSStep[] = [];
  const finished: string[] = [];
  const seen = new Set<string>();
  const stack: string[] = [];

  const snap = (message: string, extra?: Partial<DFSStep>) => {
    steps.push({ visited: [...finished], stack: [...stack], message, ...extra });
  };

  if (!g.nodes.find((n) => n.id === source)) return steps;
  stack.push(source);
  seen.add(source);
  snap(`Push source "${source}".`, { push: source });

  let guard = 0;
  const maxSteps = g.nodes.length * (g.edges.length + 1) * 4 + 64;
  while (stack.length && guard++ < maxSteps) {
    const u = stack[stack.length - 1];
    const neighbors = (adj.get(u) || []).map((x) => x.to);
    const next = neighbors.find((n) => !seen.has(n));
    if (next) {
      stack.push(next);
      seen.add(next);
      snap(`Go deeper: ${u} → ${next}.`, { push: next });
    } else {
      stack.pop();
      finished.push(u);
      snap(`Backtrack from "${u}" (all neighbors explored).`, { pop: u });
    }
  }
  snap('DFS complete. Finish order: ' + finished.join(' → '));
  return steps;
}

// ---------------- Dijkstra ----------------
export interface DijkstraStep {
  select?: string;
  relax?: { from: string; to: string; newDist: number; improved: boolean };
  dist: Record<string, number>;
  visited: string[];
  pathEdges: [string, string][];
  message: string;
}

export function dijkstraSteps(g: Graph, source: string): DijkstraStep[] {
  const adj = adjacency(g);
  const steps: DijkstraStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited: string[] = [];
  for (const nd of g.nodes) { dist[nd.id] = Infinity; prev[nd.id] = null; }
  dist[source] = 0;

  const snap = (message: string, extra?: Partial<DijkstraStep>) => {
    steps.push({ dist: { ...dist }, visited: [...visited], pathEdges: [], message, ...extra });
  };

  snap(`Initialize: dist[${source}] = 0, all others ∞.`);

  const unvisited = () => g.nodes.map((n) => n.id).filter((id) => !visited.includes(id) && dist[id] < Infinity);

  while (true) {
    const cand = unvisited();
    if (!cand.length) break;
    cand.sort((a, b) => dist[a] - dist[b]);
    const u = cand[0];
    visited.push(u);
    snap(`Select "${u}" (smallest tentative distance ${dist[u]}).`, { select: u });
    for (const { to, w } of adj.get(u) || []) {
      if (visited.includes(to)) continue;
      const nd = dist[u] + w;
      const improved = nd < dist[to];
      if (improved) { dist[to] = nd; prev[to] = u; }
      snap(
        improved
          ? `Relax ${u} → ${to}: ${dist[u]} + ${w} = ${nd} < ${dist[to] === Infinity ? '∞' : dist[to]} — improved.`
          : `Relax ${u} → ${to}: ${dist[u]} + ${w} = ${nd} ≥ ${dist[to]} — no improvement.`,
        { relax: { from: u, to, newDist: nd, improved } },
      );
    }
  }
  // final with paths
  const finalStep: DijkstraStep = {
    dist: { ...dist },
    visited: [...visited],
    pathEdges: [],
    message: 'Dijkstra complete. Shortest distances from ' + source + ': ' +
      g.nodes.map((n) => `${n.id}: ${dist[n.id] === Infinity ? '∞' : dist[n.id]}`).join(', '),
  };
  steps.push(finalStep);
  return steps;
}

export function pathFromPrev(prev: Record<string, string | null>, target: string): string[] {
  const path: string[] = [];
  let cur: string | null = target;
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  return path;
}

// ---------------- Kruskal MST ----------------
export interface KruskalStep {
  edge?: [string, string];
  accept?: boolean;
  mstEdges: [string, string][];
  considered: number;
  message: string;
}

export function kruskalSteps(g: Graph): KruskalStep[] {
  const steps: KruskalStep[] = [];
  const parent: Record<string, string> = {};
  const find = (x: string): string => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };
  for (const nd of g.nodes) parent[nd.id] = nd.id;
  const union = (a: string, b: string) => { parent[find(a)] = find(b); };
  const mst: [string, string][] = [];
  const sorted = [...g.edges].sort((a, b) => a.w - b.w);

  steps.push({ mstEdges: [], considered: 0, message: 'Start with each vertex as its own component. Edges sorted by weight.' });

  for (const e of sorted) {
    const ra = find(e.a), rb = find(e.b);
    const accept = ra !== rb;
    if (accept) { union(e.a, e.b); mst.push([e.a, e.b]); }
    steps.push({
      edge: [e.a, e.b],
      accept,
      mstEdges: [...mst],
      considered: steps.length,
      message: accept
        ? `Edge ${e.a}–${e.b} (w=${e.w}): connects two components — accept.`
        : `Edge ${e.a}–${e.b} (w=${e.w}): creates a cycle — reject.`,
    });
  }
  steps.push({
    mstEdges: [...mst],
    considered: sorted.length,
    message: `MST complete. Total weight: ${g.edges.filter((e) => mst.some(([a, b]) => (a === e.a && b === e.b) || (a === e.b && b === e.a))).reduce((s, e) => s + e.w, 0)}.`,
  });
  return steps;
}

// ---------------- Topological sort (Kahn) ----------------
export interface TopoStep {
  order: string[];
  inDegree: Record<string, number>;
  removed?: string;
  message: string;
  error?: string;
}

export function topoSteps(g: Graph): TopoStep[] {
  if (!g.directed) {
    return [{ order: [], inDegree: {}, message: 'Topological sort requires a directed graph. Switch the graph to directed mode.' , error: 'undirected'}];
  }
  const adj = adjacency(g);
  const inDeg: Record<string, number> = {};
  for (const nd of g.nodes) inDeg[nd.id] = 0;
  for (const e of g.edges) inDeg[e.b] = (inDeg[e.b] || 0) + 1;

  const steps: TopoStep[] = [];
  const order: string[] = [];
  const rem = { ...inDeg };
  const remaining = new Set(g.nodes.map((n) => n.id));

  const snap = (message: string, extra?: Partial<TopoStep>) => {
    steps.push({ order: [...order], inDegree: { ...rem }, message, ...extra });
  };

  snap('Compute in-degrees. Queue = vertices with in-degree 0.');
  while (true) {
    const ready = [...remaining].filter((id) => rem[id] === 0).sort();
    if (!ready.length) break;
    const u = ready[0];
    remaining.delete(u);
    order.push(u);
    snap(`Remove "${u}" (in-degree 0).`, { removed: u });
    for (const { to } of adj.get(u) || []) {
      if (remaining.has(to)) rem[to] -= 1;
    }
  }
  if (remaining.size > 0) {
    snap(`Cycle detected! ${[...remaining].join(', ')} can never reach in-degree 0.`, { error: 'cycle' });
  } else {
    snap('Topological order: ' + order.join(' → '));
  }
  return steps;
}

// ---------------- Connected components (undirected) ----------------
export interface CCResult { components: string[][]; edgeIn: [string, string][] }

export function components(g: Graph): CCResult {
  const adj = adjacency({ ...g, directed: false });
  const seen = new Set<string>();
  const comps: string[][] = [];
  const edgeIn: [string, string][] = [];
  for (const nd of g.nodes) {
    if (seen.has(nd.id)) continue;
    const comp: string[] = [];
    const q = [nd.id];
    seen.add(nd.id);
    while (q.length) {
      const u = q.shift()!;
      comp.push(u);
      for (const { to } of adj.get(u) || []) {
        if (!seen.has(to)) { seen.add(to); q.push(to); }
      }
    }
    comps.push(comp.sort());
  }
  return { components: comps, edgeIn };
}

// ---------------- Greedy graph coloring ----------------
export interface ColorStep {
  vertex?: string;
  color?: number;
  colors: Record<string, number>;
  message: string;
}

export function coloringSteps(g: Graph): ColorStep[] {
  const adj = adjacency({ ...g, directed: false });
  const steps: ColorStep[] = [];
  const colors: Record<string, number> = {};
  const nodes = [...g.nodes].sort((a, b) => a.id.localeCompare(b.id));
  for (const nd of nodes) {
    const used = new Set<number>();
    for (const { to } of adj.get(nd.id) || []) {
      if (colors[to] !== undefined) used.add(colors[to]);
    }
    let c = 0;
    while (used.has(c)) c++;
    colors[nd.id] = c;
    steps.push({
      vertex: nd.id,
      color: c,
      colors: { ...colors },
      message: `Color "${nd.id}" with color ${c + 1} (neighbors use ${used.size ? [...used].map((u) => u + 1).join(', ') : 'nothing'}).`,
    });
  }
  steps.push({
    colors: { ...colors },
    message: `Done with ${new Set(Object.values(colors)).size} colors (greedy, order: ${nodes.map((n) => n.id).join(', ')}).`,
  });
  return steps;
}

// ---------------- Shortest path helper for viz ----------------
export function dijkstraPaths(g: Graph, source: string): { dist: Record<string, number>; prev: Record<string, string | null> } {
  const adj = adjacency(g);
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  for (const nd of g.nodes) { dist[nd.id] = Infinity; prev[nd.id] = null; }
  dist[source] = 0;
  const done = new Set<string>();
  while (true) {
    let u: string | null = null;
    let best = Infinity;
    for (const nd of g.nodes) {
      if (!done.has(nd.id) && dist[nd.id] < best) { best = dist[nd.id]; u = nd.id; }
    }
    if (u === null) break;
    done.add(u);
    for (const { to, w } of adj.get(u) || []) {
      if (dist[u] + w < dist[to]) { dist[to] = dist[u] + w; prev[to] = u; }
    }
  }
  return { dist, prev };
}
