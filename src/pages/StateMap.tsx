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
      className="flex flex-col items-center justify-center gap-1 rounded-md border border-line bg-card p-2 h-16 hover:shadow-md hover:-translate-y-0.5 transition-all"
      title={`${s.name} — ${s.status}`}
    >
      <span className="text-xs font-bold">{s.abbreviation}</span>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[s.status] ?? 'bg-grey'}`} />
    </button>
  );
}

export function StateMap() {
  const { selectedStatuses, selectedPhases, searchQuery } = useFilterStore();
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
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge status={toBadgeStatus(selected.status)}>{selected.status}</Badge>
              <span className="text-xs rounded-full border border-line px-2 py-0.5">{selected.phase}</span>
              <span className="text-xs rounded-full border border-line px-2 py-0.5">{selected.tier}</span>
            </div>
            <p><span className="font-medium">Regime type:</span> {selected.regimeType}</p>
            <p><span className="font-medium">Priority:</span> {selected.priority}</p>
            {selected.regulator && <p><span className="font-medium">Regulator:</span> {selected.regulator}</p>}
            {selected.primaryPainPoint && <p><span className="font-medium">Primary pain point:</span> {selected.primaryPainPoint}</p>}
            {selected.estCost && <p><span className="font-medium">Estimated cost:</span> {selected.estCost}</p>}
            {selected.estTimeline && <p><span className="font-medium">Estimated timeline:</span> {selected.estTimeline}</p>}
            <p><span className="font-medium">Notes:</span> {selected.notes}</p>
            <p className="text-xs text-grey">Confidence: {selected.confidence} · Source authority tier {selected.sourceAuthority}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
