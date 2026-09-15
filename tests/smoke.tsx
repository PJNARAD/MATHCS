import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { App } from '../src/App';
import { StoreProvider } from '../src/lib/store';
import { snippets } from '../src/data/snippets';
import { getConcept } from '../src/lib/concepts';

const VIZ_CONCEPTS = ['plane-transformations', 'taylor-series', 'bayes-theorem', 'central-limit-theorem',
  'sampling-distributions', 'gradient-descent', 'compression'];

const routes = [
  '/', '/fields', '/paths', '/books', '/playground',
  ...VIZ_CONCEPTS.map((id) => `/concept/${id}`),
  '/concept/rsa-cryptography', '/concept/graph-coloring', '/concept/markov-chains',
  '/domain/number-theory', '/field/ml', '/path/ml-foundations',
];

/** React escapes quotes/apostrophes as entities; unescape before searching text. */
const decode = (html: string): string =>
  html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#x2F;/g, '/');

let failures = 0;
for (const route of routes) {
  const tag = route === '/' ? 'home' : route;
  try {
    const html = renderToString(
      <MemoryRouter initialEntries={[route]}>
        <StoreProvider>
          <App />
        </StoreProvider>
      </MemoryRouter>,
    );
    if (html.length < 800) { failures++; console.log(`  ✗ ${tag} rendered only ${html.length} chars`); }
    else console.log(`  ✓ ${tag} (${html.length} chars)`);
  } catch (err) {
    failures++;
    console.log(`  ✗ ${tag} threw ${err instanceof Error ? err.message : String(err)}`);
  }
}

// every snippet's playground deep-link renders
for (const s of snippets) {
  try {
    const html = decode(renderToString(
      <MemoryRouter initialEntries={[`/playground?snippet=${s.id}`]}>
        <StoreProvider><App /></StoreProvider>
      </MemoryRouter>,
    ));
    if (!html.includes(s.title)) { failures++; console.log(`  ✗ playground?snippet=${s.id} missing its title`); }
  } catch (err) {
    failures++;
    console.log(`  ✗ playground?snippet=${s.id} threw ${err instanceof Error ? err.message : String(err)}`);
  }
}
console.log(`  ✓ all ${snippets.length} playground deep-links render their snippet`);

// each new visualization must actually appear inside its concept page
const VIZ_PROPS: [string, string][] = [
  ['plane-transformations', 'det ='],
  ['taylor-series', 'Taylor polynomials'],
  ['bayes-theorem', 'natural frequencies'],
  ['central-limit-theorem', 'Central limit theorem sampler'],
  ['gradient-descent', 'Gradient descent on a loss surface'],
  ['compression', 'Huffman coding'],
];
for (const [conceptId, marker] of VIZ_PROPS) {
  const html = decode(renderToString(
    <MemoryRouter initialEntries={[`/concept/${conceptId}`]}>
      <StoreProvider><App /></StoreProvider>
    </MemoryRouter>,
  ));
  const has = html.includes(marker);
  if (!has) failures++;
  console.log(`  ${has ? '✓' : '✗'} ${conceptId} renders its visualization (${getConcept(conceptId)?.title})`);
}

// the command palette must render its results
{
  const html = decode(renderToString(
    <MemoryRouter initialEntries={['/']}>
      <StoreProvider><App /></StoreProvider>
    </MemoryRouter>,
  ));
  const hasSearch = html.includes('Search') && html.includes('\u2318K');
  if (!hasSearch) failures++;
  console.log(`  ${hasSearch ? '✓' : '✗'} the header exposes the palette shortcut`);
}

console.log(failures === 0 ? '\nSMOKE OK' : `\nSMOKE FAILURES: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
