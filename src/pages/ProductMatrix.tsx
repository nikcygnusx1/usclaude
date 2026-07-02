import { useState, useMemo } from 'react';
import { products, requirements, domains } from '@/data';
import { Badge, Modal } from '@/components/ui';
import { toBadgeStatus } from '@/lib/status';
import { Product } from '@/types/ontology';
import { useFilterStore } from '@/stores/useFilterStore';

export function ProductMatrix() {
  const [selected, setSelected] = useState<Product | null>(null);
  const { selectedStatuses, selectedPhases, selectedDomains, searchQuery } = useFilterStore();

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Filter by status
      if (selectedStatuses.length && !selectedStatuses.includes(p.status)) return false;
      
      // 2. Filter by phase
      if (selectedPhases.length && !selectedPhases.includes(p.phase)) return false;
      
      // 3. Filter by search query (on name or description)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      
      // 4. Filter by domain (matches if any of the product's requirements fall under selected domains)
      if (selectedDomains.length) {
        const productHasMatchingDomain = p.requirements.some(rid => {
          const req = requirements.find(r => r.id === rid);
          if (!req) return false;
          const dom = domains.find(d => d.name === req.domain);
          return dom && selectedDomains.includes(dom.id);
        });
        if (!productHasMatchingDomain) return false;
      }
      
      return true;
    });
  }, [selectedStatuses, selectedPhases, selectedDomains, searchQuery]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Product Matrix</h1>
        <p className="text-sm text-grey-dark mt-1">Architecture options and listed assets, mapped to the requirements that gate each one.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="w-full text-sm text-navy dark:text-ice">
          <thead>
            <tr className="border-b border-line bg-ice-soft dark:bg-ice-soft/10 text-left">
              <th className="px-3 py-2 font-semibold">Product / Asset</th>
              <th className="px-3 py-2 font-semibold">Category</th>
              <th className="px-3 py-2 font-semibold">Howey Score</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Phase</th>
              <th className="px-3 py-2 font-semibold">Requirements</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-grey-dark">No products match the selected filters.</td>
              </tr>
            ) : (
              filteredProducts.map(p => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-ice-soft/60 cursor-pointer" onClick={() => setSelected(p)}>
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2">{p.category}</td>
                  <td className="px-3 py-2">
                    {p.howeyScore !== undefined ? (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.howeyScore >= 70 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                        p.howeyScore >= 40 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {p.howeyScore}%
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="px-3 py-2"><Badge status={toBadgeStatus(p.status)}>{p.status}</Badge></td>
                  <td className="px-3 py-2">{p.phase}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {p.requirements.map(rid => {
                        const req = requirements.find(r => r.id === rid);
                        return req ? (
                          <span key={rid} className="text-xs rounded-full border border-line px-2 py-0.5">{req.name}</span>
                        ) : null;
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className="space-y-3 text-sm text-navy dark:text-ice">
            <div className="flex flex-wrap gap-2">
              <Badge status={toBadgeStatus(selected.status)}>{selected.status}</Badge>
              <span className="text-xs rounded-full border border-line px-2 py-0.5">{selected.category}</span>
              <span className="text-xs rounded-full border border-line px-2 py-0.5">{selected.phase}</span>
            </div>
            <p>{selected.description}</p>
            {selected.risks.length > 0 && (
              <div>
                <p className="font-semibold mb-1">Risks</p>
                <ul className="list-disc list-inside text-grey-dark dark:text-grey-light space-y-1">
                  {selected.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* Howey Prong Details */}
            {selected.howeyScore !== undefined && (
              <div className="pt-2 border-t border-line mt-2 space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <span>Howey Securities Probability Score:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selected.howeyScore >= 70 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                    selected.howeyScore >= 40 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  }`}>{selected.howeyScore}%</span>
                </p>
                {selected.howeyAnalysis && (
                  <div className="bg-ice-soft dark:bg-ice-soft/10 rounded p-2.5 text-xs space-y-2 border border-line">
                    <p><strong>1. Investment of Money:</strong> {selected.howeyAnalysis.investmentOfMoney}</p>
                    <p><strong>2. Common Enterprise:</strong> {selected.howeyAnalysis.commonEnterprise}</p>
                    <p><strong>3. Profit Expectation:</strong> {selected.howeyAnalysis.profitExpectation}</p>
                    <p><strong>4. Efforts of Others:</strong> {selected.howeyAnalysis.effortsOfOthers}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
