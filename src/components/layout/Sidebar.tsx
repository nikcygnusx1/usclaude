import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GitBranch, Map, Grid3X3, Sliders, Settings, ChevronLeft, ChevronRight, Scale, ToggleLeft, ListTodo, FileText, DollarSign, Calendar } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { Status, Phase } from '@/types/ontology';
import { clsx } from 'clsx';
import { domains } from '@/data/domains';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ontology', label: 'Ontology Explorer', icon: GitBranch },
  { to: '/states', label: 'State Map', icon: Map },
  { to: '/products', label: 'Product Matrix', icon: Grid3X3 },
  { to: '/simulator', label: 'Simulator', icon: Sliders },
  { to: '/howey', label: 'Howey Calculator', icon: Scale },
  { to: '/scenario', label: 'Scenario Planner', icon: ToggleLeft },
  { to: '/readiness', label: 'Readiness Stack', icon: ListTodo },
  { to: '/brief-generator', label: 'Brief Generator', icon: FileText },
  { to: '/capital-estimator', label: 'Capital Estimator', icon: DollarSign },
  { to: '/roadmap', label: 'Launch Roadmap', icon: Calendar },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const statuses: Status[] = ['Ready', 'Conditional', 'Blocked', 'Deferred', 'Needs verification'];
const phases: Phase[] = ['Pre-launch', 'Phase 1', 'Phase 2', 'Phase 3', 'Post-CLARITY'];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { selectedStatuses, setFilter, selectedPhases, selectedDomains } = useFilterStore();

  const toggle = (item: any, key: any, selected: any) => {
    if (selected.includes(item)) setFilter(key, selected.filter((i: any) => i !== item));
    else setFilter(key, [...selected, item]);
  };

  return (
    <aside className={clsx('flex flex-col border-r border-line bg-card transition-all duration-300 overflow-y-auto', sidebarCollapsed ? 'w-14' : 'w-64')}>
      <div className="flex items-center justify-between p-3 border-b border-line">
        {!sidebarCollapsed && <span className="font-semibold text-sm">Navigation</span>}
        <button onClick={toggleSidebar} className="ml-auto rounded p-1 hover:bg-ice-soft">{sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => clsx('flex items-center gap-3 rounded-md px-2 py-2 text-sm', isActive ? 'bg-navy text-white' : 'text-navy hover:bg-ice-soft')}>
            <Icon size={18} />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
      {!sidebarCollapsed && (
        <div className="p-3 space-y-2 border-t border-line">
          <h3>Status</h3>
          <div className="flex flex-wrap gap-1">{statuses.map(s => <button key={s} onClick={() => toggle(s, 'selectedStatuses', selectedStatuses)} className={clsx('text-xs border rounded-full px-2', selectedStatuses.includes(s) ? 'bg-navy text-white' : '')}>{s}</button>)}</div>
          <h3>Phase</h3>
          <div className="flex flex-wrap gap-1">{phases.map(p => <button key={p} onClick={() => toggle(p, 'selectedPhases', selectedPhases)} className={clsx('text-xs border rounded-full px-2', selectedPhases.includes(p) ? 'bg-navy text-white' : '')}>{p}</button>)}</div>
          <h3>Domain</h3>
          <div className="flex flex-wrap gap-1">{domains.map(d => <button key={d.id} onClick={() => toggle(d.id, 'selectedDomains', selectedDomains)} className={clsx('text-xs border rounded-full px-2', selectedDomains.includes(d.id) ? 'bg-navy text-white' : '')}>{d.name}</button>)}</div>
          <h3>Legend</h3>
          <div className="text-xs">
            <div><span className="inline-block w-3 h-3 rounded-full bg-status-ready mr-1"></span> Ready</div>
            <div><span className="inline-block w-3 h-3 rounded-full bg-status-conditional mr-1"></span> Conditional</div>
            <div><span className="inline-block w-3 h-3 rounded-full bg-status-blocked mr-1"></span> Blocked</div>
            <div><span className="inline-block w-3 h-3 rounded-full bg-status-deferred mr-1"></span> Deferred</div>
            <div><span className="inline-block w-3 h-3 rounded-full bg-status-unverified mr-1"></span> Needs verification</div>
          </div>
        </div>
      )}
    </aside>
  );
}
