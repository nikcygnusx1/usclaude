import { useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '@/hooks/useGraph';
import { Modal, Badge } from '@/components/ui';
import { toBadgeStatus } from '@/lib/status';
import { RegulatoryNode } from '@/types/ontology';

const legend: { label: string; color: string }[] = [
  { label: 'Ready', color: '#10b981' },
  { label: 'Conditional', color: '#f59e0b' },
  { label: 'Blocked', color: '#ef4444' },
  { label: 'Needs verification / Deferred', color: '#94a3b8' },
];

export function OntologyExplorer() {
  const { nodes, edges, nodeCount, edgeCount } = useGraph();
  const [selected, setSelected] = useState<RegulatoryNode | null>(null);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ontology Explorer</h1>
          <p className="text-sm text-grey-dark mt-1">{nodeCount} nodes · {edgeCount} edges. Click a node for detail. Use sidebar filters to narrow the graph.</p>
        </div>
        <div className="flex gap-3 text-xs">
          {legend.map(l => (
            <span key={l.label} className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} /> {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[500px] rounded-lg border border-line bg-card">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={(_, node: Node) => setSelected(node.data.node as RegulatoryNode)}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} color="#e2e8f0" />
          <Controls />
          <MiniMap pannable zoomable style={{ background: 'var(--card)' }} />
        </ReactFlow>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.label ?? ''}>
        {selected && (
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge status={toBadgeStatus(selected.status)}>{selected.status}</Badge>
              <span className="text-xs rounded-full border border-line px-2 py-0.5 capitalize">{selected.type}</span>
              <span className="text-xs rounded-full border border-line px-2 py-0.5">{selected.phase}</span>
            </div>
            <pre className="whitespace-pre-wrap text-xs bg-ice-soft rounded-md p-3 overflow-auto max-h-64">
              {JSON.stringify(selected.data, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
}
