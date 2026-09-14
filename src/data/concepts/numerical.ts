import type { Concept } from '../types';

export const numerical: Concept[] = [
  {
    id: 'floating-point',
    title: 'Floating-Point Arithmetic',
    domain: 'numerical',
    topic: true,
    summary: 'IEEE 754: sign·mantissa·2^exponent. Finite precision ⇒ rounding error, cancellation, overflow/underflow. Machine epsilon ≈2^-52≈2e-16 for double.',
    level: 'foundational',
    csFields: ['computer-architecture', 'computer-graphics', 'numerical'],
    prerequisites: ['number-systems', 'binary-arithmetic'],
    related: ['numerical-stability', 'numerical-integration'],
    next: ['numerical-stability'],
    content: [
      { t: 'def', title: 'IEEE 754 double', text: '64 bits: 1 sign, 11 exponent (bias 1023), 52 mantissa (plus implicit leading 1). Value = (-1)^sign × 1.mantissa × 2^{exponent-bias}. Special: 0, ∞, NaN.' },
      { t: 'props', items: [
        { title: 'Machine epsilon', text: 'ε_mach = distance from 1 to next representable ≈2.22e-16 double. Means ~15-16 decimal digits precision.' },
        { title: 'Rounding', text: 'Real x → fl(x)=x(1+δ), |δ|≤ε_mach/2 (round to nearest). Error relative ≤ ε.' },
        { title: 'Catastrophic cancellation', text: 'Subtracting nearly equal numbers: (1.0000001 - 1.0) loses significance: 1e-7 has only ~9 digits left if original had 16.' },
      ]},
      { t: 'ex', title: '0.1+0.2', steps: [
        '0.1 decimal = 0.0001100110011... binary repeating, not exact.',
        'fl(0.1)=0.10000000000000000555..., fl(0.2)=0.2000000000000000111..., sum=0.300000000000000044... ≠0.3.',
        'Hence 0.1+0.2==0.3 false in floating point.',
      ]},
      { t: 'cs', items: [
        { area: 'Graphics', how: 'Depth buffer precision: z-fighting when two surfaces nearly same depth, due to floating error.' },
        { area: 'ML', how: 'Mixed precision training: FP16 faster but needs loss scaling to avoid underflow.' },
      ]},
    ],
    practice: [
      { id: 'fp-p1', q: 'Why is 0.1+0.2 !=0.3 in floating point?', type: 'short', diff: 'easy', answer: '0.1 and 0.2 not exactly representable binary, rounding error.', explain: 'Binary floating.' },
    ],
  },
  {
    id: 'numerical-stability',
    title: 'Numerical Stability',
    domain: 'numerical',
    parent: 'floating-point',
    summary: 'Condition number measures sensitivity: ill-conditioned problem amplifies input error. Stable algorithm has error not much larger than problem conditioning.',
    level: 'core',
    csFields: ['numerical', 'computer-graphics'],
    prerequisites: ['floating-point'],
    related: ['floating-point', 'systems-of-equations'],
    content: [
      { t: 'def', title: 'Conditioning', text: 'Problem with input x, output f(x). Relative condition number κ = |x f\'(x)/f(x)| (for scalar). If κ large, small input change → large output change: ill-conditioned, any algorithm will have large error. Stable algorithm: forward error ≤ C·κ·ε_mach.' },
      { t: 'ex', title: 'Quadratic formula', steps: [
        'Solve x² -1000x+1=0: roots ≈1000 and 0.001.',
        'Naive (-b+√(b²-4ac))/2a: b²=1e6, b²-4ac≈999996, √≈999.998, -b+√ = -1000+999.998=-0.002 → division by 2 gives -0.001, but cancellation loses digits (1000 and 999.998 close).',
        'Stable: compute root with -b - sign(b)√(b²-4ac) first (no cancellation), then other via c/(a·root1).',
      ]},
      { t: 'cs', items: [
        { area: 'Linear algebra', how: 'Solving Ax=b: condition number κ(A)=||A||·||A^{-1}||. If κ large, solution sensitive to b error.' },
      ]},
    ],
    practice: [
      { id: 'ns2-p1', q: 'What is catastrophic cancellation?', type: 'short', diff: 'medium', answer: 'Subtracting nearly equal numbers, losing significant digits, relative error blows up.', explain: 'Example 1.0000001-1.0.' },
    ],
  },
  {
    id: 'root-finding',
    title: 'Root Finding',
    domain: 'numerical',
    parent: 'numerical-stability',
    summary: 'Solve f(x)=0. Bisection (robust, linear), Newton (fast quadratic if near root), secant (superlinear).',
    level: 'core',
    csFields: ['numerical', 'computer-graphics'],
    prerequisites: ['derivative', 'continuity'],
    related: ['newtons-method', 'binary-search'],
    content: [
      { t: 'def', title: 'Methods', text: 'Bisection: if f(a)f(b)<0 and continuous, root in [a,b]; halve interval each step, error halves (linear). Newton: x_{k+1}=x_k - f(x_k)/f\'(x_k), quadratic convergence near simple root if f\'≠0. Secant: approximates f\' by finite difference, superlinear order ≈1.618.' },
      { t: 'ex', title: '√2 via Newton', steps: [
        'Solve f(x)=x²-2=0, f\'=2x, Newton: x_{k+1}= (x_k +2/x_k)/2.',
        'Start 1: x1=1.5, x2=1.4167, x3=1.4142157, x4=1.41421356 quadratic convergence (digits double).',
      ]},
      { t: 'cs', items: [
        { area: 'Graphics', how: 'Ray-sphere intersection solves quadratic; Newton for ray-implicit surface.' },
      ]},
    ],
    practice: [
      { id: 'rf-p1', q: 'Bisection error after 10 steps starting interval length 1?', type: 'numeric', diff: 'easy', answer: '2^{-10}≈0.000976', explain: 'Halves each step.' },
    ],
  },
  {
    id: 'numerical-integration',
    title: 'Numerical Integration',
    domain: 'numerical',
    parent: 'root-finding',
    summary: 'Approximate ∫_a^b f(x)dx. Trapezoid O(h²), Simpson O(h⁴), Gaussian quadrature, Monte Carlo O(1/√n) but dimension independent.',
    level: 'core',
    csFields: ['computer-graphics', 'numerical', 'data-science'],
    prerequisites: ['definite-integral', 'taylor-series'],
    related: ['monte-carlo'],
    content: [
      { t: 'def', title: 'Quadrature', text: 'Approximate integral by weighted sum ∑ w_i f(x_i). Trapezoid: (b-a)(f(a)+f(b))/2, error O((b-a)³f\"/12). Simpson: (b-a)/6·(f(a)+4f((a+b)/2)+f(b)), error O((b-a)^5 f^{(4)}/2880), exact for cubics. Composite: split into n subintervals, sum.' },
      { t: 'ex', title: '∫0^1 e^x dx', steps: [
        'Exact e-1≈1.71828.',
        'Trapezoid n=1: (1)(1+e)/2≈1.859, error 0.14.',
        'Simpson n=1: (1/6)(1+4e^{0.5}+e)≈1.71886 error 0.00058 much better.',
        'n=2 Simpson even better O(h⁴).',
      ]},
      { t: 'cs', items: [
        { area: 'Path tracing', how: 'Pixel color = integral over light paths, estimated by Monte Carlo: average of random path samples.' },
        { area: 'ML', how: 'Expected loss integral approximated by average over batch (Monte Carlo).' },
      ]},
    ],
    practice: [
      { id: 'ni-p1', q: 'Why is Simpson exact for cubics?', type: 'short', diff: 'medium', answer: 'Error term involves 4th derivative, zero for degree ≤3.', explain: 'Error formula.' },
    ],
  },
  {
    id: 'monte-carlo',
    title: 'Monte Carlo Methods',
    domain: 'numerical',
    parent: 'numerical-integration',
    summary: 'Estimate expectations/integrals by random sampling: $∫f(x)p(x)dx ≈ (1/n)∑f(X_i)$, $X_i∼p$. Error $O(1/√n)$ independent of dimension, by CLT.',
    level: 'core',
    csFields: ['computer-graphics', 'data-science', 'numerical'],
    prerequisites: ['numerical-integration', 'law-of-large-numbers'],
    related: ['central-limit-theorem', 'variance-covariance'],
    content: [
      { t: 'def', title: 'Monte Carlo', text: 'Want $I=E_p[f(X)]$. Sample $X_1,...,X_n∼p$ i.i.d., estimate $\\hat I_n = (1/n)∑ f(X_i)$. By LLN, $\\hat I_n→I$; by CLT, error ≈ σ/√n where σ²=Var(f(X)). Dimension independent — beats grid in high D.' },
      { t: 'ex', title: 'π estimation', steps: [
        'Sample (x,y) uniform [0,1]², check if x²+y²≤1 (quarter circle).',
        'Fraction inside → π/4. So π≈4·(inside/n).',
        'Error O(1/√n): need 1e6 samples for ~3 digits.',
      ]},
      { t: 'cs', items: [
        { area: 'Graphics', how: 'Path tracing = Monte Carlo integration over light transport.' },
        { area: 'Finance', how: 'Option pricing via random walks.' },
      ]},
    ],
    practice: [
      { id: 'mc2-p1', q: 'Monte Carlo error scaling?', type: 'short', diff: 'easy', answer: 'O(1/√n)', explain: 'CLT.' },
    ],
  },
  {
    id: 'systems-of-equations',
    title: 'Linear Systems and Gaussian Elimination',
    domain: 'numerical',
    parent: 'numerical-stability',
    summary: 'Solve Ax=b via Gaussian elimination O(n³): forward elimination to upper triangular, back substitution. LU decomposition, pivoting for stability.',
    level: 'core',
    csFields: ['numerical', 'computer-graphics'],
    prerequisites: ['matrix-basics', 'floating-point'],
    related: ['least-squares', 'eigenvalues-eigenvectors'],
    content: [
      { t: 'def', title: 'Gaussian elimination', text: 'Transform [A|b] to upper triangular via row operations: swap rows (pivoting), add multiple of row to another. Then back substitution solves. LU: A=LU with L lower unit, U upper; solve Ly=b then Ux=y. Cost O(n³) flops.' },
      { t: 'props', items: [
        { title: 'Pivoting', text: 'Partial pivoting: choose largest |A_{ik}| in column k as pivot to reduce roundoff. Complete pivoting chooses max in submatrix.' },
        { title: 'Conditioning', text: 'If κ(A) large, small residual may still mean large error in x.' },
      ]},
      { t: 'ex', title: '2x2', steps: [
        'System: 2x+y=5, x+3y=6.',
        'Eliminate: R2←R2 -0.5 R1: [0, 2.5 | 3.5] → y=1.4, x=(5-1.4)/2=1.8.',
      ]},
    ],
    practice: [],
  },
  {
    id: 'interpolation',
    title: 'Interpolation',
    domain: 'numerical',
    parent: 'systems-of-equations',
    summary: 'Given (x_i,y_i), find polynomial p with p(x_i)=y_i. Lagrange form, Newton divided differences, spline piecewise polynomials avoid Runge.',
    level: 'advanced',
    csFields: ['computer-graphics', 'numerical'],
    prerequisites: ['systems-of-equations'],
    related: ['taylor-series'],
    content: [
      { t: 'def', title: 'Polynomial interpolation', text: 'n+1 points with distinct x_i determine unique degree ≤n polynomial. Lagrange: $p(x)=∑ y_i ℓ_i(x)$ where $ℓ_i(x)=∏_{j≠i}(x-x_j)/(x_i-x_j)$. Newton: incremental with divided differences.' },
      { t: 'callout', kind: 'warning', text: 'High-degree interpolation on equispaced points suffers Runge phenomenon: oscillations near edges. Use splines (piecewise low-degree) or Chebyshev nodes.' },
      { t: 'ex', title: 'Linear interpolation', steps: [
        'Points (0,0),(1,1): p(x)=x.',
        'In graphics, lerp(a,b,t)=(1-t)a + t b = a + t(b-a).',
      ]},
    ],
    practice: [],
  },
];
