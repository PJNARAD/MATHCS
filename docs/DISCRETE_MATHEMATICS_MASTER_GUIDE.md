# Discrete Mathematics: The Master Guide & Conceptual Blueprint

```
DISCRETE MATHEMATICS
│
├── 1. Intuition
├── 2. Formal Definition
├── 3. Notation
├── 4. Core Theory
├── 5. Rules
├── 6. Laws
├── 7. Formulas
├── 8. Tables
├── 9. Diagrams
├── 10. Step-by-Step Examples
├── 11. Counterexamples
├── 12. Common Mistakes
├── 13. Tricks / Shortcuts
├── 14. CS Connection
├── 15. Interactive Visualization
├── 16. Practice Problems
├── 17. MCQs
├── 18. Challenge Problems
└── 19. Quick Revision
```

---

## 1. Intuition

Mathematics traditionally splits into two grand universes: **continuous** and **discrete**.

* **The Continuous Realm** (Calculus, Real Analysis, Differential Equations) is the universe of the smooth and unbroken. It studies real numbers $\mathbb{R}$, continuous curves, fluids, trajectories, and instantaneous rates of change. In this world, between any two points $a$ and $b$, there are uncountably many intermediate values. Answers are often approximated within an arbitrary tolerance $\epsilon > 0$.
* **The Discrete Realm** (Discrete Mathematics) is the universe of distinct, separated, countable entities. It studies integers $\mathbb{Z}$, truth values $\{0, 1\}$, graphs, trees, finite sets, formal grammars, and step-by-step algorithms. Here, entities are fundamentally atomized: there is no integer between $3$ and $4$, no half-step between clock cycles, and no fractional bit between `0` and `1`.

### Why Discrete Math is the Native Language of Computer Science

Computers are physical instantiations of discrete mathematics:
1. **Physical Reality of Digital Hardware**: Modern processors are composed of billions of transistors that act as switches. Voltage thresholds are clamped into discrete binary states: high ($1$) and low ($0$). There are no "continuous" variables inside an ALU—only bit-vectors of width $32$ or $64$.
2. **Discrete State Transitions**: A CPU operates on a discrete clock. In cycle $t$, the program counter points to memory address $A$; in cycle $t+1$, it executes an instruction and mutates the state register. A computer program is a discrete dynamical system traversing a finite (or countably infinite) state graph.
3. **Finite Memory & Precision**: Floating-point numbers are not the real continuum $\mathbb{R}$; they are a discrete lattice of IEEE 754 bit-patterns. Round-off errors, overflow, and underflow are reminders that the continuous is merely simulated on discrete hardware.
4. **Exactness Over Approximation**: In discrete mathematics, truth is binary and non-negotiable. A cryptographic key either decrypts the ciphertext or produces garbage; an invariant either holds across every loop iteration or the program crashes; a graph either contains an augmenting path or the network flow is maximal.

Discrete mathematics provides the rigorous intellectual machinery to answer four existential questions of computation:
* **Correctness**: *Does this algorithm produce the right answer for every valid input?* (Answered by Propositional/Predicate Logic, Invariants, and Mathematical Induction.)
* **Structure**: *How are data entities related, organized, and partitioned?* (Answered by Set Theory, Relations, Functions, and Graph Theory.)
* **Complexity**: *How do runtime and memory scale as input size grows?* (Answered by Combinatorics, Recurrence Relations, and Asymptotics.)
* **Computability**: *Can this problem be solved by any discrete machine whatsoever?* (Answered by Diagonalization, Formal Languages, and Automata Theory.)

---

## 2. Formal Definition

Formally, **Discrete Mathematics** is the mathematical branch that studies structures whose underlying sets are either finite or countably infinite, or mathematical spaces endowed with the discrete topology.

### 2.1 Topological and Metric Formulation

Let $X$ be a set. A topological space $(X, \tau)$ is said to be **discrete** if every subset of $X$ is an open set:
$$\tau = \mathcal{P}(X)$$

Equivalently, every singleton set $\{x\}$ is an open neighborhood of $x$. In metric terms, a metric space $(X, d)$ is discrete if there exists an infimal distance $\delta > 0$ such that:
$$\forall x, y \in X, \quad x \neq y \implies d(x, y) \ge \delta$$
Every point $x \in X$ is an **isolated point**; there are no accumulation (limit) points in $X$.

### 2.2 Algebraic and Relational Formulation in Theoretical CS

In computer science, a **discrete structure** is formally defined as a tuple:
$$\mathcal{M} = \langle S, \mathcal{R}, \mathcal{F}, \mathcal{C} \rangle$$
where:
1. $S$ is the **carrier set**, satisfying $|S| \le \aleph_0$ (either finite with $|S| = n \in \mathbb{N}$ or countably infinite with $|S| = |\mathbb{N}|$).
2. $\mathcal{R} = \{ R_1, R_2, \dots, R_k \}$ is a finite set of $n$-ary relations $R_i \subseteq S^{a_i}$.
3. $\mathcal{F} = \{ f_1, f_2, \dots, f_m \}$ is a finite set of $n$-ary operations $f_j: S^{b_j} \to S$.
4. $\mathcal{C} \subseteq S$ is a set of distinguished constants (such as identity elements $0, 1$ or base states).

### 2.3 Well-Foundedness and Inductive Characterization

The operational core of discrete math is **well-foundedness**. A partially ordered set $(S, \prec)$ is well-founded if every non-empty subset $A \subseteq S$ contains a minimal element:
$$\forall A \subseteq S, \; A \neq \emptyset \implies \exists m \in A \; \forall x \in A, \; x \not\prec m$$
Equivalently, $(S, \prec)$ satisfies the **Descending Chain Condition (DCC)**: there exists no infinite descending sequence:
$$x_0 \succ x_1 \succ x_2 \succ x_3 \succ \dots$$
Well-foundedness is the mathematical bedrock that guarantees algorithm termination and validates the principles of Mathematical and Structural Induction.

---

## 3. Notation

| Domain | Symbol | Name / Meaning | Example / Definition |
| :--- | :---: | :--- | :--- |
| **Logic** | $\neg, \sim$ | Logical NOT (Negation) | $\neg p$ is true iff $p$ is false |
| | $\land$ | Logical AND (Conjunction) | $p \land q$ is true iff both $p$ and $q$ are true |
| | $\lor$ | Logical OR (Disjunction) | $p \lor q$ is true iff at least one is true |
| | $\oplus, \veebar$ | Logical XOR (Exclusive OR) | $p \oplus q \equiv (p \land \neg q) \lor (\neg p \land q)$ |
| | $\to, \implies$ | Material Implication | $p \to q \equiv \neg p \lor q$ (False only when $p=\top, q=\bot$) |
| | $\leftrightarrow, \iff$ | Biconditional | $p \leftrightarrow q \equiv (p \to q) \land (q \to p)$ |
| | $\equiv$ | Logical Equivalence | $P \equiv Q$ iff $P \leftrightarrow Q$ is a tautology |
| | $\models$ | Semantic Entailment | $\Gamma \models \phi$ (Every model of $\Gamma$ satisfies $\phi$) |
| | $\vdash$ | Syntactic Derivability / Proof | $\Gamma \vdash \phi$ ($\phi$ is provable from axioms $\Gamma$) |
| | $\top, 1$ | Tautology / True | Formula always evaluating to True |
| | $\bot, 0$ | Contradiction / False | Formula always evaluating to False |
| **Predicates** | $\forall$ | Universal Quantifier | $\forall x \in S, P(x)$ ("For all $x$ in $S$") |
| | $\exists$ | Existential Quantifier | $\exists x \in S, P(x)$ ("There exists an $x$ in $S$") |
| | $\exists!$ | Unique Existential Quantifier | $\exists! x, P(x) \equiv \exists x (P(x) \land \forall y (P(y) \to y = x))$ |
| **Sets** | $\in, \notin$ | Element of / Not element of | $x \in A$ |
| | $\emptyset, \varnothing$ | Empty Set | $\{ \} = \emptyset, \; |\emptyset| = 0$ |
| | $\subseteq, \subsetneq$ | Subset / Proper Subset | $A \subseteq B \iff \forall x (x \in A \to x \in B)$ |
| | $\cup, \cap$ | Union / Intersection | $A \cup B = \{x \mid x \in A \lor x \in B\}$, $A \cap B = \{x \mid x \in A \land x \in B\}$ |
| | $\setminus, -$ | Set Difference / Relative Complement | $A \setminus B = \{x \mid x \in A \land x \notin B\}$ |
| | $\triangle$ | Symmetric Difference | $A \triangle B = (A \setminus B) \cup (B \setminus A) = (A \cup B) \setminus (A \cap B)$ |
| | $A^c, \overline{A}$ | Absolute Complement | $A^c = \mathcal{U} \setminus A$ |
| | $\mathcal{P}(A), 2^A$ | Power Set | $\mathcal{P}(A) = \{ S \mid S \subseteq A \}$ |
| | $|A|$ | Cardinality | Number of elements in $A$ |
| | $\aleph_0$ | Aleph-Null | Cardinality of countably infinite sets ($|\mathbb{N}|$) |
| **Relations** | $A \times B$ | Cartesian Product | $\{ (a, b) \mid a \in A \land b \in B \}$ |
| | $a \, R \, b$ | Binary Relation Notation | $(a, b) \in R$ |
| | $R^{-1}$ | Inverse Relation | $\{ (b, a) \mid (a, b) \in R \}$ |
| | $S \circ R$ | Relation Composition | $\{ (a, c) \mid \exists b ((a, b) \in R \land (b, c) \in S) \}$ |
| | $R^+$ | Transitive Closure | $\bigcup_{k=1}^\infty R^k$ (Smallest transitive relation $\supseteq R$) |
| | $R^*$ | Reflexive Transitive Closure | $R^+ \cup \Delta_A$ where $\Delta_A = \{ (a, a) \mid a \in A \}$ |
| | $[a]_R$ | Equivalence Class | $\{ x \in A \mid (x, a) \in R \}$ |
| | $A / R$ | Quotient Set | $\{ [a]_R \mid a \in A \}$ (Partition of $A$ under $R$) |
| **Functions** | $f: A \to B$ | Function Mapping | Domain $A$, Codomain $B$ |
| | $\mathrm{im}(f), \mathrm{ran}(f)$| Image / Range | $\{ f(a) \mid a \in A \} \subseteq B$ |
| | $g \circ f$ | Function Composition | $(g \circ f)(x) = g(f(x))$ |
| | $f^{-1}$ | Inverse Function | Exists iff $f$ is bijective |
| **Recurrences** | $\lfloor x \rfloor, \lceil x \rceil$ | Floor and Ceiling | Greatest integer $\le x$ / Least integer $\ge x$ |
| | $O, \Omega, \Theta$ | Asymptotic Bounds | Upper, lower, and tight growth bounds |
| | $\binom{n}{k}$ | Binomial Coefficient | $\frac{n!}{k!(n-k)!}$ ("$n$ choose $k$") |

---

## 4. Core Theory

### Theorem 4.1: The Well-Ordering Principle & Induction Equivalence
**Statement**: The following three mathematical propositions are logically equivalent over the non-negative integers $\mathbb{N}_0 = \{0, 1, 2, \dots\}$:
1. **The Well-Ordering Principle (WOP)**: Every non-empty subset $S \subseteq \mathbb{N}_0$ contains a least element ($s \in S$ such that $\forall x \in S, s \le x$).
2. **The Principle of Weak Mathematical Induction**: If $P(0)$ is true, and $\forall k \in \mathbb{N}_0, P(k) \implies P(k+1)$, then $\forall n \in \mathbb{N}_0, P(n)$ is true.
3. **The Principle of Strong (Complete) Induction**: If $P(0)$ is true, and $\forall k \in \mathbb{N}_0, (\forall i \le k, P(i)) \implies P(k+1)$, then $\forall n \in \mathbb{N}_0, P(n)$ is true.

*Significance for CS*: WOP provides the standard proof technique for loop termination and algorithmic termination: define a termination metric $m(\text{state}) \in \mathbb{N}_0$ that strictly decreases on every iteration. Since $\mathbb{N}_0$ has no infinite strictly descending chains, the loop must terminate.

---

