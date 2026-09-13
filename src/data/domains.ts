import type { Domain } from './types';

export const domains: Domain[] = [
  {
    id: 'discrete',
    name: 'Discrete Mathematics',
    short: 'Discrete Math',
    tagline: 'Logic, sets, functions, relations, and the language of computation',
    description:
      'Discrete mathematics is the mathematics of countable structures — the native language of computer science. It supplies the syntax of logic, the semantics of sets and functions, the structure of relations, and the tools (recursion, induction, asymptotics) used to reason about algorithms.',
    icon: 'Braces',
  },
  {
    id: 'proofs',
    name: 'Mathematical Proof & Problem Solving',
    short: 'Proofs',
    tagline: 'The craft of rigorous mathematical argument',
    description:
      'A proof is the unit of mathematical truth. This domain teaches the standard techniques — direct proof, contradiction, contrapositive, cases, induction, existence and uniqueness — and how to recognize which one applies. Every field of computer science rests on proven theorems.',
    icon: 'PenTool',
  },
  {
    id: 'number-theory',
    name: 'Number Theory',
    short: 'Number Theory',
    tagline: 'Divisibility, primes, modular arithmetic, and the mathematics of cryptography',
    description:
      'Number theory studies integers in depth: divisibility, prime factorization, the Euclidean algorithm, and congruences. What looks like pure abstraction is in fact the engine of modern cryptography — RSA, hashing, and secure communication are built on these ideas.',
    icon: 'Hash',
  },
  {
    id: 'combinatorics',
    name: 'Combinatorics',
    short: 'Combinatorics',
    tagline: 'Counting arrangements, combinations, and structures',
    description:
      'Combinatorics is the mathematics of counting: how many ways can things be arranged, chosen, or distributed? It underlies algorithm analysis, probability, coding theory, and the design of networks and schedules.',
    icon: 'Sigma',
  },
  {
    id: 'graph-theory',
    name: 'Graph Theory',
    short: 'Graph Theory',
    tagline: 'Vertices, edges, paths — the mathematics of networks',
    description:
      'A graph is a set of vertices connected by edges. Graphs model networks, maps, dependencies, social connections, and computation itself. Graph theory provides the concepts (trees, connectivity, flows, colorings) and algorithms (BFS, DFS, Dijkstra, MST) at the heart of CS.',
    icon: 'Waypoints',
  },
  {
    id: 'probability',
    name: 'Probability',
    short: 'Probability',
    tagline: 'Quantifying uncertainty',
    description:
      'Probability gives a precise language for uncertainty: sample spaces, events, conditional reasoning, random variables, and distributions. It is the foundation of machine learning, statistical inference, randomized algorithms, and communication systems.',
    icon: 'Dices',
  },
  {
    id: 'statistics',
    name: 'Statistics',
    short: 'Statistics',
    tagline: 'Learning from data: estimation, inference, and uncertainty',
    description:
      'Statistics is probability turned around: starting from observed data, we estimate parameters, test hypotheses, and build models. It powers data science, A/B testing, machine learning evaluation, and every empirical claim in computing.',
    icon: 'BarChart3',
  },
  {
    id: 'linear-algebra',
    name: 'Linear Algebra',
    short: 'Linear Algebra',
    tagline: 'Vectors, matrices, and linear transformations',
    description:
      'Linear algebra is the machinery of modern computation: vectors as data, matrices as transformations, and eigenstructure as the geometry of data. It is the single most used mathematical language in machine learning, graphics, and scientific computing.',
    icon: 'Grid3x3',
  },
  {
    id: 'calculus',
    name: 'Calculus',
    short: 'Calculus',
    tagline: 'Change, motion, and accumulation',
    description:
      'Calculus studies how quantities change: limits, derivatives, integrals, and series. It is the language of optimization (gradient descent), physics simulation, graphics, and the analysis of continuous systems.',
    icon: 'TrendingUp',
  },
  {
    id: 'optimization',
    name: 'Optimization',
    short: 'Optimization',
    tagline: 'Finding the best: minima, maxima, and the methods that find them',
    description:
      'Optimization asks: given a function, where is it smallest (or largest)? Gradient descent, Newton’s method, convexity, and Lagrange multipliers are the core tools. Training a neural network is, at its heart, an optimization problem.',
    icon: 'Target',
  },
  {
    id: 'geometry',
    name: 'Geometry & Trigonometry',
    short: 'Geometry & Trig',
    tagline: 'Space, shape, angles, and the functions that describe them',
    description:
      'Geometry and trigonometry describe space: points, lines, circles, triangles, and the sine–cosine functions. They drive computer graphics, game engines, robotics, vision, and any system that reasons about physical layout.',
    icon: 'Triangle',
  },
  {
    id: 'abstract-algebra',
    name: 'Abstract Algebra',
    short: 'Abstract Algebra',
    tagline: 'Groups, rings, and fields — structure for its own sake',
    description:
      'Abstract algebra studies algebraic structures: groups, rings, and fields. Finite fields and groups are the substrate of modern cryptography, error-correcting codes, and the algebra of symmetric systems.',
    icon: 'Network',
  },
  {
    id: 'information-theory',
    name: 'Information Theory',
    short: 'Information Theory',
    tagline: 'Measuring, compressing, and transmitting information',
    description:
      'Information theory quantifies information itself: entropy, compression limits, and channel capacity. It explains why zip works, how error correction defeats noise, and what a communication channel can fundamentally transmit.',
    icon: 'Radio',
  },
  {
    id: 'numerical',
    name: 'Numerical Mathematics',
    short: 'Numerical Methods',
    tagline: 'Doing mathematics with approximate, finite-precision numbers',
    description:
      'Computers use floating point, and floating point lies a little. Numerical mathematics studies approximation, error, and stable algorithms for roots, integrals, and linear systems — the craft behind every simulation and scientific computation.',
    icon: 'Calculator',
  },
  {
    id: 'formal',
    name: 'Formal Languages & Theoretical CS',
    short: 'Formal Languages',
    tagline: 'Automata, computability, and the limits of computation',
    description:
      'Formal languages describe exactly what machines can recognize and compute. From regular languages and automata to Turing machines and the halting problem, this domain maps the boundary between the decidable and the impossible.',
    icon: 'Workflow',
  },
];

export const domainById = (id: string): Domain | undefined => domains.find((d) => d.id === id);
export const domainName = (id: string): string => domainById(id)?.name ?? id;
