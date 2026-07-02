import { useMemo, useState } from 'react';
import { states } from '@/data';
import { useFilterStore } from '@/stores/useFilterStore';
import { Badge, InspectorDrawer } from '@/components/ui';
import { toBadgeStatus } from '@/lib/status';
import { State } from '@/types/ontology';

const statusDot: Record<string, string> = {
  Ready: 'bg-status-ready', Conditional: 'bg-status-conditional', Blocked: 'bg-status-blocked',
  Deferred: 'bg-status-deferred', 'Needs verification': 'bg-status-unverified',
};

function StateTile({ s, onClick }: { s: State; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 rounded-md border border-line bg-card p-2 h-16 hover:shadow-md hover:-translate-y-0.5 transition-all text-navy dark:text-ice"
      title={`${s.name} — ${s.status}`}
    >
      <span className="text-xs font-bold">{s.abbreviation}</span>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[s.status] ?? 'bg-grey'}`} />
    </button>
  );
}

export function StateMap() {
  const { selectedStatuses, selectedPhases, searchQuery, clarityEnacted } = useFilterStore();
  const [selected, setSelected] = useState<State | null>(null);

  const filtered = useMemo(() => {
    return states.filter(s => {
      if (selectedStatuses.length && !selectedStatuses.includes(s.status)) return false;
      if (selectedPhases.length && !selectedPhases.includes(s.phase)) return false;
      if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [selectedStatuses, selectedPhases, searchQuery]);

  const researched = filtered.filter(s => s.tier !== 'Unresearched').sort((a, b) => a.tier.localeCompare(b.tier));
  const unresearched = filtered.filter(s => s.tier === 'Unresearched');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">State Map</h1>
        <p className="text-sm text-grey-dark mt-1">{filtered.length} of {states.length} states shown. Use the sidebar filters to narrow by status or phase.</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">Researched States ({researched.length})</h2>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {researched.map(s => <StateTile key={s.id} s={s} onClick={() => setSelected(s)} />)}
        </div>
      </div>

      {unresearched.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2 text-grey-dark">Not Yet Researched ({unresearched.length})</h2>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 opacity-60">
            {unresearched.map(s => <StateTile key={s.id} s={s} onClick={() => setSelected(s)} />)}
          </div>
        </div>
      )}

      <InspectorDrawer isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className="space-y-3 text-sm text-navy dark:text-ice leading-relaxed">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge status={toBadgeStatus(selected.status)}>{selected.status}</Badge>
              <span className="text-xs rounded-full border border-line px-2 py-0.5">{selected.phase}</span>
              <span className="text-xs rounded-full border border-line px-2 py-0.5">{selected.tier}</span>
            </div>

            {/* CLARITY Enacted State Overlay */}
            {clarityEnacted && selected.tier !== 'Unresearched' && (selected.regimeType === 'Money transmitter' || selected.regimeType === 'Hybrid') && (
              <div className="rounded-md border border-dashed border-status-ready bg-status-ready/10 p-3 text-xs text-status-ready font-medium my-2">
                ⚡ CLARITY Preemption Active: Money transmission license requirements are preempted at the federal level for CFTC-registered digital commodities.
              </div>
            )}

            <div className="space-y-2 border-b border-line pb-3">
              <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Regime Type</span> {selected.regimeType}</p>
              <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Priority</span> {selected.priority}</p>
              {selected.regulator && <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Regulator Portal</span> {selected.regulator}</p>}
            </div>

            <div className="space-y-2 border-b border-line pb-3">
              {/* Extended bonding/net worth fields */}
              {selected.minNetWorth && <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Minimum Corporate Net Worth</span> <span className="font-mono text-sm">{selected.minNetWorth}</span></p>}
              {selected.suretyBond && <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Surety Bond Collateral</span> <span className="font-mono text-sm">{selected.suretyBond}</span></p>}
              {selected.sandboxAvailable !== undefined && (
                <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Regulatory Sandbox</span> {selected.sandboxAvailable ? 'Exemption Available' : 'None'}</p>
              )}
              {selected.sandboxNotes && <p className="text-xs text-grey-dark dark:text-grey-light pl-3 border-l border-line italic">"{selected.sandboxNotes}"</p>}
              {selected.tier !== 'Unresearched' && (
                <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">NMLS Registration</span> {selected.nmlsRequired ? 'Required (Apply via NMLS)' : 'Not Used / Exempt'}</p>
              )}
            </div>

            <div className="space-y-2">
              {selected.estCost && <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Estimated Fee</span> <span className="font-mono">{selected.estCost}</span></p>}
              {selected.estTimeline && <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Estimated Pipeline duration</span> <span className="font-mono">{selected.estTimeline}</span></p>}
              <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Detailed Notes</span> {selected.notes}</p>
            </div>

            {/* Technical YAML registry payload */}
            <div className="pt-2 border-t border-line mt-3">
              <details className="group cursor-pointer">
                <summary className="text-[10px] font-bold uppercase tracking-wider text-grey select-none list-none flex items-center gap-1.5">
                  <span className="transition-transform group-open:rotate-90">&rarr;</span>
                  <span>[Technical Registry Payload]</span>
                </summary>
                <pre className="mt-2 p-2.5 rounded bg-ice-soft dark:bg-navy-deep text-[10px] font-mono overflow-x-auto text-navy dark:text-ice border border-line leading-normal">
{`state_registry:
  id: "${selected.id}"
  name: "${selected.name}"
  abbreviation: "${selected.abbreviation}"
  regime: "${selected.regimeType}"
  phase: "${selected.phase}"
  net_worth: "${selected.minNetWorth || '0'}"
  surety_bond: "${selected.suretyBond || '0'}"
  sandbox: ${selected.sandboxAvailable}
  nmls: ${selected.nmlsRequired}
  authority: tier_${selected.sourceAuthority}`}
                </pre>
              </details>
            </div>

            <p className="text-[10px] text-grey pt-3 border-t border-line mt-4">Confidence: {selected.confidence} · Source authority tier {selected.sourceAuthority}</p>
          </div>
        )}
      </InspectorDrawer>
    </div>
  );
}
