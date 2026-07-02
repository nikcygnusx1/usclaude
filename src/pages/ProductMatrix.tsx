import { useState } from 'react';
import { products, requirements } from '@/data';
import { Badge, Modal } from '@/components/ui';
import { toBadgeStatus } from '@/lib/status';
import { Product } from '@/types/ontology';

export function ProductMatrix() {
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Product Matrix</h1>
        <p className="text-sm text-grey-dark mt-1">Architecture options and listed assets, mapped to the requirements that gate each one.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-ice-soft text-left">
              <th className="px-3 py-2 font-semibold">Product / Asset</th>
              <th className="px-3 py-2 font-semibold">Category</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Phase</th>
              <th className="px-3 py-2 font-semibold">Requirements</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-ice-soft/60 cursor-pointer" onClick={() => setSelected(p)}>
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2">{p.category}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge status={toBadgeStatus(selected.status)}>{selected.status}</Badge>
              <span className="text-xs rounded-full border border-line px-2 py-0.5">{selected.category}</span>
              <span className="text-xs rounded-full border border-line px-2 py-0.5">{selected.phase}</span>
            </div>
            <p>{selected.description}</p>
            {selected.risks.length > 0 && (
              <div>
                <p className="font-medium mb-1">Risks</p>
                <ul className="list-disc list-inside text-grey-dark space-y-1">
                  {selected.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
