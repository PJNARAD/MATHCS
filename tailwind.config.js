/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FBFAF7',
        paper2: '#F4F1EA',
        paper3: '#ECE8DE',
        ink: '#1B2A41',
        ink2: '#3D4C63',
        ink3: '#66718A',
        ink4: '#8A93A5',
        line: '#E4E1D7',
        line2: '#D5D1C4',
        blue: '#2B5C8A',
        blued: '#1F4468',
        bluel: '#EAF1F7',
        bluep: '#DCE8F2',
        gold: '#8A6D2F',
        goldl: '#F5EFDF',
        terracotta: '#A9432E',
        terracottal: '#F7E9E5',
        moss: '#3E7A4E',
        mossl: '#E7F0E9',
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
        card: '0 1px 2px rgba(27, 42, 65, 0.05), 0 1px 1px rgba(27, 42, 65, 0.03)',
        pop: '0 4px 16px rgba(27, 42, 65, 0.10), 0 1px 3px rgba(27, 42, 65, 0.06)',
      },
      maxWidth: {
        content: '46rem',
        wide: '70rem',
      },
    },
  },
  plugins: [],
};
