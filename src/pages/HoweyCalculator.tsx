import { useState, useEffect } from 'react';
import { products } from '@/data';
import { Card, CardHeader, CardBody, Badge } from '@/components/ui';

type SelectedAsset = 'LCX_TOKEN' | 'BTC' | 'ETH' | 'CUSTOM';

export function HoweyCalculator() {
  const [assetKey, setAssetKey] = useState<SelectedAsset>('LCX_TOKEN');
  
  // Custom sliders state (only used if assetKey is 'CUSTOM')
  const [prong1, setProng1] = useState<number>(5); // Investment of Money (0-10)
  const [prong2, setProng2] = useState<number>(5); // Common Enterprise (0-10)
  const [prong3, setProng3] = useState<number>(5); // Expectation of Profit (0-10)
  const [prong4, setProng4] = useState<number>(5); // Efforts of Others (0-10)

  const selectedProduct = products.find(p => p.id === assetKey);

  // Calculate score
  let finalScore = 0;
  if (assetKey === 'CUSTOM') {
    finalScore = Math.round(((prong1 + prong2 + prong3 + prong4) / 40) * 100);
  } else if (selectedProduct && selectedProduct.howeyScore !== undefined) {
    finalScore = selectedProduct.howeyScore;
  }

  // Pre-fill sliders when preset asset changes
  useEffect(() => {
    if (assetKey === 'LCX_TOKEN') {
      setProng1(8); setProng2(8); setProng3(9); setProng4(9);
    } else if (assetKey === 'BTC') {
      setProng1(1); setProng2(0); setProng3(1); setProng4(0);
    } else if (assetKey === 'ETH') {
      setProng1(2); setProng2(2); setProng3(3); setProng4(1);
    }
  }, [assetKey]);

  // Determine risk profile details
  const getRiskLabel = (score: number) => {
    if (score >= 70) return { label: 'High Securities Risk', color: 'text-red-500 border-red-500 bg-red-500/10' };
    if (score >= 40) return { label: 'Medium Securities Risk', color: 'text-amber-500 border-amber-500 bg-amber-500/10' };
    return { label: 'Low Commodity Classification', color: 'text-green-500 border-green-500 bg-green-500/10' };
  };

  const risk = getRiskLabel(finalScore);

  return (
    <div className="space-y-4 text-navy dark:text-ice">
      <div>
        <h1 className="text-2xl font-bold">Howey Token Assessment Tool</h1>
        <p className="text-sm text-grey-dark mt-1">
          Evaluate tokens against the four prongs of the SEC v. Howey Test to determine U.S. securities classification risk.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left Column: Asset Selection & Prong Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>Asset Selector</CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {(['LCX_TOKEN', 'BTC', 'ETH', 'CUSTOM'] as SelectedAsset[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setAssetKey(k)}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                      assetKey === k
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'border-line bg-card hover:bg-ice-soft text-navy dark:text-ice'
                    }`}
                  >
                    {k === 'LCX_TOKEN' ? 'LCX Token' : k === 'BTC' ? 'Bitcoin (BTC)' : k === 'ETH' ? 'Ethereum (ETH)' : 'Custom Token'}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Interactive Checklist Cards */}
          <div className="space-y-3 font-mono">
            {/* Prong 1 */}
            <Card>
              <CardBody className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-grey">Prong 1: Investment of Money</h3>
                  {assetKey === 'CUSTOM' ? (
                    <span className="text-xs font-bold text-navy dark:text-ice px-2 py-0.5 bg-ice-soft dark:bg-ice-soft/10 rounded">{prong1}/10</span>
                  ) : (
                    <Badge status={prong1 >= 5 ? 'blocked' : 'ready'}>{prong1 >= 5 ? 'Met' : 'Not Met'}</Badge>
                  )}
                </div>
                <p className="text-xs text-grey-dark dark:text-grey-light font-sans">Does the asset purchase involve a transfer of fiat or other virtual assets in exchange for the token?</p>
                {assetKey === 'CUSTOM' ? (
                  <input type="range" min="0" max="10" value={prong1} onChange={e => setProng1(parseInt(e.target.value))} className="w-full accent-navy dark:accent-ice" />
                ) : (
                  <p className="text-xs italic bg-ice-soft dark:bg-ice-soft/10 p-2.5 rounded font-sans">"{selectedProduct?.howeyAnalysis?.investmentOfMoney}"</p>
                )}
              </CardBody>
            </Card>

            {/* Prong 2 */}
            <Card>
              <CardBody className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-grey">Prong 2: Common Enterprise</h3>
                  {assetKey === 'CUSTOM' ? (
                    <span className="text-xs font-bold text-navy dark:text-ice px-2 py-0.5 bg-ice-soft dark:bg-ice-soft/10 rounded">{prong2}/10</span>
                  ) : (
                    <Badge status={prong2 >= 5 ? 'blocked' : 'ready'}>{prong2 >= 5 ? 'Met' : 'Not Met'}</Badge>
                  )}
                </div>
                <p className="text-xs text-grey-dark dark:text-grey-light font-sans">Are investors’ fortunes pooled together (horizontal commonality) or linked to the promoter (vertical commonality)?</p>
                {assetKey === 'CUSTOM' ? (
                  <input type="range" min="0" max="10" value={prong2} onChange={e => setProng2(parseInt(e.target.value))} className="w-full accent-navy dark:accent-ice" />
                ) : (
                  <p className="text-xs italic bg-ice-soft dark:bg-ice-soft/10 p-2.5 rounded font-sans">"{selectedProduct?.howeyAnalysis?.commonEnterprise}"</p>
                )}
              </CardBody>
            </Card>

            {/* Prong 3 */}
            <Card>
              <CardBody className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-grey">Prong 3: Expectation of Profits</h3>
                  {assetKey === 'CUSTOM' ? (
                    <span className="text-xs font-bold text-navy dark:text-ice px-2 py-0.5 bg-ice-soft dark:bg-ice-soft/10 rounded">{prong3}/10</span>
                  ) : (
                    <Badge status={prong3 >= 5 ? 'blocked' : 'ready'}>{prong3 >= 5 ? 'Met' : 'Not Met'}</Badge>
                  )}
                </div>
                <p className="text-xs text-grey-dark dark:text-grey-light font-sans">Are buyers purchasing with the intent of price appreciation, staking yields, or deflate-and-burn reward mechanics?</p>
                {assetKey === 'CUSTOM' ? (
                  <input type="range" min="0" max="10" value={prong3} onChange={e => setProng3(parseInt(e.target.value))} className="w-full accent-navy dark:accent-ice" />
                ) : (
                  <p className="text-xs italic bg-ice-soft dark:bg-ice-soft/10 p-2.5 rounded font-sans">"{selectedProduct?.howeyAnalysis?.profitExpectation}"</p>
                )}
              </CardBody>
            </Card>

            {/* Prong 4 */}
            <Card>
              <CardBody className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-grey">Prong 4: Derived from the Efforts of Others</h3>
                  {assetKey === 'CUSTOM' ? (
                    <span className="text-xs font-bold text-navy dark:text-ice px-2 py-0.5 bg-ice-soft dark:bg-ice-soft/10 rounded">{prong4}/10</span>
                  ) : (
                    <Badge status={prong4 >= 5 ? 'blocked' : 'ready'}>{prong4 >= 5 ? 'Met' : 'Not Met'}</Badge>
                  )}
                </div>
                <p className="text-xs text-grey-dark dark:text-grey-light font-sans">Does the token value rely on the managerial, operational, or marketing efforts of a central group, issuer, or promoter?</p>
                {assetKey === 'CUSTOM' ? (
                  <input type="range" min="0" max="10" value={prong4} onChange={e => setProng4(parseInt(e.target.value))} className="w-full accent-navy dark:accent-ice" />
                ) : (
                  <p className="text-xs italic bg-ice-soft dark:bg-ice-soft/10 p-2.5 rounded font-sans">"{selectedProduct?.howeyAnalysis?.effortsOfOthers}"</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Right Column: Securities Risk Gauge & Recommendations */}
        <div className="space-y-4">
          <Card>
            <CardHeader>Securities Probability Rating</CardHeader>
            <CardBody className="flex flex-col items-center justify-center p-6 space-y-4">
              {/* Dynamic Circular SVG Gauge */}
              <div className="relative flex items-center justify-center h-36 w-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--line)" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={finalScore >= 70 ? '#ef4444' : finalScore >= 40 ? '#f59e0b' : '#10b981'}
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - finalScore / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center font-mono">
                  <span className="text-3xl font-extrabold text-navy dark:text-ice">{finalScore}%</span>
                  <span className="text-[9px] text-grey uppercase tracking-wider font-bold">Risk</span>
                </div>
              </div>

              {/* Risk Status Badge */}
              <div className={`text-center rounded-full border px-3 py-1 text-xs font-bold ${risk.color}`}>
                {risk.label}
              </div>

              <div className="text-xs text-grey-dark dark:text-grey-light text-center space-y-2 border-t border-line pt-4 w-full">
                <p className="font-sans leading-relaxed">
                  <strong>Current Guidance</strong>: {finalScore >= 70
                    ? 'Classified as high-risk under SEC standards. Offering is restricted to registered broker-dealer vectors only; retail listing is blocked.'
                    : finalScore >= 40
                    ? 'Moderate risk profile. Listing requires per-asset legal opinions, detailed conflicts disclosure, and strict marketing claims discipline.'
                    : 'Low-risk digital commodity status. Spot listing is supported under CFTC parameters, pending local state money transmitter compliance.'
                  }
                </p>
              </div>
            </CardBody>
          </Card>

          {/* LCX Token Specific Conflicts Box */}
          {assetKey === 'LCX_TOKEN' && (
            <Card status="blocked">
              <CardHeader className="text-status-blocked border-b border-line px-4 py-3 font-bold bg-red-50/50 dark:bg-red-950/10">
                ⚠️ LCX Token Gating conflicts
              </CardHeader>
              <CardBody className="text-xs space-y-3 font-mono leading-normal">
                <div>
                  <span className="font-bold text-[10px] text-red-500 block uppercase">[Self-Listing Conflict]</span>
                  <p className="text-grey-dark dark:text-grey-light font-sans text-xs mt-0.5">
                    Listing your own exchange token creates direct conflicts. Under SEC/BitLicense rules, self-listing triggers strict disclosure audits.
                  </p>
                </div>
                <div>
                  <span className="font-bold text-[10px] text-red-500 block uppercase">[Staking Yield Program]</span>
                  <p className="text-grey-dark dark:text-grey-light font-sans text-xs mt-0.5">
                    Guaranteed staking rewards or deflationary burn mechanics are classified as investment contracts, representing the highest Howey prong risk.
                  </p>
                </div>
                <div>
                  <span className="font-bold text-[10px] text-red-500 block uppercase">[Ex-U.S. Conflation Risk]</span>
                  <p className="text-grey-dark dark:text-grey-light font-sans text-xs mt-0.5">
                    Liechtenstein regulatory status or EU MiCA passporting provides no authorization inside U.S. boundaries. Treat as strictly separate.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
