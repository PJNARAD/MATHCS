import type { LearningPath } from './types';

export const paths: LearningPath[] = [
  {
    id: 'path-ml',
    title: 'Mathematics for Machine Learning',
    icon: 'Cpu',
    fieldId: 'ml',
    description:
      'The standard route for ML and AI: from algebra and functions, through vectors and matrices, to probability, derivatives, and gradient descent — the mathematics that actually trains models.',
    stages: [
      { title: 'Foundations', concepts: ['number-systems', 'function-basics', 'logarithms'] },
      { title: 'Linear Algebra', concepts: ['vectors', 'matrix-basics', 'matrix-multiplication', 'linear-transformations', 'dot-product', 'cosine-similarity'] },
      { title: 'Probability & Statistics', concepts: ['probability-axioms', 'random-variables', 'expectation', 'variance-covariance', 'normal-distribution', 'linear-regression'] },
      { title: 'Calculus', concepts: ['limits', 'derivative', 'differentiation-rules', 'partial-derivatives', 'gradient'] },
      { title: 'Optimization', concepts: ['optimization-intro', 'convexity', 'gradient-descent', 'stochastic-gradient-descent', 'newtons-method'] },
      { title: 'Structure & Information', concepts: ['eigenvalues-eigenvectors', 'pca-eigen-applications', 'entropy', 'maximum-likelihood'] },
    ],
  },
  {
    id: 'path-algorithms',
    title: 'Mathematics for Algorithms & DSA',
    icon: 'Binary',
    fieldId: 'algorithms-dsa',
    description:
      'The discrete-mathematics spine of algorithmic thinking: logic, induction, recurrences, asymptotic analysis, and the graph algorithms that define the field.',
    stages: [
      { title: 'Logical Foundations', concepts: ['logic', 'truth-tables', 'proof-by-contradiction', 'mathematical-induction'] },
      { title: 'Structures', concepts: ['set-basics', 'function-basics', 'relations', 'graph-definition', 'trees'] },
      { title: 'Counting & Recursion', concepts: ['fundamental-counting', 'combinations', 'recurrence-relations', 'solving-recurrences', 'recursion-trees', 'dynamic-programming'] },
      { title: 'Analysis', concepts: ['asymptotic-notation', 'asymptotic-properties', 'growth-rates', 'binary-search'] },
      { title: 'Graph Algorithms', concepts: ['bfs-dfs', 'dijkstra', 'minimum-spanning-trees', 'kruskal-prims', 'union-find', 'matching', 'maximum-flow', 'topological-sorting'] },
    ],
  },
  {
    id: 'path-crypto',
    title: 'Mathematics for Cryptography & Security',
    icon: 'KeyRound',
    fieldId: 'cryptography',
    description:
      'The number-theory route to modern cryptography: divisibility, the Euclidean algorithm, modular arithmetic, Fermat and Euler, and RSA — the full chain from primes to public-key encryption.',
    stages: [
      { title: 'Integer Foundations', concepts: ['parity', 'divisibility', 'division-algorithm', 'divisibility-tests'] },
      { title: 'Prime Machinery', concepts: ['prime-factorization', 'primes', 'sieve-of-eratosthenes', 'gcd', 'euclidean-algorithm', 'bezout-identity'] },
      { title: 'Modular World', concepts: ['congruence', 'residue-classes', 'modular-arithmetic-ops', 'modular-inverses', 'linear-congruences', 'modular-exponentiation'] },
      { title: 'The Big Theorems', concepts: ['euler-totient', 'fermats-little-theorem', 'euler-theorem', 'chinese-remainder-theorem'] },
      { title: 'Cryptography', concepts: ['rsa-cryptography', 'finite-fields', 'entropy', 'error-correction-codes'] },
    ],
  },
  {
    id: 'path-data-science',
    title: 'Mathematics for Data Science',
    icon: 'Database',
    fieldId: 'data-science',
    description:
      'Statistics-first: describing data, sampling, distributions, inference, regression, and the linear algebra behind feature structure.',
    stages: [
      { title: 'Describing Data', concepts: ['measures-of-center', 'measures-of-spread', 'correlation'] },
      { title: 'Probability Core', concepts: ['probability-axioms', 'conditional-probability', 'random-variables', 'expectation', 'variance-covariance', 'normal-distribution'] },
      { title: 'From Data to Models', concepts: ['linear-regression', 'maximum-likelihood', 'confidence-intervals', 'hypothesis-testing', 'bayesian-statistics'] },
      { title: 'Linear Algebra for Data', concepts: ['vectors', 'matrix-basics', 'dot-product', 'cosine-similarity', 'eigenvalues-eigenvectors'] },
      { title: 'Uncertainty & Inference', concepts: ['law-of-large-numbers', 'central-limit-theorem', 'markov-chains'] },
    ],
  },
  {
    id: 'path-graphics',
    title: 'Mathematics for Computer Graphics & Games',
    icon: 'Monitor',
    fieldId: 'computer-graphics',
    description:
      'The geometry-and-linear-algebra route: vectors, matrices as transformations, trigonometry, and the calculus that drives motion and lighting.',
    stages: [
      { title: 'Geometric Foundations', concepts: ['coordinate-geometry', 'vectors', 'unit-circle-trig'] },
      { title: 'Transformations', concepts: ['linear-transformations', 'plane-transformations', 'matrix-multiplication', 'cross-product', 'conic-sections'] },
      { title: '3D Space', concepts: ['3d-geometry', 'linear-independence', 'basis-dimension'] },
      { title: 'Motion & Light', concepts: ['derivative', 'taylor-series', 'numerical-integration', 'probability-axioms'] },
    ],
  },
  {
    id: 'path-vision',
    title: 'Mathematics for Computer Vision',
    icon: 'ScanEye',
    fieldId: 'computer-vision',
    description:
      'Vision = matrices (images) + geometry (cameras) + calculus (learning) + probability (uncertainty). This path threads all four.',
    stages: [
      { title: 'Images as Linear Algebra', concepts: ['vectors', 'matrix-basics', 'matrix-multiplication', 'dot-product', 'cosine-similarity'] },
      { title: 'Camera Geometry', concepts: ['coordinate-geometry', 'unit-circle-trig', 'conic-sections', '3d-geometry', 'linear-transformations'] },
      { title: 'Learning Vision', concepts: ['derivative', 'partial-derivatives', 'gradient', 'gradient-descent'] },
      { title: 'Uncertainty in Perception', concepts: ['probability-axioms', 'conditional-probability', 'bayes-theorem', 'normal-distribution'] },
      { title: 'Structure from Data', concepts: ['eigenvalues-eigenvectors', 'pca-eigen-applications', 'least-squares'] },
    ],
  },
  {
    id: 'path-robotics',
    title: 'Mathematics for Robotics',
    icon: 'Bot',
    fieldId: 'robotics',
    description:
      'Robots live in continuous space: geometry for pose, calculus for dynamics, probability for estimation, and optimization for control.',
    stages: [
      { title: 'Space & Pose', concepts: ['coordinate-geometry', 'vectors', 'unit-circle-trig', '3d-geometry', 'linear-transformations'] },
      { title: 'Dynamics', concepts: ['derivative', 'partial-derivatives', 'gradient'] },
      { title: 'Estimation', concepts: ['probability-axioms', 'random-variables', 'markov-chains', 'normal-distribution'] },
      { title: 'Control', concepts: ['optimization-intro', 'gradient-descent', 'linear-programming'] },
    ],
  },
  {
    id: 'path-networks',
    title: 'Mathematics for Networks & Distributed Systems',
    icon: 'Globe',
    fieldId: 'computer-networks',
    description:
      'Networks are graphs under uncertainty: graph structure and shortest paths, probability of loss, queueing of packets, and flows for capacity.',
    stages: [
      { title: 'Graph Structure', concepts: ['graph-definition', 'paths-walks-cycles', 'connectivity', 'trees'] },
      { title: 'Traversals & Shortest Paths', concepts: ['bfs-dfs', 'dijkstra', 'bellman-ford', 'floyd-warshall'] },
      { title: 'Capacity & Flow', concepts: ['minimum-spanning-trees', 'kruskal-prims', 'network-flow', 'maximum-flow', 'max-flow-min-cut'] },
      { title: 'Uncertainty', concepts: ['probability-axioms', 'markov-chains', 'queueing'] },
    ],
  },
  {
    id: 'path-theory',
    title: 'Mathematics for Theoretical CS',
    icon: 'ScrollText',
    fieldId: 'theoretical-cs',
    description:
      'The route to the limits of computation: logic and proofs, counting, formal languages, automata, Turing machines, and complexity classes.',
    stages: [
      { title: 'Proof Machinery', concepts: ['logic', 'quantifiers', 'proof-by-contradiction', 'mathematical-induction', 'well-ordering-principle'] },
      { title: 'Counting', concepts: ['fundamental-counting', 'combinations', 'pigeonhole-principle', 'inclusion-exclusion'] },
      { title: 'Languages & Machines', concepts: ['formal-languages-basics', 'regular-languages', 'finite-automata', 'context-free-languages'] },
      { title: 'Computability', concepts: ['turing-machines', 'halting-problem', 'complexity-classes'] },
      { title: 'Structures in Theory', concepts: ['graph-definition', 'boolean-algebra', 'lattice-logic', 'groups'] },
    ],
  },
  {
    id: 'path-discrete',
    title: 'Discrete Mathematics Foundations',
    icon: 'Braces',
    fieldId: 'software-engineering',
    description:
      'The general foundation path for software, systems, and architecture: logic, sets, functions, relations, induction, and Boolean algebra.',
    stages: [
      { title: 'Logic', concepts: ['logic', 'propositions', 'logical-operators', 'truth-tables', 'predicates', 'quantifiers', 'logical-equivalence'] },
      { title: 'Structures', concepts: ['set-basics', 'set-operations', 'function-basics', 'injective-functions', 'surjective-functions', 'bijective-functions', 'relations', 'equivalence-relations', 'partial-orders', 'lattice-logic'] },
      { title: 'Reasoning', concepts: ['direct-proof', 'proof-by-contradiction', 'proof-by-contrapositive', 'mathematical-induction', 'conjectures-counterexamples'] },
      { title: 'Circuits', concepts: ['boolean-basics', 'de-morgans-laws', 'logic-gates', 'boolean-simplification'] },
    ],
  },
  {
    id: 'path-linear',
    title: 'Linear Algebra Deep Path',
    icon: 'Grid3x3',
    fieldId: 'quantum-computing',
    description:
      'A full tour of linear algebra from vectors to SVD — the route for quantum computing, graphics, and scientific computing.',
    stages: [
      { title: 'Vectors', concepts: ['vector-basics', 'vector-operations', 'dot-product', 'cross-product', 'projections'] },
      { title: 'Matrices', concepts: ['matrix-basics', 'matrix-multiplication', 'identity-inverses', 'determinants'] },
      { title: 'Systems & Spaces', concepts: ['systems-of-equations', 'gaussian-elimination', 'linear-independence', 'basis-dimension', 'rank-nullity'] },
      { title: 'Transformations', concepts: ['linear-transformations', 'plane-transformations'] },
      { title: 'Eigenstructure', concepts: ['eigenvalues-eigenvectors', 'diagonalization', 'pca-eigen-applications', 'svd', 'least-squares'] },
    ],
  },
  {
    id: 'path-number-theory',
    title: 'Number Theory Deep Path',
    icon: 'Hash',
    fieldId: 'competitive-programming',
    description:
      'From divisibility to RSA: the complete number-theory curriculum, including every divisibility test, the Euclidean algorithm, and the great theorems.',
    stages: [
      { title: 'Integers', concepts: ['number-systems', 'binary-arithmetic', 'parity', 'logarithms'] },
      { title: 'Divisibility', concepts: ['divisibility', 'division-algorithm', 'divisibility-tests', 'factors-and-multiples', 'prime-factorization'] },
      { title: 'Primes', concepts: ['primes', 'sieve-of-eratosthenes', 'primality-testing'] },
      { title: 'GCD & Modular', concepts: ['gcd', 'lcm', 'euclidean-algorithm', 'bezout-identity', 'congruence', 'modular-arithmetic-ops', 'modular-inverses'] },
      { title: 'Theorems & Cryptography', concepts: ['chinese-remainder-theorem', 'euler-totient', 'fermats-little-theorem', 'euler-theorem', 'rsa-cryptography'] },
    ],
  },
  {
    id: 'path-calculus',
    title: 'Calculus for Computing',
    icon: 'TrendingUp',
    fieldId: 'deep-learning',
    description:
      'Calculus aimed at CS: limits and derivatives, the integration toolkit, series, and multivariable calculus — ending where gradient descent begins.',
    stages: [
      { title: 'Foundations', concepts: ['function-review', 'limits', 'continuity'] },
      { title: 'Derivatives', concepts: ['derivative', 'differentiation-rules', 'implicit-differentiation', 'derivative-applications'] },
      { title: 'Integrals', concepts: ['antiderivatives', 'definite-integral', 'ftoc', 'integration-techniques'] },
      { title: 'Series', concepts: ['sequences', 'series', 'taylor-series'] },
      { title: 'Multivariable', concepts: ['partial-derivatives', 'gradient', 'multivariable-optimization'] },
    ],
  },
  {
    id: 'path-probability',
    title: 'Probability & Statistics Path',
    icon: 'Dices',
    fieldId: 'hci',
    description:
      'The full probability-to-inference route: axioms, conditioning, Bayes, distributions, limit theorems, and statistical inference.',
    stages: [
      { title: 'Core Probability', concepts: ['sample-spaces-events', 'probability-axioms', 'classical-probability', 'conditional-probability', 'independence', 'bayes-theorem'] },
      { title: 'Random Variables', concepts: ['random-variables', 'expectation', 'variance-covariance', 'bernoulli-binomial', 'normal-distribution'] },
      { title: 'Limit Behavior', concepts: ['law-of-large-numbers', 'central-limit-theorem', 'markov-chains'] },
      { title: 'Statistics', concepts: ['measures-of-center', 'measures-of-spread', 'sampling-distributions', 'linear-regression', 'confidence-intervals', 'hypothesis-testing'] },
    ],
  },
];

export const pathById = (id: string): LearningPath | undefined => paths.find((p) => p.id === id);
