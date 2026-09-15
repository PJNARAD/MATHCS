/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // All visual tokens are channels rather than fixed colours. Tailwind's
      // alpha placeholder keeps utilities such as bg-paper/90 working while
      // [data-theme="dark"] swaps the palette in one place.
      colors: {
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        paper2: 'rgb(var(--color-paper2) / <alpha-value>)',
        paper3: 'rgb(var(--color-paper3) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        onaccent: 'rgb(var(--color-on-accent) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        ink2: 'rgb(var(--color-ink2) / <alpha-value>)',
        ink3: 'rgb(var(--color-ink3) / <alpha-value>)',
        ink4: 'rgb(var(--color-ink4) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        line2: 'rgb(var(--color-line2) / <alpha-value>)',
        blue: 'rgb(var(--color-blue) / <alpha-value>)',
        blued: 'rgb(var(--color-blued) / <alpha-value>)',
        bluel: 'rgb(var(--color-bluel) / <alpha-value>)',
        bluep: 'rgb(var(--color-bluep) / <alpha-value>)',
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
        goldl: 'rgb(var(--color-goldl) / <alpha-value>)',
        terracotta: 'rgb(var(--color-terracotta) / <alpha-value>)',
        terracottal: 'rgb(var(--color-terracottal) / <alpha-value>)',
        moss: 'rgb(var(--color-moss) / <alpha-value>)',
        mossl: 'rgb(var(--color-mossl) / <alpha-value>)',
        goldline: 'rgb(var(--color-goldline) / <alpha-value>)',
        terraline: 'rgb(var(--color-terraline) / <alpha-value>)',
        mossline: 'rgb(var(--color-mossline) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'Iowan Old Style', 'Times New Roman', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: ['0.72rem', { lineHeight: '1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.35rem' }],
        base: ['0.9375rem', { lineHeight: '1.6rem' }],
        lg: ['1.0625rem', { lineHeight: '1.65rem' }],
        xl: ['1.25rem', { lineHeight: '1.6rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.45rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.375rem', { lineHeight: '2.8rem' }],
      },
      letterSpacing: { tightest: '-0.03em' },
      boxShadow: {
        card: '0 1px 2px rgb(var(--color-ink) / 0.05), 0 1px 1px rgb(var(--color-ink) / 0.03)',
        pop: '0 4px 16px rgb(var(--color-ink) / 0.10), 0 1px 3px rgb(var(--color-ink) / 0.06)',
      },
      maxWidth: {
        content: '46rem',
        wide: '70rem',
      },
    },
  },
  plugins: [],
};
