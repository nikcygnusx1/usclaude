import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, User } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useFilterStore } from '@/stores/useFilterStore';

export function TopNav() {
  const { darkMode, toggleDarkMode } = useUIStore();
  const { searchQuery, setFilter } = useFilterStore();
  const { pathname } = useLocation();
  const breadcrumbs = pathname.split('/').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1));

  return (
    <header className="flex h-14 items-center gap-4 border-b border-line bg-card px-4 shadow-sm">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg text-navy dark:text-ice">
        <svg width="28" height="28" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="var(--navy)"/><text x="8" y="22" fontSize="20" fill="white" fontFamily="Arial" fontWeight="bold">L</text></svg>
        <span className="hidden sm:inline">LCX USA OS</span>
      </Link>
      <nav className="flex items-center text-sm text-grey-dark">
        <span>/</span>
        {breadcrumbs.length === 0 ? <span className="ml-1">Dashboard</span> : breadcrumbs.map((c,i) => <span key={c} className="ml-1">{c}{i<breadcrumbs.length-1?'/':''}</span>)}
      </nav>
      <div className="ml-auto flex items-center gap-3">
        <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setFilter('searchQuery', e.target.value)} className="h-8 w-48 rounded-md border border-line bg-ice-soft pl-2 text-sm" />
        <button onClick={toggleDarkMode} aria-label="Dark mode">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
        <button aria-label="User"><User size={18} /></button>
      </div>
    </header>
  );
}
