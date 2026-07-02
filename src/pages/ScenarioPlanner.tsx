import { useFilterStore } from '@/stores/useFilterStore';
import { Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { requirements } from '@/data';
import { ToggleLeft, ToggleRight, FileText, Terminal } from 'lucide-react';
import { clsx } from 'clsx';

export function ScenarioPlanner() {
  const { clarityEnacted, toggleClarityEnacted } = useFilterStore();

  const preemptedRequirements = requirements.filter(r => r.preemptedUnderClarity);

  return (
    <div className="space-y-4 text-navy dark:text-ice">
      {/* Top Section */}
      <div>
        <h1 className="text-2xl font-bold">Legislative Scenario Planner</h1>
        <p className="text-sm text-grey-dark mt-1">
          Simulate the impact of proposed U.S. legislation (such as the CLARITY Act H.R. 3633) on LCX USA’s regulatory gating blocks.
        </p>
      </div>

      {/* Interactive Toggle Card */}
      <Card className="bg-gradient-to-r from-navy to-navy/80 text-white border-0 shadow-lg">
        <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold">CLARITY Act (H.R. 3633) Simulation</h2>
            <p className="text-xs text-grey-light/80 max-w-xl">
              Toggling this switch enacts the CLARITY framework across the entire app. It updates the state map, products, and graph explorer to reflect federal digital-commodity preemption and DeFi safe harbors.
            </p>
          </div>
          <button
            onClick={toggleClarityEnacted}
            className={clsx(
              'flex items-center gap-3 rounded-full border px-5 py-2.5 transition-all transform active:scale-95 shrink-0 self-start sm:self-center',
              clarityEnacted
                ? 'bg-status-ready/20 border-status-ready text-status-ready shadow-md shadow-status-ready/10'
                : 'bg-white/10 border-white/20 text-white'
            )}
            aria-label="Toggle CLARITY Act simulation"
          >
            <span className="text-xs uppercase tracking-wider font-extrabold">Simulate Enactment</span>
            {clarityEnacted ? (
              <ToggleRight className="text-status-ready h-7 w-7 transition-all" />
            ) : (
              <ToggleLeft className="text-grey-light h-7 w-7 transition-all" />
            )}
          </button>
        </CardBody>
      </Card>

      {/* Delta Comparison Board: Terminal Style */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Pre-CLARITY Panel */}
        <div
          className={clsx(
            'rounded-lg border bg-slate-950 text-slate-100 font-mono shadow-md overflow-hidden transition-all',
            !clarityEnacted ? 'ring-2 ring-red-500/30 border-red-500/40' : 'opacity-60 border-slate-800'
          )}
        >
          {/* Terminal Title Bar */}
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 shrink-0" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-red-400">Current Law Regime</span>
            </div>
            <Terminal size={14} className="text-slate-500" />
          </div>

          <div className="p-4 space-y-4 text-xs leading-normal">
            <div className="border-b border-slate-900 pb-3">
              <span className="font-semibold block text-red-400 mb-1">&gt; state_money_transmission</span>
              <p className="text-slate-300">
                LCX USA must apply for and obtain Money Transmission Licenses (MTLs) in <strong>49 states</strong> to facilitate custody, fiat-ramps, or stablecoin transmission. Approval times take 6–18 months per state.
              </p>
            </div>
            <div className="border-b border-slate-900 pb-3">
              <span className="font-semibold block text-red-400 mb-1">&gt; cftc_vs_sec_jurisdiction</span>
              <p className="text-slate-300">
                Ambiguous and overlapping. The SEC actively applies the Howey Test to classify utility tokens and staking rewards as securities, resulting in high enforcement risk (e.g. LCX Token gating).
              </p>
            </div>
            <div className="border-b border-slate-900 pb-3">
              <span className="font-semibold block text-red-400 mb-1">&gt; defi_and_noncustodial</span>
              <p className="text-slate-300">
                No safe harbors. Software-only and API platform services run the risk of being classified as unlicensed money transmitters or unregistered broker-dealers under SEC/FinCEN interpretations.
              </p>
            </div>
            <div>
              <span className="font-semibold block text-red-400 mb-1">&gt; stablecoins</span>
              <p className="text-slate-300">
                Fragmented state-level treatment. Texas DOB Mem 1037 and Florida HB 505 treat stablecoin transactions as "fiat value transmission," triggering mandatory local licensing.
              </p>
            </div>
          </div>
        </div>

        {/* Post-CLARITY Panel */}
        <div
          className={clsx(
            'rounded-lg border bg-slate-950 text-slate-100 font-mono shadow-md overflow-hidden transition-all',
            clarityEnacted ? 'ring-2 ring-emerald-500/30 border-emerald-500/40' : 'opacity-60 border-slate-800'
          )}
        >
          {/* Terminal Title Bar */}
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">Post-CLARITY H.R. 3633</span>
            </div>
            <Terminal size={14} className="text-slate-500" />
          </div>

          <div className="p-4 space-y-4 text-xs leading-normal">
            <div className="border-b border-slate-900 pb-3">
              <span className="font-semibold block text-emerald-400 mb-1">&gt; state_money_transmission</span>
              <p className="text-slate-300">
                Federal digital commodity registration <strong>preempts state MTL licensing</strong> for spot commodity trading. LCX USA can roll out spot trading in most states without applying for individual state MTLs.
              </p>
            </div>
            <div className="border-b border-slate-900 pb-3">
              <span className="font-semibold block text-emerald-400 mb-1">&gt; cftc_vs_sec_jurisdiction</span>
              <p className="text-slate-300">
                Definitive statutory separation. CFTC obtains clear exclusive oversight over "digital commodities" (e.g., spot BTC/ETH trading); SEC maintains oversight over "digital securities" (e.g., tokenized assets).
              </p>
            </div>
            <div className="border-b border-slate-900 pb-3">
              <span className="font-semibold block text-emerald-400 mb-1">&gt; defi_and_noncustodial</span>
              <p className="text-slate-300">
                Formal federal safe harbor. Developers of non-custodial software (Option A) and smart contracts are explicitly exempted from money transmission and broker-dealer licensing rules.
              </p>
            </div>
            <div>
              <span className="font-semibold block text-emerald-400 mb-1">&gt; stablecoins</span>
              <p className="text-slate-300">
                Harmonized U.S. stablecoin issuance standards. Reduces fragmented state-by-state licensing overlays for fiat-backed reserves, establishing a single federal supervisory path.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preempted Gating Items List */}
      <Card>
        <CardHeader className="flex items-center gap-2 border-b border-line px-4 py-3 font-semibold">
          <FileText size={18} className="text-navy dark:text-ice" /> Impacted Gating Requirements
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {preemptedRequirements.map(r => (
              <div
                key={r.id}
                className={clsx(
                  'p-3 rounded-md border transition-all duration-300',
                  clarityEnacted
                    ? 'border-dashed border-status-ready bg-status-ready/5'
                    : 'border-line bg-card'
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={clsx('font-bold text-sm transition-colors', clarityEnacted ? 'text-status-ready' : 'text-navy dark:text-ice')}>
                    {r.name}
                  </span>
                  <Badge status={clarityEnacted ? 'ready' : 'blocked'}>
                    {clarityEnacted ? 'Preempted' : 'Active Gate'}
                  </Badge>
                </div>
                <p className="text-xs text-grey-dark dark:text-grey-light">{r.description}</p>
                {clarityEnacted && (
                  <p className="text-xs text-status-ready font-medium mt-2 pl-2 border-l-2 border-status-ready font-mono text-[10px]">
                    PAYLOAD_DELTA: {r.preemptionDescription}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
