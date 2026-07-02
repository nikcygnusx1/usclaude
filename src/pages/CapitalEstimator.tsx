import { useState, useMemo } from 'react';
import { states } from '@/data';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { DollarSign, Landmark, ShieldCheck, Clock, CheckSquare, Square } from 'lucide-react';

// String parsers
const parseCost = (costStr?: string): number => {
  if (!costStr) return 0;
  const clean = costStr.replace(/[^\d.]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return num * 1000; // convert e.g., "150" to 150000
};

const parseBond = (bondStr?: string): number => {
  if (!bondStr) return 0;
  const clean = bondStr.replace(/[^\d.]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return num; // e.g., "$500,000" to 500000
};

const parseNetWorth = (nwStr?: string): number => {
  if (!nwStr) return 0;
  const clean = nwStr.replace(/[^\d.]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return num; // e.g., "$500,000" to 500000
};

const parseTimeline = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const matches = timeStr.match(/\d+/g);
  if (!matches) return 0;
  return Math.max(...matches.map(Number)); // e.g., "6-12 months" to 12
};

export function CapitalEstimator() {
  const researchedStates = useMemo(() => states.filter(s => s.tier !== 'Unresearched'), []);
  const [selectedIds, setSelectedIds] = useState<string[]>(['TX', 'WY', 'CA']);

  const toggleState = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectCohort = (phase: 'Phase 1' | 'Phase 2' | 'Phase 3' | 'All') => {
    if (phase === 'All') {
      setSelectedIds(researchedStates.map(s => s.id));
    } else {
      setSelectedIds(researchedStates.filter(s => s.phase === phase).map(s => s.id));
    }
  };

  // Selected state objects
  const selectedStatesData = useMemo(() => {
    return states.filter(s => selectedIds.includes(s.id));
  }, [selectedIds]);

  // Aggregate numbers
  const totals = useMemo(() => {
    let licensingFees = 0;
    let suretyBonds = 0;
    let minNetWorth = 0;
    let longestTimeline = 0;

    selectedStatesData.forEach(s => {
      licensingFees += parseCost(s.estCost);
      suretyBonds += parseBond(s.suretyBond);
      
      const nw = parseNetWorth(s.minNetWorth);
      if (nw > minNetWorth) minNetWorth = nw;

      const timeline = parseTimeline(s.estTimeline);
      if (timeline > longestTimeline) longestTimeline = timeline;
    });

    return { licensingFees, suretyBonds, minNetWorth, longestTimeline };
  }, [selectedStatesData]);

  // Formatter helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Licensing Capital &amp; Cost Estimator</h1>
        <p className="text-sm text-grey-dark mt-1">
          Estimate aggregate state filing fees, required surety bond collateral, and the overall net worth ceiling for custom rollout scopes.
        </p>
      </div>

      {/* KPI Card Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Cost */}
        <Card>
          <CardBody className="space-y-2">
            <div className="flex justify-between items-center text-grey dark:text-grey-light">
              <span className="text-xs font-semibold uppercase tracking-wider">Licensing Fees</span>
              <DollarSign size={16} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-navy dark:text-ice">
                {formatCurrency(totals.licensingFees)}
              </div>
              <p className="text-[10px] text-grey-dark mt-1">Sum of estimated state application costs.</p>
            </div>
          </CardBody>
        </Card>

        {/* Surety Bonds */}
        <Card>
          <CardBody className="space-y-2">
            <div className="flex justify-between items-center text-grey dark:text-grey-light">
              <span className="text-xs font-semibold uppercase tracking-wider">Surety Bonds</span>
              <Landmark size={16} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-navy dark:text-ice">
                {formatCurrency(totals.suretyBonds)}
              </div>
              <p className="text-[10px] text-grey-dark mt-1">Cumulative bond collateral requirement.</p>
            </div>
          </CardBody>
        </Card>

        {/* Net Worth Ceiling */}
        <Card>
          <CardBody className="space-y-2">
            <div className="flex justify-between items-center text-grey dark:text-grey-light">
              <span className="text-xs font-semibold uppercase tracking-wider">Req. Net Worth</span>
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-navy dark:text-ice">
                {formatCurrency(totals.minNetWorth)}
              </div>
              <p className="text-[10px] text-grey-dark mt-1">Maximum net worth ceiling (satisfies all states).</p>
            </div>
          </CardBody>
        </Card>

        {/* Timeline */}
        <Card>
          <CardBody className="space-y-2">
            <div className="flex justify-between items-center text-grey dark:text-grey-light">
              <span className="text-xs font-semibold uppercase tracking-wider">Max Timeline</span>
              <Clock size={16} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-navy dark:text-ice">
                {totals.longestTimeline ? `${totals.longestTimeline} Months` : '0 Months'}
              </div>
              <p className="text-[10px] text-grey-dark mt-1">Estimated duration of longest state gate.</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Selectors and Breakdown Panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left Column: Selectors */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center border-b border-line px-4 py-3 font-semibold">
              <span>Select Rollout Scope</span>
              <span className="text-xs font-normal text-grey">{selectedIds.length} states</span>
            </CardHeader>
            <CardBody className="space-y-3 p-3">
              {/* Cohort helper buttons */}
              <div className="flex flex-wrap gap-1 border-b border-line pb-2.5">
                <button onClick={() => selectCohort('Phase 1')} className="text-[10px] border border-line rounded px-2 py-0.5 hover:bg-ice-soft bg-card font-medium text-navy dark:text-ice">Phase 1</button>
                <button onClick={() => selectCohort('Phase 2')} className="text-[10px] border border-line rounded px-2 py-0.5 hover:bg-ice-soft bg-card font-medium text-navy dark:text-ice">Phase 2</button>
                <button onClick={() => selectCohort('Phase 3')} className="text-[10px] border border-line rounded px-2 py-0.5 hover:bg-ice-soft bg-card font-medium text-navy dark:text-ice">Phase 3</button>
                <button onClick={() => selectCohort('All')} className="text-[10px] border border-line rounded px-2 py-0.5 hover:bg-ice-soft bg-card font-medium text-navy dark:text-ice">Select All</button>
              </div>

              {/* State check list */}
              <div className="max-h-72 overflow-y-auto space-y-1">
                {researchedStates.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggleState(s.id)}
                    className="flex items-center gap-2 text-xs text-left w-full hover:bg-ice-soft dark:hover:bg-ice-soft/10 p-1.5 rounded transition-colors text-navy dark:text-ice"
                  >
                    {selectedIds.includes(s.id) ? (
                      <CheckSquare className="text-navy dark:text-ice h-4 w-4 shrink-0" />
                    ) : (
                      <Square className="text-grey dark:text-grey-light h-4 w-4 shrink-0" />
                    )}
                    <span className="flex-1 font-medium">{s.name} ({s.abbreviation})</span>
                    <span className="text-[10px] text-grey">{s.phase}</span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Breakdown Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-line px-4 py-3 font-semibold">Jurisdiction Cost Breakdown</CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-navy dark:text-ice">
                  <thead>
                    <tr className="border-b border-line bg-ice-soft dark:bg-ice-soft/10 text-[10px] uppercase font-bold tracking-wider">
                      <th className="px-4 py-2.5">State</th>
                      <th className="px-4 py-2.5">Licensing Fee</th>
                      <th className="px-4 py-2.5">Surety Bond</th>
                      <th className="px-4 py-2.5">Required Net Worth</th>
                      <th className="px-4 py-2.5 text-right">Est. Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStatesData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-grey-dark">No states selected. Select states on the left to see the cost details.</td>
                      </tr>
                    ) : (
                      selectedStatesData.map(s => (
                        <tr key={s.id} className="border-b border-line last:border-0 hover:bg-ice-soft/40">
                          <td className="px-4 py-3 font-bold">{s.name} ({s.abbreviation})</td>
                          <td className="px-4 py-3">{formatCurrency(parseCost(s.estCost))}</td>
                          <td className="px-4 py-3">{formatCurrency(parseBond(s.suretyBond))}</td>
                          <td className="px-4 py-3">{formatCurrency(parseNetWorth(s.minNetWorth))}</td>
                          <td className="px-4 py-3 text-right font-medium">{s.estTimeline || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
