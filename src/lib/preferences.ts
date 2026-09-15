// ---------------------------------------------------------------------------
// User preferences — the resolution helpers in this file are deliberately
// free of React and browser APIs so they can be tested without a DOM.
// ---------------------------------------------------------------------------

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type ReaderFontSize = 's' | 'm' | 'l' | 'xl';
export type ReaderWidth = 'narrow' | 'standard' | 'wide';

export const THEME_STORAGE_KEY = 'mathcs-theme';
export const READER_STORAGE_KEY = 'mathcs-reader';

export const READER_FONT_SIZES: Record<ReaderFontSize, string> = {
  s: '0.875rem',
  m: '0.9375rem',
  l: '1rem',
  xl: '1.125rem',
};

export const READER_WIDTHS: Record<ReaderWidth, string> = {
  narrow: '40rem',
  standard: '46rem',
  wide: '54rem',
};

export interface ReaderPreferences {
  fontSize: ReaderFontSize;
  width: ReaderWidth;
}

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  fontSize: 'm',
  width: 'standard',
};

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function isReaderFontSize(value: unknown): value is ReaderFontSize {
  return value === 's' || value === 'm' || value === 'l' || value === 'xl';
}

export function isReaderWidth(value: unknown): value is ReaderWidth {
  return value === 'narrow' || value === 'standard' || value === 'wide';
}

/** Resolve a stored preference against the operating system's current theme. */
export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light';
  return preference;
}

/** The three-state order used by the compact header toggle. */
export function nextThemePreference(preference: ThemePreference): ThemePreference {
  if (preference === 'light') return 'dark';
  if (preference === 'dark') return 'system';
  return 'light';
}

/** Toggle between the two visible themes without discarding system support. */
export function toggledThemePreference(resolved: ResolvedTheme): Exclude<ThemePreference, 'system'> {
  return resolved === 'dark' ? 'light' : 'dark';
}

export function parseThemePreference(value: unknown): ThemePreference {
  return isThemePreference(value) ? value : 'system';
}

export function parseReaderPreferences(value: unknown): ReaderPreferences {
  if (!value || typeof value !== 'object') return { ...DEFAULT_READER_PREFERENCES };
  const raw = value as Record<string, unknown>;
  return {
    fontSize: isReaderFontSize(raw.fontSize) ? raw.fontSize : DEFAULT_READER_PREFERENCES.fontSize,
    width: isReaderWidth(raw.width) ? raw.width : DEFAULT_READER_PREFERENCES.width,
  };
}

export function readerCssVariables(prefs: ReaderPreferences): {
  '--reader-font-size': string;
  '--reader-width': string;
} {
  return {
    '--reader-font-size': READER_FONT_SIZES[prefs.fontSize],
    '--reader-width': READER_WIDTHS[prefs.width],
  };
}
