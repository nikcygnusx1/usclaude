import { useFilterStore } from '@/stores/useFilterStore';
import { Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { requirements } from '@/data';
import { ToggleLeft, ToggleRight, FileText, CheckCircle, ShieldAlert } from 'lucide-react';

export function ScenarioPlanner() {
  const { clarityEnacted, toggleClarityEnacted } = useFilterStore();

  const preemptedRequirements = requirements.filter(r => r.preemptedUnderClarity);

  return (
    <div className="space-y-4">
      {/* Top Section */}
      <div>
        <h1 className="text-2xl font-bold">Legislative Scenario Planner</h1>
        <p className="text-sm text-grey-dark mt-1">
          Simulate the impact of proposed U.S. legislation (such as the CLARITY Act H.R. 3633) on LCX USA’s regulatory gating blocks.
        </p>
      </div>

      {/* Interactive Toggle Card */}
      <Card className="bg-gradient-to-r from-navy to-navy/80 text-white border-0">
        <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold">CLARITY Act (H.R. 3633) Simulation</h2>
            <p className="text-xs text-grey-light/80 max-w-xl">
              Toggling this switch enacts the CLARITY framework across the entire app. It updates the state map, products, and graph explorer to reflect federal digital-commodity preemption and DeFi safe harbors.
            </p>
          </div>
          <button
            onClick={toggleClarityEnacted}
            className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 transition-colors self-start sm:self-center"
            aria-label="Toggle CLARITY Act simulation"
          >
            <span className="text-sm font-semibold">Simulate Enactment</span>
            {clarityEnacted ? (
              <ToggleRight className="text-status-ready h-7 w-7" />
            ) : (
              <ToggleLeft className="text-grey-light h-7 w-7" />
            )}
          </button>
        </CardBody>
      </Card>

      {/* Delta Comparison Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Pre-CLARITY Card */}
        <Card className={!clarityEnacted ? 'ring-2 ring-navy/50' : 'opacity-70'}>
          <CardHeader className="flex items-center gap-2 font-bold text-navy dark:text-ice bg-ice-soft dark:bg-ice-soft/10">
            <ShieldAlert size={18} className="text-status-blocked" /> Pre-CLARITY Regime (Current Law)
          </CardHeader>
          <CardBody className="space-y-4 text-xs">
            <div className="border-b border-line pb-2">
              <span className="font-semibold block text-sm mb-0.5">State money transmission</span>
              <p className="text-grey-dark dark:text-grey-light">
                LCX USA must apply for and obtain Money Transmission Licenses (MTLs) in <strong>49 states</strong> to facilitate custody, fiat-ramps, or stablecoin transmission. Approval times take 6–18 months per state.
              </p>
            </div>
            <div className="border-b border-line pb-2">
              <span className="font-semibold block text-sm mb-0.5">CFTC vs SEC split</span>
              <p className="text-grey-dark dark:text-grey-light">
                Ambiguous and overlapping. The SEC actively applies the Howey Test to classify utility tokens and staking rewards as securities, resulting in high enforcement risk (e.g. LCX Token gating).
              </p>
            </div>
            <div className="border-b border-line pb-2">
              <span className="font-semibold block text-sm mb-0.5">DeFi &amp; Non-Custodial Software</span>
              <p className="text-grey-dark dark:text-grey-light">
                No safe harbors. Software-only and API platform services run the risk of being classified as unlicensed money transmitters or unregistered broker-dealers under SEC/FinCEN interpretations.
              </p>
            </div>
            <div>
              <span className="font-semibold block text-sm mb-0.5">Stablecoins</span>
              <p className="text-grey-dark dark:text-grey-light">
                Fragmented state-level treatment. Texas DOB Mem 1037 and Florida HB 505 treat stablecoin transactions as "fiat value transmission," triggering mandatory local licensing.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Post-CLARITY Card */}
        <Card className={clarityEnacted ? 'ring-2 ring-status-ready/60' : 'opacity-70'}>
          <CardHeader className="flex items-center gap-2 font-bold text-status-ready bg-status-ready-bg/20">
            <CheckCircle size={18} className="text-status-ready" /> Post-CLARITY Regime (Simulated)
          </CardHeader>
          <CardBody className="space-y-4 text-xs">
            <div className="border-b border-line pb-2">
              <span className="font-semibold block text-sm mb-0.5 text-status-ready">State money transmission</span>
              <p className="text-grey-dark dark:text-grey-light">
                Federal digital commodity registration <strong>preempts state MTL licensing</strong> for spot commodity trading. LCX USA can roll out spot trading in most states without applying for individual state MTLs.
              </p>
            </div>
            <div className="border-b border-line pb-2">
              <span className="font-semibold block text-sm mb-0.5 text-status-ready">CFTC vs SEC split</span>
              <p className="text-grey-dark dark:text-grey-light">
                Definitive statutory separation. CFTC obtains clear exclusive oversight over "digital commodities" (e.g., spot BTC/ETH trading); SEC maintains oversight over "digital securities" (e.g., tokenized assets).
              </p>
            </div>
            <div className="border-b border-line pb-2">
              <span className="font-semibold block text-sm mb-0.5 text-status-ready">DeFi &amp; Non-Custodial Software</span>
              <p className="text-grey-dark dark:text-grey-light">
                Formal federal safe harbor. Developers of non-custodial software (Option A) and smart contracts are explicitly exempted from money transmission and broker-dealer licensing rules.
              </p>
            </div>
            <div>
              <span className="font-semibold block text-sm mb-0.5 text-status-ready">Stablecoins</span>
              <p className="text-grey-dark dark:text-grey-light">
                Harmonized federal stablecoin issuance standards. Reduces fragmented state-by-state licensing overlays for fiat-backed reserves, establishing a single federal supervisory path.
              </p>
            </div>
          </CardBody>
        </Card>
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
                className={`p-3 rounded-md border transition-all ${
                  clarityEnacted
                    ? 'border-dashed border-status-ready bg-status-ready/5 opacity-90'
                    : 'border-line bg-card'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-semibold text-sm ${clarityEnacted ? 'text-status-ready' : 'text-navy dark:text-ice'}`}>
                    {r.name}
                  </span>
                  <Badge status={clarityEnacted ? 'ready' : 'blocked'}>
                    {clarityEnacted ? 'Preempted' : 'Active Gate'}
                  </Badge>
                </div>
                <p className="text-xs text-grey-dark dark:text-grey-light">{r.description}</p>
                {clarityEnacted && (
                  <p className="text-xs text-status-ready font-medium mt-1.5 pl-2 border-l-2 border-status-ready">
                    ✨ CLARITY Rule: {r.preemptionDescription}
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
