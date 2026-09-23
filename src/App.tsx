import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { publishedDomainCount } from './data/coverage';
import { ToastProvider } from './components/Toast';
import { PreferencesMenu, PreferencesProvider, ThemeToggle, usePreferences } from './components/Preferences';

const HomePage = lazy(() => import('./pages/Home').then((module) => ({ default: module.HomePage })));
const DomainPage = lazy(() => import('./pages/DomainPage').then((module) => ({ default: module.DomainPage })));
const ConceptPage = lazy(() => import('./pages/ConceptPage').then((module) => ({ default: module.ConceptPage })));
const FieldsPage = lazy(() => import('./pages/FieldsPage').then((module) => ({ default: module.FieldsPage })));
const FieldDetailPage = lazy(() => import('./pages/FieldsPage').then((module) => ({ default: module.FieldDetailPage })));
const PathsPage = lazy(() => import('./pages/PathsPage').then((module) => ({ default: module.PathsPage })));
const PathDetailPage = lazy(() => import('./pages/PathsPage').then((module) => ({ default: module.PathDetailPage })));
const BooksPage = lazy(() => import('./pages/BooksPage').then((module) => ({ default: module.BooksPage })));
const PlaygroundPage = lazy(() => import('./pages/PlaygroundPage').then((module) => ({ default: module.PlaygroundPage })));
const PracticePage = lazy(() => import('./pages/PracticePage').then((module) => ({ default: module.PracticePage })));
const ProgressPage = lazy(() => import('./pages/ProgressPage').then((module) => ({ default: module.ProgressPage })));
const GlossaryPage = lazy(() => import('./pages/GlossaryPage').then((module) => ({ default: module.GlossaryPage })));
const TheoremsPage = lazy(() => import('./pages/TheoremsPage').then((module) => ({ default: module.TheoremsPage })));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage').then((module) => ({ default: module.ApplicationsPage })));
const CommandPalette = lazy(() => import('./components/CommandPalette').then((module) => ({ default: module.CommandPalette })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// The two learner surfaces are the newest additions to the shell, so they only
// join the header once there is room for them; every page is reachable from the
// footer, the home page and the command palette at any width.
const NAV = [
  { to: '/fields', label: 'CS Fields' },
  { to: '/paths', label: 'Paths' },
  { to: '/books', label: 'Books' },
  { to: '/playground', label: 'Playground' },
  { to: '/practice', label: 'Practice', wide: true },
  { to: '/progress', label: 'Progress', wide: true },
];

const FOOTER_LINKS: { heading: string; links: { to: string; label: string }[] }[] = [
  {
    heading: 'Learn',
    links: [
      { to: '/fields', label: 'CS fields' },
      { to: '/paths', label: 'Learning paths' },
      { to: '/books', label: 'Books' },
      { to: '/playground', label: 'Playground' },
    ],
  },
  {
    heading: 'Library',
    links: [
      { to: '/glossary', label: 'Glossary' },
      { to: '/theorems', label: 'Theorem index' },
      { to: '/applications', label: 'Applications' },
    ],
  },
  {
    heading: 'You',
    links: [
      { to: '/practice', label: 'Practice trainer' },
      { to: '/progress', label: 'Progress dashboard' },
    ],
  },
];

function NavItem({ to, label, wide }: { to: string; label: string; wide?: boolean }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `shrink-0 px-3 py-1.5 text-sm transition-colors ${wide ? 'hidden lg:block' : ''} ${
          isActive ? 'bg-ink text-paper' : 'text-ink2 hover:bg-paper2 hover:text-ink'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0">
      <span className="flex h-8 w-8 items-center justify-center bg-ink text-paper font-serif text-lg font-semibold select-none">
        π
      </span>
      <span className="font-serif text-lg font-semibold tracking-tightest text-ink">MathCS</span>
    </Link>
  );
}

function PageLoading() {
  return (
    <div className="mx-auto max-w-content px-4 py-20 text-center" aria-live="polite">
      <div className="mx-auto h-1 w-24 overflow-hidden bg-paper2">
        <div className="h-full w-1/2 animate-pulse bg-blue" />
      </div>
      <p className="mt-3 text-xs text-ink3">Loading…</p>
    </div>
  );
}

function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { toggleTheme } = usePreferences();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'd' && event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return;
        event.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleTheme]);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur no-print">
        <div className="mx-auto max-w-wide px-4 h-14 flex items-center gap-2">
          <Brand />
          <nav className="slim-scroll ml-auto flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="mr-1 hidden items-center gap-2 border border-line2 bg-surface px-2.5 py-1.5 text-xs text-ink3 transition-colors hover:border-ink3 hover:text-ink sm:flex"
              aria-label="Search (Command or Control + K)"
            >
              <Search size={13} />
              Search
              <kbd className="border border-line2 bg-paper2 px-1 font-mono text-[10px]">⌘K</kbd>
            </button>
            {NAV.map((n) => (
              <NavItem key={n.to} {...n} />
            ))}
            <ThemeToggle />
            <PreferencesMenu />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/domain/:id" element={<DomainPage />} />
            <Route path="/concept/:id" element={<ConceptPage />} />
            <Route path="/fields" element={<FieldsPage />} />
            <Route path="/field/:id" element={<FieldDetailPage />} />
            <Route path="/paths" element={<PathsPage />} />
            <Route path="/path/:id" element={<PathDetailPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="/theorems" element={<TheoremsPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route
              path="*"
              element={
                <div className="mx-auto max-w-content px-4 py-16 text-center">
                  <h1 className="text-2xl font-semibold text-ink font-serif">404 — page not found</h1>
                  <p className="mt-2 text-sm text-ink3">That route doesn't exist in this build.</p>
                  <Link to="/" className="btn-primary mt-6 inline-flex">Back home</Link>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>

      <footer className="no-print border-t border-line bg-surface">
        <div className="mx-auto max-w-wide px-4 py-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Brand />
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-ink3">
                Mathematics for Computer Science: {publishedDomainCount} domains of lessons, proofs, runnable code
                and interactive labs.
              </p>
            </div>
            {FOOTER_LINKS.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-ink3">{group.heading}</div>
                <ul className="mt-2 space-y-1">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="text-xs text-ink2 transition-colors hover:text-blue">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-ink3">
            <span>Progress, bookmarks and practice history stay in this browser.</span>
            <span className="font-mono">
              {new Date().getFullYear()} · interactive laboratory
            </span>
          </div>
        </div>
      </footer>
      <Suspense fallback={null}>
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </Suspense>
    </div>
  );
}

export function App() {
  return (
    <PreferencesProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </PreferencesProvider>
  );
}
