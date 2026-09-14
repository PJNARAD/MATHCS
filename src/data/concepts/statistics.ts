import type { Concept } from '../types';

export const statistics: Concept[] = [
  {
    id: 'measures-of-center',
    title: 'Measures of Center',
    domain: 'statistics',
    topic: true,
    summary: 'Mean, median, mode: three ways to say “typical value”, with different robustness and meaning.',
    level: 'foundational',
    csFields: ['data-science', 'software-engineering', 'web-development', 'hci', 'cloud-computing'],
    prerequisites: ['expectation'],
    related: ['measures-of-spread', 'expectation'],
    next: ['measures-of-spread'],
    content: [
      { t: 'def', title: 'Center', text: 'Mean $\\bar x = \\frac1n\\sum x_i$ (sensitive to outliers, linear). Median = middle order statistic (robust, 50th percentile). Mode = most frequent (for categorical or multimodal).' },
      { t: 'ex', title: 'Income example', steps: [
        'Incomes [30k, 35k, 40k, 45k, 1M]: mean = 230k (pulled by outlier), median = 40k (typical), mode = none.',
        'Mean minimizes squared error: argmin_m Σ(x_i-m)² = mean. Median minimizes absolute error.',
      ]},
      { t: 'cs', items: [
        { area: 'Latency', how: 'Mean latency skewed by tail; median (p50) and p95/p99 better describe user experience.' },
      ]},
    ],
    practice: [
      { id: 'moc-p1', q: 'Dataset [1,2,3,100]. Mean vs median?', type: 'numeric', diff: 'easy', answer: 'Mean 26.5, median 2.5', explain: 'Mean affected by 100.' },
    ],
  },
  {
    id: 'measures-of-spread',
    title: 'Measures of Spread',
    domain: 'statistics',
    parent: 'measures-of-center',
    summary: 'Variance, standard deviation, IQR, range: how much data varies around its center.',
    level: 'foundational',
    csFields: ['data-science', 'hci'],
    prerequisites: ['measures-of-center'],
    related: ['variance-covariance', 'normal-distribution'],
    content: [
      { t: 'def', title: 'Spread', text: 'Range = max-min. IQR = Q3-Q1 (middle 50% width, robust). Variance $s²=\\frac1{n-1}\\sum (x_i-\\bar x)²$ (sample) or $σ²$ population; SD = √variance in same units.' },
      { t: 'props', items: [
        { title: 'Robustness', text: 'Range fragile (one outlier changes it); IQR robust; SD intermediate.' },
        { title: 'Chebyshev', text: 'At least 1-1/k² of data within k SDs of mean, for any distribution.' },
      ]},
      { t: 'cs', items: [
        { area: 'SLA', how: 'Jitter = spread of latency; SD and IQR quantify stability.' },
      ]},
    ],
    practice: [
      { id: 'mos-p1', q: 'Data [2,4,4,4,5,5,7,9]. Sample variance?', type: 'numeric', diff: 'medium', answer: '≈4.57', explain: 'Mean 5, sum squared dev 32, /(7)=4.57.' },
    ],
  },
  {
    id: 'correlation',
    title: 'Correlation',
    domain: 'statistics',
    parent: 'measures-of-spread',
    summary: 'Pearson $r = Cov(X,Y)/(σ_Xσ_Y) ∈ [-1,1]$: linear association. Spearman rank correlation for monotonic.',
    level: 'core',
    csFields: ['data-science', 'hci', 'ml'],
    prerequisites: ['variance-covariance', 'measures-of-center'],
    related: ['linear-regression', 'hypothesis-testing'],
    content: [
      { t: 'def', title: 'Pearson correlation', text: '$r = \\frac{\\sum (x_i-\\bar x)(y_i-\\bar y)}{\\sqrt{\\sum (x_i-\\bar x)²\\sum (y_i-\\bar y)²}}$. r=1 perfect positive linear, -1 perfect negative, 0 no linear relation.' },
      { t: 'callout', kind: 'warning', text: 'Correlation ≠ causation. Also, r=0 does not imply independence (e.g., Y=X² with symmetric X). Outliers can flip r.' },
      { t: 'ex', title: 'Anscombe quartet', steps: [
        'Four datasets with same mean, variance, r≈0.816 but wildly different scatterplots: linear, curved, outlier-driven, vertical.',
        'Lesson: always plot data; summary statistics hide structure.',
      ]},
    ],
    practice: [
      { id: 'corr-p1', q: 'If Y=2X+3 exactly, r=?', type: 'numeric', diff: 'easy', answer: '1', explain: 'Perfect positive linear.' },
    ],
  },
  {
    id: 'sampling-distributions',
    title: 'Sampling Distributions',
    domain: 'statistics',
    parent: 'measures-of-spread',
    summary: 'Distribution of a statistic (e.g., sample mean) over repeated samples. Foundation for inference.',
    level: 'core',
    csFields: ['data-science'],
    prerequisites: ['central-limit-theorem'],
    related: ['confidence-intervals', 'hypothesis-testing'],
    content: [
      { t: 'def', title: 'Sampling distribution', text: 'Fix population. Draw many samples size n, compute statistic T (e.g., mean). Distribution of T across samples is its sampling distribution. For mean: $E[\\bar X]=μ$, $Var(\\bar X)=σ²/n$, and by CLT $\\bar X≈N(μ,σ²/n)$ for large n.' },
      { t: 'ex', title: 'Standard error', steps: [
        'SE = SD of sampling distribution. For mean, SE = s/√n (estimated).',
        'SE shrinks as 1/√n: quadrupling sample halves error.',
      ]},
    ],
    practice: [
      { id: 'sd-p1', q: 'Population SD σ=10, n=100. SE of mean?', type: 'numeric', diff: 'easy', answer: '1', explain: '10/√100=1.' },
    ],
  },
  {
    id: 'confidence-intervals',
    title: 'Confidence Intervals',
    domain: 'statistics',
    parent: 'sampling-distributions',
    summary: 'Interval $\\bar x ± z*·SE$ that, under repeated sampling, contains true parameter with specified confidence (e.g., 95%).',
    level: 'core',
    csFields: ['data-science', 'hci'],
    prerequisites: ['sampling-distributions', 'normal-distribution'],
    related: ['hypothesis-testing', 'central-limit-theorem'],
    content: [
      { t: 'def', title: 'CI', text: '95% CI for mean (σ known): $\\bar x ± 1.96·σ/√n$. With σ unknown and large n, replace σ by s. Small n: use t-distribution.' },
      { t: 'callout', kind: 'insight', text: 'A 95% CI does NOT mean “95% probability true mean is in this interval” (mean is fixed, interval random). It means 95% of intervals from repeated sampling would contain the true mean.' },
      { t: 'ex', title: 'A/B test', steps: [
        'Control mean 2.5s, SE 0.1s, n=1000. 95% CI: 2.5±0.196 = [2.304,2.696].',
        'Treatment mean 2.3s, SE 0.1s, CI [2.104,2.496]. Overlap? Some overlap, but difference CI can be computed directly.',
      ]},
    ],
    practice: [
      { id: 'ci-p1', q: 'Mean 100, SE 5. 95% CI?', type: 'numeric', diff: 'easy', answer: '[90.2,109.8]', explain: '100±1.96*5.' },
    ],
  },
  {
    id: 'hypothesis-testing',
    title: 'Hypothesis Testing',
    domain: 'statistics',
    parent: 'confidence-intervals',
    summary: 'Formal decision: null H0 vs alternative H1. p-value = P(data at least as extreme | H0). Reject H0 if p < α.',
    level: 'core',
    csFields: ['data-science', 'hci', 'bioinformatics'],
    prerequisites: ['confidence-intervals', 'normal-distribution'],
    related: ['confidence-intervals', 'central-limit-theorem'],
    content: [
      { t: 'def', title: 'Test', text: 'Choose test statistic T. Compute p = P_{H0}(T ≥ observed). If p < α (e.g., 0.05), reject H0. Errors: Type I (false positive) = α, Type II (false negative) = β, power = 1-β.' },
      { t: 'ex', title: 'Coin fairness', steps: [
        'H0: p=0.5, observe 60 heads in 100 flips.',
        'Under H0, X~Bin(100,0.5), mean 50, SD 5. z=(60-50)/5=2, p≈0.045 two-sided? Actually one-sided 0.028, two-sided 0.056.',
        'At α=0.05, one-sided rejects, two-sided does not — choice of alternative matters.',
      ]},
      { t: 'callout', kind: 'warning', text: 'p-value is not P(H0 true | data). It is P(data | H0). Confusing them is the prosecutor’s fallacy.' },
    ],
    practice: [
      { id: 'ht-p1', q: 'What does p=0.03 mean?', type: 'short', diff: 'medium', answer: 'If H0 true, 3% chance to see data this extreme. Not 97% chance H1 true.', explain: 'Definition of p-value.' },
    ],
  },
  {
    id: 'linear-regression',
    title: 'Linear Regression',
    domain: 'statistics',
    parent: 'correlation',
    summary: 'Model $y = β0+β1x+ε$: least squares minimizes Σ(y_i-ŷ_i)². Solution $\\hat β = (X^TX)^{-1}X^Ty$.',
    level: 'core',
    csFields: ['data-science', 'ml', 'ai'],
    prerequisites: ['correlation', 'matrix-multiplication'],
    related: ['maximum-likelihood', 'least-squares'],
    content: [
      { t: 'def', title: 'Least squares', text: 'Minimize $||y-Xβ||²$. Normal equations $X^TXβ=X^Ty$. For simple regression (one feature): slope $\\hat β1 = r·(s_y/s_x)$, intercept $\\hat β0=\\bar y-\\hat β1\\bar x$.' },
      { t: 'ex', title: 'Height vs weight', steps: [
        'Data (height, weight): compute means, SDs, r=0.7.',
        'Slope = 0.7·(10kg/0.1m)=70 kg/m: each 1cm taller → 0.7kg heavier on average.',
      ]},
      { t: 'cs', items: [
        { area: 'Baseline model', how: 'First model for any tabular prediction: simple, interpretable, often surprisingly good.' },
      ]},
    ],
    practice: [
      { id: 'lr-p1', q: 'If r=0, slope?', type: 'numeric', diff: 'easy', answer: '0', explain: 'No linear relation.' },
    ],
  },
  {
    id: 'maximum-likelihood',
    title: 'Maximum Likelihood Estimation',
    domain: 'statistics',
    parent: 'linear-regression',
    summary: 'Choose parameters θ that maximize likelihood $L(θ)=P(data|θ)$ or log-likelihood $ℓ(θ)=log L$. The workhorse of fitting.',
    level: 'advanced',
    csFields: ['ml', 'data-science', 'ai'],
    prerequisites: ['conditional-probability', 'derivative'],
    related: ['bayes-theorem', 'entropy'],
    content: [
      { t: 'def', title: 'MLE', text: '$\\hat θ_{MLE}=argmax_θ L(θ)=argmax_θ \\sum_i log P(x_i|θ)$. Log turns product into sum, numerically stable.' },
      { t: 'ex', title: 'Coin bias', steps: [
        'Observe k heads in n flips: L(p)=p^k(1-p)^{n-k}, ℓ=k log p+(n-k)log(1-p).',
        'Derivative zero: k/p - (n-k)/(1-p)=0 → p̂=k/n (sample proportion).',
      ]},
      { t: 'cs', items: [
        { area: 'Logistic regression', how: 'MLE under Bernoulli model gives cross-entropy loss.' },
      ]},
    ],
    practice: [
      { id: 'mle-p1', q: 'Data [0,1,1,0,1] Bernoulli. MLE p?', type: 'numeric', diff: 'easy', answer: '0.6', explain: '3/5.' },
    ],
  },
  {
    id: 'bayesian-statistics',
    title: 'Bayesian Statistics',
    domain: 'statistics',
    parent: 'maximum-likelihood',
    summary: 'Treat parameters as random: posterior $P(θ|data) ∝ P(data|θ)P(θ)$. Prior + data → posterior.',
    level: 'advanced',
    csFields: ['data-science', 'ml'],
    prerequisites: ['bayes-theorem', 'maximum-likelihood'],
    related: ['confidence-intervals', 'maximum-likelihood'],
    content: [
      { t: 'def', title: 'Bayes', text: 'Posterior $∝$ Likelihood × Prior. MAP estimate = argmax posterior = argmax [log likelihood + log prior]. Prior acts as regularizer.' },
      { t: 'ex', title: 'Beta-Bernoulli', steps: [
        'Prior Beta(α,β) for p, likelihood Binomial(k|n,p). Posterior Beta(α+k, β+n-k).',
        'Mean posterior (α+k)/(α+β+n): pseudo-counts α,β.',
      ]},
    ],
    practice: [
      { id: 'bs-p1', q: 'Why does prior help with small data?', type: 'short', diff: 'medium', answer: 'Adds pseudo-observations, stabilizes estimate, avoids overfitting.', explain: 'Regularization.' },
    ],
  },
  {
    id: 'law-of-large-numbers-stat',
    title: 'LLN and CLT in Practice',
    domain: 'statistics',
    parent: 'bayesian-statistics',
    summary: 'How LLN and CLT justify polling, Monte Carlo, and confidence intervals.',
    level: 'core',
    csFields: ['data-science'],
    prerequisites: ['law-of-large-numbers', 'central-limit-theorem'],
    related: ['confidence-intervals', 'hypothesis-testing'],
    content: [
      { t: 'p', text: 'LLN: sample mean converges to true mean. CLT: its error is approx normal with SD σ/√n. Together they justify every “± margin of error” you see in polls.' },
      { t: 'ex', title: 'Poll margin', steps: [
        'n=1000, p̂=0.52, SE=√(p̂(1-p̂)/n)≈0.0158, 95% CI ≈ ±3.1%.',
        'Need ±1%? Need n≈(1.96/0.01)²·0.25≈9604.',
      ]},
    ],
    practice: [],
  },
];