### Theorem 4.2: The Fundamental Theorem of Equivalence Relations
**Statement**: Let $A$ be a non-empty set.
1. If $R$ is an equivalence relation on $A$ (reflexive, symmetric, transitive), the set of equivalence classes $A/R = \{ [a]_R \mid a \in A \}$ forms a **partition** of $A$:
   * $\forall a \in A, [a]_R \neq \emptyset$.
   * $\forall a, b \in A$, either $[a]_R = [b]_R$ or $[a]_R \cap [b]_R = \emptyset$.
   * $\bigcup_{a \in A} [a]_R = A$.
2. Conversely, every partition $\mathcal{P} = \{ A_i \}_{i \in I}$ of $A$ induces a unique equivalence relation $R_{\mathcal{P}}$ defined by:
   $$(a, b) \in R_{\mathcal{P}} \iff \exists i \in I \text{ such that } a \in A_i \land b \in A_i$$

*Proof sketch for disjointness*:
Assume $[a]_R \cap [b]_R \neq \emptyset$. Let $c \in [a]_R \cap [b]_R$.
Then $(c, a) \in R$ and $(c, b) \in R$.
By symmetry, $(a, c) \in R$.
By transitivity with $(c, b) \in R$, we deduce $(a, b) \in R$.
Now let arbitrary $x \in [b]_R$, so $(x, b) \in R$. By symmetry, $(b, a) \in R$, so by transitivity $(x, a) \in R$, meaning $x \in [a]_R$. Thus $[b]_R \subseteq [a]_R$.
By identical symmetric argument, $[a]_R \subseteq [b]_R$, proving $[a]_R = [b]_R$. $\blacksquare$

---

### Theorem 4.3: Cantor's Theorem & The Diagonal Argument
**Statement**: For any set $S$ (finite or infinite), the cardinality of the power set is strictly greater than the cardinality of $S$:
$$|S| < |\mathcal{P}(S)|$$

*Proof by Contradiction*:
Suppose there exists a surjective mapping $f: S \to \mathcal{P}(S)$.
Construct the **Cantor diagonal set**:
$$D = \{ x \in S \mid x \notin f(x) \}$$
Since $D \subseteq S$, $D \in \mathcal{P}(S)$. Because $f$ is surjective, there must exist some element $d \in S$ such that $f(d) = D$.
Now query whether $d \in D$:
* If $d \in D$, then by definition of $D$, $d \notin f(d)$. But $f(d) = D$, so $d \notin D$ (Contradiction).
* If $d \notin D$, then since $f(d) = D$, $d \notin f(d)$. By definition of $D$, this implies $d \in D$ (Contradiction).

In both cases, we reach $d \in D \iff d \notin D$, an impossible contradiction. Hence, no surjection exists, proving $|S| < |\mathcal{P}(S)|$. $\blacksquare$

*Significance for CS (The Halting Problem)*:
* Every computer program is a finite string over a finite alphabet $\{0, 1\}^*$, which is countably infinite ($|\text{Programs}| = \aleph_0$).
* The set of all decision problems (languages) is the set of all subsets of $\{0, 1\}^*$, which is $\mathcal{P}(\{0, 1\}^*)$, with cardinality $2^{\aleph_0} = \mathfrak{c}$ (uncountable).
* Because $\aleph_0 < 2^{\aleph_0}$, **there are strictly more computational problems than there can ever be computer programs**. Undecidable problems (like the Halting Problem) are a mathematical necessity of cardinality.

---

### Theorem 4.4: The Generalized Pigeonhole Principle
**Statement**: If $N$ discrete objects are placed into $k$ discrete boxes, then:
* At least one box contains at least $\lceil N / k \rceil$ objects.
* At least one box contains at most $\lfloor N / k \rfloor$ objects.

*Proof by Contradiction*:
Suppose every box contains at most $\lceil N / k \rceil - 1$ objects. The total number of objects would be at most:
$$k \cdot (\lceil N / k \rceil - 1) < k \cdot \left( \frac{N}{k} + 1 - 1 \right) = N$$
This contradicts the fact that there are $N$ objects in total. $\blacksquare$

---

### Theorem 4.5: The Master Theorem for Recurrences
**Statement**: Let $a \ge 1$ and $b > 1$ be constants, let $f(n)$ be an asymptotically positive function, and let $T(n)$ be defined on integers by:
$$T(n) = a T(n/b) + f(n)$$
where $n/b$ can mean either $\lfloor n/b \rfloor$ or $\lceil n/b \rceil$. Let $c_{\text{crit}} = \log_b a$ be the **critical exponent** (measuring the rate of leaf creation in the recursion tree):

1. **Leaf-Dominated Regime**: If $f(n) = O(n^{\log_b a - \epsilon})$ for some constant $\epsilon > 0$, then:
   $$T(n) = \Theta(n^{\log_b a})$$
2. **Balanced Regime**: If $f(n) = \Theta(n^{\log_b a} \log^k n)$ for some $k \ge 0$, then:
   $$T(n) = \Theta(n^{\log_b a} \log^{k+1} n)$$
3. **Root-Dominated Regime**: If $f(n) = \Omega(n^{\log_b a + \epsilon})$ for some $\epsilon > 0$, and if $a f(n/b) \le c f(n)$ for some constant $c < 1$ and all sufficiently large $n$ (regularity condition), then:
   $$T(n) = \Theta(f(n))$$

---

## 5. Rules

### 5.1 Propositional Rules of Inference
In formal deduction, rules of inference permit deriving new valid statements from established premises:

$$\begin{array}{rcccl}
\textbf{Modus Ponens (MP):} & p, \; p \to q & \vdash & q & \text{(Affirming the antecedent)} \\
\textbf{Modus Tollens (MT):} & \neg q, \; p \to q & \vdash & \neg p & \text{(Denying the consequent)} \\
\textbf{Hypothetical Syllogism (HS):} & p \to q, \; q \to r & \vdash & p \to r & \text{(Transitivity of implication)} \\
\textbf{Disjunctive Syllogism (DS):} & p \lor q, \; \neg p & \vdash & q & \text{(Elimination of disjunct)} \\
\textbf{Conjunction (Conj):} & p, \; q & \vdash & p \land q & \text{(Combining true facts)} \\
\textbf{Simplification (Simp):} & p \land q & \vdash & p & \text{(Decomposing conjunction)} \\
\textbf{Addition (Add):} & p & \vdash & p \lor q & \text{(Weakening)} \\
\textbf{Resolution (Res):} & p \lor q, \; \neg p \lor r & \vdash & q \lor r & \text{(Foundation of SAT / Prolog)}
\end{array}$$

### 5.2 Quantifier Inference Rules
$$\begin{array}{rcccl}
\textbf{Universal Instantiation (UI):} & \forall x P(x) & \vdash & P(c) & \text{for any arbitrary domain constant } c \\
\textbf{Universal Generalization (UG):} & P(c) & \vdash & \forall x P(x) & \text{where } c \text{ is an arbitrary, unconstrained element} \\
\textbf{Existential Instantiation (EI):} & \exists x P(x) & \vdash & P(c) & \text{for a fresh, previously unused witness } c \\
\textbf{Existential Generalization (EG):} & P(c) & \vdash & \exists x P(x) & \text{for any known witness } c
\end{array}$$

### 5.3 Proof Methodology Rules
1. **Direct Proof ($P \implies Q$)**: Assume antecedent $P$ is true. Apply definitions, axioms, and previously proven theorems in an unbroken logical chain to deduce consequent $Q$.
2. **Proof by Contraposition ($\neg Q \implies \neg P$)**: Exploit the tautology $(P \to Q) \equiv (\neg Q \to \neg P)$. Assume $Q$ is false ($\neg Q$), and deduce that $P$ must be false ($\neg P$). Essential when $\neg Q$ provides more structural information than $P$.
3. **Proof by Contradiction (Reductio Ad Absurdum)**: To prove proposition $P$, assume $\neg P$. Derive a logical impossibility $R \land \neg R \equiv \bot$. By classical logic, the assumption $\neg P$ must be false, so $P$ is true.
4. **Proof by Minimal Counterexample (WOP)**: To prove $\forall n \in \mathbb{N}_0, P(n)$, assume the contrary set $F = \{ n \in \mathbb{N}_0 \mid \neg P(n) \} \neq \emptyset$. By the Well-Ordering Principle, $F$ has a minimal element $m = \min(F)$. Show that the existence of $m$ forces an even smaller failure $m' < m$, generating a contradiction.
5. **Structural Induction**: Used for recursively defined structures (trees, formulas, lists). Prove the base cases for atomic elements, then prove that whenever the property holds for sub-structures $s_1, \dots, s_k$, it holds for the composed structure $\text{Op}(s_1, \dots, s_k)$.

---

## 6. Laws

### 6.1 The Principle of Duality
Any true Boolean algebra or set identity remains true if:
* Operators are interchanged: $\land \longleftrightarrow \lor$ (and $\cap \longleftrightarrow \cup$)
* Identity constants are interchanged: $0 \longleftrightarrow 1$ (and $\emptyset \longleftrightarrow \mathcal{U}$)

### 6.2 Master Catalog of Algebraic Laws

| Law Name | Propositional Logic Formulation | Set Theory Formulation | Boolean Algebra ($+ \equiv \lor, \cdot \equiv \land$) |
| :--- | :--- | :--- | :--- |
| **De Morgan's Laws** | $\neg(p \land q) \equiv \neg p \lor \neg q$ <br> $\neg(p \lor q) \equiv \neg p \land \neg q$ | $(A \cap B)^c = A^c \cup B^c$ <br> $(A \cup B)^c = A^c \cap B^c$ | $\overline{x \cdot y} = \bar{x} + \bar{y}$ <br> $\overline{x + y} = \bar{x} \cdot \bar{y}$ |
| **Quantifier De Morgan** | $\neg \forall x P(x) \equiv \exists x \neg P(x)$ <br> $\neg \exists x P(x) \equiv \forall x \neg P(x)$ | $\left(\bigcap_{i} A_i\right)^c = \bigcup_{i} A_i^c$ <br> $\left(\bigcup_{i} A_i\right)^c = \bigcap_{i} A_i^c$ | — |
| **Absorption Laws** | $p \lor (p \land q) \equiv p$ <br> $p \land (p \lor q) \equiv p$ | $A \cup (A \cap B) = A$ <br> $A \cap (A \cup B) = A$ | $x + (x \cdot y) = x$ <br> $x \cdot (x + y) = x$ |
| **Distributive Laws** | $p \land (q \lor r) \equiv (p \land q) \lor (p \land r)$ <br> $p \lor (q \land r) \equiv (p \lor q) \land (p \lor r)$ | $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$ <br> $A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$ | $x \cdot (y + z) = (x \cdot y) + (x \cdot z)$ <br> $x + (y \cdot z) = (x + y) \cdot (x + z)$ |
| **Consensus Theorem** | $(p \land q) \lor (\neg p \land r) \lor (q \land r) \equiv (p \land q) \lor (\neg p \land r)$ | $(A \cap B) \cup (A^c \cap C) \cup (B \cap C) = (A \cap B) \cup (A^c \cap C)$ | $xy + \bar{x}z + yz = xy + \bar{x}z$ <br> *(Dual)*: $(x+y)(\bar{x}+z)(y+z) = (x+y)(\bar{x}+z)$ |
| **Idempotent Laws** | $p \lor p \equiv p$, $\quad p \land p \equiv p$ | $A \cup A = A$, $\quad A \cap A = A$ | $x + x = x$, $\quad x \cdot x = x$ |
| **Commutative Laws** | $p \lor q \equiv q \lor p$, $\quad p \land q \equiv q \land p$ | $A \cup B = B \cup A$, $\quad A \cap B = B \cap A$ | $x + y = y + x$, $\quad x \cdot y = y \cdot x$ |
| **Associative Laws** | $(p \lor q) \lor r \equiv p \lor (q \lor r)$ <br> $(p \land q) \land r \equiv p \land (q \land r)$ | $(A \cup B) \cup C = A \cup (B \cup C)$ <br> $(A \cap B) \cap C = A \cap (B \cap C)$ | $(x + y) + z = x + (y + z)$ <br> $(x \cdot y) \cdot z = x \cdot (y \cdot z)$ |
| **Identity Laws** | $p \land \top \equiv p$, $\quad p \lor \bot \equiv p$ | $A \cap \mathcal{U} = A$, $\quad A \cup \emptyset = A$ | $x \cdot 1 = x$, $\quad x + 0 = x$ |
| **Domination (Null)**| $p \lor \top \equiv \top$, $\quad p \land \bot \equiv \bot$ | $A \cup \mathcal{U} = \mathcal{U}$, $\quad A \cap \emptyset = \emptyset$ | $x + 1 = 1$, $\quad x \cdot 0 = 0$ |
| **Complementation** | $p \lor \neg p \equiv \top$, $\quad p \land \neg p \equiv \bot$ | $A \cup A^c = \mathcal{U}$, $\quad A \cap A^c = \emptyset$ | $x + \bar{x} = 1$, $\quad x \cdot \bar{x} = 0$ |
| **Involution** | $\neg(\neg p) \equiv p$ | $(A^c)^c = A$ | $\bar{\bar{x}} = x$ |

