import React from 'react';
import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
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
  // Lessons added to close dangling references (see scripts/audit.ts).
  '/concept/kruskal-prims', '/concept/union-find', '/concept/maximum-flow', '/concept/max-flow-min-cut',
  '/concept/matching', '/concept/cosine-similarity', '/concept/lattice-logic', '/concept/binary-search',
  // Newest depth batches (Relations, Boolean algebra, Recursion) through the lazy loader.
  '/concept/partial-orders', '/concept/boolean-simplification', '/concept/recursion', '/concept/growth-rates',
  '/domain/number-theory', '/field/ml', '/path/ml-foundations',
  // Generated library pages and the learner surfaces: each suspends on its own
  // slice, so onAllReady has to resolve it or the page renders as a shell.
  '/glossary', '/theorems', '/applications', '/practice', '/progress',
];

/** React escapes quotes/apostrophes as entities; unescape before searching text. */
const decode = (html: string): string => html
  .replace(/&#x27;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, '&')
  .replace(/&#x2F;/g, '/')
  .replace(/&#x3D;/g, '=');

/**
 * renderToString stops at a Suspense fallback. Pipeable SSR's onAllReady is
 * the important part of this smoke test: it waits for every lazy route and
 * visualization chunk, so a broken page cannot hide behind the route fallback.
 */
function renderApp(route: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let renderError: unknown;
    const stream = renderToPipeableStream(
      <StaticRouter location={route}>
        <StoreProvider><App /></StoreProvider>
      </StaticRouter>,
      {
        onAllReady() {
          const output = new PassThrough();
          let html = '';
          output.on('data', (chunk: Buffer | string) => { html += chunk.toString(); });
          output.on('end', () => {
            if (renderError) reject(renderError);
            else resolve(html);
          });
          stream.pipe(output);
        },
        onShellError: reject,
        onError: (error) => { renderError = error; },
      },
    );
  });
}

async function main(): Promise<void> {
  let failures = 0;
  for (const route of routes) {
    const tag = route === '/' ? 'home' : route;
    try {
      const html = await renderApp(route);
      if (html.length < 800 || html.includes('Loading…')) {
        failures++;
        console.log(`  ✗ ${tag} rendered an incomplete shell (${html.length} chars)`);
      } else console.log(`  ✓ ${tag} (${html.length} chars)`);
    } catch (err) {
      failures++;
      console.log(`  ✗ ${tag} threw ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Every snippet's playground deep-link renders.
  for (const s of snippets) {
    try {
      const html = decode(await renderApp(`/playground?snippet=${s.id}`));
      if (!html.includes(s.title)) {
        failures++;
        console.log(`  ✗ playground?snippet=${s.id} missing its title`);
      }
    } catch (err) {
      failures++;
      console.log(`  ✗ playground?snippet=${s.id} threw ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  console.log(`  ✓ all ${snippets.length} playground deep-links render their snippet`);

  // Each new visualization must actually appear inside its concept page.
  const vizProps: [string, string][] = [
    ['plane-transformations', 'det ='],
    ['taylor-series', 'Taylor polynomials'],
    ['bayes-theorem', 'natural frequencies'],
    ['central-limit-theorem', 'Central limit theorem sampler'],
    ['gradient-descent', 'Gradient descent on a loss surface'],
    ['compression', 'Huffman coding'],
    ['lattice-logic', 'Lattice explorer'],
  ];
  for (const [conceptId, marker] of vizProps) {
    const html = decode(await renderApp(`/concept/${conceptId}`));
    const has = html.includes(marker);
    if (!has) failures++;
    console.log(`  ${has ? '✓' : '✗'} ${conceptId} renders its visualization (${getConcept(conceptId)?.title})`);
  }

  // The new surfaces must render their real content, not a Suspense fallback:
  // each one suspends on a generated slice or on a lazy lesson body.
  const surfaceMarkers: [string, string][] = [
    ['/glossary', 'defined terms'],
    ['/theorems', 'with proofs'],
    ['/applications', 'call-outs'],
    ['/practice', 'questions in the curriculum'],
    ['/progress', 'Your progress'],
    ['/practice?domain=calculus&mode=missed', 'Practice trainer'],
  ];
  for (const [route, marker] of surfaceMarkers) {
    const html = decode(await renderApp(route));
    const has = html.includes(marker);
    if (!has) failures++;
    console.log(`  ${has ? '✓' : '✗'} ${route} renders its content (${marker})`);
  }

  // A glossary entry must be reachable from the page and deep-link to its block.
  {
    const html = decode(await renderApp('/glossary'));
    const hasAnchor = /href="\/concept\/[a-z0-9-]+#section-definition-/.test(html);
    if (!hasAnchor) failures++;
    console.log(`  ${hasAnchor ? '✓' : '✗'} glossary entries deep-link to the block they came from`);
  }

  // The shell still exposes both the palette and the no-flash/theme controls.
  {
    const html = decode(await renderApp('/'));
    const hasSearch = html.includes('Search') && html.includes('⌘K');
    const hasComfort = html.includes('Reading and theme preferences');
    if (!hasSearch || !hasComfort) failures++;
    console.log(`  ${hasSearch && hasComfort ? '✓' : '✗'} header exposes search and reading preferences`);
  }

  console.log(failures === 0 ? '\nSMOKE OK' : `\nSMOKE FAILURES: ${failures}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
