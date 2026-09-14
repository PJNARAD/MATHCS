import type { Concept } from '../types';

export const formal: Concept[] = [
  {
    id: 'formal-languages-basics',
    title: 'Formal Languages Basics',
    domain: 'formal',
    topic: true,
    summary: 'Alphabet Σ, string over Σ, language L⊆Σ*. Operations: union, concatenation, Kleene star L* = ∪_{n≥0} L^n. Empty string ε and empty language ∅.',
    level: 'foundational',
    csFields: ['compilers', 'theoretical-cs'],
    prerequisites: ['set-basics', 'set-operations'],
    related: ['regular-languages', 'context-free-languages'],
    next: ['regular-languages'],
    content: [
      { t: 'def', title: 'Language', text: 'Alphabet Σ finite set of symbols. Σ* = all finite strings over Σ including ε (empty string, length 0). Language L is subset of Σ*. Operations: L1∪L2, L1L2={xy|x∈L1,y∈L2}, L*={ε}∪L∪LL∪... (zero or more concatenations), L+ = LL* (one or more).' },
      { t: 'ex', title: 'Examples', steps: [
        'Σ={0,1}, L={w | w has even number of 0s}: infinite language.',
        'L={a^n b^n | n≥0}: not regular, but context-free.',
        '∅ vs {ε}: ∅ has no strings, {ε} has one string of length 0. ∅*={ε}.',
      ]},
      { t: 'cs', items: [
        { area: 'Regex', how: 'Regular expressions denote regular languages, used in lexing.' },
      ]},
    ],
    practice: [
      { id: 'flb-p1', q: 'Σ={a,b}, L={a,ab}. What is L²?', type: 'short', diff: 'easy', answer: '{aa, aab, aba, abab}? Wait compute: L·L = {a·a=aa, a·ab=aab, ab·a=aba, ab·ab=abab} = {aa,aab,aba,abab}.', explain: 'Concatenation.' },
    ],
  },
  {
    id: 'regular-languages',
    title: 'Regular Languages and Regex',
    domain: 'formal',
    parent: 'formal-languages-basics',
    summary: 'Built from ∅, {ε}, {a} via union, concat, star. Equivalent to regex and to finite automata. Closed under Boolean ops.',
    level: 'core',
    csFields: ['compilers', 'theoretical-cs'],
    prerequisites: ['formal-languages-basics'],
    related: ['finite-automata', 'context-free-languages'],
    next: ['finite-automata'],
    content: [
      { t: 'def', title: 'Regular', text: 'Regular languages are smallest class containing ∅,{ε},{a} for each a∈Σ and closed under union, concatenation, star. Regex syntax: ∅, ε, a, R1|R2 (union), R1R2 (concat), R* (star), R+ = RR*, R? = ε|R. Precedence: * highest, then concat, then |.' },
      { t: 'props', items: [
        { title: 'Closure', text: 'Regular closed under union, concat, star, complement, intersection, difference, reversal.' },
        { title: 'Pumping lemma', text: 'If L regular, ∃p such that any s∈L with |s|≥p can be split s=xyz with |xy|≤p, |y|>0, and xy^i z∈L for all i≥0. Used to prove non-regularity.' },
      ]},
      { t: 'ex', title: 'Regex examples', steps: [
        '(a|b)*abb: strings ending with abb.',
        '0*10*1: strings with exactly two 1s? Actually 0*1 0*1 0*? No, (0*10*10*): exactly two 1s.',
        'Σ={0,1}, even number of 0s: (1*01*01*)*1* .',
      ]},
      { t: 'cs', items: [
        { area: 'Lexing', how: 'Tokens defined by regex: identifier [a-zA-Z_][a-zA-Z0-9_]*, number [0-9]+, etc. Lexer converts regex to DFA.' },
      ]},
    ],
    practice: [
      { id: 'reg-p1', q: 'Give regex for strings over {0,1} with no consecutive 1s.', type: 'short', diff: 'medium', answer: '(0|10)*(ε|1) or (1?0)*1?', explain: 'Avoid 11.' },
      { id: 'reg-p2', q: 'Use pumping lemma to show {a^n b^n} not regular.', type: 'proof', diff: 'medium', answer: 'Assume regular, p pumping length, s=a^p b^p, |xy|≤p so y = a^k, k>0. Pump y: xy²z = a^{p+k}b^p not in L (unequal numbers). Contradiction.', explain: 'Classic proof.' },
    ],
  },
  {
    id: 'finite-automata',
    title: 'Finite Automata (DFA/NFA)',
    domain: 'formal',
    parent: 'regular-languages',
    summary: 'DFA: 5-tuple (Q,Σ,δ,q0,F) deterministic. NFA allows ε and multiple transitions; equivalent to DFA via subset construction. Regular = recognized by DFA.',
    level: 'core',
    csFields: ['compilers', 'theoretical-cs'],
    prerequisites: ['regular-languages'],
    related: ['regular-languages', 'context-free-languages'],
    next: ['context-free-languages'],
    content: [
      { t: 'def', title: 'DFA', text: 'DFA = (Q,Σ,δ:Q×Σ→Q, q0∈Q, F⊆Q). Extended δ̂(q,ε)=q, δ̂(q,wa)=δ(δ̂(q,w),a). Accepts w if δ̂(q0,w)∈F. NFA: δ:Q×(Σ∪{ε})→P(Q), accepts if some path from q0 to F spells w. NFA→DFA: subset construction: DFA states = subsets of NFA states, exponential blowup 2^n worst case.' },
      { t: 'ex', title: 'DFA for even 0s', steps: [
        'States q_even, q_odd. Start q_even, accepting q_even.',
        'δ(q_even,0)=q_odd, δ(q_odd,0)=q_even, δ(q,1)=q for both.',
        'Tracks parity of 0s.',
      ]},
      { t: 'props', items: [
        { title: 'Equivalence', text: 'DFA ≡ NFA ≡ ε-NFA ≡ regex ≡ regular languages (Kleene theorem).' },
        { title: 'Minimization', text: 'Myhill-Nerode: minimal DFA unique up to isomorphism, found via partition refinement (Hopcroft O(n log n)).' },
      ]},
      { t: 'cs', items: [
        { area: 'Lexers', how: 'Regex → NFA (Thompson) → DFA (subset) → minimized DFA → table-driven lexer.' },
        { area: 'Network', how: 'Packet filtering: regex-like patterns compiled to DFA for line-rate matching.' },
      ]},
    ],
    practice: [
      { id: 'dfa-p1', q: 'NFA with n states → DFA at most how many states?', type: 'numeric', diff: 'easy', answer: '2^n', explain: 'Subset construction.' },
    ],
  },
  {
    id: 'context-free-languages',
    title: 'Context-Free Languages and Grammars',
    domain: 'formal',
    parent: 'finite-automata',
    summary: 'CFG: variables, terminals, productions A→α, start S. Derives strings via replacements. Recognized by pushdown automata. Not closed under intersection/complement.',
    level: 'core',
    csFields: ['compilers', 'theoretical-cs'],
    prerequisites: ['finite-automata'],
    related: ['regular-languages', 'turing-machines'],
    next: ['turing-machines'],
    content: [
      { t: 'def', title: 'CFG', text: 'CFG G=(V,Σ,R,S) where V variables, Σ terminals disjoint, R productions A→α with A∈V, α∈(V∪Σ)*, S start. Derives via ⇒: replace variable by RHS. Language L(G)={w∈Σ* | S⇒*w}. Example S→aSb|ε generates {a^n b^n}.' },
      { t: 'props', items: [
        { title: 'Normal forms', text: 'Chomsky normal form: productions A→BC or A→a, plus S→ε. Greibach: A→aα where α∈V*. Useful for parsing.' },
        { title: 'Pumping lemma CFL', text: 'If L CFL, ∃p such that any s∈L, |s|≥p can be split s=uvxyz with |vxy|≤p, |vy|>0, uv^i x y^i z∈L.' },
        { title: 'Closure', text: 'CFL closed under union, concat, star, reversal, not under intersection/complement. Intersection of CFL and regular is CFL.' },
      ]},
      { t: 'ex', title: 'Balanced parentheses', steps: [
        'S→SS | (S) | ε generates all balanced parentheses.',
        'Parse tree for (()): S→(S) →((S)) →(()).',
        'Ambiguity: grammar S→S+S|S*S|(S)|a ambiguous (a+a*a has two parse trees). Need precedence/associativity or different grammar.',
      ]},
      { t: 'cs', items: [
        { area: 'Parsing', how: 'Programming language syntax is CFG; parser builds parse tree.' },
        { area: 'Catalan', how: 'Number of parse trees for n pairs of parens = Catalan number.' },
      ]},
    ],
    practice: [
      { id: 'cfl-p1', q: 'Give CFG for {a^n b^n | n≥0}.', type: 'short', diff: 'easy', answer: 'S→aSb|ε', explain: 'Recursive.' },
      { id: 'cfl-p2', q: 'Is {a^n b^n c^n} context-free?', type: 'truefalse', diff: 'medium', options: ['True','False'], correct: 1, answer: 'False, needs two stacks (context-sensitive). Pumping lemma CFL fails.', explain: 'Classic non-CFL.' },
    ],
  },
  {
    id: 'turing-machines',
    title: 'Turing Machines',
    domain: 'formal',
    parent: 'context-free-languages',
    summary: 'TM = finite control + infinite tape. Formalizes algorithm. Decidable = TM halts with yes/no; recognizable = TM halts on yes, may loop on no.',
    level: 'advanced',
    csFields: ['theoretical-cs', 'compilers'],
    prerequisites: ['context-free-languages'],
    related: ['halting-problem', 'complexity-classes'],
    next: ['halting-problem'],
    content: [
      { t: 'def', title: 'TM', text: 'TM = (Q,Σ,Γ,δ,q0,q_accept,q_reject) where Γ⊇Σ tape alphabet with blank ⊔, δ:Q×Γ→Q×Γ×{L,R} transition. Configuration = tape contents + head pos + state. TM starts with input on tape, runs. Decides L if always halts and accepts iff w∈L. Recognizes L if accepts exactly w∈L (may loop otherwise). Church-Turing thesis: TM captures intuitive algorithm.' },
      { t: 'props', items: [
        { title: 'Variants equivalent', text: 'Multi-tape, nondeterministic, two-way infinite tape all same power (polynomial overhead for multi-tape).' },
        { title: 'Universal TM', text: 'Exists UTM that simulates any TM given its description: basis of stored-program computer.' },
        { title: 'Undecidable', text: 'Some languages not decidable (e.g., halting problem), some not even recognizable.' },
      ]},
      { t: 'cs', items: [
        { area: 'Computability', how: 'Defines what can be computed at all.' },
      ]},
    ],
    practice: [],
  },
  {
    id: 'halting-problem',
    title: 'Halting Problem',
    domain: 'formal',
    parent: 'turing-machines',
    summary: 'HALT = {<M,w> | TM M halts on w} is undecidable: no TM decides it. Diagonalization proof. Reductions show many other problems undecidable.',
    level: 'advanced',
    csFields: ['theoretical-cs'],
    prerequisites: ['turing-machines'],
    related: ['turing-machines', 'complexity-classes'],
    next: ['complexity-classes'],
    content: [
      { t: 'thm', name: 'Halting undecidable', statement: 'No TM H decides HALT = {<M,w> | M halts on w}.', proof: [
        'Assume H decides HALT. Build D that on input <M>: run H(<M,<M>>); if H says halts, loop forever; else halt.',
        'Consider D(<D>): if D halts on <D>, then H(<D,<D>>)=halts, so D loops — contradiction. If D loops on <D>, then H says loops, so D halts — contradiction.',
        'Hence H cannot exist.',
      ]},
      { t: 'ex', title: 'Reductions', steps: [
        'If we could decide “does M accept ε?”, we could decide HALT: transform M to M\' that on any input runs M on w then accepts if M halted — M\' accepts ε iff M halts on w.',
        'Thus many problems undecidable via reduction from HALT.',
      ]},
      { t: 'cs', items: [
        { area: 'Program analysis', how: 'Perfect bug detector impossible: would solve halting.' },
      ]},
    ],
    practice: [
      { id: 'halt-p1', q: 'Why does halting undecidability imply no perfect virus detector?', type: 'short', diff: 'medium', answer: 'Virus detector would need to decide if program does malicious action (e.g., halts with certain output), which reduces from halting.', explain: 'Rice theorem.' },
    ],
  },
  {
    id: 'complexity-classes',
    title: 'Complexity Classes P and NP',
    domain: 'formal',
    parent: 'halting-problem',
    summary: 'P = decidable in poly time by deterministic TM. NP = decidable in poly time by nondeterministic TM, equivalently verifiable in poly time. P vs NP open.',
    level: 'advanced',
    csFields: ['theoretical-cs'],
    prerequisites: ['turing-machines', 'halting-problem'],
    related: ['halting-problem', 'turing-machines'],
    content: [
      { t: 'def', title: 'P and NP', text: 'P = ∪_k TIME(n^k): languages decidable in deterministic polynomial time. NP = ∪_k NTIME(n^k) = languages where membership has poly-size certificate verifiable in poly time: L∈NP iff ∃ poly-time verifier V with x∈L ⇔ ∃c, |c|=poly(|x|), V(x,c)=1.' },
      { t: 'props', items: [
        { title: 'P ⊆ NP', text: 'Deterministic poly is special case of nondeterministic.' },
        { title: 'NP-complete', text: 'L NP-complete if L∈NP and every L\'∈NP reduces to L in poly time (L\'≤_p L). If any NP-complete in P, then P=NP. SAT, 3-SAT, CLIQUE, Hamiltonian path NP-complete (Cook-Levin).' },
        { title: 'Beyond', text: 'EXP = exponential time, PSPACE = polynomial space, BPP = randomized poly with bounded error.' },
      ]},
      { t: 'ex', title: 'Examples', steps: [
        'PATH (is there path s→t?) in P via BFS.',
        'HAMILTONIAN PATH in NP: certificate = permutation of vertices, verify edges exist.',
        '3-SAT NP-complete: given CNF with 3 literals per clause, is there satisfying assignment?',
      ]},
      { t: 'cs', items: [
        { area: 'Crypto', how: 'Assumes P≠NP: NP-hard problems have no efficient algorithm, used for hardness.' },
        { area: 'Optimization', how: 'Many optimization problems NP-hard; we use approximation or heuristics.' },
      ]},
    ],
    practice: [
      { id: 'cc2-p1', q: 'Why is PATH in P but HAMILTONIAN PATH believed not?', type: 'short', diff: 'medium', answer: 'PATH has efficient BFS O(V+E); Hamiltonian path seems to require exponential search, no known poly algorithm, and is NP-complete.', explain: 'Complexity difference.' },
    ],
  },
  {
    id: 'decidability',
    title: 'Decidability and Recognizability',
    domain: 'formal',
    parent: 'halting-problem',
    summary: 'Decidable = TM always halts with answer. Recognizable (r.e.) = TM accepts yes instances, may loop on no. Co-recognizable complement r.e. Decidable = r.e. ∩ co-r.e.',
    level: 'advanced',
    csFields: ['theoretical-cs'],
    prerequisites: ['turing-machines', 'halting-problem'],
    related: ['halting-problem', 'complexity-classes'],
    content: [
      { t: 'def', title: 'Classes', text: 'Decidable (recursive): TM always halts, decides membership. Recognizable (r.e.): TM accepts if in language, may loop otherwise. Co-recognizable: complement recognizable. Theorem: L decidable iff L and complement both recognizable.' },
      { t: 'ex', title: 'Examples', steps: [
        'A_DFA = {<B,w> | DFA B accepts w} decidable (simulate DFA).',
        'A_TM = {<M,w> | TM M accepts w} recognizable but not decidable (halting-like).',
        'E_TM = {<M> | L(M)=∅} not recognizable.',
      ]},
    ],
    practice: [],
  },
];
