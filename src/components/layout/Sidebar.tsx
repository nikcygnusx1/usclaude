import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GitBranch, Map, Grid3X3, Sliders, Settings, ChevronLeft, ChevronRight, Scale, ToggleLeft, ListTodo, FileText, DollarSign, Calendar, AlertTriangle, RotateCcw } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { useAuditStore } from '@/stores/useAuditStore';
import { redFlags } from '@/data';
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
  { to: '/red-flags', label: 'Red Flags & Audit', icon: AlertTriangle },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const statuses: Status[] = ['Ready', 'Conditional', 'Blocked', 'Deferred', 'Needs verification'];
const phases: Phase[] = ['Pre-launch', 'Phase 1', 'Phase 2', 'Phase 3', 'Post-CLARITY'];

const domainShortLabels: Record<string, string> = {
  'Surveillance, travel-rule, sanctions, and reporting': 'Surveillance & Sanctions',
  'Anti-fraud and unfair-practices enforcement': 'Anti-Fraud Enforcement',
  'Custody, reserves, and insurance requirements': 'Custody & Reserves',
  'Digital commodity classification and listing': 'Commodity Classification',
  'Consumer-protection disclosures and advertising': 'Consumer Protection',
  'Corporate governance and CCO obligations': 'Governance & CCO',
};

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { selectedStatuses, setFilter, selectedPhases, selectedDomains, resetFilters } = useFilterStore();
  const { resolvedRemediations } = useAuditStore();

  const unresolvedCount = redFlags.filter(rf => {
    if (rf.risk !== 'Critical' && rf.risk !== 'High') return false;
    return rf.remediations.some(r => !resolvedRemediations.includes(r.id));
  }).length;

  const toggle = (item: any, key: any, selected: any) => {
    if (selected.includes(item)) setFilter(key, selected.filter((i: any) => i !== item));
    else setFilter(key, [...selected, item]);
  };

  const hasActiveFilters = selectedStatuses.length > 0 || selectedPhases.length > 0 || selectedDomains.length > 0;

  return (
    <aside className={clsx('flex flex-col border-r border-line bg-card transition-all duration-300 overflow-y-auto', sidebarCollapsed ? 'w-14' : 'w-64')}>
      <div className="flex items-center justify-between p-3 border-b border-line">
        {!sidebarCollapsed && <span className="font-semibold text-sm">Navigation</span>}
        <button onClick={toggleSidebar} className="ml-auto rounded p-1 hover:bg-ice-soft">{sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navigation.map(({ to, label, icon: Icon }) => {
          const isRedFlags = to === '/red-flags';
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-md px-2 py-2 text-sm relative',
                  isActive ? 'bg-navy text-card' : 'text-navy hover:bg-ice-soft dark:text-ice dark:hover:bg-ice-soft/10'
                )
              }
            >
              <Icon size={18} />
              {!sidebarCollapsed && <span className="flex-1">{label}</span>}
              {!sidebarCollapsed && isRedFlags && unresolvedCount > 0 && (
                <span className="bg-red-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  {unresolvedCount}
                </span>
              )}
              {sidebarCollapsed && isRedFlags && unresolvedCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse-beacon" />
              )}
            </NavLink>
          );
        })}
      </nav>
      {!sidebarCollapsed && (
        <div className="p-3 space-y-2 border-t border-line">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors mb-1"
            >
              <RotateCcw size={10} />
              Clear All Filters
            </button>
          )}
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-grey mt-3 mb-1">Status</h3>
          <div className="flex flex-wrap gap-1">{statuses.map(s => <button key={s} onClick={() => toggle(s, 'selectedStatuses', selectedStatuses)} className={clsx('text-xs border rounded-full px-2 transition-all', selectedStatuses.includes(s) ? 'bg-navy text-card' : '')}>{s}</button>)}</div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-grey mt-3 mb-1">Phase</h3>
          <div className="flex flex-wrap gap-1">{phases.map(p => <button key={p} onClick={() => toggle(p, 'selectedPhases', selectedPhases)} className={clsx('text-xs border rounded-full px-2 transition-all', selectedPhases.includes(p) ? 'bg-navy text-card' : '')}>{p}</button>)}</div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-grey mt-3 mb-1">Domain</h3>
          <div className="flex flex-wrap gap-1">{domains.map(d => <button key={d.id} onClick={() => toggle(d.id, 'selectedDomains', selectedDomains)} className={clsx('text-xs border rounded-full px-2 truncate max-w-[200px] transition-all', selectedDomains.includes(d.id) ? 'bg-navy text-card' : '')}>{domainShortLabels[d.name] || d.name}</button>)}</div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-grey mt-3 mb-1">Legend</h3>
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