---

## 7. Formulas

### 7.1 Sets & Combinatorics
* **Power Set Size**:
  $$|\mathcal{P}(A)| = 2^{|A|}$$
* **Principle of Inclusion-Exclusion (2 Sets)**:
  $$|A \cup B| = |A| + |B| - |A \cap B|$$
* **Principle of Inclusion-Exclusion (3 Sets)**:
  $$|A \cup B \cup C| = |A| + |B| + |C| - (|A \cap B| + |B \cap C| + |C \cap A|) + |A \cap B \cap C|$$
* **General Principle of Inclusion-Exclusion ($n$ Sets)**:
  $$\left| \bigcup_{i=1}^n A_i \right| = \sum_{k=1}^n (-1)^{k-1} \sum_{1 \le i_1 < i_2 < \dots < i_k \le n} \left| \bigcap_{j=1}^k A_{i_j} \right|$$

### 7.2 Relations on a Set of Size $n$ ($|A| = n$)
The Cartesian product has $|A \times A| = n^2$ possible pairs.

* **Total Possible Binary Relations**:
  $$N_{\text{total}} = 2^{n^2}$$
* **Reflexive Relations** (diagonal elements fixed to $1$, off-diagonal free):
  $$N_{\text{refl}} = 2^{n^2 - n} = 2^{n(n-1)}$$
* **Irreflexive Relations** (diagonal fixed to $0$):
  $$N_{\text{irrefl}} = 2^{n(n-1)}$$
* **Symmetric Relations** (diagonal free, lower triangle mirrors upper triangle):
  $$N_{\text{sym}} = 2^{n + \frac{n(n-1)}{2}} = 2^{\frac{n(n+1)}{2}}$$
* **Reflexive and Symmetric Relations**:
  $$N_{\text{refl}\land\text{sym}} = 2^{\frac{n(n-1)}{2}}$$
* **Antisymmetric Relations** (for each of $\binom{n}{2}$ pairs, 3 choices: $(a,b), (b,a),$ or neither; diagonal has $2^n$ choices):
  $$N_{\text{antisym}} = 2^n \cdot 3^{\frac{n(n-1)}{2}}$$
* **Asymmetric Relations** (irreflexive and antisymmetric):
  $$N_{\text{asym}} = 3^{\frac{n(n-1)}{2}}$$
* **Equivalence Relations** (counted by Bell numbers $B_n$):
  $$B_{n+1} = \sum_{k=0}^n \binom{n}{k} B_k, \quad B_0 = 1, B_1 = 1, B_2 = 2, B_3 = 5, B_4 = 15, B_5 = 52$$

### 7.3 Functions Between Finite Sets ($|A| = m, |B| = n$)
* **Total Functions ($f: A \to B$)**:
  $$N_{\text{func}} = n^m$$
* **Injective Functions (One-to-One)**:
  $$P(n, m) = \begin{cases} \frac{n!}{(n-m)!} & \text{if } m \le n \\ 0 & \text{if } m > n \end{cases}$$
* **Surjective Functions (Onto)**:
  $$N_{\text{surj}} = n! \cdot S(m, n) = \sum_{j=0}^n (-1)^j \binom{n}{j} (n - j)^m$$
  *(where $S(m,n)$ is the Stirling number of the second kind)*
* **Bijective Functions ($m = n$)**:
  $$N_{\text{bij}} = n!$$

### 7.4 Second-Order Linear Homogeneous Recurrences
For the recurrence relation:
$$a_n = c_1 a_{n-1} + c_2 a_{n-2}$$
Characteristic equation:
$$r^2 - c_1 r - c_2 = 0$$

* **Case 1: Two Distinct Real Roots ($r_1 \neq r_2$)**:
  $$a_n = C_1 r_1^n + C_2 r_2^n$$
* **Case 2: One Repeated Real Root ($r_1 = r_2 = r$)**:
  $$a_n = (C_1 + C_2 n) r^n$$
* **Case 3: Complex Conjugate Roots ($r = \rho e^{\pm i\theta}$)**:
  $$a_n = \rho^n (C_1 \cos(n\theta) + C_2 \sin(n\theta))$$

---

## 8. Tables

### 8.1 Master Truth Table of All Propositional Connectives

| $p$ | $q$ | $\neg p$ | $p \land q$ | $p \lor q$ | $p \oplus q$ | $p \to q$ | $p \leftrightarrow q$ | $p \uparrow q$ (NAND) | $p \downarrow q$ (NOR) |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **T** | **T** | F | **T** | **T** | F | **T** | **T** | F | F |
| **T** | **F** | F | F | **T** | **T** | F | F | **T** | F |
| **F** | **T** | **T** | F | **T** | **T** | **T** | F | **T** | F |
| **F** | **F** | **T** | F | F | F | **T** | **T** | **T** | **T** |

### 8.2 Variations of the Conditional Statement

| Form | Expression | Truth when $p=\text{T}, q=\text{F}$ | Truth when $p=\text{F}, q=\text{T}$ | Logical Equivalence |
| :--- | :---: | :---: | :---: | :--- |
| **Original Conditional** | $p \to q$ | **F** | **T** | $\equiv \text{Contrapositive}$ |
| **Converse** | $q \to p$ | **T** | **F** | $\equiv \text{Inverse}$ |
| **Inverse** | $\neg p \to \neg q$ | **T** | **F** | $\equiv \text{Converse}$ |
| **Contrapositive** | $\neg q \to \neg p$ | **F** | **T** | $\equiv \text{Original Conditional}$ |

### 8.3 Classification Matrix of Binary Relation Properties

| Property | Formal Definition | Adjacency Matrix $M$ Condition | Directed Graph Representation | Count on Set of Size $n$ |
| :--- | :--- | :--- | :--- | :--- |
| **Reflexive** | $\forall x, (x, x) \in R$ | $M_{ii} = 1$ for all $i$ | Self-loop at **every** vertex | $2^{n(n-1)}$ |
| **Irreflexive**| $\forall x, (x, x) \notin R$ | $M_{ii} = 0$ for all $i$ | **No** self-loops anywhere | $2^{n(n-1)}$ |
| **Symmetric** | $\forall x,y, (x, y) \in R \implies (y, x) \in R$ | $M = M^T$ (Symmetric matrix) | Every directed edge is bidirectional | $2^{\frac{n(n+1)}{2}}$ |
| **Antisymmetric**| $\forall x,y, ((x, y) \in R \land (y, x) \in R) \implies x = y$ | $M_{ij} = 1 \implies M_{ji} = 0$ ($i \neq j$) | Between distinct vertices, at most one direction | $2^n \cdot 3^{\frac{n(n-1)}{2}}$ |
| **Asymmetric** | $\forall x,y, (x, y) \in R \implies (y, x) \notin R$ | $M_{ij} = 1 \implies M_{ji} = 0$ for **all** $i,j$ | Irreflexive + Antisymmetric | $3^{\frac{n(n-1)}{2}}$ |
| **Transitive** | $\forall x,y,z, ((x,y) \in R \land (y,z) \in R) \implies (x,z) \in R$ | $M \odot M \le M$ (Boolean multiplication) | 2-hop path implies a direct shortcut edge | No closed form |

### 8.4 Common Mathematical Structures Formed by Relations

| Structure | Reflexive? | Symmetric? | Antisymmetric? | Transitive? | Total? (Connected) | Canonical Computer Science Example |
| :--- | :-: | :-: | :-: | :-: | :-: | :--- |
| **Equivalence Relation** | **Yes** | **Yes** | No | **Yes** | No | Congruence modulo $m$; Connected components; Union-Find |
| **Partial Order (Poset)**| **Yes** | No | **Yes** | **Yes** | No | Task dependency DAGs; Subtype polymorphism; `git commit` ancestry |
| **Strict Partial Order** | **No** (Irref) | No | **Yes** (Asym) | **Yes** | No | Strict precedence $a < b$; Lamport logical clocks in distributed systems |
| **Total Order (Linear)** | **Yes** | No | **Yes** | **Yes** | **Yes** | Sorted arrays; Lexicographical order; Priority queues |
| **Lattice** | **Yes** | No | **Yes** | **Yes** | Poset + $\sup,\inf$ | Access Control Matrices (Bell-LaPadula); Compiler dataflow frameworks |

### 8.5 Asymptotic Growth Hierarchy

| Asymptotic Class | Common Name | $n = 10$ | $n = 10^3$ | $n = 10^6$ | Feasibility Threshold in CS ($10^8$ ops/sec) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $O(1)$ | Constant | $1$ | $1$ | $1$ | Instantaneous (Hash lookup, array index) |
| $O(\log n)$ | Logarithmic | $3.32$ | $\approx 10$ | $\approx 20$ | Billions of items within microseconds (Binary search) |
| $O(n)$ | Linear | $10$ | $10^3$ | $10^6$ | $10^8$ ops $\approx 1$ second (Linear scan, BFS) |
| $O(n \log n)$ | Linearithmic | $33.2$ | $10^4$ | $2 \times 10^7$ | Millions of items in seconds (Mergesort, FFT) |
| $O(n^2)$ | Quadratic | $100$ | $10^6$ | $10^{12}$ | Max feasible $n \approx 10^4$ (Nested loops, Bubble sort) |
| $O(n^3)$ | Cubic | $10^3$ | $10^9$ | $10^{18}$ | Max feasible $n \approx 500$ (Floyd-Warshall, Matrix mult) |
| $O(2^n)$ | Exponential | $1024$ | $10^{301}$ | Astronomical | Max feasible $n \approx 30$ (Exact SAT, TSP, Brute-force) |
| $O(n!)$ | Factorial | $3.6 \times 10^6$ | Unfathomable | Unfathomable | Max feasible $n \approx 12$ (All permutations) |

---

## 9. Diagrams

### 9.1 Hasse Diagram of a Poset Lattice: Divisibility on $D_{36}$
A Hasse diagram displays a partial order by omitting reflexive loops and transitive shortcuts, drawing relations as upward edges.

```
                     36 (Greatest element / Top ⊤)
                    /  \
                   18   12
                  /  \ /  \
                 9    6    4
                  \  / \  /
                   3     2
                    \   /
                      1 (Least element / Bottom ⊥)
```

### 9.2 Function Mapping Classifications (Bipartite Graph Models)

```
INJECTIVE (One-to-One)          SURJECTIVE (Onto)               BIJECTIVE (Isomorphism)
  A           B                   A           B                   A           B
( 1 ) ----> ( a )               ( 1 ) ----> ( a )               ( 1 ) ----> ( a )
( 2 ) ----> ( b )               ( 2 ) ---\                      ( 2 ) ----> ( b )
( 3 ) ----> ( c )               ( 3 ) ----> ( b )               ( 3 ) ----> ( c )
            ( d )               ( 4 ) ----> ( c )
[No two arrows hit same;        [Every target element           [Perfect 1-to-1 match;
 codomain can have unhit]        is hit by ≥ 1 arrow]            both Injective & Surjective]
```

### 9.3 Venn Diagram: 3 Sets with 8 Disjoint Minterm Partitions

```
         +-------------------------------------------------------+
         | Universe U                                            |
         |                                                       |
         |            Set A                  Set B               |
         |       /-------------\        /-------------\          |
         |      /               \      /               \         |
         |     /     Region 1    \    /    Region 2     \        |
         |    |   A ∩ B' ∩ C'     \  /    A' ∩ B ∩ C'    |       |
         |    |                    \/                    |       |
         |    |                 Region 4                 |       |
         |    |                A ∩ B ∩ C'                |       |
         |     \              /    /\                   /        |
         |      \   Region 5 /    /  \   Region 6      /         |
         |       \ A ∩ B' ∩ C    /    \ A' ∩ B ∩ C    /          |
         |        \---------\   /Reg 7 \  /----------/           |
         |                   \ /A∩B∩C   \/                       |
         |                    |----------|                       |
         |                    | Region 3 |                       |
         |                    |A'∩ B'∩ C |                       |
         |                     \        /                        |
         |                      \------/                         |
         |                        Set C                          |
         |                                                       |
         |   Region 0: Outside all three (A' ∩ B' ∩ C')          |
         +-------------------------------------------------------+
```

