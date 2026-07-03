import { useState, useMemo } from 'react';
import USAMap from 'react-usa-map';
import { Badge, InspectorDrawer } from '@/components/ui';
import { states } from '@/data';
import { useAuditStore } from '@/stores/useAuditStore';
import { useFilterStore } from '@/stores/useFilterStore';
import { toBadgeStatus } from '@/lib/status';
import { State } from '@/types/ontology';
import { Map, SlidersHorizontal, Info, RefreshCw } from 'lucide-react';


export function StateMap() {
  const { addAuditLog } = useAuditStore();
  const { selectedStatuses, selectedPhases, clarityEnacted, spdiEquivalence } = useFilterStore();
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

      // Apply global filters
      const matchGlobalStatus = selectedStatuses.length === 0 || selectedStatuses.includes(s.status);
      const matchGlobalPhase = selectedPhases.length === 0 || selectedPhases.includes(s.phase);

      return matchNmls && matchSandbox && matchRegime && matchPriority && matchPhase && matchGlobalStatus && matchGlobalPhase;
    });
  }, [nmlsFilter, sandboxFilter, regimeFilter, priorityFilter, phaseFilter, selectedStatuses, selectedPhases]);

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

  const mapConfig = useMemo(() => {
    const config: Record<string, { fill?: string; clickHandler?: (e: any) => void }> = {};
    states.forEach(s => {
      const isUnresearched = s.tier === 'Unresearched';
      const isActive = filteredStates.some(x => x.id === s.id);
      const effectiveStatus = (clarityEnacted && s.nmlsRequired) || (spdiEquivalence && s.abbreviation === 'NY') ? 'Ready' : s.status;

      let fill = 'rgb(var(--grey))'; // default slate / unverified / deferred
      if (isUnresearched) {
        fill = 'rgba(var(--grey) / 0.25)'; // faint slate for unresearched
      } else if (!isActive) {
        fill = 'rgba(var(--grey) / 0.08)'; // transparent/hidden if filtered out
      } else if (effectiveStatus === 'Ready') {
        fill = 'rgb(var(--green))'; 
      } else if (effectiveStatus === 'Blocked') {
        fill = 'rgb(var(--red))'; 
      } else if (effectiveStatus === 'Conditional') {
        fill = 'rgb(var(--amber))'; 
      }

      config[s.abbreviation] = {
        fill,
        clickHandler: (e: any) => {
          const abbr = e.target.dataset.name;
          const match = states.find(st => st.abbreviation === abbr);
          if (match) {
            handleStateClick(match);
          }
        }
      };
    });
    return config;
  }, [filteredStates, clarityEnacted]);

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

        {/* Right Side: Interactive SVG USA Map Viewport */}
        <div className="flex-1 bg-card border border-line rounded-lg p-6 shadow-sm overflow-auto flex items-center justify-center us-state-map">
          <div className="w-full max-w-2xl select-none">
            <USAMap customize={mapConfig} />
          </div>
        </div>


      </div>

      {/* Slide-out State Inspector Drawer */}
      <InspectorDrawer isOpen={!!selectedState} onClose={() => setSelectedState(null)} title={selectedState?.name ?? ''}>
        {selectedState && (() => {
          const effectiveStatus = (clarityEnacted && selectedState.nmlsRequired) || (spdiEquivalence && selectedState.abbreviation === 'NY') ? 'Ready' : selectedState.status;
          return (
            <div className="space-y-4 text-xs leading-relaxed text-navy dark:text-ice">
              <div className="flex flex-wrap gap-2">
                <Badge status={toBadgeStatus(effectiveStatus)}>{effectiveStatus}</Badge>

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
          );
        })()}
      </InspectorDrawer>


    </div>
  );
}
export default StateMap;
