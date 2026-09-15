import React, { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { domainsWithContent } from './lib/concepts';
import { domains } from './data/domains';
import { HomePage } from './pages/Home';
import { DomainPage } from './pages/DomainPage';
import { ConceptPage } from './pages/ConceptPage';
import { FieldsPage, FieldDetailPage } from './pages/FieldsPage';
import { PathsPage, PathDetailPage } from './pages/PathsPage';
import { BooksPage } from './pages/BooksPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { CommandPalette } from './components/CommandPalette';

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

export function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto max-w-wide px-4 h-14 flex items-center gap-3">
          <Brand />
          <nav className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="mr-1 hidden items-center gap-2 border border-line2 bg-white px-2.5 py-1.5 text-xs text-ink3 transition-colors hover:border-ink3 hover:text-ink sm:flex"
              aria-label="Search (Command or Control + K)"
            >
              <Search size={13} />
              Search
              <kbd className="border border-line2 bg-paper2 px-1 font-mono text-[10px]">⌘K</kbd>
            </button>
            {NAV.map((n) => (
              <NavItem key={n.to} {...n} />
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
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
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto max-w-wide px-4 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-ink3">
          <span>
            MathCS — Mathematics for Computer Science. {domainsWithContent.size} of {domains.length} domains live in
            this build; the rest are on the roadmap.
          </span>
          <span className="font-mono">
            {new Date().getFullYear()} · interactive laboratory
          </span>
        </div>
      </footer>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
