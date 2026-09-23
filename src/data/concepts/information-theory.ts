import type { Concept } from '../types';

export const informationTheory: Concept[] = [
  {
    id: 'entropy',
    title: 'Entropy',
    domain: 'information-theory',
    topic: true,
    summary: 'Shannon entropy $H(X)=-∑ p(x) log₂ p(x)$: expected surprise, bits needed to encode. $0≤H≤log|𝒳|$, max when uniform.',
    level: 'core',
    csFields: ['ai', 'ml', 'nlp', 'cybersecurity', 'cryptography', 'information-retrieval', 'computer-networks'],
    prerequisites: ['probability-axioms', 'logarithms', 'expectation'],
    related: ['cross-entropy', 'mutual-information', 'compression'],
    next: ['cross-entropy'],
    content: [
      { t: 'def', title: 'Entropy', text: 'For discrete X with PMF p(x): $H(X)= -\\sum_x p(x)\\log_2 p(x)$ (bits). Convention $0\\log0=0$. Measures uncertainty / expected information content. $H(X)=E[-\\log p(X)]$.' },
      { t: 'props', items: [
        { title: 'Bounds', text: '0 ≤ H(X) ≤ log₂|𝒳|, with 0 when deterministic (one outcome prob 1), log|𝒳| when uniform.' },
        { title: 'Additivity', text: 'If X,Y independent, H(X,Y)=H(X)+H(Y).' },
        { title: 'Chain rule', text: 'H(X,Y)=H(X)+H(Y|X).' },
      ]},
      { t: 'ex', title: 'Coin', steps: [
        'Fair coin: p=0.5 each, H = -0.5 log2 0.5 -0.5 log2 0.5 =1 bit.',
        'Biased p=0.9: H = -0.9 log2 0.9 -0.1 log2 0.1 ≈0.469 bits: less surprise, more predictable.',
        'Deterministic: H=0.',
      ]},
      { t: 'formula', name: 'Joint and conditional', latex: 'H(X,Y)=-\\sum_{x,y} p(x,y)\\log p(x,y),\\; H(Y|X)=\\sum_x p(x) H(Y|X=x) = -\\sum_{x,y} p(x,y)\\log p(y|x)', note: '' },
      { t: 'cs', items: [
        { area: 'Compression', how: 'Shannon source coding theorem: n i.i.d. samples need ≈ nH bits to encode, cannot do better.' },
        { area: 'ML loss', how: 'Cross-entropy loss = H(p,q) = H(p)+D_KL(p||q): minimizing cross-entropy = minimizing KL divergence to true distribution.' },
        { area: 'Security', how: 'Key strength in bits = entropy of key generation process. Low entropy → brute-force feasible.' },
      ]},
    ],
    practice: [
      { id: 'ent-p1', q: 'X uniform over 8 outcomes. H(X)?', type: 'numeric', diff: 'easy', answer: '3 bits', explain: 'log2 8=3.' },
      { id: 'ent-p2', q: 'Fair die (6 outcomes) entropy?', type: 'numeric', diff: 'easy', answer: 'log2 6 ≈2.585 bits', explain: '-6*(1/6 log2 1/6)=log2 6.' },
      { id: 'ent-p3', q: 'Why does uniform maximize entropy?', type: 'short', diff: 'medium', answer: 'By Jensen or Lagrange multipliers: maximize -∑p log p subject to ∑p=1, p≥0 → p uniform. Intuition: uniform most unpredictable.', explain: 'Concave optimization.' },
    ],
  },
  {
    id: 'cross-entropy',
    title: 'Cross-Entropy and KL Divergence',
    domain: 'information-theory',
    parent: 'entropy',
    summary: '$H(p,q)=-∑ p(x) log q(x)$: bits when using q to encode p. $D_{KL}(p||q)=∑ p log(p/q)=H(p,q)-H(p)≥0$: extra cost of mismatch.',
    level: 'core',
    csFields: ['ml', 'nlp', 'deep-learning'],
    prerequisites: ['entropy'],
    related: ['entropy', 'maximum-likelihood'],
    content: [
      { t: 'def', title: 'Cross-entropy & KL', text: 'Cross-entropy $H(p,q)=-\\sum p(x)\\log q(x)$. KL divergence $D_{KL}(p||q)=\\sum p(x)\\log\\frac{p(x)}{q(x)} = H(p,q)-H(p)$. $D_{KL}≥0$ with equality iff p=q (Gibbs inequality).' },
      { t: 'props', items: [
        { title: 'Not symmetric', text: 'D_KL(p||q)≠D_KL(q||p).' },
        { title: 'ML connection', text: 'MLE minimizes D_KL(empirical || model) = minimizes cross-entropy.' },
        { title: 'Chain rule', text: 'D_KL(p(x,y)||q(x,y))=D_KL(p(x)||q(x))+E_{p(x)}[D_KL(p(y|x)||q(y|x))].' },
      ]},
      { t: 'ex', title: 'Classification loss', steps: [
        'True distribution p = one-hot [0,1,0] for class 1.',
        'Model q=[0.2,0.7,0.1]. Cross-entropy = -log 0.7 ≈0.357.',
        'If q=[0.1,0.1,0.8] (wrong), CE = -log 0.1=2.30 larger.',
      ]},
      { t: 'cs', items: [
        { area: 'Deep learning', how: 'Softmax + cross-entropy loss is standard for classification.' },
      ]},
    ],
    practice: [
      { id: 'ce-p1', q: 'p=[1,0], q=[0.5,0.5]. H(p,q)?', type: 'numeric', diff: 'easy', answer: '1 bit', explain: '-1*log2 0.5 =1.' },
    ],
  },
  {
    id: 'mutual-information',
    title: 'Mutual Information',
    domain: 'information-theory',
    parent: 'cross-entropy',
    summary: '$I(X;Y)=H(X)-H(X|Y)=H(Y)-H(Y|X)=H(X)+H(Y)-H(X,Y)=D_{KL}(p(x,y)||p(x)p(y))$: reduction in uncertainty about X from knowing Y.',
    level: 'advanced',
    csFields: ['ml', 'nlp', 'information-retrieval'],
    prerequisites: ['entropy'],
    related: ['entropy', 'bayes-theorem'],
    content: [
      { t: 'def', title: 'MI', text: '$I(X;Y)=\\sum_{x,y} p(x,y)\\log\\frac{p(x,y)}{p(x)p(y)} = D_{KL}(p(x,y)||p(x)p(y))$. $I≥0$, 0 iff independent. Symmetric: I(X;Y)=I(Y;X). $I(X;Y)≤\\min(H(X),H(Y))$.' },
      { t: 'ex', title: 'Perfect correlation', steps: [
        'X=Y fair coin: H(X)=1, H(X|Y)=0, so I=1 bit: Y tells everything about X.',
        'X,Y independent fair coins: H(X|Y)=H(X)=1, I=0.',
      ]},
      { t: 'cs', items: [
        { area: 'Feature selection', how: 'Choose features with high MI with label, low MI with each other.' },
        { area: 'Info bottleneck', how: 'Deep learning theory: layer should maximize I(layer;label) while minimizing I(layer;input).' },
      ]},
    ],
    practice: [
      { id: 'mutual-p1', q: 'If X independent of Y, I(X;Y)?', type: 'numeric', diff: 'easy', answer: '0', explain: 'p(x,y)=p(x)p(y), log ratio 0.' },
    ],
  },
  {
    id: 'compression',
    title: 'Source Coding and Compression',
    domain: 'information-theory',
    parent: 'entropy',
    summary: 'Shannon: n i.i.d. symbols with entropy H can be compressed to ≈ nH bits, no more. Huffman coding achieves within 1 bit of H.',
    level: 'core',
    csFields: ['computer-networks', 'information-retrieval'],
    prerequisites: ['entropy'],
    related: ['entropy', 'cross-entropy'],
    content: [
      { t: 'thm', name: 'Source coding theorem', statement: 'For i.i.d. X^n with entropy H, for any ε>0, ∃ code with expected length ≤ n(H+ε) for large n, and no code can achieve expected length < n(H-ε) (asymptotically).', proof: ['Typical set has ≈2^{nH} sequences, each ~2^{-nH} probable; need nH bits to index them. Atypical set negligible.']},
      { t: 'ex', title: 'Huffman', steps: [
        'Symbols A:0.5,B:0.25,C:0.125,D:0.125. Entropy =1.75 bits.',
        'Huffman: A=0 (1 bit), B=10 (2 bits), C=110, D=111 (3 bits). Expected length =0.5*1+0.25*2+0.125*3+0.125*3=1.75 = H, optimal.',
      ]},
      { t: 'viz', id: 'huffman', props: { preset: 'skew', message: 'AAAAAABCD' } },
      { t: 'cs', items: [
        { area: 'ZIP', how: 'Lempel-Ziv approximates entropy rate of source.' },
        { area: 'ML', how: 'VAE loss includes entropy term for latent code.' },
      ]},
    ],
    practice: [],
  },
  {
    id: 'channel-capacity',
    title: 'Channel Capacity',
    domain: 'information-theory',
    parent: 'mutual-information',
    summary: 'Noisy channel $p(y|x)$. Capacity $C=\\max_{p(x)} I(X;Y)$: max reliable rate. Shannon: rate <C achievable with arbitrarily low error, >C impossible.',
    level: 'advanced',
    csFields: ['computer-networks'],
    prerequisites: ['mutual-information'],
    related: ['entropy', 'error-correction-codes'],
    content: [
      { t: 'def', title: 'Capacity', text: 'Channel defined by $p(y|x)$. For input distribution $p(x)$, $I(X;Y)$ is mutual info. Capacity $C=\\max_{p(x)} I(X;Y)$: supremum of achievable reliable communication rates.' },
      { t: 'ex', title: 'Binary symmetric channel', steps: [
        'BSC flips bit with prob p: Y = X ⊕ Z, Z~Bernoulli(p).',
        'Capacity C=1-H(p). If p=0 (noiseless), C=1 bit/use. If p=0.5 (useless), H(p)=1, C=0.',
        'p=0.1: H(0.1)≈0.469, C≈0.531 bits per use.',
      ]},
      { t: 'cs', items: [
        { area: '5G', how: 'Code design aims to approach capacity: LDPC, Turbo codes.' },
      ]},
    ],
    practice: [],
  },
  {
    id: 'error-correction-codes',
    title: 'Error-Correcting Codes',
    domain: 'information-theory',
    parent: 'channel-capacity',
    summary: 'Add redundancy to detect/correct errors: Hamming distance, parity, Hamming codes, Reed-Solomon. Rate vs distance tradeoff.',
    level: 'advanced',
    csFields: ['computer-networks', 'cryptography'],
    prerequisites: ['channel-capacity', 'finite-fields'],
    related: ['finite-fields', 'entropy'],
    content: [
      { t: 'def', title: 'Code', text: 'Code C⊆Σ^n: set of codewords length n. Hamming distance d(x,y)=#positions differing. Minimum distance d_min = min_{x≠y∈C} d(x,y). Can detect up to d_min-1 errors, correct up to ⌊(d_min-1)/2⌋.' },
      { t: 'ex', title: 'Hamming (7,4)', steps: [
        '4 data bits +3 parity bits, n=7,k=4,d=3: corrects 1 error, detects 2.',
        'Parity checks: p1 covers bits 1,2,4; p2 covers 1,3,4; p3 covers 2,3,4 (binary representation).',
        'Syndrome = position of error in binary.',
      ]},
      { t: 'cs', items: [
        { area: 'Storage', how: 'RAID, QR codes use Reed-Solomon over GF(256).' },
        { area: 'RAM', how: 'ECC memory uses Hamming codes.' },
      ]},
    ],
    practice: [],
  },
];