### 9.4 Recursion Tree for $T(n) = 2T(n/2) + cn$ (Mergesort)

```
Level 0:                      cn                            --> Cost = cn
                            /    \
Level 1:              c(n/2)      c(n/2)                    --> Cost = cn
                      /    \      /    \
Level 2:           c(n/4) c(n/4) c(n/4) c(n/4)              --> Cost = cn
                   :      :      :      :
Level i:           ... 2^i nodes of size (n/2^i) ...         --> Cost = 2^i * c(n/2^i) = cn
                   :      :      :      :
Level log₂ n:      T(1)   T(1)   T(1)   ...   T(1)          --> Cost = n * T(1) = Θ(n)
                   \_____________________________/
                             n leaves

Total Depth = log₂ n + 1 levels
Total Cost  = (cn) * (log₂ n) + Θ(n) = Θ(n log n)
```

### 9.5 1-Bit Full Adder Logic Circuit

```
Inputs: A, B, Cin
Outputs: Sum (S), Carry-out (Cout)

A  ----+---------+
       |         |
B  ----+----+    |
       |    |    |
       v    v    |
    +---------+  |
    |   XOR   |--+------------+
    +---------+  |            |
         |       |            v
    (Half-Sum)   |         +---------+
         |       |         |   XOR   |------------> Sum = A ⊕ B ⊕ Cin
Cin -----+-------)-------->|         |
         |       |         +---------+
         |       |
         |       v
         |   +---------+
         |   |   AND   |--------------------+
         |   +---------+                    |
         |        |                         v
         v        |                      +----+
     +---------+  |                      | OR |-------> Cout = (A·B) + (Cin·(A⊕B))
     |   AND   |--+--------------------->|    |
     +---------+                         +----+
```

---

### 9.6 Hasse Diagram: Divisibility on $D_{30}$ (the Boolean lattice $B_3$)

Since $30 = 2 \cdot 3 \cdot 5$ is square-free, each divisor is a subset of $\{2, 3, 5\}$: the lattice $D_{30}$ is isomorphic to the powerset lattice $\mathcal{P}(\{2,3,5\})$ ordered by inclusion — a cube, $B_3$.

```
                      30 (Greatest element / Top ⊤)
                     /  |  \
                    /   |   \
                   6    10   15
                  / / \ | / \ \
                 2       3       5
                    \    |    /
                     \   |   /
                      1 (Least element / Bottom ⊥)
```

Edges: each cover multiplies by exactly one prime ($1 \to 2, 3, 5$; $2 \to 6, 10$; $3 \to 6, 15$; $5 \to 10, 15$; $6, 10, 15 \to 30$). Meet = gcd, join = lcm. Every element has a **unique complement** (its opposite corner: $d \vee (30/d) = 30$ and $d \wedge (30/d) = 1$), which is what makes $B_3$ a Boolean algebra.

### 9.7 Hasse Diagram: The Pentagon Lattice $N_5$

$N_5$ is the smallest **non-distributive** lattice: chains $0 < a < 1$ and $0 < b < c < 1$, with $a$ incomparable with $b$ and $c$. Its five cover edges $0\!-\!a$, $0\!-\!b$, $b\!-\!c$, $c\!-\!1$, $a\!-\!1$ form the pentagon cycle $0 - a - 1 - c - b - 0$ that gives it the name.

```
                    1 (Greatest element / Top ⊤)
                   /  |
                  /   |
                 a    c
                 |    |
                 |    b
                  \   |
                   \  |
                    0 (Least element / Bottom ⊥)
```

The distributive law fails here: $c \wedge (a \vee b) = c \wedge 1 = c$, but $(c \wedge a) \vee (c \wedge b) = 0 \vee b = b \neq c$. Together with $M_3$ (the diamond), this is Birkhoff's test: a lattice is distributive iff it contains neither $N_5$ nor $M_3$ as a sublattice.

---

## 10. Step-by-Step Examples

### Example 10.1: Proof by Mathematical Induction
**Theorem**: For every integer $n \ge 1$, the sum of the first $n$ cubes equals the square of the $n$-th triangular number:
$$\sum_{i=1}^n i^3 = 1^3 + 2^3 + \dots + n^3 = \left( \frac{n(n+1)}{2} \right)^2$$

**Step 1: Base Case ($n = 1$)**
* Left-Hand Side (LHS): $\sum_{i=1}^1 i^3 = 1^3 = 1$.
* Right-Hand Side (RHS): $\left( \frac{1(1+1)}{2} \right)^2 = \left( \frac{2}{2} \right)^2 = 1^2 = 1$.
* LHS = RHS. The base case holds.

**Step 2: Inductive Hypothesis**
Assume the identity holds for an arbitrary fixed integer $k \ge 1$:
$$\sum_{i=1}^k i^3 = \left( \frac{k(k+1)}{2} \right)^2$$

**Step 3: Inductive Step (Prove for $n = k + 1$)**
We must prove:
$$\sum_{i=1}^{k+1} i^3 = \left( \frac{(k+1)(k+2)}{2} \right)^2$$

Decompose the sum into the first $k$ terms plus the $(k+1)$-th term:
$$\sum_{i=1}^{k+1} i^3 = \left( \sum_{i=1}^k i^3 \right) + (k+1)^3$$

Substitute the Inductive Hypothesis:
$$= \left( \frac{k(k+1)}{2} \right)^2 + (k+1)^3 = \frac{k^2 (k+1)^2}{4} + (k+1)^3$$

Factor out the common term $(k+1)^2$:
$$= (k+1)^2 \left[ \frac{k^2}{4} + (k+1) \right] = (k+1)^2 \left[ \frac{k^2 + 4k + 4}{4} \right]$$

Recognize the perfect square $k^2 + 4k + 4 = (k+2)^2$:
$$= (k+1)^2 \cdot \frac{(k+2)^2}{4} = \left( \frac{(k+1)(k+2)}{2} \right)^2$$

**Conclusion**: The statement holds for $k+1$. By the Principle of Mathematical Induction, the theorem is true for all integers $n \ge 1$. $\blacksquare$

---

### Example 10.2: Algebraic Propositional Simplification Using Named Laws
**Problem**: Prove without truth tables that the following formula is a tautology:
$$(p \to (q \lor r)) \equiv (\neg r \to (p \to q))$$

| Derivation Step | Formula | Law Cited |
| :-: | :--- | :--- |
| **0** | $\neg r \to (p \to q)$ | Start with RHS |
| **1** | $\neg(\neg r) \lor (p \to q)$ | Material Implication Law ($a \to b \equiv \neg a \lor b$) |
| **2** | $r \lor (p \to q)$ | Double Negation Law ($\neg(\neg r) \equiv r$) |
| **3** | $r \lor (\neg p \lor q)$ | Material Implication Law ($p \to q \equiv \neg p \lor q$) |
| **4** | $(r \lor \neg p) \lor q$ | Associative Law of Disjunction |
| **5** | $(\neg p \lor r) \lor q$ | Commutative Law of Disjunction |
| **6** | $\neg p \lor (r \lor q)$ | Associative Law of Disjunction |
| **7** | $\neg p \lor (q \lor r)$ | Commutative Law of Disjunction |
| **8** | $p \to (q \lor r)$ | Material Implication Law ($\neg p \lor B \equiv p \to B$) |

The RHS simplifies identically to the LHS. Equivalence is proved algebraically. $\blacksquare$

---

### Example 10.3: Solving a Second-Order Recurrence Relation with Repeated Roots
**Problem**: Solve the recurrence relation:
$$a_n = 4a_{n-1} - 4a_{n-2} \quad \text{for } n \ge 2, \quad \text{with initial conditions } a_0 = 1, \; a_1 = 6$$

**Step 1: Form the Characteristic Equation**
Assume a solution of the form $a_n = r^n$:
$$r^n = 4r^{n-1} - 4r^{n-2} \implies r^2 - 4r + 4 = 0$$

**Step 2: Solve for Characteristic Roots**
$$(r - 2)^2 = 0 \implies r_1 = r_2 = 2 \quad \text{(Repeated root with multiplicity 2)}$$

**Step 3: Write the General Solution**
Due to root repetition, multiply the second basis function by $n$:
$$a_n = C_1 \cdot 2^n + C_2 \cdot n \cdot 2^n = (C_1 + C_2 n) 2^n$$

**Step 4: Solve for Constants Using Initial Conditions**
* For $n = 0$:
  $$a_0 = (C_1 + C_2 \cdot 0) \cdot 2^0 = C_1 = 1 \implies C_1 = 1$$
* For $n = 1$:
  $$a_1 = (C_1 + C_2 \cdot 1) \cdot 2^1 = (1 + C_2) \cdot 2 = 6 \implies 1 + C_2 = 3 \implies C_2 = 2$$

**Step 5: State the Closed-Form Solution**
$$a_n = (1 + 2n) 2^n$$

*Verification*:
* $a_0 = (1 + 0) \cdot 1 = 1$ (Matches)
* $a_1 = (1 + 2) \cdot 2 = 6$ (Matches)
* $a_2 = 4a_1 - 4a_0 = 4(6) - 4(1) = 20$. Formula: $(1 + 4) \cdot 2^2 = 5 \cdot 4 = 20$ (Matches) $\blacksquare$

---

### Example 10.4: Equivalence Relation and Quotient Partition
**Problem**: Define relation $R$ on $\mathbb{Z}$ by:
$$x \, R \, y \iff 3 \mid (2x + y)$$
Prove that $R$ is an equivalence relation, find all equivalence classes, and specify the quotient set $\mathbb{Z}/R$.

**Step 1: Prove Reflexivity ($\forall x \in \mathbb{Z}, x \, R \, x$)**
We must test if $3 \mid (2x + x)$.
$$2x + x = 3x = 3(x)$$
Since $x \in \mathbb{Z}$, $3x$ is a multiple of $3$. Thus $x \, R \, x$. Reflexivity holds.

**Step 2: Prove Symmetry ($\forall x, y \in \mathbb{Z}, x \, R \, y \implies y \, R \, x$)**
Assume $x \, R \, y$, meaning $2x + y = 3k$ for some $k \in \mathbb{Z}$.
We must show $3 \mid (2y + x)$.
Notice that:
$$(2x + y) + (2y + x) = 3x + 3y = 3(x + y)$$
Therefore:
$$2y + x = 3(x + y) - (2x + y) = 3(x + y) - 3k = 3(x + y - k)$$
Since $(x + y - k) \in \mathbb{Z}$, $2y + x$ is divisible by $3$. Thus $y \, R \, x$. Symmetry holds.

**Step 3: Prove Transitivity ($\forall x, y, z \in \mathbb{Z}, (x \, R \, y \land y \, R \, z) \implies x \, R \, z$)**
Assume $2x + y = 3j$ and $2y + z = 3k$ for integers $j, k$.
Add both equations together:
$$(2x + y) + (2y + z) = 3j + 3k \implies 2x + 3y + z = 3(j + k)$$
Rearrange for $2x + z$:
$$2x + z = 3(j + k) - 3y = 3(j + k - y)$$
Since $(j + k - y) \in \mathbb{Z}$, $3 \mid (2x + z)$, meaning $x \, R \, z$. Transitivity holds.

**Step 4: Determine Equivalence Classes**
Note that $2x + y \equiv 0 \pmod 3 \iff -x + y \equiv 0 \pmod 3 \iff y \equiv x \pmod 3$.
Hence, $R$ is identical to standard congruence modulo $3$.
There are exactly 3 distinct equivalence classes:
$$[0] = \{ \dots, -6, -3, 0, 3, 6, \dots \} = 3\mathbb{Z}$$
$$[1] = \{ \dots, -5, -2, 1, 4, 7, \dots \} = 3\mathbb{Z} + 1$$
$$[2] = \{ \dots, -4, -1, 2, 5, 8, \dots \} = 3\mathbb{Z} + 2$$
The quotient set is the ring of integers modulo 3:
$$\mathbb{Z}/R = \{ [0], [1], [2] \} \cong \mathbb{Z}_3 \quad \blacksquare$$

