import type { Concept } from '../types';

export const optimization: Concept[] = [
  {
    id: 'optimization-intro',
    title: 'Optimization Introduction',
    domain: 'optimization',
    topic: true,
    summary: 'Minimize $f(x)$ subject to $x∈S$. Local vs global minima, convex vs non-convex, constrained vs unconstrained. The problem behind training, routing, and resource allocation.',
    level: 'foundational',
    csFields: ['ml', 'ai', 'cloud-computing', 'computer-networks', 'robotics'],
    prerequisites: ['derivative', 'gradient'],
    related: ['convexity', 'gradient-descent', 'linear-programming'],
    next: ['convexity'],
    content: [
      { t: 'def', title: 'Optimization problem', text: 'Minimize $f:ℝ^n→ℝ$ over feasible set $S⊆ℝ^n$: $\\min_{x∈S} f(x)$. $f$ objective, $S$ defined by constraints $g_i(x)≤0$, $h_j(x)=0$. Unconstrained: $S=ℝ^n$. Local min: $∃δ>0$ s.t. $f(x)≤f(y)$ for all $y$ with $||y-x||<δ$. Global min: $f(x)≤f(y)$ for all $y∈S$.' },
      { t: 'props', items: [
        { title: 'Existence', text: 'Continuous f on compact S attains min/max (Weierstrass).' },
        { title: 'Optimality (unconstrained)', text: 'If x* interior local min and f differentiable, ∇f(x*)=0 and Hessian PSD.' },
        { title: 'Convexity helps', text: 'Convex f over convex S: local min = global min, easy to find.' },
      ]},
      { t: 'ex', title: 'Examples', steps: [
        'Least squares: min ||Ax-b||², convex, closed form.',
        'Neural net: min non-convex loss, many local minima, SGD works empirically.',
        'Shortest path: min over discrete paths, solved by Dijkstra.',
      ]},
      { t: 'cs', items: [
        { area: 'ML', how: 'Training = optimization of loss over parameters.' },
        { area: 'Cloud', how: 'Bin packing VMs = optimization under capacity.' },
      ]},
    ],
    practice: [
      { id: 'opt-intro-p1', q: 'Why is convexity desirable?', type: 'short', diff: 'easy', answer: 'Local minima are global, efficient algorithms (gradient descent) converge to optimum.', explain: 'Convex optimization is tractable.' },
    ],
  },
  {
    id: 'convexity',
    title: 'Convexity',
    domain: 'optimization',
    parent: 'optimization-intro',
    summary: 'Set C convex if line segment between any two points in C stays in C. Function f convex if epigraph convex, equivalently $f(tx+(1-t)y)≤t f(x)+(1-t)f(y)$. Jensen: $f(E[X])≤E[f(X)]$.',
    level: 'core',
    csFields: ['ml', 'ai', 'cloud-computing'],
    prerequisites: ['optimization-intro'],
    related: ['gradient-descent', 'linear-programming'],
    content: [
      { t: 'def', title: 'Convex', text: 'Set C convex if $∀x,y∈C, t∈[0,1]: tx+(1-t)y∈C$. Function f convex on convex domain if $f(tx+(1-t)y)≤t f(x)+(1-t)f(y)$. Strictly convex if < for x≠y, t∈(0,1). Concave = -convex.' },
      { t: 'props', items: [
        { title: 'First order', text: 'If f differentiable convex, $f(y)≥f(x)+∇f(x)^T(y-x)$: lies above tangent.' },
        { title: 'Second order', text: 'If twice differentiable, convex iff Hessian ∇²f(x) PSD for all x.' },
        { title: 'Jensen', text: 'Convex f: $f(E[X])≤E[f(X)]$. Expectation of convex ≥ convex of expectation.' },
        { title: 'Local=global', text: 'For convex f over convex set, any local min is global.' },
      ]},
      { t: 'ex', title: 'Examples', steps: [
        'f(x)=x² convex (second derivative 2>0).',
        'f(x)=|x| convex but not differentiable at 0.',
        'f(x)=log x concave, f(x)=e^x convex.',
        'Norms ||x|| are convex.',
      ]},
      { t: 'cs', items: [
        { area: 'Regularization', how: 'L2 regularizer ||w||² convex, L1 ||w||₁ convex but not smooth — promotes sparsity.' },
      ]},
    ],
    practice: [
      { id: 'conv-p1', q: 'Is f(x)=x⁴ convex?', type: 'truefalse', diff: 'easy', options: ['True','False'], correct: 0, answer: 'True', explain: 'Second derivative 12x²≥0.' },
    ],
  },
  {
    id: 'gradient-descent',
    title: 'Gradient Descent',
    domain: 'optimization',
    parent: 'convexity',
    summary: '$x_{k+1}=x_k - η∇f(x_k)$: follow downhill. With appropriate step η, converges for convex Lipschitz gradient. The engine of ML.',
    level: 'core',
    csFields: ['ml', 'ai', 'deep-learning', 'nlp', 'computer-vision', 'robotics'],
    prerequisites: ['gradient', 'convexity'],
    related: ['stochastic-gradient-descent', 'convexity'],
    next: ['stochastic-gradient-descent'],
    content: [
      { t: 'def', title: 'GD', text: 'Unconstrained min of differentiable f: iterate $x_{k+1}=x_k - η_k ∇f(x_k)$. η step size / learning rate. For convex f with L-Lipschitz gradient and η≤1/L, $f(x_k)-f* = O(1/k)$. With strong convexity, linear convergence $O((1-μ/L)^k)$.' },
      { t: 'props', items: [
        { title: 'Step size', text: 'Too large diverges, too small slow. Line search or fixed 1/L works. Adaptive: Adam, RMSProp adjust per coordinate.' },
        { title: 'Descent', text: 'If η small, f decreases: f(x_{k+1}) ≤ f(x_k) - η(1-ηL/2)||∇f||².' },
        { title: 'Stationary', text: 'If ∇f(x*)=0 and convex, x* global min. Non-convex: may converge to saddle or local min.' },
      ]},
      { t: 'ex', title: 'Quadratic', steps: [
        'f(x)= (x-3)², ∇=2(x-3), start x0=0, η=0.1: x1=0-0.1·(-6)=0.6, x2=0.6-0.1·(-4.8)=1.08, ... →3.',
        'Optimal η=0.5 gives one-step convergence for this f: x1=0-0.5·(-6)=3.',
      ]},
      { t: 'viz', id: 'prime-explorer', props: { defaultN: 10 } },
      { t: 'cs', items: [
        { area: 'Training', how: 'Backprop computes ∇L, GD updates weights.' },
        { area: 'Hyperparameter', how: 'Learning rate most important hyperparameter; schedule (decay) helps.' },
      ]},
    ],
    practice: [
      { id: 'gd-p1', q: 'f(x)=x², x0=4, η=0.1, one GD step?', type: 'numeric', diff: 'easy', answer: '3.2', explain: '∇=2x=8, x1=4-0.8=3.2.' },
      { id: 'gd-p2', q: 'Why does GD need small η?', type: 'short', diff: 'medium', answer: 'Taylor: f(x-η∇)=f(x)-η||∇||²+O(η²). If η too big, second order term dominates and may increase f.', explain: 'Descent lemma.' },
    ],
  },
  {
    id: 'stochastic-gradient-descent',
    title: 'Stochastic Gradient Descent',
    domain: 'optimization',
    parent: 'gradient-descent',
    summary: 'Use noisy unbiased gradient estimate from mini-batch: $x_{k+1}=x_k - η g_k$, $E[g_k]=∇f(x_k)$. Cheaper per step, converges with decreasing η.',
    level: 'advanced',
    csFields: ['ml', 'deep-learning', 'nlp'],
    prerequisites: ['gradient-descent', 'expectation'],
    related: ['gradient-descent', 'law-of-large-numbers'],
    content: [
      { t: 'def', title: 'SGD', text: 'Full gradient $∇f = \\frac1n\\sum_i ∇f_i$ expensive for large n. SGD samples mini-batch B: $g = \\frac1{|B|}\\sum_{i∈B} ∇f_i$, unbiased $E[g]=∇f$. Update $x←x-η g$. Variance reduced by larger batch or variance reduction (SVRG, SAGA).' },
      { t: 'props', items: [
        { title: 'Convergence', text: 'Convex: with η_k = O(1/√k), $E[f(\\bar x_k)-f*]=O(1/√k)$. Strongly convex: $O(1/k)$ with η_k=O(1/k). Non-convex: converges to stationary point $E[||∇f||²]→0$.' },
        { title: 'Batch size trade-off', text: 'Larger batch: less noise, more compute per step, better parallelism. Small batch: more noise acts as regularizer, often generalizes better.' },
        { title: 'Momentum', text: 'Heavy ball: $v_{k+1}=μ v_k + g_k$, $x_{k+1}=x_k-η v_{k+1}$: accelerates through ravines.' },
      ]},
      { t: 'ex', title: 'Linear regression SGD', steps: [
        'Loss for one example (x_i,y_i): ℓ_i(w)=(w·x_i - y_i)², ∇ℓ_i=2(w·x_i - y_i)x_i.',
        'SGD picks one i, updates w←w-η·2(w·x_i - y_i)x_i.',
        'Full GD would sum over all n each step: O(nd) vs O(d) per SGD step.',
      ]},
      { t: 'cs', items: [
        { area: 'Deep learning', how: 'Training on billions of tokens: only SGD (mini-batch) feasible.' },
      ]},
    ],
    practice: [
      { id: 'sgd-p1', q: 'Why is SGD gradient unbiased?', type: 'short', diff: 'medium', answer: 'E over random batch = average over all data = full gradient, by linearity of expectation and uniform sampling.', explain: 'Unbiasedness.' },
    ],
  },
  {
    id: 'newtons-method',
    title: "Newton's Method",
    domain: 'optimization',
    parent: 'gradient-descent',
    summary: '$x_{k+1}=x_k - [∇²f(x_k)]^{-1}∇f(x_k)$: use second-order Taylor, quadratic convergence near optimum but needs Hessian.',
    level: 'advanced',
    csFields: ['ml', 'numerical'],
    prerequisites: ['gradient-descent', 'taylor-series'],
    related: ['gradient-descent', 'convexity'],
    content: [
      { t: 'def', title: 'Newton', text: 'Second-order approximation $f(x+δ)≈f(x)+∇f^T δ+½δ^T H δ$. Minimize quadratic: $H δ = -∇f$ ⇒ $δ = -H^{-1}∇f$. Update $x←x+δ$. For strongly convex with Lipschitz Hessian, locally quadratic convergence: error squares each step.' },
      { t: 'props', items: [
        { title: 'Cost', text: 'Needs Hessian O(n²) and solve linear system O(n³) per step — expensive for large n.' },
        { title: 'Non-convex', text: 'H may not be PSD; Newton may go to saddle. Fix via trust region or Hessian modification.' },
      ]},
      { t: 'cs', items: [
        { area: 'Second-order optimizers', how: 'L-BFGS approximates Hessian for large-scale convex problems.' },
      ]},
    ],
    practice: [],
  },
  {
    id: 'linear-programming',
    title: 'Linear Programming',
    domain: 'optimization',
    parent: 'convexity',
    summary: 'Minimize linear $c^Tx$ subject to $Ax≤b$, $x≥0$. Feasible region is polyhedron, optimum at vertex. Simplex and interior point methods.',
    level: 'advanced',
    csFields: ['cloud-computing', 'computer-networks'],
    prerequisites: ['convexity', 'matrix-basics'],
    related: ['optimization-intro'],
    content: [
      { t: 'def', title: 'LP', text: 'Standard form: min $c^Tx$ s.t. $Ax=b$, $x≥0$. Feasible set convex polyhedron. Fundamental theorem: if optimum exists, it occurs at extreme point (vertex).' },
      { t: 'props', items: [
        { title: 'Duality', text: 'Every LP has dual: max $b^Ty$ s.t. $A^Ty ≤ c$. Weak duality: primal ≥ dual; strong: equal at optimum (if feasible).' },
        { title: 'Algorithms', text: 'Simplex walks vertex to vertex (exponential worst-case but fast in practice). Interior point polynomial O(n^3.5).' },
      ]},
      { t: 'ex', title: 'Resource allocation', steps: [
        'Factory makes A,B: profit 3A+5B, constraints: A+2B≤8 (material), 3A+2B≤12 (labor), A,B≥0.',
        'Vertices: (0,0)=0, (0,4)=20, (4,0)=12, (2,3)=21 → optimum (2,3) profit 21.',
      ]},
      { t: 'cs', items: [
        { area: 'Scheduling', how: 'Assigning VMs to hosts with CPU/memory constraints is LP relaxation of integer program.' },
      ]},
    ],
    practice: [
      { id: 'lp-p1', q: 'Why does LP optimum occur at vertex?', type: 'short', diff: 'medium', answer: 'Linear objective over convex polyhedron: level sets are hyperplanes, pushing in -c direction until last touch is at boundary, and an extreme point can be chosen.', explain: 'Convexity + linearity.' },
    ],
  },
  {
    id: 'lagrange-multipliers',
    title: 'Lagrange Multipliers',
    domain: 'optimization',
    parent: 'linear-programming',
    summary: 'For constrained $\\min f(x)$ s.t. $g(x)=0$: at optimum $∇f=λ∇g$ (gradients parallel). Lagrangian $L=f+λg$, stationary $∇L=0$.',
    level: 'advanced',
    csFields: ['ml', 'robotics'],
    prerequisites: ['gradient', 'linear-programming'],
    related: ['convexity'],
    content: [
      { t: 'def', title: 'Lagrange', text: 'Min f(x) s.t. g(x)=0. Lagrangian $L(x,λ)=f(x)+λ g(x)$. Necessary condition at optimum (regular): $∇_x L=0$, $g=0$. Geometrically: level set of f tangent to constraint, gradients parallel.' },
      { t: 'ex', title: 'Max area with perimeter', steps: [
        'Max xy s.t. 2x+2y=P. L=xy+λ(P-2x-2y). ∂L/∂x=y-2λ=0, ∂L/∂y=x-2λ=0 ⇒ x=y=P/4 square.',
      ]},
    ],
    practice: [],
  },
];
