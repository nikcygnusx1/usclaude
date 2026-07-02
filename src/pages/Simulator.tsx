import { useState } from 'react';
import { Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { states, products } from '@/data';
import { toBadgeStatus } from '@/lib/status';

type ArchOption = 'A' | 'B' | 'C';

const architectures: Record<ArchOption, {
  name: string; structure: string; licensing: string; burden: string; benefit: string; limitation: string; productId: string;
}> = {
  A: {
    name: 'Option A — Non-Custodial Architecture (Phase 1 only)',
    structure: 'Software/API platform; third-party custody (e.g. Fireblocks, BitGo).',
    licensing: 'Zero state licensing — federal MSB registration only.',
    burden: 'Lowest — launch achievable in roughly 90 days.',
    benefit: 'Fastest path to market; minimal licensing surface area.',
    limitation: 'Cannot offer fiat ramps; the user must hold their own keys.',
    productId: 'NONCUSTODIAL_WALLET',
  },
  B: {
    name: 'Option B — Segregated Custody Architecture (Phase 2+)',
    structure: 'Customer funds held in segregated accounts; LCX USA never pools funds.',
    licensing: 'MTL required in most states, except Wyoming (SPDI charter route).',
    burden: 'Medium — roughly 6-12 months to stand up.',
    benefit: 'Enables fiat ramps and institutional trust.',
    limitation: 'Still requires state-by-state MTL coordination and a custody partner.',
    productId: 'CUSTODY',
  },
  C: {
    name: 'Option C — Omnibus Custody Architecture (Full Exchange)',
    structure: 'LCX USA controls all keys; omnibus wallets.',
    licensing: 'MTL + BitLicense (NY) + DFAL (CA) + WY SPDI, as applicable.',
    burden: 'Highest — 18+ months.',
    benefit: 'Maximum product flexibility.',
    limitation: 'Highest aggregate regulatory risk and cost.',
    productId: 'EXCHANGE',
  },
};

export function Simulator() {
  const [option, setOption] = useState<ArchOption>('A');
  const arch = architectures[option];
  const product = products.find(p => p.id === arch.productId);

  const compatibleStates = option === 'A'
    ? states.filter(s => s.phase === 'Phase 1' && s.tier !== 'Unresearched')
    : option === 'B'
      ? states.filter(s => s.phase === 'Phase 2' && s.tier !== 'Unresearched')
      : states.filter(s => s.phase === 'Phase 3' && s.tier !== 'Unresearched');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Architecture Simulator</h1>
        <p className="text-sm text-grey-dark mt-1">
          Compares the three custody architectures identified in the research and the states/products each one unlocks. Not a full legal what-if engine — a grounded comparison of the three documented options.
        </p>
      </div>

      <div className="flex gap-2">
        {(['A', 'B', 'C'] as ArchOption[]).map(k => (
          <button
            key={k}
            onClick={() => setOption(k)}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${option === k ? 'bg-navy text-white border-navy' : 'border-line bg-card hover:bg-ice-soft'}`}
          >
            Option {k}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>{arch.name}</CardHeader>
        <CardBody className="space-y-2 text-sm">
          <p><span className="font-medium">Structure:</span> {arch.structure}</p>
          <p><span className="font-medium">Licensing:</span> {arch.licensing}</p>
          <p><span className="font-medium">Burden:</span> {arch.burden}</p>
          <p><span className="font-medium">Benefit:</span> {arch.benefit}</p>
          <p><span className="font-medium">Limitation:</span> {arch.limitation}</p>
          {product && (
            <div className="pt-2">
              <Badge status={toBadgeStatus(product.status)}>{product.name}: {product.status}</Badge>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>States compatible with this architecture's target phase ({compatibleStates.length})</CardHeader>
        <CardBody>
          {compatibleStates.length === 0 ? (
            <p className="text-sm text-grey-dark">No researched states currently mapped to this phase.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {compatibleStates.map(s => (
                <span key={s.id} className="text-xs rounded-full border border-line px-2 py-1">{s.name}</span>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