---

## 11. Counterexamples

### 11.1 The Fallacy of the Converse (Affirming the Consequent)
* **Claim**: $p \to q \models q \to p$.
* **Counterexample**: Let $p$ be "It is pouring rain" and $q$ be "The pavement is wet".
  The statement $p \to q$ is true. However, observing $q$ (the pavement is wet) does not imply $p$ (it rained)—someone could have operated a lawn sprinkler or washed a car.
* **Formal truth table disproof**: When $p = \text{False}$ and $q = \text{True}$, $p \to q$ is True, but $q \to p$ is False.

### 11.2 Symmetric and Transitive Does NOT Imply Reflexive
* **The Fallacious "Proof"**:
  "Let $a \in A$. Pick $b$ such that $(a, b) \in R$. By symmetry, $(b, a) \in R$. By transitivity, since $(a, b) \in R$ and $(b, a) \in R$, we get $(a, a) \in R$. Therefore $R$ is reflexive!"
* **Where it Fails**: It assumes that for every $a \in A$, there *exists* some $b$ such that $(a, b) \in R$. If an element is isolated (has degree 0), this premise collapses.
* **Concrete Counterexample**:
  Let $A = \{1, 2, 3\}$ and relation $R = \{(1, 1), (1, 2), (2, 1), (2, 2)\}$.
  * $R$ is symmetric: Every pair has its reverse.
  * $R$ is transitive: Composition verifies transitivity.
  * $R$ is **not** reflexive: $(3, 3) \notin R$ because element $3$ is never related to anything.
  * Extremal counterexample: The empty relation $R = \emptyset$ on any non-empty set $A$ is vacuously symmetric and vacuously transitive, but completely non-reflexive.

### 11.3 Antisymmetric is NOT the Opposite of Symmetric
* **Misconception**: "If a relation is not symmetric, it must be antisymmetric." (Or vice versa).
* **The 4 Orthogonal Possibilities**:
  1. **Both Symmetric and Antisymmetric**: The identity relation $\Delta = \{(1, 1), (2, 2)\}$ on $\{1, 2\}$.
  2. **Symmetric but NOT Antisymmetric**: $R = \{(1, 2), (2, 1)\}$ on $\{1, 2\}$.
  3. **Antisymmetric but NOT Symmetric**: $R = \{(1, 2)\}$ on $\{1, 2\}$.
  4. **NEITHER Symmetric NOR Antisymmetric**: $R = \{(1, 2), (2, 1), (2, 3)\}$ on $\{1, 2, 3\}$. It fails symmetry because $(3, 2) \notin R$; it fails antisymmetry because both $(1, 2)$ and $(2, 1)$ exist with $1 \neq 2$.

### 11.4 Injective Does NOT Imply Surjective on Infinite Sets
* **Finite Sets**: By the Pigeonhole Principle, for any function $f: A \to A$ where $A$ is finite, $f$ is injective $\iff$ $f$ is surjective.
* **Infinite Counterexample**:
  Let $f: \mathbb{N} \to \mathbb{N}$ defined by $f(n) = n + 1$.
  * $f$ is strictly injective: $a + 1 = b + 1 \implies a = b$.
  * $f$ is **not** surjective: There is no $n \in \mathbb{N}$ such that $f(n) = 0$. The target value $0$ is never hit.
  *(This property is Dedekind's formal definition of an infinite set: a set is infinite iff it can be put into bijection with a proper subset of itself).*

### 11.5 Greedy Choice Failure in Coin Change
* **Problem**: Make change for $W$ using minimal coins with coin denominations $\{1, 3, 4\}$.
* **Target**: $W = 6$.
* **Greedy Strategy**: Always pick largest available coin $\le$ remaining amount.
  * Greedy picks $4$, leaving $6 - 4 = 2$.
  * Greedy picks $1$, leaving $2 - 1 = 1$.
  * Greedy picks $1$, leaving $0$.
  * Total coins = $3$ (Coins: $\{4, 1, 1\}$).
* **Counterexample / Optimal**:
  * Pick two $3$-coins: $3 + 3 = 6$.
  * Total coins = $2$ (Coins: $\{3, 3\}$).
  Greedy fails because discrete subproblems have structural dependencies that require Dynamic Programming.

---

## 12. Common Mistakes

### 12.1 Naive Quantifier Negation
* **Error**: Negating $\forall x (P(x) \to Q(x))$ as $\forall x (P(x) \to \neg Q(x))$ or $\exists x (\neg P(x) \to \neg Q(x))$.
* **Why it Fails**: The negation of an implication $A \to B$ is $A \land \neg B$ (NOT another implication).
* **Correct Formulation**:
  $$\neg \forall x (P(x) \to Q(x)) \equiv \exists x \neg(P(x) \to Q(x)) \equiv \exists x (P(x) \land \neg Q(x))$$
  *Example*: "Every computer in the lab is patched" has negation "There exists a computer in the lab that is NOT patched" (not "Every computer is unpatched").

### 12.2 The Vacuous Truth Fallacy
* **Error**: Believing that "For all $x \in \emptyset, P(x)$" is false because there are no elements to exhibit the property.
* **Why it Fails**: By definition, $\forall x \in S, P(x) \equiv \forall x (x \in S \to P(x))$. When $S = \emptyset$, the antecedent $x \in \emptyset$ is identically **False**. Since $\text{False} \to Q$ is always **True**, the statement is vacuously true.
* **Impact**: The empty set $\emptyset$ is a subset of every set $A$ ($\emptyset \subseteq A$), and the empty relation is irreflexive, symmetric, antisymmetric, and transitive.

### 12.3 Confusing Subset ($\subseteq$) with Membership ($\in$)
* Let $A = \{ 1, \{2\} \}$.
  * $1 \in A$ is **True**.
  * $\{1\} \subseteq A$ is **True**.
  * $\{1\} \in A$ is **False** (the set containing 1 is not an element).
  * $2 \in A$ is **False** ($2$ is wrapped inside $\{2\}$).
  * $\{2\} \in A$ is **True**.
  * $\{2\} \subseteq A$ is **False** (because $2 \notin A$).
  * $\{\{2\}\} \subseteq A$ is **True**.

### 12.4 Illegal Division in Modular Congruences
* **Error**: Deducing $a \equiv b \pmod m$ from $ac \equiv bc \pmod m$.
* **Why it Fails**: In modular arithmetic, integers with non-trivial GCDs are zero-divisors.
* **Concrete Failure**:
  $$2 \cdot 4 \equiv 2 \cdot 1 \pmod 6 \quad (8 \equiv 2 \pmod 6 \text{ is True})$$
  Dividing by $2$ would yield $4 \equiv 1 \pmod 6$, which is **False**!
* **Correct Rule**:
  $$ac \equiv bc \pmod m \iff a \equiv b \pmod{\frac{m}{\gcd(c, m)}}$$
  Here $\gcd(2, 6) = 2$, so $4 \equiv 1 \pmod{6/2} \equiv 1 \pmod 3$ (which is True).

### 12.5 Blind Application of the Master Theorem
* **Error**: Applying the Master Theorem to $T(n) = 2T(n/2) + n \log n$ and declaring $T(n) = \Theta(n \log n)$.
* **Why it Fails**: The critical exponent is $\log_2 2 = 1$, so $n^{\log_b a} = n^1 = n$. The driving function is $f(n) = n \log n$. Notice that $f(n)$ is asymptotically larger than $n$, but NOT by a polynomial factor $n^\epsilon$ ($\log n$ grows slower than any $n^\epsilon$ for $\epsilon > 0$). Case 3 does NOT apply!
* **Correct Approach**: Use the extended case 2 (or a recursion tree) to obtain $T(n) = \Theta(n \log^2 n)$.

### 12.6 Treating Big-O as an Exact Metric
* **Error**: Writing $f(n) = O(n^2)$ and treating $f(n)$ as proportional to $n^2$, or writing $O(n^2) = f(n)$.
* **Why it Fails**: Big-O is a set containment relation ($\in$), not an equality ($=$). $O(g(n))$ is an upper bound, not a tight bound. A function $f(n) = 5n$ is mathematically in $O(n^2)$, $O(n^3)$, and $O(2^n)$. To claim tightness, one must use $\Theta(n^2)$.

---

## 13. Tricks / Shortcuts

### 13.1 The Invariant Principle (State Machine Shortcut)
When analyzing an iterative algorithm, game, or distributed protocol, do not trace every possible execution path. Instead:
1. Formulate a predicate or numeric quantity $I(\text{state})$.
2. Prove that if $I(\text{state})$ holds, then for any valid state transition $\text{state} \to \text{state}'$, $I(\text{state}')$ holds.
3. If the target state has $I(\text{target}) = \text{False}$, the target state is mathematically unreachable.
*Classic Example*: In the Mutilated Chessboard problem (removing two opposite diagonal corners), each domino covers exactly one black and one white square. The initial board has $32$ black and $30$ white squares. Invariant: $|B - W| = 2 \neq 0$. Since a fully tiled board requires $|B - W| = 0$, tiling is impossible.

### 13.2 Complementary Counting Principle
When tasked with counting configurations that satisfy "at least one" or "some messy constraint":
$$|A| = |\mathcal{U}| - |A^c|$$
*Example*: How many 8-bit bytes contain at least one `0`?
Direct counting requires summing $\binom{8}{1} + \binom{8}{2} + \dots + \binom{8}{8}$.
Complement shortcut: Total bytes $|\mathcal{U}| = 2^8 = 256$. The only byte with no `0`s is `11111111` ($1$ byte).
Answer = $256 - 1 = 255$.

### 13.3 The Contrapositive Transformation for Disjunctions
When asked to prove an implication whose conclusion is a disjunction:
$$P \implies (Q \lor R)$$
Proving this directly can be awkward. Transform it using classical equivalence:
$$(P \land \neg Q) \implies R \quad \text{or} \quad (P \land \neg R) \implies Q$$
You now have two concrete assumptions ($P$ and $\neg Q$) to deduce a single clean result ($R$).

### 13.4 Boolean Duality & Consensus Term Elimination
When simplifying large sum-of-products Boolean expressions, look for the **consensus pattern**:
$$x y + \bar{x} z + y z \equiv x y + \bar{x} z$$
The term $y z$ is completely redundant.
*Mental Check*: If variable $x$ appears uncomplemented in one term ($xy$) and complemented in another ($\bar{x}z$), the product of the remaining literals ($yz$) can be deleted immediately.

### 13.5 Master Theorem Inspection via Critical Exponent Ratio
Given $T(n) = a T(n/b) + \Theta(n^d)$:
1. Calculate $c = \log_b a$.
2. Compare $c$ and $d$:
   * $c > d \implies T(n) = \Theta(n^c)$
   * $c = d \implies T(n) = \Theta(n^d \log n)$
   * $c < d \implies T(n) = \Theta(n^d)$

### 13.6 Matrix Exponentiation for Any Linear Recurrence
Any $k$-th order linear recurrence $a_n = \sum_{i=1}^k c_i a_{n-i}$ can be computed in $O(k^3 \log n)$ time using binary matrix exponentiation:
$$\begin{pmatrix} a_n \\ a_{n-1} \\ \vdots \\ a_{n-k+1} \end{pmatrix} = \begin{pmatrix} c_1 & c_2 & \dots & c_k \\ 1 & 0 & \dots & 0 \\ 0 & 1 & \dots & 0 \\ \vdots & \vdots & \ddots & \vdots \end{pmatrix}^{n-k+1} \begin{pmatrix} a_{k-1} \\ a_{k-2} \\ \vdots \\ a_0 \end{pmatrix}$$

---

## 14. CS Connection

### 14.1 Relational Databases & SQL Query Optimizers
* **Codd's Relational Algebra**: Relational databases (PostgreSQL, MySQL) are direct implementations of first-order predicate logic and discrete relations.
  * A table is a finite relation $R \subseteq D_1 \times D_2 \times \dots \times D_k$.
  * A SQL `SELECT * FROM A, B` computes the Cartesian product $A \times B$.
  * A `WHERE` clause applies a first-order logic filter $\{ t \in R \mid P(t) \}$.
  * A `JOIN` is the relational composition of two relations projected on matching keys.
  * `GROUP BY` partitions the tuple relation into mathematical **equivalence classes** under an attribute projection.

