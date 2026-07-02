import { useState, useMemo } from 'react';
import { states, products, readinessItems } from '@/data';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { Printer, CheckSquare, Square } from 'lucide-react';
import { ReadinessItem } from '@/types/ontology';

export function BriefGenerator() {
  // Researched states list
  const researchedStates = useMemo(() => states.filter(s => s.tier !== 'Unresearched'), []);
  
  // Selected states
  const [selectedStateIds, setSelectedStateIds] = useState<string[]>(['TX', 'WY', 'CA']);
  
  // Selected products
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(['NONCUSTODIAL_WALLET', 'LCX_TOKEN']);

  // Fetch readiness items from localStorage
  const activeReadinessItems = useMemo<ReadinessItem[]>(() => {
    const saved = localStorage.getItem('lcx-readiness-stack');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return readinessItems;
  }, []);

  // Toggle state selection
  const toggleState = (id: string) => {
    setSelectedStateIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Toggle product selection
  const toggleProduct = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Select all / None helper
  const selectAllStates = () => setSelectedStateIds(researchedStates.map(s => s.id));
  const selectNoStates = () => setSelectedStateIds([]);

  // Computed data for memo
  const selectedStatesData = useMemo(() => {
    return states.filter(s => selectedStateIds.includes(s.id));
  }, [selectedStateIds]);

  const selectedProductsData = useMemo(() => {
    return products.filter(p => selectedProductIds.includes(p.id));
  }, [selectedProductIds]);

  // Average Howey score
  const avgHoweyScore = useMemo(() => {
    if (!selectedProductsData.length) return 0;
    const total = selectedProductsData.reduce((sum, p) => sum + (p.howeyScore ?? 0), 0);
    return Math.round(total / selectedProductsData.length);
  }, [selectedProductsData]);

  // Outstanding blockers (not completed readiness items gating selected products)
  const outstandingBlockers = useMemo(() => {
    return activeReadinessItems.filter(item => {
      if (item.status === 'Complete') return false;
      // Map item category to product gate (e.g. CCO gates MSB / standard setups)
      return true;
    });
  }, [activeReadinessItems]);

  // Check if any product is custodial
  const isCustodialSelected = useMemo(() => {
    return selectedProductsData.some(p => p.id === 'CUSTODY' || p.id === 'EXCHANGE' || p.id === 'FIAT_RAMP');
  }, [selectedProductsData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Print media layout styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print">
        <h1 className="text-2xl font-bold">Regulatory Brief Generator</h1>
        <p className="text-sm text-grey-dark mt-1">
          Compile custom state-rollout cost matrices and regulatory impact analyses into an official printed briefing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Selector Panel (Left) */}
        <div className="lg:col-span-1 space-y-4 no-print">
          {/* State Selector */}
          <Card>
            <CardHeader className="flex items-center justify-between border-b border-line px-4 py-3 font-semibold">
              <span>Select States</span>
              <div className="flex gap-2 text-xs">
                <button onClick={selectAllStates} className="text-navy dark:text-ice hover:underline">All</button>
                <span className="text-line">|</span>
                <button onClick={selectNoStates} className="text-navy dark:text-ice hover:underline">None</button>
              </div>
            </CardHeader>
            <CardBody className="max-h-60 overflow-y-auto space-y-1.5 p-3">
              {researchedStates.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleState(s.id)}
                  className="flex items-center gap-2 text-xs text-left w-full hover:bg-ice-soft dark:hover:bg-ice-soft/10 p-1 rounded transition-colors text-navy dark:text-ice"
                >
                  {selectedStateIds.includes(s.id) ? (
                    <CheckSquare className="text-navy dark:text-ice h-4 w-4 shrink-0" />
                  ) : (
                    <Square className="text-grey dark:text-grey-light h-4 w-4 shrink-0" />
                  )}
                  <span>{s.name} ({s.abbreviation})</span>
                </button>
              ))}
            </CardBody>
          </Card>

          {/* Product Selector */}
          <Card>
            <CardHeader className="border-b border-line px-4 py-3 font-semibold">Select Products / Assets</CardHeader>
            <CardBody className="space-y-1.5 p-3">
              {products.map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className="flex items-center gap-2 text-xs text-left w-full hover:bg-ice-soft dark:hover:bg-ice-soft/10 p-1 rounded transition-colors text-navy dark:text-ice"
                >
                  {selectedProductIds.includes(p.id) ? (
                    <CheckSquare className="text-navy dark:text-ice h-4 w-4 shrink-0" />
                  ) : (
                    <Square className="text-grey dark:text-grey-light h-4 w-4 shrink-0" />
                  )}
                  <span>{p.name}</span>
                </button>
              ))}
            </CardBody>
          </Card>

          {/* Action Panel */}
          <button
            onClick={handlePrint}
            disabled={!selectedStateIds.length || !selectedProductIds.length}
            className="flex items-center justify-center gap-2 w-full bg-navy text-white hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md py-2.5 font-semibold text-sm transition-colors shadow-md"
          >
            <Printer size={16} /> Print Compliance Memo
          </button>
        </div>

        {/* Printable Memo Preview (Right) */}
        <div className="lg:col-span-2">
          <div
            id="print-area"
            className="bg-white text-black border border-line shadow-lg rounded-lg p-8 max-w-2xl mx-auto space-y-6 font-serif leading-relaxed"
          >
            {/* Memo Header */}
            <div className="border-b-4 border-black pb-4 text-sm font-sans space-y-1.5">
              <div className="text-3xl font-extrabold tracking-tight uppercase font-serif mb-3">MEMORANDUM</div>
              <div><strong>DATE:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div><strong>TO:</strong> LCX Executive Board &amp; General Counsel</div>
              <div><strong>FROM:</strong> LCX USA Compliance Committee</div>
              <div>
                <strong>SUBJECT:</strong> Regulatory Brief — U.S. Rollout Strategy &amp; Gating Blocks
              </div>
            </div>

            {/* Selection Check warning */}
            {(!selectedStateIds.length || !selectedProductIds.length) && (
              <div className="text-center py-10 font-sans text-grey-dark italic">
                Please select at least one state and product in the left panel to compile the memo.
              </div>
            )}

            {selectedStateIds.length > 0 && selectedProductIds.length > 0 && (
              <>
                {/* 1. Executive Summary */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-base uppercase tracking-wider border-b border-black pb-1">
                    1. Executive Rollout Summary
                  </h3>
                  <p className="text-xs">
                    This brief analyzes the regulatory feasibility of launching the proposed LCX USA product suite across 
                    <strong> {selectedStateIds.length} selected U.S. jurisdictions</strong>. The calculated aggregate Howey Test risk 
                    rating is <strong className="text-red-700">{avgHoweyScore}%</strong>, indicating 
                    {avgHoweyScore >= 70 ? ' high securities classification risk.' : avgHoweyScore >= 40 ? ' moderate hybrid risk.' : ' low commodities exposure.'}
                  </p>
                </div>

                {/* 2. Target Product Scope */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-base uppercase tracking-wider border-b border-black pb-1">
                    2. Product Scope &amp; Howey Rating
                  </h3>
                  <table className="w-full text-left text-xs font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="py-1">Product / Asset</th>
                        <th className="py-1">Category</th>
                        <th className="py-1 text-right">Howey Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProductsData.map(p => (
                        <tr key={p.id} className="border-b border-gray-200">
                          <td className="py-1.5 font-medium">{p.name}</td>
                          <td className="py-1.5">{p.category}</td>
                          <td className="py-1.5 text-right font-bold">{p.howeyScore}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 3. State Jurisdiction Pipeline */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-base uppercase tracking-wider border-b border-black pb-1">
                    3. State Licensing &amp; Cost Requirements
                  </h3>
                  <table className="w-full text-left text-xs font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="py-1">State</th>
                        <th className="py-1">Regime Type</th>
                        <th className="py-1">Surety Bond</th>
                        <th className="py-1">Est. Cost</th>
                        <th className="py-1 text-right">Timeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStatesData.map(s => (
                        <tr key={s.id} className="border-b border-gray-200">
                          <td className="py-1.5 font-medium">{s.name}</td>
                          <td className="py-1.5">{s.regimeType}</td>
                          <td className="py-1.5">{s.suretyBond || 'None'}</td>
                          <td className="py-1.5">{s.estCost || 'N/A'}</td>
                          <td className="py-1.5 text-right">{s.estTimeline || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. CFIUS Alert Box */}
                {isCustodialSelected && (
                  <div className="border border-red-800 bg-red-50 p-3 rounded font-sans text-xs space-y-1.5 text-red-950">
                    <div className="font-bold flex items-center gap-1">
                      ⚠️ CFIUS Foreign Control Alert (LCX AG)
                    </div>
                    <p>
                      Custodial products trigger mandatory CFIUS voluntary disclosures due to foreign parent ownership (LCX AG, Liechtenstein) exceeding 25% control. Passive investor covenants must be formally signed by counsel to restrict voting power &lt;10% and block tech data access.
                    </p>
                  </div>
                )}

                {/* 5. Outstanding Operational Blockers */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-base uppercase tracking-wider border-b border-black pb-1">
                    4. Outstanding Gating Blockers
                  </h3>
                  <p className="text-xs italic mb-2">
                    Below are the required U.S. compliance items that are not yet marked 'Complete' in the Readiness Stack:
                  </p>
                  {outstandingBlockers.length === 0 ? (
                    <p className="text-xs text-green-700 font-sans">✓ All required operational ready documents and surveillance systems are completed.</p>
                  ) : (
                    <ul className="list-disc list-inside text-xs font-sans space-y-1 pl-1">
                      {outstandingBlockers.slice(0, 8).map(b => (
                        <li key={b.id}>
                          <strong>{b.name}</strong> ({b.category}): Gating for <em>{b.gatingFor}</em>. Notes: {b.notes}
                        </li>
                      ))}
                      {outstandingBlockers.length > 8 && (
                        <li className="italic text-gray-500">And {outstandingBlockers.length - 8} other compliance gating items...</li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Footnote */}
                <div className="border-t border-gray-300 pt-3 text-[10px] text-gray-500 font-sans leading-tight">
                  Disclaimer: This brief aggregates parameters from the LCX USA multi-agent research transcript. 
                  It represents operational and strategic mapping, not final binding legal opinions from licensed counsel.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
