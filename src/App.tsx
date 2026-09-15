import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { domains } from './data/domains';
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
const CommandPalette = lazy(() => import('./components/CommandPalette').then((module) => ({ default: module.CommandPalette })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const NAV = [
  { to: '/fields', label: 'CS Fields' },
  { to: '/paths', label: 'Paths' },
  { to: '/books', label: 'Books' },
  { to: '/playground', label: 'Playground' },
];

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `px-3 py-1.5 text-sm transition-colors ${
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
      <p className="mt-3 text-xs text-ink3">Loading lesson…</p>
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
          <nav className="ml-auto flex items-center gap-1">
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

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-wide px-4 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-ink3">
          <span>
            MathCS — Mathematics for Computer Science. {publishedDomainCount} of {domains.length} domains live in
            this build; the rest are on the roadmap.
          </span>
          <span className="font-mono">
            {new Date().getFullYear()} · interactive laboratory
          </span>
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