### 14.2 Compilers, Abstract Syntax Trees & Type Systems
* **Grammars & Parsing**: Programming language syntax is formalized via Context-Free Grammars (CFGs).
* **Structural Induction on ASTs**: Compilers prove type safety theorems ("Well-typed programs cannot get stuck") using structural induction over the inductive definition of the language's Abstract Syntax Tree (AST).
* **Curry-Howard Isomorphism**: A deep bijection connecting discrete logic to computer science:
  * A proposition corresponds to a Type.
  * A proof corresponds to a Program.
  * Evaluating a program corresponds to Proof Normalization.

### 14.3 Cryptography & Cybersecurity
* **Public-Key Cryptography (RSA)**: Relies on number-theoretic discrete math:
  * Modular arithmetic over $\mathbb{Z}_n^*$.
  * Euler's Totient Theorem: $a^{\phi(n)} \equiv 1 \pmod n$.
  * Bezout's identity and the Extended Euclidean Algorithm to calculate modular multiplicative inverses $d \equiv e^{-1} \pmod{\phi(n)}$.
* **Block Ciphers (AES)**: The AES S-box is an invertible bijection (permutation) computed over the finite Galois Field $\text{GF}(2^8)$.

### 14.4 Operating Systems & Distributed Systems
* **Deadlock Detection**: Handled by detecting directed cycles in a Resource Allocation Graph using topological sorting of a partial order.
* **Lamport Logical Clocks**: In a distributed system with no centralized physical clock, the "happens-before" relation $\to$ is defined as a strict partial order on events.

### 14.5 Digital Hardware Design & VLSI
* **Logic Synthesis**: Chip designers express hardware using Boolean algebra (Verilog/VHDL). Optimization compilers use Karnaugh Maps and the Quine-McCluskey algorithm to find minimal sum-of-products expressions, minimizing the physical gate count and transistor heat dissipation.
* **Functional Completeness**: Modern silicon chips are constructed almost exclusively out of CMOS **NAND** (or **NOR**) gates because $\{ \text{NAND} \}$ is functionally complete.

---

## 15. Interactive Visualization

Below is an engine implemented in TypeScript/JavaScript that models the core discrete structures:
1. **Propositional Logic AST Evaluator & Truth Table Generator** (with Tautology/Contradiction classification).
2. **Binary Relation Analyzer & Transitive Closure** (Warshall's Algorithm).
3. **Divide-and-Conquer Recurrence Analyzer** (Master Theorem Solver).
4. **Lattice Explorer** (divisor lattices $D_{36}$ / $D_{30}$, the pentagon $N_5$, and a distributivity checker).

```typescript
// ============================================================================
// Discrete Mathematics Interactive Engine
// ============================================================================

export type TruthValue = boolean;

// 1. PROPOSITIONAL LOGIC EVALUATOR
export type Expr =
  | { type: 'var'; name: string }
  | { type: 'not'; sub: Expr }
  | { type: 'and'; left: Expr; right: Expr }
  | { type: 'or'; left: Expr; right: Expr }
  | { type: 'xor'; left: Expr; right: Expr }
  | { type: 'impl'; left: Expr; right: Expr }
  | { type: 'iff'; left: Expr; right: Expr };

export function evalExpr(expr: Expr, env: Record<string, boolean>): boolean {
  switch (expr.type) {
    case 'var':  return Boolean(env[expr.name]);
    case 'not':  return !evalExpr(expr.sub, env);
    case 'and':  return evalExpr(expr.left, env) && evalExpr(expr.right, env);
    case 'or':   return evalExpr(expr.left, env) || evalExpr(expr.right, env);
    case 'xor':  return evalExpr(expr.left, env) !== evalExpr(expr.right, env);
    case 'impl': return !evalExpr(expr.left, env) || evalExpr(expr.right, env);
    case 'iff':  return evalExpr(expr.left, env) === evalExpr(expr.right, env);
  }
}

export function generateTruthTable(variables: string[], expr: Expr) {
  const n = variables.length;
  const rowsCount = 1 << n;
  const table = [];
  let trueCount = 0;

  for (let i = 0; i < rowsCount; i++) {
    const env: Record<string, boolean> = {};
    for (let j = 0; j < n; j++) {
      // High-order bit corresponds to first variable
      const bit = Boolean((i >> (n - 1 - j)) & 1);
      env[variables[j]] = bit;
    }
    const result = evalExpr(expr, env);
    if (result) trueCount++;
    table.push({ ...env, RESULT: result });
  }

  const classification =
    trueCount === rowsCount ? 'TAUTOLOGY' :
    trueCount === 0 ? 'CONTRADICTION' : 'CONTINGENCY';

  return { table, classification, trueCount, totalRows: rowsCount };
}

// 2. BINARY RELATION PROPERTY ANALYZER
export interface RelationReport {
  isReflexive: boolean;
  isIrreflexive: boolean;
  isSymmetric: boolean;
  isAntisymmetric: boolean;
  isTransitive: boolean;
  isEquivalence: boolean;
  isPartialOrder: boolean;
  transitiveClosure: number[][];
  equivalenceClasses?: number[][];
}

export function analyzeRelation(size: number, pairs: [number, number][]): RelationReport {
  // Initialize adjacency matrix M
  const M: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  for (const [u, v] of pairs) {
    if (u >= 0 && u < size && v >= 0 && v < size) {
      M[u][v] = true;
    }
  }

  // Check Reflexivity & Irreflexivity
  let isReflexive = true;
  let isIrreflexive = true;
  for (let i = 0; i < size; i++) {
    if (!M[i][i]) isReflexive = false;
    if (M[i][i]) isIrreflexive = false;
  }

  // Check Symmetry & Antisymmetry
  let isSymmetric = true;
  let isAntisymmetric = true;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (M[i][j] && !M[j][i]) isSymmetric = false;
      if (i !== j && M[i][j] && M[j][i]) isAntisymmetric = false;
    }
  }

  // Check Transitivity via definition
  let isTransitive = true;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (M[i][j]) {
        for (let k = 0; k < size; k++) {
          if (M[j][k] && !M[i][k]) {
            isTransitive = false;
            break;
          }
        }
      }
    }
  }

  // Warshall's Algorithm for Transitive Closure W
  const W: number[][] = M.map((row) => row.map((cell) => (cell ? 1 : 0)));
  for (let k = 0; k < size; k++) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        W[i][j] = W[i][j] || (W[i][k] && W[k][j]) ? 1 : 0;
      }
    }
  }

  const isEquivalence = isReflexive && isSymmetric && isTransitive;
  const isPartialOrder = isReflexive && isAntisymmetric && isTransitive;

  // Compute Equivalence Classes if applicable
  let equivalenceClasses: number[][] | undefined;
  if (isEquivalence) {
    const visited = new Set<number>();
    equivalenceClasses = [];
    for (let i = 0; i < size; i++) {
      if (!visited.has(i)) {
        const cls: number[] = [];
        for (let j = 0; j < size; j++) {
          if (M[i][j]) {
            cls.push(j);
            visited.add(j);
          }
        }
        equivalenceClasses.push(cls);
      }
    }
  }

  return {
    isReflexive,
    isIrreflexive,
    isSymmetric,
    isAntisymmetric,
    isTransitive,
    isEquivalence,
    isPartialOrder,
    transitiveClosure: W,
    equivalenceClasses,
  };
}

// 3. MASTER THEOREM DIVIDE-AND-CONQUER SOLVER
export function solveMasterTheorem(a: number, b: number, d: number) {
  if (a < 1 || b <= 1) {
    throw new Error('Master Theorem requires a >= 1 and b > 1');
  }
  const crit = Math.log(a) / Math.log(b);
  const eps = 1e-6;

  if (Math.abs(crit - d) < eps) {
    return {
      case: 2,
      asymptotics: `Θ(n^${d.toFixed(2)} log n)`,
      explanation: `Critical exponent log_${b}(${a}) = ${crit.toFixed(2)} equals driving exponent d = ${d}. Balanced work.`,
    };
  } else if (crit > d) {
    return {
      case: 1,
      asymptotics: `Θ(n^${crit.toFixed(2)})`,
      explanation: `Critical exponent log_${b}(${a}) = ${crit.toFixed(2)} exceeds driving exponent d = ${d}. Leaf-dominated.`,
    };
  } else {
    return {
      case: 3,
      asymptotics: `Θ(n^${d.toFixed(2)})`,
      explanation: `Driving exponent d = ${d} exceeds critical exponent log_${b}(${a}) = ${crit.toFixed(2)}. Root-dominated.`,
    };
  }
}

// 4. LATTICE EXPLORER: DIVISOR LATTICES D36 / D30, PENTAGON N5
export interface Lattice {
  elements: string[];           // display labels
  covers: [number, number][];   // Hasse edges [lower, upper]
  rank: number[];               // height above the bottom element
  meet: number[][];             // meet[i][j] -> element index (a_i ∧ a_j)
  join: number[][];             // join[i][j] -> element index (a_i ∨ a_j)
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;
const isPrime = (m: number): boolean => {
  if (m < 2) return false;
  for (let f = 2; f * f <= m; f++) if (m % f === 0) return false;
  return true;
};
/** Total number of prime factors, counted with multiplicity. */
const bigOmega = (d: number): number => {
  let r = 0, m = d, p = 2;
  while (m > 1) {
    while (m % p === 0) { m /= p; r++; }
    p++;
  }
  return r;
};

/**
 * Divisor lattice D_n. A cover is exactly one prime factor added, so the rank
 * of a divisor is its total number of prime factors. Meet is gcd, join is lcm.
 */
export function divisorLattice(n: number): Lattice {
  const divs: number[] = [];
  for (let d = 1; d <= n; d++) if (n % d === 0) divs.push(d);
  const idx = new Map(divs.map((d, i) => [d, i]));
  const rank = divs.map(bigOmega);
  const covers: [number, number][] = [];
  for (const lo of divs) {
    for (const hi of divs) {
      if (hi > lo && hi % lo === 0 && isPrime(hi / lo)) {
        covers.push([idx.get(lo)!, idx.get(hi)!]);
      }
    }
  }
  const meet: number[][] = [];
  const join: number[][] = [];
  for (let i = 0; i < divs.length; i++) {
    meet.push([]); join.push([]);
    for (let j = 0; j < divs.length; j++) {
      meet[i].push(idx.get(gcd(divs[i], divs[j]))!);
      join[i].push(idx.get(lcm(divs[i], divs[j]))!);
    }
  }
  return { elements: divs.map(String), covers, rank, meet, join };
}

/** The pentagon N5: chains 0 < a < 1 and 0 < b < c < 1; a incomparable to b, c. */
export const N5: Lattice = {
  elements: ['0', 'a', 'b', 'c', '1'],
  covers: [[0, 1], [0, 2], [2, 3], [3, 4], [1, 4]],
  rank: [0, 1, 1, 2, 3],
  meet: [
    [0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1],
    [0, 0, 2, 2, 2],
    [0, 0, 2, 3, 3],
    [0, 1, 2, 3, 4],
  ],
  join: [
    [0, 1, 2, 3, 4],
    [1, 1, 4, 4, 4],
    [2, 4, 2, 3, 4],
    [3, 4, 3, 3, 4],
    [4, 4, 4, 4, 4],
  ],
};

/** Birkhoff distributivity test: a ∧ (b ∨ c) = (a ∧ b) ∨ (a ∧ c) for all triples. */
export function isDistributive(L: Lattice): boolean {
  const n = L.elements.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        if (L.meet[i][L.join[j][k]] !== L.join[L.meet[i][j]][L.meet[i][k]]) return false;
      }
    }
  }
  return true;
}

// isDistributive(divisorLattice(36))  // true  — the 3x3 grid
// isDistributive(divisorLattice(30))  // true  — the cube B3
// isDistributive(N5)                  // false — c ∧ (a ∨ b) = c, but (c ∧ a) ∨ (c ∧ b) = b
```

---

## 16. Practice Problems

### Problem 16.1 (Logic & Negation)
**Question**: Negate the following predicate logic statement such that no negation operator precedes a quantifier or connective:
$$\forall x \in \mathbb{R}, \; \exists y \in \mathbb{R}, \; (x < y \land \forall z \in \mathbb{R}, (y < z \to x < z))$$

**Solution**:
1. Apply negation to the outer statement:
   $$\neg [\forall x, \exists y (x < y \land \forall z (y < z \to x < z))]$$
2. Move negation past $\forall x$ (converts to $\exists x$):
   $$\exists x \neg [\exists y (x < y \land \forall z (y < z \to x < z))]$$
3. Move negation past $\exists y$ (converts to $\forall y$):
   $$\exists x \forall y \neg [ (x < y) \land \forall z (y < z \to x < z) ]$$
4. Apply De Morgan's law to the conjunction $\neg (A \land B) \equiv \neg A \lor \neg B$:
   $$\exists x \forall y [ \neg (x < y) \lor \neg \forall z (y < z \to x < z) ]$$
5. Negate $(x < y)$ to get $(x \ge y)$, and push negation past $\forall z$:
   $$\exists x \forall y [ (x \ge y) \lor \exists z \neg (y < z \to x < z) ]$$
6. Apply negation of implication $\neg (P \to Q) \equiv P \land \neg Q$:
   $$\exists x \forall y [ (x \ge y) \lor \exists z (y < z \land x \ge z) ]$$
The negation is completely simplified.

---

### Problem 16.2 (Combinatorics & Principle of Inclusion-Exclusion)
**Question**: A computer network has $100$ servers. Over an evaluation window:
* $50$ servers experienced high CPU load.
* $40$ servers experienced memory exhaustion.
* $30$ servers experienced disk I/O bottlenecks.
* $20$ servers experienced both high CPU and memory exhaustion.
* $15$ servers experienced both high CPU and disk bottlenecks.
* $10$ servers experienced both memory exhaustion and disk bottlenecks.
* $5$ servers experienced all three issues simultaneously.
How many servers experienced **at least one** issue, and how many ran completely **without issues**?

**Solution**:
Let $C, M, D$ denote the sets of servers with CPU, Memory, and Disk issues.
By the Principle of Inclusion-Exclusion:
$$|C \cup M \cup D| = (|C| + |M| + |D|) - (|C \cap M| + |C \cap D| + |M \cap D|) + |C \cap M \cap D|$$
Substitute the values:
$$|C \cup M \cup D| = (50 + 40 + 30) - (20 + 15 + 10) + 5$$
$$|C \cup M \cup D| = 120 - 45 + 5 = 80 \text{ servers}$$
The number of servers experiencing no issues is the complement:
$$|U \setminus (C \cup M \cup D)| = 100 - 80 = 20 \text{ servers}$$

---

### Problem 16.3 (Relations & Equivalence Counting)
**Question**: Let $A = \{1, 2, 3, 4, 5, 6\}$. Define relation $R$ on $A$ by $(a, b) \in R \iff a \equiv b \pmod 2$.
1. Is $R$ an equivalence relation?
2. Explicitly write out the equivalence classes.
3. How many total ordered pairs belong to $R$?

**Solution**:
1. Parity congruence $a \equiv b \pmod 2$ is reflexive ($a-a = 0$ is even), symmetric ($a-b$ even $\implies b-a$ even), and transitive ($a-b$ even and $b-c$ even $\implies a-c$ even). Thus $R$ is an equivalence relation.
2. The elements partition into even and odd integers:
   * $[1]_R = \{1, 3, 5\}$ (Odds)
   * $[2]_R = \{2, 4, 6\}$ (Evens)
3. For any partition with subsets of sizes $s_1, s_2, \dots, s_k$, the total number of pairs in the equivalence relation is $\sum_{i=1}^k s_i^2$.
   $$|R| = |[1]|^2 + |[2]|^2 = 3^2 + 3^2 = 9 + 9 = 18 \text{ ordered pairs}$$

---

### Problem 16.4 (Pigeonhole Principle in Graphs)
**Question**: Prove that in any simple undirected graph with $n \ge 2$ vertices, there must exist at least two vertices that have the exact same degree.

**Solution**:
1. In a simple graph with $n$ vertices, each vertex can connect to at most $n-1$ other vertices.
   The possible degrees for any vertex lie in the set:
   $$D = \{0, 1, 2, \dots, n-1\}$$
2. Notice the mutual exclusivity of degree $0$ and degree $n-1$:
   * If there is a vertex of degree $0$, it connects to nobody. Therefore, no vertex can connect to all other $n-1$ vertices (degree $n-1$ is impossible).
   * If there is a vertex of degree $n-1$, it connects to all vertices. Therefore, no vertex can be isolated (degree $0$ is impossible).
3. Hence, the actual set of possible degrees in any single valid graph can have size at most $n-1$ (either $\{0, 1, \dots, n-2\}$ or $\{1, 2, \dots, n-1\}$).
4. By the Pigeonhole Principle:
   * Pigeons = $n$ vertices.
   * Pigeonholes = at most $n-1$ degree values.
   Since $n > n-1$, at least two vertices must be assigned to the same degree value. $\blacksquare$

---

### Problem 16.5 (Solving a Non-Homogeneous Recurrence)
**Question**: Solve the recurrence relation:
$$a_n = 2a_{n-1} + 3^n \quad \text{for } n \ge 1, \quad \text{with } a_0 = 4$$

**Solution**:
**Step 1: Homogeneous Solution ($a_n^{(h)}$)**
$$a_n - 2a_{n-1} = 0 \implies r - 2 = 0 \implies r = 2$$
$$a_n^{(h)} = C \cdot 2^n$$

**Step 2: Particular Solution ($a_n^{(p)}$)**
The non-homogeneous term is $f(n) = 3^n$. Since $3$ is not a root of the characteristic equation, guess $a_n^{(p)} = A \cdot 3^n$.
Substitute into the recurrence:
$$A \cdot 3^n = 2(A \cdot 3^{n-1}) + 3^n$$
Divide by $3^{n-1}$:
$$3A = 2A + 3 \implies A = 3$$
Thus, $a_n^{(p)} = 3 \cdot 3^n = 3^{n+1}$.

**Step 3: General Solution**
$$a_n = a_n^{(h)} + a_n^{(p)} = C \cdot 2^n + 3^{n+1}$$

**Step 4: Solve for $C$ Using $a_0 = 4$**
$$a_0 = C \cdot 2^0 + 3^{0+1} = C + 3 = 4 \implies C = 1$$
**Final Closed Form**:
$$a_n = 2^n + 3^{n+1}$$

*Check for $n=1$*: $a_1 = 2(4) + 3^1 = 11$. Formula: $2^1 + 3^2 = 2 + 9 = 11$. (Verified) $\blacksquare$

---

## 17. MCQs

### MCQ 1
Let $R$ and $S$ be equivalence relations on a set $A$. Which of the following statements is **always** true?
* A) $R \cup S$ is an equivalence relation on $A$.
* B) $R \cap S$ is an equivalence relation on $A$.
* C) $R \setminus S$ is an equivalence relation on $A$.
* D) $R \circ S$ is an equivalence relation on $A$.

