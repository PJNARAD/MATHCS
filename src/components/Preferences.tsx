import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Laptop, Moon, Settings2, Sun, Type } from 'lucide-react';
import {
  DEFAULT_READER_PREFERENCES,
  READER_STORAGE_KEY,
  THEME_STORAGE_KEY,
  nextThemePreference,
  parseReaderPreferences,
  parseThemePreference,
  readerCssVariables,
  resolveTheme,
  toggledThemePreference,
  type ReaderFontSize,
  type ReaderPreferences,
  type ReaderWidth,
  type ResolvedTheme,
  type ThemePreference,
} from '../lib/preferences';

interface PreferencesContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  reader: ReaderPreferences;
  setTheme: (preference: ThemePreference) => void;
  cycleTheme: () => void;
  toggleTheme: () => void;
  setFontSize: (fontSize: ReaderFontSize) => void;
  setWidth: (width: ReaderWidth) => void;
}

const DEFAULT_CONTEXT: PreferencesContextValue = {
  preference: 'system',
  resolvedTheme: 'light',
  reader: DEFAULT_READER_PREFERENCES,
  setTheme: () => undefined,
  cycleTheme: () => undefined,
  toggleTheme: () => undefined,
  setFontSize: () => undefined,
  setWidth: () => undefined,
};

const PreferencesContext = createContext<PreferencesContextValue>(DEFAULT_CONTEXT);

function prefersDark(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readStored<T>(key: string, fallback: T, parse: (value: unknown) => T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : parse(JSON.parse(value));
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Preferences are a convenience; private browsing and full storage should
    // never make the lesson itself unusable.
  }
}

function applyTheme(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    readStored(THEME_STORAGE_KEY, 'system', parseThemePreference),
  );
  const [systemDark, setSystemDark] = useState(prefersDark);
  const [reader, setReader] = useState<ReaderPreferences>(() =>
    readStored(READER_STORAGE_KEY, { ...DEFAULT_READER_PREFERENCES }, parseReaderPreferences),
  );
  const resolvedTheme = resolveTheme(preference, systemDark);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener?.('change', onChange);
    // Safari versions that predate addEventListener still exist in embedded
    // browsers; keep the small compatibility branch harmless elsewhere.
    if (!media.addEventListener) media.addListener(onChange);
    return () => {
      media.removeEventListener?.('change', onChange);
      if (!media.removeEventListener) media.removeListener(onChange);
    };
  }, []);

  const setTheme = (next: ThemePreference) => {
    setPreference(next);
    writeStored(THEME_STORAGE_KEY, next);
    applyTheme(resolveTheme(next, prefersDark()));
  };
  const cycleTheme = () => setTheme(nextThemePreference(preference));
  const toggleTheme = () => setTheme(toggledThemePreference(resolvedTheme));
  const setFontSize = (fontSize: ReaderFontSize) => {
    const next = { ...reader, fontSize };
    setReader(next);
    writeStored(READER_STORAGE_KEY, next);
  };
  const setWidth = (width: ReaderWidth) => {
    const next = { ...reader, width };
    setReader(next);
    writeStored(READER_STORAGE_KEY, next);
  };

  const value = useMemo<PreferencesContextValue>(() => ({
    preference,
    resolvedTheme,
    reader,
    setTheme,
    cycleTheme,
    toggleTheme,
    setFontSize,
    setWidth,
  }), [preference, resolvedTheme, reader]);

  return (
    <PreferencesContext.Provider value={value}>
      <div
        className="preferences-root"
        style={readerCssVariables(reader) as React.CSSProperties}
      >
        {children}
      </div>
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  return useContext(PreferencesContext);
}

function ThemeIcon({ theme }: { theme: ResolvedTheme }) {
  return theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />;
}

export function ThemeToggle() {
  const { preference, resolvedTheme, toggleTheme } = usePreferences();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-ghost btn-sm no-print"
      aria-label={`Switch theme; current theme is ${resolvedTheme}`}
      title={`Theme: ${preference}. Click to switch light/dark; Shift+D also toggles.`}
    >
      <ThemeIcon theme={resolvedTheme} />
      <span className="hidden xl:inline">{resolvedTheme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  );
}

const themeOptions: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={14} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={14} /> },
  { value: 'system', label: 'System', icon: <Laptop size={14} /> },
];

const fontOptions: { value: ReaderFontSize; label: string }[] = [
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

const widthOptions: { value: ReaderWidth; label: string }[] = [
  { value: 'narrow', label: '40 rem' },
  { value: 'standard', label: '46 rem' },
  { value: 'wide', label: '54 rem' },
];

export function PreferencesMenu() {
  const { preference, reader, setTheme, setFontSize, setWidth } = usePreferences();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative no-print">
      <button
        type="button"
        className="btn-ghost btn-sm"
        aria-label="Reading and theme preferences"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        title="Reading comfort and theme"
      >
        <Settings2 size={15} />
        <span className="hidden lg:inline">Comfort</span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-64 border border-line2 bg-surface p-3 shadow-pop"
          role="dialog"
          aria-label="Reading and theme preferences"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3">Theme</div>
          <div className="mt-1 grid grid-cols-3 gap-1">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={`btn-sm inline-flex items-center justify-center gap-1 border ${preference === option.value ? 'border-blue bg-bluel text-blue' : 'border-line2 text-ink2 hover:bg-paper2'}`}
                aria-pressed={preference === option.value}
              >
                {option.icon}{option.label}
              </button>
            ))}
          </div>
          <div className="mt-3 border-t border-line pt-3">
            <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-ink3">
              <Type size={13} /> Text size
            </div>
            <div className="mt-1 grid grid-cols-4 gap-1">
              {fontOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFontSize(option.value)}
                  className={`border py-1 text-xs ${reader.fontSize === option.value ? 'border-blue bg-bluel text-blue' : 'border-line2 text-ink2 hover:bg-paper2'}`}
                  aria-pressed={reader.fontSize === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3">Reading width</div>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {widthOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setWidth(option.value)}
                  className={`border py-1 text-[11px] ${reader.width === option.value ? 'border-blue bg-bluel text-blue' : 'border-line2 text-ink2 hover:bg-paper2'}`}
                  aria-pressed={reader.width === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 border-t border-line pt-2 text-[10px] text-ink4">Theme shortcut: Shift+D</div>
        </div>
      )}
    </div>
  );
}
