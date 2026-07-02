import { useMemo, useState } from 'react';
import { states } from '@/data';
import { useFilterStore } from '@/stores/useFilterStore';
import { Badge, Modal } from '@/components/ui';
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

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className="space-y-2 text-sm text-navy dark:text-ice">
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

            <p><span className="font-semibold">Regime Type:</span> {selected.regimeType}</p>
            <p><span className="font-semibold">Priority:</span> {selected.priority}</p>
            {selected.regulator && <p><span className="font-semibold">Regulator:</span> {selected.regulator}</p>}
            {selected.primaryPainPoint && <p><span className="font-semibold">Primary Pain Point:</span> {selected.primaryPainPoint}</p>}
            
            {/* Extended bonding/net worth fields */}
            {selected.minNetWorth && <p><span className="font-semibold">Minimum Net Worth:</span> {selected.minNetWorth}</p>}
            {selected.suretyBond && <p><span className="font-semibold">Surety Bond:</span> {selected.suretyBond}</p>}
            {selected.sandboxAvailable !== undefined && (
              <p><span className="font-semibold">Regulatory Sandbox:</span> {selected.sandboxAvailable ? 'Available' : 'None'}</p>
            )}
            {selected.sandboxNotes && <p className="text-xs text-grey-dark dark:text-grey-light pl-3 border-l border-line italic">{selected.sandboxNotes}</p>}
            {selected.tier !== 'Unresearched' && (
              <p><span className="font-semibold">NMLS Integration:</span> {selected.nmlsRequired ? 'NMLS Application Required' : 'NMLS Not Used'}</p>
            )}

            {selected.estCost && <p><span className="font-semibold">Estimated Cost:</span> {selected.estCost}</p>}
            {selected.estTimeline && <p><span className="font-semibold">Estimated Timeline:</span> {selected.estTimeline}</p>}
            <p><span className="font-semibold">Notes:</span> {selected.notes}</p>
            <p className="text-xs text-grey pt-2 border-t border-line mt-3">Confidence: {selected.confidence} · Source authority tier {selected.sourceAuthority}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