> **Correct Answer: B**
> **Explanation**: The intersection of any two equivalence relations is always reflexive (both contain $\Delta_A$), symmetric ($a(R \cap S)b \implies aRb \land aSb \implies bRa \land bSa \implies b(R \cap S)a$), and transitive ($a(R \cap S)b \land b(R \cap S)c \implies (aRb \land bRc) \land (aSb \land bSc) \implies aRc \land aSc \implies a(R \cap S)c$).
> *Distractor Analysis*:
> * A is wrong: Unions of equivalence relations generally fail transitivity (e.g., $R = \{(1,1),(2,2),(1,2),(2,1)\}$, $S = \{(2,2),(3,3),(2,3),(3,2)\}$ on $\{1,2,3\}$; $(1,2) \in R \cup S$ and $(2,3) \in R \cup S$, but $(1,3) \notin R \cup S$).
> * C is wrong: $R \setminus S$ removes diagonal elements $(a, a)$, losing reflexivity.
> * D is wrong: $R \circ S$ is an equivalence relation if and only if $R \circ S = S \circ R$ (they commute).

---

### MCQ 2
How many distinct Boolean functions of $n$ variables $f: \{0, 1\}^n \to \{0, 1\}$ can be constructed?
* A) $2^n$
* B) $n^2$
* C) $2^{2^n}$
* D) $2^{n^2}$

> **Correct Answer: C**
> **Explanation**: A truth table with $n$ binary input variables contains $2^n$ distinct rows. For each of these $2^n$ input combinations, the Boolean function can output either `0` or `1` (2 independent choices). By the product rule of counting, there are $2^{2^n}$ distinct functions.
> *Distractor Analysis*:
> * A is wrong: $2^n$ is the number of rows in the truth table, not the number of functions.
> * B is wrong: $n^2$ is an algebraic expression irrelevant to truth table permutations.
> * D is wrong: $2^{n^2}$ is the number of binary relations on a set of size $n$.

---

### MCQ 3
What is the contrapositive of the assertion: *"If a graph is bipartite, then it contains no odd-length cycles"*?
* A) If a graph contains no odd-length cycles, then it is bipartite.
* B) If a graph is not bipartite, then it contains an odd-length cycle.
* C) If a graph contains an odd-length cycle, then it is not bipartite.
* D) If a graph contains an even-length cycle, then it is bipartite.

> **Correct Answer: C**
> **Explanation**: The conditional is $P \to Q$, where $P = \text{"graph is bipartite"}$ and $Q = \text{"graph contains no odd cycles"}$. The contrapositive is $\neg Q \to \neg P$.
> $\neg Q$ is "The graph contains an odd cycle", and $\neg P$ is "The graph is not bipartite".
> *Distractor Analysis*:
> * A is the converse ($Q \to P$).
> * B is the inverse ($\neg P \to \neg Q$).
> * D introduces an extraneous condition (even cycles have no bearing on bipartiteness).

---

### MCQ 4
Let $A$ be a set with $|A| = 4$. What is the number of **antisymmetric** relations that can be defined on $A$?
* A) $16$
* B) $65,536$
* C) $11,664$
* D) $2,048$

> **Correct Answer: C**
> **Explanation**: The formula for the number of antisymmetric relations on a set of size $n$ is $2^n \cdot 3^{\frac{n(n-1)}{2}}$.
> For $n = 4$:
> * $\frac{n(n-1)}{2} = \frac{4 \times 3}{2} = 6$ unordered pairs of distinct elements.
> * $2^n = 2^4 = 16$ choices for the diagonal elements.
> * $3^6 = 729$ choices for off-diagonal pairs.
> * Total = $16 \times 729 = 11,664$.

---

### MCQ 5
Consider the recurrence $T(n) = 8T(n/2) + \Theta(n^3)$. By the Master Theorem, what is the tight asymptotic bound for $T(n)$?
* A) $\Theta(n^3)$
* B) $\Theta(n^3 \log n)$
* C) $\Theta(n^4)$
* D) $\Theta(n^{\log_2 3})$

> **Correct Answer: B**
> **Explanation**: Here $a = 8$, $b = 2$, and $f(n) = \Theta(n^3)$.
> The critical exponent is $\log_b a = \log_2 8 = 3$.
> Since $f(n) = \Theta(n^3) = \Theta(n^{\log_b a})$, this falls precisely under **Case 2** of the Master Theorem ($k = 0$).
> Thus, $T(n) = \Theta(n^{\log_b a} \log^{k+1} n) = \Theta(n^3 \log n)$.

---

### MCQ 6
Which of the following logical formulas is a **contradiction**?
* A) $(p \to q) \land (p \land \neg q)$
* B) $(p \lor q) \to (p \land q)$
* C) $(p \to q) \lor (q \to p)$
* D) $p \oplus (p \land q)$

> **Correct Answer: A**
> **Explanation**: $(p \to q) \equiv \neg p \lor q$. The formula is $(\neg p \lor q) \land (p \land \neg q)$.
> Let $X = (p \land \neg q)$. By De Morgan's laws, $\neg X = \neg p \lor q$.
> The expression is $\neg X \land X \equiv \bot$ (identically False under all truth assignments).
> *Distractor Analysis*:
> * B is a contingency (True when $p=q=\text{T}$ or $p=q=\text{F}$).
> * C is a famous tautology (always True for any $p, q$).
> * D is a contingency (evaluates to True when $p=\text{T}, q=\text{F}$).

---

## 18. Challenge Problems

