// ---------------------------------------------------------------------------
// Snippet runner.
//
// Used by the playground page (browser) and by the CI verifier, so the output a
// learner sees is produced by exactly the same code path that the tests check.
//
// Snippets run with `new Function`, which is deliberate: the playground executes
// only the reviewed snippets in src/data/snippets.ts plus whatever the visitor
// types into their own browser. It is not a security boundary for untrusted
// third-party code, and it runs synchronously, so an infinite loop in a snippet
// would hang the tab. Keep snippets small and terminating.
// ---------------------------------------------------------------------------

export interface RunResult {
  logs: string[];
  error?: string;
  ms: number;
  ok: boolean;
}

/** Console-like formatting: strings verbatim, everything else inspected. */
export function formatValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
  if (Array.isArray(value)) return `[ ${value.map(formatValue).join(', ')} ]`;
  if (value instanceof Map) return `Map(${value.size}) ${formatValue([...value.entries()])}`;
  if (value instanceof Set) return `Set(${value.size}) ${formatValue([...value.values()])}`;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value) ?? String(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function makeConsole(logs: string[]): { log: (...a: unknown[]) => void } & Record<string, unknown> {
  const push = (prefix: string) => (...args: unknown[]) => {
    logs.push(prefix + args.map(formatValue).join(' '));
  };
  return {
    log: push(''),
    info: push(''),
    debug: push(''),
    warn: push('warn: '),
    error: push('error: '),
  };
}

/**
 * Execute a snippet and collect everything it printed.
 * Never throws: failures come back as `ok: false` with the error message.
 */
export function runSnippet(code: string): RunResult {
  const logs: string[] = [];
  const started = Date.now();
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('console', `'use strict';\n${code}\n`);
    fn(makeConsole(logs));
    return { logs, ms: Date.now() - started, ok: true };
  } catch (err) {
    return {
      logs,
      error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      ms: Date.now() - started,
      ok: false,
    };
  }
}

/** The declared-output comparison used by both the page and the test suite. */
export function compareOutput(result: RunResult, expected: string): { matches: boolean; actual: string } {
  const actual = result.logs.join('\n');
  return { matches: result.ok && actual === expected, actual };
}
