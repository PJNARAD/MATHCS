import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Progress store (localStorage-backed)
// ---------------------------------------------------------------------------

export interface ProgressState {
  completed: string[]; // concept ids marked complete
  practice: Record<string, { correct: boolean; attempts: number }>;
  fieldInterest: string | null;
  pathStep: Record<string, number>; // pathId -> next step index
}

const KEY = 'mathcs-progress-v1';

const DEFAULT: ProgressState = {
  completed: [],
  practice: {},
  fieldInterest: null,
  pathStep: {},
};

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT, ...parsed };
  } catch {
    return DEFAULT;
  }
}

interface StoreCtx {
  state: ProgressState;
  toggleComplete: (id: string) => void;
  recordAnswer: (qid: string, correct: boolean) => void;
  setFieldInterest: (id: string | null) => void;
  setPathStep: (pathId: string, step: number) => void;
  reset: () => void;
  isComplete: (id: string) => boolean;
  practiceResult: (qid: string) => { correct: boolean; attempts: number } | undefined;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => (typeof window === 'undefined' ? DEFAULT : load()));

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state]);

  const api = useMemo<StoreCtx>(() => ({
    state,
    toggleComplete: (id) =>
      setState((s) => ({
        ...s,
        completed: s.completed.includes(id) ? s.completed.filter((x) => x !== id) : [...s.completed, id],
      })),
    recordAnswer: (qid, correct) =>
      setState((s) => {
        const prev = s.practice[qid];
        return {
          ...s,
          practice: {
            ...s.practice,
            [qid]: {
              correct: (prev?.correct ?? false) || correct,
              attempts: (prev?.attempts ?? 0) + 1,
            },
          },
        };
      }),
    setFieldInterest: (id) => setState((s) => ({ ...s, fieldInterest: id })),
    setPathStep: (pathId, step) => setState((s) => ({ ...s, pathStep: { ...s.pathStep, [pathId]: step } })),
    reset: () => setState(DEFAULT),
    isComplete: (id) => state.completed.includes(id),
    practiceResult: (qid) => state.practice[qid],
  }), [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