### Challenge 18.1: The Erdős-Szekeres Theorem (Poset / Pigeonhole Proof)
**Theorem**: Let $n \ge 1$ and let $r, s$ be positive integers. Every sequence of $r \cdot s + 1$ distinct real numbers contains either a monotonically increasing subsequence of length $r + 1$ or a monotonically decreasing subsequence of length $s + 1$.

**Proof**:
Let the sequence of $r \cdot s + 1$ distinct real numbers be denoted by:
$$a_1, a_2, \dots, a_{rs+1}$$
For each index $i \in \{1, 2, \dots, rs + 1\}$, associate an ordered pair of positive integers:
$$(x_i, y_i)$$
where:
* $x_i$ is the length of the longest monotonically increasing subsequence ending at $a_i$.
* $y_i$ is the length of the longest monotonically decreasing subsequence ending at $a_i$.

**Lemma**: For any two distinct indices $i < j$, the pairs $(x_i, y_i)$ and $(x_j, y_j)$ must be distinct:
$$(x_i, y_i) \neq (x_j, y_j)$$
*Proof of Lemma*:
Since all numbers in the sequence are distinct, either $a_i < a_j$ or $a_i > a_j$.
* If $a_i < a_j$: We can append $a_j$ to the longest increasing subsequence ending at $a_i$. Thus, the length of the increasing subsequence ending at $a_j$ satisfies $x_j \ge x_i + 1 > x_i$. Hence $x_i \neq x_j$.
* If $a_i > a_j$: We can append $a_j$ to the longest decreasing subsequence ending at $a_i$. Thus, $y_j \ge y_i + 1 > y_i$. Hence $y_i \neq y_j$.
In both cases, $(x_i, y_i) \neq (x_j, y_j)$. The mapping $i \mapsto (x_i, y_i)$ is strictly **injective**.

**Applying the Pigeonhole Principle**:
Now suppose for contradiction that there is **no** increasing subsequence of length $r + 1$ and **no** decreasing subsequence of length $s + 1$.
This means that for all $i$:
$$1 \le x_i \le r \quad \text{and} \quad 1 \le y_i \le s$$
The set of all possible ordered pairs $(x_i, y_i)$ is a subset of $\{1, \dots, r\} \times \{1, \dots, s\}$, which contains at most:
$$r \cdot s \text{ possible pairs}$$
However, we have $r \cdot s + 1$ indices (pigeons) mapped injectively into $r \cdot s$ possible coordinate pairs (holes).
By the Pigeonhole Principle, at least two distinct indices must receive the exact same pair, directly contradicting the lemma!
Therefore, either some $x_i \ge r + 1$ or some $y_i \ge s + 1$. $\blacksquare$

---

### Challenge 18.2: De Bruijn Sequences and Hamiltonian Cycles
**Problem**: A binary De Bruijn sequence $B(2, n)$ is a cyclic bit-string of length $2^n$ such that every possible binary string of length $n$ appears exactly once as a contiguous substring. Prove that a binary De Bruijn sequence exists for every integer $n \ge 1$.

**Proof**:
Construct a directed graph $G_n = (V, E)$, called the **De Bruijn Graph of order $n$**:
* **Vertices $V$**: The set of all $2^{n-1}$ binary strings of length $n - 1$:
  $$V = \{0, 1\}^{n-1}$$
* **Edges $E$**: There is a directed edge from vertex $u = u_1 u_2 \dots u_{n-1}$ to vertex $v = v_1 v_2 \dots v_{n-1}$ if and only if the suffix of $u$ matches the prefix of $v$:
  $$u_2 u_3 \dots u_{n-1} = v_1 v_2 \dots v_{n-2}$$
  Each directed edge represents an $n$-bit string $e = u_1 u_2 \dots u_{n-1} v_{n-1}$.

**Properties of $G_n$**:
1. **Total Edges**: Since each vertex $u$ has two outgoing edges (one appending $0$, one appending $1$), the out-degree of every vertex is:
   $$\operatorname{out-deg}(u) = 2$$
   Similarly, each vertex $v$ can be reached from exactly two predecessors (prepending $0$ or $1$), so:
   $$\operatorname{in-deg}(v) = 2$$
   Thus, for every vertex $v \in V$:
   $$\operatorname{in-deg}(v) = \operatorname{out-deg}(v) = 2$$
   The graph is **balanced**.
2. **Strongly Connected**: Given any vertex $u$ and any vertex $w$, we can transition from $u$ to $w$ in at most $n-1$ steps by shifting in the bits of $w$ one by one.

**Euler's Theorem for Digraphs**:
A directed graph contains an **Eulerian circuit** (a closed walk visiting every edge exactly once) if and only if it is strongly connected and every vertex has $\operatorname{in-deg}(v) = \operatorname{out-deg}(v)$.
Both conditions hold for $G_n$.
Therefore, $G_n$ contains an Eulerian circuit traversing all $|E| = 2 \cdot 2^{n-1} = 2^n$ edges.
Reading the edge labels along this Eulerian circuit produces a cyclic sequence of length $2^n$ where every $n$-bit string appears as a contiguous window of length $n$ exactly once. $\blacksquare$

---

### Challenge 18.3: Refutation Completeness of Propositional Resolution
**Theorem**: A set of propositional clauses $\Sigma$ in Conjunctive Normal Form (CNF) is unsatisfiable if and only if the empty clause $\square$ (representing contradiction $\bot$) can be derived from $\Sigma$ using the **Resolution Rule**:
$$\frac{C_1 \lor x \quad C_2 \lor \neg x}{C_1 \lor C_2}$$

**Proof (by Induction on the Number of Variables $n$)**:
*Soundness ($\Sigma \vdash \square \implies \Sigma$ is unsatisfiable)*:
The resolution rule is locally sound: if truth assignment $\alpha \models (C_1 \lor x)$ and $\alpha \models (C_2 \lor \neg x)$, then if $\alpha(x) = \text{True}$, $\alpha$ must satisfy $C_2$; if $\alpha(x) = \text{False}$, $\alpha$ must satisfy $C_1$. In all cases, $\alpha \models (C_1 \lor C_2)$.
Because truth is preserved, if $\square \equiv \bot$ is derived, no assignment can satisfy $\Sigma$.

*Completeness ($\Sigma$ is unsatisfiable $\implies \Sigma \vdash \square$)*:
We proceed by induction on $n$, the number of distinct propositional variables in $\Sigma$.
* **Base Case ($n = 0$)**:
  If $\Sigma$ has no variables and is unsatisfiable, it must already contain the empty clause $\square$. Thus $\Sigma \vdash \square$.
* **Inductive Step**:
  Assume resolution is refutation complete for all clause sets with $< n$ variables.
  Let $\Sigma$ be an unsatisfiable clause set over variables $\{x_1, \dots, x_n\}$. Pick variable $x_n$.
  Partition the clauses in $\Sigma$ containing $x_n$ into three sets:
  * $\Sigma_+$: clauses of the form $C_i \lor x_n$
  * $\Sigma_-$: clauses of the form $D_j \lor \neg x_n$
  * $\Sigma_0$: clauses containing neither $x_n$ nor $\neg x_n$

  Form the resolved clause set $\Sigma' = \Sigma_0 \cup \{ C_i \lor D_j \mid (C_i \lor x_n) \in \Sigma_+ \land (D_j \lor \neg x_n) \in \Sigma_- \}$.
  Notice that $\Sigma'$ does not contain variable $x_n$, so it has $n - 1$ variables.

  *Claim: $\Sigma'$ is unsatisfiable.*
  Suppose for contradiction that $\Sigma'$ is satisfiable. Then there exists a truth assignment $\alpha: \{x_1, \dots, x_{n-1}\} \to \{0, 1\}$ satisfying all clauses in $\Sigma'$.
  Can we extend $\alpha$ to satisfy $\Sigma$?
  * If $\alpha$ satisfies all $C_i$, we can set $\alpha(x_n) = 0$, satisfying all clauses in $\Sigma_-$.
  * If $\alpha$ violates some $C_{i^*}$, then because $\alpha$ satisfies all resolved clauses $(C_{i^*} \lor D_j) \in \Sigma'$, $\alpha$ must satisfy every $D_j$. In this case, setting $\alpha(x_n) = 1$ satisfies all clauses in $\Sigma_+$.
  Thus, if $\Sigma'$ were satisfiable, $\Sigma$ would be satisfiable.
  Because $\Sigma$ is unsatisfiable, $\Sigma'$ must be unsatisfiable!

  By the Inductive Hypothesis, since $\Sigma'$ has $n-1$ variables and is unsatisfiable, there exists a resolution derivation of $\square$ from $\Sigma'$.
  Since every clause in $\Sigma'$ is either in $\Sigma$ or derived from $\Sigma$ by one resolution step, we conclude $\Sigma \vdash \square$. $\blacksquare$

---

## 19. Quick Revision

### High-Yield Flash Cards & Exam Anchors

```
+----------------------------------------------------------------------------------------------------+
|                                    DISCRETE MATH FORMULA PUNCHLIST                                 |
+----------------------------------------------------------------------------------------------------+
| 1. LOGIC EQUIVALENCES:                                                                             |
|    • p → q ≡ ¬p ∨ q ≡ ¬q → ¬p (Contrapositive)                                                     |
|    • ¬(p → q) ≡ p ∧ ¬q                                                                             |
|    • p ⊕ q ≡ (p ∨ q) ∧ ¬(p ∧ q)                                                                    |
|    • De Morgan: ¬(p ∧ q) ≡ ¬p ∨ ¬q    |    ¬(p ∨ q) ≡ ¬p ∧ ¬q                                      |
|    • Absorption: p ∨ (p ∧ q) ≡ p      |    p ∧ (p ∨ q) ≡ p                                         |
|    • Consensus: xy + x'z + yz = xy + x'z                                                           |
+----------------------------------------------------------------------------------------------------+
| 2. SET THEORY & CARDINALITY:                                                                       |
|    • Power set size: |P(A)| = 2^|A|                                                                |
|    • 2-Set PIE: |A ∪ B| = |A| + |B| - |A ∩ B|                                                      |
|    • 3-Set PIE: |A ∪ B ∪ C| = Σ|A| - Σ|A ∩ B| + |A ∩ B ∩ C|                                        |
|    • Countably infinite: |N| = |Z| = |Q| = ℵ₀                                                      |
|    • Uncountable: |R| = |P(N)| = 2^ℵ₀ = c                                                          |
+----------------------------------------------------------------------------------------------------+
| 3. RELATIONS (on set of size n):                                                                   |
|    • Total relations:           2^(n²)                                                             |
|    • Reflexive:                 2^(n(n-1))               (Diagonal fixed = 1)                      |
|    • Symmetric:                 2^(n(n+1)/2)             (Independent upper triangle)              |
|    • Antisymmetric:             2^n · 3^(n(n-1)/2)       (3 choices per pair: left, right, none)   |
|    • Equivalence relation:      Reflexive + Symmetric + Transitive → Partitions set into classes   |
|    • Partial Order (Poset):     Reflexive + Antisymmetric + Transitive                             |
+----------------------------------------------------------------------------------------------------+
| 4. FUNCTIONS (f: A → B, |A| = m, |B| = n):                                                         |
|    • Total functions:           n^m                                                                |
|    • Injective (One-to-One):    n! / (n - m)!   (Requires m ≤ n)                                   |
|    • Bijective:                 n!              (Requires m = n)                                   |
+----------------------------------------------------------------------------------------------------+
| 5. RECURRENCES (Master Theorem for T(n) = aT(n/b) + Θ(n^d)):                                      |
|    • c = log_b(a) (Critical Exponent)                                                              |
|    • c > d  ==>  T(n) = Θ(n^c)                 (Leaf-dominated)                                   |
|    • c = d  ==>  T(n) = Θ(n^d · log n)         (Balanced)                                         |
|    • c < d  ==>  T(n) = Θ(n^d)                 (Root-dominated)                                   |
+----------------------------------------------------------------------------------------------------+
| 6. PROOF HEURISTICS:                                                                               |
|    • "For all x" false?  --> Provide ONE counterexample.                                           |
|    • "There exists x" false? --> Prove for ALL x it fails.                                         |
|    • Direct proof stuck? --> Prove contrapositive (¬Q → ¬P).                                       |
|    • Divisibility / integer problems? --> Use Well-Ordering Principle / Minimal Counterexample.    |
|    • Loop termination? --> Define strict decreasing metric bounded below in N₀.                    |
+----------------------------------------------------------------------------------------------------+
```
