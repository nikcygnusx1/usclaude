import { useState, useMemo } from 'react';
import { Badge, InspectorDrawer } from '@/components/ui';
import { states } from '@/data';
import { useAuditStore } from '@/stores/useAuditStore';
import { toBadgeStatus } from '@/lib/status';
import { State } from '@/types/ontology';
import { Map, SlidersHorizontal, Info, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

// 50-State Geographic Grid Cartogram Mapping coordinates
const gridPositions: Record<string, { r: number; c: number }> = {
  AK: { r: 1, c: 1 }, ME: { r: 1, c: 12 },
  WA: { r: 2, c: 2 }, ID: { r: 2, c: 3 }, MT: { r: 2, c: 4 }, ND: { r: 2, c: 5 }, MN: { r: 2, c: 6 }, WI: { r: 2, c: 7 }, MI: { r: 2, c: 8 }, NY: { r: 2, c: 9 }, VT: { r: 2, c: 10 }, NH: { r: 2, c: 11 },
  OR: { r: 3, c: 2 }, NV: { r: 3, c: 3 }, WY: { r: 3, c: 4 }, SD: { r: 3, c: 5 }, IA: { r: 3, c: 6 }, IL: { r: 3, c: 7 }, IN: { r: 3, c: 8 }, OH: { r: 3, c: 9 }, PA: { r: 3, c: 10 }, NJ: { r: 3, c: 11 }, MA: { r: 3, c: 12 },
  CA: { r: 4, c: 2 }, UT: { r: 4, c: 3 }, CO: { r: 4, c: 4 }, NE: { r: 4, c: 5 }, MO: { r: 4, c: 6 }, KY: { r: 4, c: 7 }, WV: { r: 4, c: 8 }, VA: { r: 4, c: 9 }, MD: { r: 4, c: 10 }, DE: { r: 4, c: 11 }, CT: { r: 4, c: 12 },
  AZ: { r: 5, c: 3 }, NM: { r: 5, c: 4 }, KS: { r: 5, c: 5 }, AR: { r: 5, c: 6 }, TN: { r: 5, c: 7 }, NC: { r: 5, c: 8 }, SC: { r: 5, c: 9 }, RI: { r: 5, c: 12 },
  OK: { r: 6, c: 5 }, LA: { r: 6, c: 6 }, MS: { r: 6, c: 7 }, AL: { r: 6, c: 8 }, GA: { r: 6, c: 9 },
  HI: { r: 7, c: 2 }, TX: { r: 7, c: 5 }, FL: { r: 7, c: 10 }
};

const statusBorder: Record<string, string> = {
  Ready: 'border-l-status-ready',
  Conditional: 'border-l-status-conditional',
  Blocked: 'border-l-status-blocked',
  Deferred: 'border-l-status-deferred',
  'Needs verification': 'border-l-status-unverified',
};

const statusGlow: Record<string, string> = {
  Ready: 'bg-status-ready/10 hover:bg-status-ready/20 border-status-ready/30 text-status-ready',
  Conditional: 'bg-status-conditional/10 hover:bg-status-conditional/20 border-status-conditional/30 text-status-conditional',
  Blocked: 'bg-status-blocked/10 hover:bg-status-blocked/20 border-status-blocked/30 text-status-blocked',
  Deferred: 'bg-status-deferred/10 hover:bg-status-deferred/20 border-status-deferred/30 text-status-deferred',
  'Needs verification': 'bg-status-unverified/10 hover:bg-status-unverified/20 border-status-unverified/30 text-status-unverified',
};

export function StateMap() {
  const { addAuditLog } = useAuditStore();
  const [selectedState, setSelectedState] = useState<State | null>(null);

  // Filters State
  const [nmlsFilter, setNmlsFilter] = useState<string>('all');
  const [sandboxFilter, setSandboxFilter] = useState<string>('all');
  const [regimeFilter, setRegimeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  const filteredStates = useMemo(() => {
    return states.filter(s => {
      // Show all states including unresearched — they'll be styled differently in the grid
      if (s.tier === 'Unresearched') return true;
      
      const matchNmls = nmlsFilter === 'all' || (nmlsFilter === 'yes' && s.nmlsRequired) || (nmlsFilter === 'no' && !s.nmlsRequired);
      const matchSandbox = sandboxFilter === 'all' || (sandboxFilter === 'yes' && s.sandboxAvailable) || (sandboxFilter === 'no' && !s.sandboxAvailable);
      const matchRegime = regimeFilter === 'all' || s.regimeType === regimeFilter;
      const matchPriority = priorityFilter === 'all' || s.priority === priorityFilter;
      const matchPhase = phaseFilter === 'all' || s.phase === phaseFilter;

      return matchNmls && matchSandbox && matchRegime && matchPriority && matchPhase;
    });
  }, [nmlsFilter, sandboxFilter, regimeFilter, priorityFilter, phaseFilter]);

  const handleResetFilters = () => {
    setNmlsFilter('all');
    setSandboxFilter('all');
    setRegimeFilter('all');
    setPriorityFilter('all');
    setPhaseFilter('all');
    addAuditLog('CCO reset state map filter criteria.', 'System');
  };

  const handleStateClick = (state: State) => {
    setSelectedState(state);
    addAuditLog(`CCO inspected state card: [${state.abbreviation}]`, 'Audit');
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col gap-4 text-navy dark:text-ice overflow-hidden">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Map size={24} className="text-navy dark:text-ice" /> Jurisdictional Operations Room</h1>
        <p className="text-sm text-grey-dark dark:text-grey-light mt-0.5">
          Map-based digital twin illustrating Money Transmitter Licensing (MTL) and sandbox exemptions across the USA.
        </p>
      </div>

      {/* Main split layout container */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden relative">
        
        {/* Left Side: Sidebar Filters */}
        <div className="w-64 bg-card border border-line rounded-lg p-4 flex flex-col space-y-4 shrink-0 overflow-y-auto shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-grey flex items-center gap-1.5">
              <SlidersHorizontal size={13} /> Filter Registry
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] text-grey hover:text-navy dark:hover:text-ice flex items-center gap-1 font-bold font-mono"
            >
              <RefreshCw size={10} /> Reset
            </button>
          </div>

          {/* NMLS filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-grey-dark">NMLS Registration</label>
            <select
              value={nmlsFilter}
              onChange={e => setNmlsFilter(e.target.value)}
              className="w-full h-8 rounded border border-line bg-ice-soft dark:bg-navy-deep px-2 text-xs focus:outline-none"
            >
              <option value="all">All States</option>
              <option value="yes">Required via NMLS</option>
              <option value="no">Exempt / Not Required</option>
            </select>
          </div>

          {/* Sandbox filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-grey-dark">MTL Sandbox Exemption</label>
            <select
              value={sandboxFilter}
              onChange={e => setSandboxFilter(e.target.value)}
              className="w-full h-8 rounded border border-line bg-ice-soft dark:bg-navy-deep px-2 text-xs focus:outline-none"
            >
              <option value="all">All States</option>
              <option value="yes">Sandbox Exemption Available</option>
              <option value="no">No Sandbox Program</option>
            </select>
          </div>

          {/* Regime Type filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-grey-dark">Regime Classification</label>
            <select
              value={regimeFilter}
              onChange={e => setRegimeFilter(e.target.value)}
              className="w-full h-8 rounded border border-line bg-ice-soft dark:bg-navy-deep px-2 text-xs focus:outline-none"
            >
              <option value="all">All Classifications</option>
              <option value="Money transmitter">Money transmitter</option>
              <option value="Virtual currency">Virtual currency</option>
              <option value="Hybrid">Hybrid</option>
              <option value="No general MTL">No general MTL</option>
              <option value="Special purpose">Special purpose</option>
            </select>
          </div>

          {/* Launch Priority filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-grey-dark">Launch Priority</label>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full h-8 rounded border border-line bg-ice-soft dark:bg-navy-deep px-2 text-xs focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Phase filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-grey-dark">Launch Phase</label>
            <select
              value={phaseFilter}
              onChange={e => setPhaseFilter(e.target.value)}
              className="w-full h-8 rounded border border-line bg-ice-soft dark:bg-navy-deep px-2 text-xs focus:outline-none"
            >
              <option value="all">All Phases</option>
              <option value="Pre-launch">Pre-launch</option>
              <option value="Phase 1">Phase 1</option>
              <option value="Phase 2">Phase 2</option>
              <option value="Phase 3">Phase 3</option>
            </select>
          </div>

          <div className="pt-2 border-t border-line text-[10px] text-grey space-y-1 mt-auto leading-relaxed">
            <p className="font-bold flex items-center gap-1"><Info size={10} /> Legend Guides:</p>
            <p>Green (Ready), Amber (Conditional), Red (Blocked), Slate (Needs Verification/Deferred).</p>
          </div>
        </div>

        {/* Right Side: Geographic Grid Cartogram Map Viewport */}
        <div className="flex-1 bg-card border border-line rounded-lg p-6 shadow-sm overflow-auto flex items-center justify-center">
          <div className="grid grid-cols-12 gap-2 h-[450px] w-[850px] relative shrink-0">
            {/* Generate all 50 states mapped to coordinates */}
            {states.map(s => {
              const pos = gridPositions[s.abbreviation];
              if (!pos) return null; // Skip states without grid positions

              const isUnresearched = s.tier === 'Unresearched';
              const isActive = filteredStates.some(x => x.id === s.id);
              const colorClass = statusGlow[s.status] || 'bg-status-deferred/10 border-status-deferred/30';
              const borderClass = statusBorder[s.status] || 'border-l-status-deferred';

              // Unresearched states: visible but faint, non-clickable
              if (isUnresearched) {
                return (
                  <div
                    key={s.id}
                    title="Not yet researched"
                    style={{
                      gridRow: pos.r,
                      gridColumn: pos.c,
                    }}
                    className="flex flex-col items-center justify-between rounded p-1.5 text-left w-full h-full border-l-4 select-none bg-slate-100 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 border-l-slate-300 dark:border-l-slate-700 text-slate-400"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[11px] font-extrabold font-mono tracking-tight text-slate-400">{s.abbreviation}</span>
                      <span className="h-1.5 w-1.5 rounded-full block bg-slate-300 dark:bg-slate-600" />
                    </div>
                    <div className="w-full text-right">
                      <span className="text-[9px] text-slate-400 block font-sans truncate font-semibold uppercase">—</span>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={s.id}
                  onClick={() => handleStateClick(s)}
                  style={{
                    gridRow: pos.r,
                    gridColumn: pos.c,
                  }}
                  className={clsx(
                    'flex flex-col items-center justify-between border rounded p-1.5 text-left transition-all duration-300 w-full h-full transform active:scale-95 border-l-4 select-none',
                    borderClass,
                    isActive ? colorClass : 'bg-line/20 border-line/35 opacity-15 pointer-events-none'
                  )}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[11px] font-extrabold font-mono tracking-tight">{s.abbreviation}</span>
                    <span className="h-1.5 w-1.5 rounded-full block" style={{ backgroundColor: s.status === 'Ready' ? '#10b981' : s.status === 'Blocked' ? '#ef4444' : s.status === 'Conditional' ? '#f59e0b' : '#64748b' }} />
                  </div>
                  <div className="w-full text-right">
                    <span className="text-[9px] text-grey-dark block font-sans truncate font-semibold uppercase">{s.estTimeline || 'N/A'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Slide-out State Inspector Drawer */}
      <InspectorDrawer isOpen={!!selectedState} onClose={() => setSelectedState(null)} title={selectedState?.name ?? ''}>
        {selectedState && (
          <div className="space-y-4 text-xs leading-relaxed text-navy dark:text-ice">
            <div className="flex flex-wrap gap-2">
              <Badge status={toBadgeStatus(selectedState.status)}>{selectedState.status}</Badge>
              <span className="rounded-full border border-line px-2.5 py-0.5 uppercase tracking-wider text-[10px] font-mono">{selectedState.phase}</span>
              <span className="rounded-full border border-line px-2.5 py-0.5 uppercase tracking-wider text-[10px] font-mono">{selectedState.tier}</span>
            </div>

            <div className="space-y-2 border-b border-line pb-3">
              <p><span className="font-semibold text-grey block uppercase text-[9px] tracking-wider">Regime Type</span> {selectedState.regimeType}</p>
              <p><span className="font-semibold text-grey block uppercase text-[9px] tracking-wider">Launch Priority</span> {selectedState.priority}</p>
              {selectedState.regulator && <p><span className="font-semibold text-grey block uppercase text-[9px] tracking-wider">State Regulator</span> {selectedState.regulator}</p>}
            </div>

            <div className="space-y-2 border-b border-line pb-3">
              {selectedState.minNetWorth && <p><span className="font-semibold text-grey block uppercase text-[9px] tracking-wider">Minimum Corporate Net Worth</span> <span className="font-mono">{selectedState.minNetWorth}</span></p>}
              {selectedState.suretyBond && <p><span className="font-semibold text-grey block uppercase text-[9px] tracking-wider">Surety Bond Collateral</span> <span className="font-mono">{selectedState.suretyBond}</span></p>}
              {selectedState.sandboxAvailable !== undefined && (
                <p><span className="font-semibold text-grey block uppercase text-[9px] tracking-wider">Regulatory Sandbox</span> {selectedState.sandboxAvailable ? 'Exemption Available' : 'None'}</p>
              )}
              {selectedState.sandboxNotes && <p className="italic text-grey-dark pl-2 border-l border-line">"{selectedState.sandboxNotes}"</p>}
              <p><span className="font-semibold text-grey block uppercase text-[9px] tracking-wider">NMLS Registration</span> {selectedState.nmlsRequired ? 'Required (Apply via NMLS)' : 'Not Used / Exempt'}</p>
            </div>

            <div className="space-y-2">
              {selectedState.estCost && <p><span className="font-semibold text-grey block uppercase text-[9px] tracking-wider">Estimated Cost</span> <span className="font-mono">{selectedState.estCost}</span></p>}
              {selectedState.estTimeline && <p><span className="font-semibold text-grey block uppercase text-[9px] tracking-wider">Estimated Timeline</span> <span className="font-mono">{selectedState.estTimeline}</span></p>}
              <p><span className="font-semibold text-grey block uppercase text-[9px] tracking-wider">Operational Notes</span> {selectedState.notes}</p>
            </div>
          </div>
        )}
      </InspectorDrawer>
    </div>
  );
}
export default StateMap;
