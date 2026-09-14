import type { Concept } from '../types';

export const geometry: Concept[] = [
  {
    id: 'coordinate-geometry',
    title: 'Coordinate Geometry',
    domain: 'geometry',
    topic: true,
    summary: 'Points as vectors, distance formula, midpoint, slope. The bridge between algebra and geometry.',
    level: 'foundational',
    csFields: ['computer-graphics', 'game-dev', 'computer-vision', 'robotics'],
    prerequisites: ['vectors'],
    related: ['vectors', 'unit-circle-trig'],
    next: ['unit-circle-trig'],
    content: [
      { t: 'def', title: 'Coordinates', text: 'Point $P=(x,y)$ in plane, $P=(x,y,z)$ in space. Distance $d(P,Q)=\\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}$. Midpoint $M=((x_1+x_2)/2,(y_1+y_2)/2)$. Slope $m=(y_2-y_1)/(x_2-x_1)$.' },
      { t: 'ex', title: 'Line equation', steps: [
        'Two-point form: (y-y1)=m(x-x1).',
        'General: ax+by+c=0, normal vector (a,b).',
        'Distance from point (x0,y0) to line ax+by+c=0: |ax0+by0+c|/√(a²+b²).',
      ]},
    ],
    practice: [
      { id: 'cg-p1', q: 'Distance between (0,0) and (3,4)?', type: 'numeric', diff: 'easy', answer: '5', explain: '3-4-5 triangle.' },
    ],
  },
  {
    id: 'unit-circle-trig',
    title: 'Unit Circle and Trigonometry',
    domain: 'geometry',
    parent: 'coordinate-geometry',
    summary: 'On unit circle $x²+y²=1$, angle θ from positive x-axis: $cosθ=x$, $sinθ=y$, $tanθ=y/x$. Periodic, $sin²+cos²=1$.',
    level: 'core',
    csFields: ['computer-graphics', 'game-dev', 'robotics', 'competitive-programming', 'computer-vision'],
    prerequisites: ['coordinate-geometry'],
    related: ['plane-transformations', 'conic-sections'],
    next: ['3d-geometry'],
    content: [
      { t: 'def', title: 'Trig functions', text: 'Unit circle: $cosθ = x$, $sinθ = y$. $tanθ = sinθ/cosθ$. $sec=1/cos$, $csc=1/sin$, $cot=cos/sin$. Period $2π$ for sin/cos, $π$ for tan. Pythagorean: $sin²θ+cos²θ=1$.' },
      { t: 'formula', name: 'Angle sum', latex: '\\sin(a+b)=\\sin a\\cos b+\\cos a\\sin b,\\; \\cos(a+b)=\\cos a\\cos b-\\sin a\\sin b,\\; \\tan(a+b)=\\frac{\\tan a+\\tan b}{1-\\tan a\\tan b}', note: '' },
      { t: 'ex', title: 'Rotation', steps: [
        'Point (1,0) rotated by θ: (cosθ, sinθ).',
        'Rotate (x,y) by θ: (x cosθ - y sinθ, x sinθ + y cosθ) — matrix [[cosθ,-sinθ],[sinθ,cosθ]].',
      ]},
      { t: 'cs', items: [
        { area: 'Game dev', how: 'Character facing direction: angle → (cos,sin) velocity.' },
        { area: 'Graphics', how: 'Camera orbit: spherical coordinates use sin/cos.' },
      ]},
    ],
    practice: [
      { id: 'trig-p1', q: 'sin 30°?', type: 'numeric', diff: 'easy', answer: '0.5', explain: 'Unit circle.' },
      { id: 'trig-p2', q: 'Prove sin²+cos²=1 from unit circle definition.', type: 'proof', diff: 'easy', answer: 'Point (cosθ,sinθ) lies on x²+y²=1, so cos²+sin²=1.', explain: 'Definition.' },
    ],
  },
  {
    id: '3d-geometry',
    title: '3D Geometry',
    domain: 'geometry',
    parent: 'unit-circle-trig',
    summary: 'Points, vectors, planes, lines in 3D. Plane: $ax+by+cz=d$ with normal $(a,b,c)$. Line: $p+tv$. Distance, intersection.',
    level: 'core',
    csFields: ['computer-graphics', 'robotics', 'computer-vision', 'game-dev'],
    prerequisites: ['unit-circle-trig', 'vectors', 'dot-product', 'cross-product'],
    related: ['plane-transformations', 'conic-sections'],
    content: [
      { t: 'def', title: '3D basics', text: 'Plane: $ax+by+cz=d$, normal $n=(a,b,c)$. Line: $r(t)=p+tv$, $p$ point, $v$ direction. Two planes intersect in line (unless parallel). Line-plane intersection solves $a(p_x+t v_x)+...=d$ for t.' },
      { t: 'props', items: [
        { title: 'Distance point-plane', text: '|ax0+by0+cz0-d|/√(a²+b²+c²).' },
        { title: 'Angle plane-plane', text: 'Angle between normals: cosθ = |n1·n2|/(|n1||n2|).' },
      ]},
      { t: 'ex', title: 'Ray tracing', steps: [
        'Ray: origin o + t d, t≥0.',
        'Intersect plane: solve (o+t d)·n = d0 → t = (d0 - o·n)/(d·n). If denominator 0, parallel.',
      ]},
    ],
    practice: [
      { id: '3d-p1', q: 'Plane through (0,0,0) with normal (0,0,1)?', type: 'short', diff: 'easy', answer: 'z=0 (xy-plane)', explain: '0*x+0*y+1*z=0.' },
    ],
  },
  {
    id: 'conic-sections',
    title: 'Conic Sections',
    domain: 'geometry',
    parent: '3d-geometry',
    summary: 'Circle, ellipse, parabola, hyperbola: intersections of cone with plane. Quadratic equations $Ax²+Bxy+Cy²+Dx+Ey+F=0$.',
    level: 'core',
    csFields: ['computer-graphics', 'computer-vision', 'game-dev'],
    prerequisites: ['coordinate-geometry', 'unit-circle-trig'],
    related: ['3d-geometry'],
    content: [
      { t: 'def', title: 'Conics', text: 'Circle: $(x-h)²+(y-k)²=r²$. Ellipse: $(x-h)²/a²+(y-k)²/b²=1$. Parabola: $y=a(x-h)²+k$ (focus-directrix). Hyperbola: $(x-h)²/a²-(y-k)²/b²=1$. Discriminant $B²-4AC$: <0 ellipse (circle if A=C), =0 parabola, >0 hyperbola.' },
      { t: 'ex', title: 'Orbit', steps: [
        'Planet orbit ellipse with Sun at focus: r = a(1-e²)/(1+e cosθ), e eccentricity.',
        'Parabola: projectile y = x tanθ - gx²/(2v² cos²θ).',
      ]},
      { t: 'cs', items: [
        { area: 'Graphics', how: 'Lens distortion modeled via conics; bounding volumes: circles, ellipses for culling.' },
      ]},
    ],
    practice: [
      { id: 'conic-p1', q: 'What conic is x²+y²=4?', type: 'mcq', diff: 'easy', options: ['Circle','Ellipse','Parabola','Hyperbola'], correct: 0, answer: 'Circle radius 2', explain: 'A=C, B=0, discriminant negative.' },
    ],
  },
  {
    id: 'transformations-geometry',
    title: 'Geometric Transformations',
    domain: 'geometry',
    parent: 'conic-sections',
    summary: 'Translation, rotation, scaling, reflection, shear: preserve certain properties. Composition is matrix multiplication in homogeneous coordinates.',
    level: 'core',
    csFields: ['computer-graphics', 'game-dev'],
    prerequisites: ['plane-transformations', 'matrix-multiplication'],
    related: ['plane-transformations', 'linear-transformations'],
    content: [
      { t: 'def', title: 'Isometry', text: 'Preserves distances: translation, rotation, reflection (and composition). Similarity preserves angles (adds uniform scaling). Affine preserves parallelism (adds shear, non-uniform scaling). Projective preserves lines.' },
      { t: 'ex', title: '2D composition', steps: [
        'Translate by (1,0) then rotate 90°: (x,y)→(x+1,y)→(-y, x+1).',
        'Rotate then translate: (x,y)→(-y,x)→(-y+1, x). Different — order matters.',
      ]},
    ],
    practice: [],
  },
  {
    id: 'spherical-geometry',
    title: 'Spherical Geometry',
    domain: 'geometry',
    parent: '3d-geometry',
    summary: 'Geometry on sphere: great circles are lines, sum of triangle angles >180°, area = R²·excess. Used for geo and 3D.',
    level: 'advanced',
    csFields: ['computer-graphics', 'robotics'],
    prerequisites: ['3d-geometry', 'unit-circle-trig'],
    related: ['conic-sections'],
    content: [
      { t: 'def', title: 'Great circle', text: 'Intersection of sphere with plane through center: shortest path (geodesic) on sphere. Any two non-antipodal points define unique great circle.' },
      { t: 'formula', name: 'Haversine', latex: 'd=2R\\arcsin\\sqrt{\\sin²\\frac{Δφ}{2}+\\cos φ_1\\cos φ_2\\sin²\\frac{Δλ}{2}}', note: 'Distance between lat/long φ,λ.' },
      { t: 'cs', items: [
        { area: 'Maps', how: 'GPS distance uses haversine (spherical approximation) or Vincenty (ellipsoid).' },
      ]},
    ],
    practice: [],
  },
];
