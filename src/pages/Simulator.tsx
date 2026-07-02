import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { useAuditStore } from '@/stores/useAuditStore';
import { clsx } from 'clsx';

interface OptionMetrics {
  id: string;
  title: string;
  desc: string;
  fees: string;
  bonds: string;
  netWorth: string;
  nmlsCount: number;
  sandboxes: number;
  howeyAvg: string;
  unlockedStates: string[];
  blockersCount: number;
}

const simulatorOptions: OptionMetrics[] = [
  {
    id: 'non-custodial',
    title: 'Option A: Non-Custodial Wallet',
    desc: 'Crypto-to-crypto non-custodial custody model. Minimizes licensing triggers by routing custody to user-held private keys.',
    fees: '$25,000',
    bonds: '$0',
    netWorth: '$0 (No corporate MTL requirements)',
    nmlsCount: 1, // Only Montana
    sandboxes: 1,
    howeyAvg: '45% (Medium legal risk)',
    unlockedStates: ['Montana'],
    blockersCount: 1,
  },
  {
    id: 'spdi-custody',
    title: 'Option B: SPDI Wyoming Custody',
    desc: 'Establish Wyoming Special Purpose Depository Institution (SPDI) trust trust custody routing to avoid full multi-state MTL triggers.',
    fees: '$120,000',
    bonds: '$500,000',
    netWorth: '$5,000,000 (Wyoming statutory minimum)',
    nmlsCount: 5,
    sandboxes: 2,
    howeyAvg: '62% (High legal risk)',
    unlockedStates: ['Wyoming', 'Montana', 'Colorado', 'Utah'],
    blockersCount: 3,
  },
  {
    id: 'custodial-exchange',
    title: 'Option C: Custodial Exchange',
    desc: 'Full custodial fiat-to-crypto retail exchange platform. Triggers absolute state Money Transmitter Licenses (MTLs) and NY BitLicense.',
    fees: '$840,000',
    bonds: '$4,250,000',
    netWorth: '$15,000,000 (Aggregate multi-state ceiling)',
    nmlsCount: 46,
    sandboxes: 0,
    howeyAvg: '80% (Critical legal risk)',
    unlockedStates: ['All 50 states (excluding restricted territories)'],
    blockersCount: 22,
  },
];

export function Simulator() {
  const { committedArchitecture, commitArchitecture } = useAuditStore();

  const handleSelectArchitecture = (id: string) => {
    if (committedArchitecture === id) {
      commitArchitecture(null);
    } else {
      commitArchitecture(id);
    }
  };

  return (
    <div className="space-y-4 text-navy dark:text-ice h-[calc(100vh-6.5rem)] flex flex-col overflow-hidden min-h-0">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-2">U.S. Rollout Architecture Modeler</h1>
        <p className="text-sm text-grey-dark dark:text-grey-light mt-0.5">
          Simulate and commit the core custody architecture. Committing locks the regulatory mapping framework and syncs the Audit Trail.
        </p>
      </div>

      {/* Side-by-Side Comparison Workspace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 overflow-y-auto pr-1 py-1">
        {simulatorOptions.map(opt => {
          const isCommitted = committedArchitecture === opt.id;
          return (
            <Card
              key={opt.id}
              className={clsx(
                'flex flex-col border-2 transition-all duration-300 relative group h-full justify-between',
                isCommitted
                  ? 'border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/2 scale-[1.01] shadow-md shadow-cyan-500/10'
                  : 'border-line hover:border-grey'
              )}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-line">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-sm tracking-tight text-navy dark:text-ice">{opt.title}</h3>
                  {isCommitted && (
                    <Badge status="ready" className="flex items-center gap-1 shrink-0">
                      <CheckCircle2 size={10} /> Committed
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-grey-dark dark:text-grey-light mt-1.5 leading-relaxed">{opt.desc}</p>
              </div>

              {/* Metrics Sheet */}
              <div className="p-4 flex-1 space-y-3.5">
                <span className="font-bold text-[9px] uppercase tracking-wider text-grey block">Operational &amp; Capital Projections</span>
                
                <div className="space-y-2 font-mono text-[10px]">
                  <div className="flex justify-between pb-1.5 border-b border-line/40">
                    <span className="text-grey uppercase">Licensing Fees:</span>
                    <span className="font-bold text-navy-deep dark:text-ice-soft">{opt.fees}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-line/40">
                    <span className="text-grey uppercase">Surety Bond Collateral:</span>
                    <span className="font-bold text-navy-deep dark:text-ice-soft">{opt.bonds}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-line/40">
                    <span className="text-grey uppercase">Statutory Net Worth:</span>
                    <span className="font-bold text-navy-deep dark:text-ice-soft text-right max-w-[140px] truncate" title={opt.netWorth}>
                      {opt.netWorth.split(' (')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-line/40">
                    <span className="text-grey uppercase">MTL Jurisdictions:</span>
                    <span className="font-bold text-navy-deep dark:text-ice-soft">{opt.nmlsCount} states</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-line/40">
                    <span className="text-grey uppercase">Sandbox Program Gates:</span>
                    <span className="font-bold text-navy-deep dark:text-ice-soft">{opt.sandboxes} available</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-line/40">
                    <span className="text-grey uppercase">Avg. Howey Risk:</span>
                    <span className="font-bold text-navy-deep dark:text-ice-soft">{opt.howeyAvg}</span>
                  </div>
                </div>

                {/* Unlocked Territory lists */}
                <div className="space-y-1">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-grey block">Exemption-Friendly States Unlocked</span>
                  <div className="flex flex-wrap gap-1">
                    {opt.unlockedStates.map((st, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-ice-soft dark:bg-navy-deep border border-line text-[9px] font-semibold text-grey-dark">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button at bottom */}
              <div className="p-4 border-t border-line shrink-0">
                <button
                  onClick={() => handleSelectArchitecture(opt.id)}
                  className={clsx(
                    'w-full h-9 rounded text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5',
                    isCommitted
                      ? 'bg-status-blocked hover:bg-status-blocked/90 text-white'
                      : 'bg-navy dark:bg-ice text-white dark:text-navy hover:opacity-95'
                  )}
                >
                  {isCommitted ? (
                    <>
                      <span>Revoke Commitment Covenants</span>
                    </>
                  ) : (
                    <>
                      <span>Commit Rollout Architecture</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
export default Simulator;
