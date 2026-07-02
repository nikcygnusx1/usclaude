import { useState, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '@/hooks/useGraph';
import { Badge, InspectorDrawer, CustomOntologyNode } from '@/components/ui';
import { toBadgeStatus } from '@/lib/status';
import { RegulatoryNode } from '@/types/ontology';
import { states, products, requirements } from '@/data';
import { clsx } from 'clsx';

const nodeTypes = {
  custom: CustomOntologyNode,
};

export function OntologyExplorer() {
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
  const { nodes, edges, nodeCount, edgeCount } = useGraph(layoutDirection);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<RegulatoryNode | null>(null);

  // Compute highlighted dependencies (upstream ancestors + downstream descendants)
  const highlightedNodeIds = useMemo(() => {
    const activeId = hoveredNodeId || selectedNodeId;
    if (!activeId) return new Set<string>();

    const visited = new Set<string>([activeId]);
    
    // BFS Upstream (Ancestors/Dependencies)
    const incoming: Record<string, string[]> = {};
    edges.forEach(e => {
      if (!incoming[e.target]) incoming[e.target] = [];
      incoming[e.target].push(e.source);
    });

    const queueUp = [activeId];
    while (queueUp.length > 0) {
      const curr = queueUp.shift()!;
      const parents = incoming[curr] || [];
      parents.forEach(p => {
        if (!visited.has(p)) {
          visited.add(p);
          queueUp.push(p);
        }
      });
    }

    // BFS Downstream (Descendants/Gated Items)
    const outgoing: Record<string, string[]> = {};
    edges.forEach(e => {
      if (!outgoing[e.source]) outgoing[e.source] = [];
      outgoing[e.source].push(e.target);
    });

    const queueDown = [activeId];
    while (queueDown.length > 0) {
      const curr = queueDown.shift()!;
      const children = outgoing[curr] || [];
      children.forEach(c => {
        if (!visited.has(c)) {
          visited.add(c);
          queueDown.push(c);
        }
      });
    }

    return visited;
  }, [hoveredNodeId, selectedNodeId, edges]);

  // Process nodes with highlighted/dimmed flags
  const processedNodes = useMemo(() => {
    const activeId = hoveredNodeId || selectedNodeId;
    if (!activeId) return nodes;

    return nodes.map(n => {
      const isHighlighted = n.id === activeId || (selectedNodeId === n.id);
      const isDimmed = !highlightedNodeIds.has(n.id);
      return {
        ...n,
        data: {
          ...(n.data as object),
          isHighlighted,
          isDimmed,
        },
      };
    });
  }, [hoveredNodeId, selectedNodeId, nodes, highlightedNodeIds]);

  // Process edges with opacity dims and animated flow lines
  const processedEdges = useMemo(() => {
    const activeId = hoveredNodeId || selectedNodeId;
    if (!activeId) return edges;

    return edges.map(e => {
      const isPath = highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target);
      if (isPath) {
        return {
          ...e,
          animated: true,
          style: {
            ...e.style,
            stroke: '#06b6d4', // Vibrant Cyan highlight path
            strokeWidth: 2,
            opacity: 1,
          },
          markerEnd: typeof e.markerEnd === 'object' && e.markerEnd !== null ? {
            ...e.markerEnd,
            color: '#06b6d4',
          } : '#06b6d4',
        };
      }
      return {
        ...e,
        animated: false,
        style: {
          ...e.style,
          opacity: 0.1, // Dimmed edge
        },
      };
    });
  }, [hoveredNodeId, selectedNodeId, edges, highlightedNodeIds]);

  // Look up full details for selected inspector nodes
  const selectedStateObj = useMemo(() => {
    if (selectedNode?.type === 'state') {
      return states.find(s => s.id === selectedNode.id);
    }
    return null;
  }, [selectedNode]);

  const selectedProductObj = useMemo(() => {
    if (selectedNode?.type === 'product') {
      return products.find(p => p.id === selectedNode.id);
    }
    return null;
  }, [selectedNode]);

  const selectedReqObj = useMemo(() => {
    if (selectedNode?.type === 'requirement') {
      return requirements.find(r => r.id === selectedNode.id);
    }
    return null;
  }, [selectedNode]);

  return (
    <div className="flex h-full flex-col gap-3 text-navy dark:text-ice">
      {/* Page Header info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ontology Graph Explorer</h1>
          <p className="text-sm text-grey-dark mt-1">
            {nodeCount} nodes · {edgeCount} edges. Hover a node to trace dependencies. Click to inspect registry metadata sheets.
          </p>
        </div>
        
        {/* Status indicator badges legend */}
        <div className="flex flex-wrap gap-2.5 text-[10px] font-bold font-mono">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-status-ready" /> READY</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-status-conditional" /> CONDITIONAL</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-status-blocked" /> BLOCKED</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-status-deferred" /> DEFERRED / NEEDS VERIFICATION</span>
        </div>
      </div>

      {/* Main Canvas Card */}
      <div className="flex-1 min-h-[550px] rounded-lg border border-line bg-card relative overflow-hidden shadow-sm">
        {/* Layout controls overlay */}
        <div className="absolute top-3 left-3 z-10 flex gap-1 bg-card/95 backdrop-blur-[2px] border border-line p-1 rounded shadow-md text-[10px] font-mono font-bold">
          <button
            onClick={() => setLayoutDirection('LR')}
            className={clsx('px-2 py-1 rounded transition-colors', layoutDirection === 'LR' ? 'bg-navy text-white' : 'hover:bg-ice-soft dark:hover:bg-ice-soft/10 text-grey-dark dark:text-ice')}
          >
            Horizontal Pipeline
          </button>
          <button
            onClick={() => setLayoutDirection('TB')}
            className={clsx('px-2 py-1 rounded transition-colors', layoutDirection === 'TB' ? 'bg-navy text-white' : 'hover:bg-ice-soft dark:hover:bg-ice-soft/10 text-grey-dark dark:text-ice')}
          >
            Vertical Stack
          </button>
        </div>

        <ReactFlow
          nodes={processedNodes}
          edges={processedEdges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node: Node) => {
            const rawNode = node.data.node as RegulatoryNode;
            setSelectedNode(rawNode);
            setSelectedNodeId(rawNode.id);
          }}
          onNodeMouseEnter={(_, node: Node) => setHoveredNodeId(node.id)}
          onNodeMouseLeave={() => setHoveredNodeId(null)}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} color="var(--line)" className="opacity-45" />
          <Controls className="!bg-card !border-line !shadow-sm dark:!bg-navy" />
          <MiniMap pannable zoomable style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '6px' }} />
        </ReactFlow>
      </div>

      {/* Slide-Out Inspector Drawer */}
      <InspectorDrawer
        isOpen={!!selectedNode}
        onClose={() => {
          setSelectedNode(null);
          setSelectedNodeId(null);
        }}
        title={selectedNode?.label ?? ''}
      >
        {selectedNode && (
          <div className="space-y-4 text-sm text-navy dark:text-ice">
            <div className="flex flex-wrap gap-2">
              <Badge status={toBadgeStatus(selectedNode.status)}>{selectedNode.status}</Badge>
              <span className="text-xs rounded-full border border-line px-2.5 py-0.5 uppercase font-mono">{selectedNode.type}</span>
              <span className="text-xs rounded-full border border-line px-2.5 py-0.5 font-mono">{selectedNode.phase}</span>
            </div>

            {/* Custom Detail Renders based on Node Type */}
            {selectedStateObj && (
              <div className="space-y-3 pt-2">
                <p className="text-xs">{selectedStateObj.notes}</p>
                <div className="space-y-2 border-t border-line pt-3">
                  <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Regime Regime</span> {selectedStateObj.regimeType}</p>
                  {selectedStateObj.minNetWorth && <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Minimum Corporate Net Worth</span> <span className="font-mono text-sm">{selectedStateObj.minNetWorth}</span></p>}
                  {selectedStateObj.suretyBond && <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Surety Bond Collateral</span> <span className="font-mono text-sm">{selectedStateObj.suretyBond}</span></p>}
                  {selectedStateObj.sandboxAvailable !== undefined && (
                    <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Regulatory Sandbox</span> {selectedStateObj.sandboxAvailable ? 'Exemption Available' : 'None'}</p>
                  )}
                  {selectedStateObj.estTimeline && <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Estimated Pipeline Duration</span> <span className="font-mono">{selectedStateObj.estTimeline}</span></p>}
                </div>
              </div>
            )}

            {selectedProductObj && (
              <div className="space-y-3 pt-2">
                <p className="text-xs">{selectedProductObj.description}</p>
                {selectedProductObj.howeyScore !== undefined && (
                  <div className="bg-ice-soft dark:bg-ice-soft/10 rounded p-3 border border-line text-xs space-y-2">
                    <p className="font-bold flex items-center justify-between">
                      <span>Howey Securities Score:</span>
                      <span className="font-mono text-sm">{selectedProductObj.howeyScore}%</span>
                    </p>
                    {selectedProductObj.howeyAnalysis && (
                      <div className="space-y-1.5 pt-1 text-[11px] border-t border-line/50 leading-relaxed">
                        <p><strong>Investment:</strong> {selectedProductObj.howeyAnalysis.investmentOfMoney}</p>
                        <p><strong>Enterprise:</strong> {selectedProductObj.howeyAnalysis.commonEnterprise}</p>
                        <p><strong>Profits:</strong> {selectedProductObj.howeyAnalysis.profitExpectation}</p>
                        <p><strong>Efforts:</strong> {selectedProductObj.howeyAnalysis.effortsOfOthers}</p>
                      </div>
                    )}
                  </div>
                )}
                {selectedProductObj.risks.length > 0 && (
                  <div className="space-y-1.5 border-t border-line pt-3">
                    <span className="font-semibold text-xs text-grey uppercase tracking-wider block">Identified Gating Risks</span>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {selectedProductObj.risks.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectedReqObj && (
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <span className="font-semibold text-xs text-grey uppercase tracking-wider block">Domain Classification</span>
                  <p className="text-sm font-medium">{selectedReqObj.domain}</p>
                </div>
                <div className="space-y-2 border-t border-line pt-3">
                  <span className="font-semibold text-xs text-grey uppercase tracking-wider block">Requirement Description</span>
                  <p className="text-xs leading-relaxed">{selectedReqObj.description}</p>
                </div>
              </div>
            )}

            {/* Standard raw details payload */}
            <div className="pt-2 border-t border-line">
              <details className="group cursor-pointer">
                <summary className="text-[10px] font-bold uppercase tracking-wider text-grey select-none list-none flex items-center gap-1.5">
                  <span className="transition-transform group-open:rotate-90">&rarr;</span>
                  <span>[Technical Registry Payload]</span>
                </summary>
                <pre className="mt-2 p-2.5 rounded bg-ice-soft dark:bg-navy-deep text-[10px] font-mono overflow-x-auto text-navy dark:text-ice border border-line leading-normal">
                  {JSON.stringify(selectedNode.data || selectedNode, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </InspectorDrawer>
    </div>
  );
}
