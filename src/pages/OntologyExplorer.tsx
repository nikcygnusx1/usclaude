import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactFlow, { Background, Controls, MiniMap, Node, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '@/hooks/useGraph';
import { Badge, InspectorDrawer, CustomOntologyNode } from '@/components/ui';
import { toBadgeStatus } from '@/lib/status';
import { RegulatoryNode } from '@/types/ontology';
import { states, products, requirements, licenses, ontologyGraph } from '@/data';
import { clsx } from 'clsx';
import { Search, Info, Sliders, Calendar, Layers, Eye } from 'lucide-react';


const nodeTypes = {
  custom: CustomOntologyNode,
};

const timelineStepLabels: Record<number, { title: string; desc: string }> = {
  0: { title: 'Month 0 — Setup', desc: 'Pre-launch baseline setup. Corporate structure, BSA/AML programs, and passive investor filings active.' },
  1: { title: 'Month 6 — Phase 1', desc: 'Non-custodial, crypto-only, institutional wallet trading active in exemption-friendly states (Montana).' },
  2: { title: 'Month 12 — Phase 2', desc: 'Custodial trading and fiat-ramps active. Wyoming SPDI trust charter and sponsor banking clearing ready.' },
  3: { title: 'Month 18 — Phase 3', desc: 'National retail launch. Multi-state money transmitter licenses and New York BitLicense active.' },
  4: { title: 'Post-CLARITY Act', desc: 'Federal preemption enacted. State Money Transmission license requirements preempted for spot trading.' },
};

export function OntologyExplorer() {
  const location = useLocation();
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
  const [colorBy, setColorBy] = useState<'status' | 'phase' | 'domain'>('status');
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(['state', 'license', 'requirement', 'product']));
  const [timelineStep, setTimelineStep] = useState<number>(3); // Default to Step 3: Month 18 launch
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<RegulatoryNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rfInstance, setRfInstance] = useState<any>(null);

  // Auto-activate layers and timeline matching focus param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focusId = params.get('focus');
    if (focusId) {
      const rawNode = ontologyGraph.nodes.find(n => n.id === focusId);
      if (rawNode) {
        if (!activeLayers.has(rawNode.type)) {
          setActiveLayers(prev => {
            const next = new Set(prev);
            next.add(rawNode.type);
            return next;
          });
        }
        const phaseSteps: Record<string, number> = {
          'Pre-launch': 0,
          'Phase 1': 1,
          'Phase 2': 2,
          'Phase 3': 3,
          'Post-CLARITY': 4,
        };
        const neededStep = phaseSteps[rawNode.phase];
        if (neededStep !== undefined && timelineStep < neededStep) {
          setTimelineStep(neededStep);
        }
        setSelectedNodeId(focusId);
        setSelectedNode(rawNode);
      }
    }
  }, [location.search]);

  // Load graph nodes and edges dynamically based on layers, timeline step, and direction
  const { nodes, edges, nodeCount, edgeCount } = useGraph({
    layoutDirection,
    colorBy,
    activeLayers,
    timelineStep,
  });

  // Center node once loaded in ReactFlow
  useEffect(() => {
    if (rfInstance && selectedNodeId) {
      const matchNode = nodes.find(n => n.id === selectedNodeId);
      if (matchNode) {
        rfInstance.setCenter(matchNode.position.x + 120, matchNode.position.y + 45, { zoom: 1.1, duration: 800 });
      }
    }
  }, [rfInstance, selectedNodeId, nodes]);


  const toggleLayer = (layer: string) => {
    const next = new Set(activeLayers);
    if (next.has(layer)) next.delete(layer);
    else next.add(layer);
    setActiveLayers(next);
  };

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

  // Search filter list
  const searchMatches = useMemo(() => {
    if (!searchQuery) return [];
    return nodes.filter(n => n.data.node.label.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [searchQuery, nodes]);

  // Auto-focus zoom-to node action
  const handleSearchSelect = (n: Node) => {
    setSelectedNodeId(n.id);
    setSelectedNode(n.data.node as RegulatoryNode);
    setSearchQuery('');
    if (rfInstance) {
      rfInstance.setCenter(n.position.x + 120, n.position.y + 45, { zoom: 1.1, duration: 800 });
    }
  };

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

  const selectedLicObj = useMemo(() => {
    if (selectedNode?.type === 'license') {
      return licenses.find(l => l.id === selectedNode.id);
    }
    return null;
  }, [selectedNode]);

  return (
    <ReactFlowProvider>
      <div className="flex h-[calc(100vh-6.5rem)] flex-col gap-4 text-navy dark:text-ice overflow-hidden">
        {/* Top Header Section */}
        <div>
          <h1 className="text-2xl font-bold">Ontology Graph Explorer</h1>
          <p className="text-sm text-grey-dark dark:text-grey-light mt-0.5">
            {nodeCount} nodes · {edgeCount} edges. Visualize the regulatory relationship map. Control layers, paint styles, and scrub rollout milestones in real time.
          </p>
        </div>

        {/* Multi-Pane Dashboard Layout */}
        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden relative">
          
          {/* Left Panel: Layers, Coloring & Search Sidebar */}
          <div className="w-64 bg-card border border-line rounded-lg p-4 flex flex-col space-y-4 shrink-0 overflow-y-auto shadow-sm">
            
            {/* Search and Zoom Node */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold uppercase tracking-wider text-grey flex items-center gap-1.5">
                <Search size={12} /> Search Object
              </label>
              <input
                type="text"
                placeholder="Type object name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-8 rounded border border-line bg-ice-soft dark:bg-navy-deep px-2.5 text-xs text-navy dark:text-ice focus:outline-none placeholder-grey/50 font-mono"
              />
              {searchMatches.length > 0 && (
                <div className="absolute top-14 left-0 right-0 z-20 bg-card border border-line rounded shadow-lg overflow-hidden text-xs divide-y divide-line">
                  {searchMatches.map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleSearchSelect(m)}
                      className="w-full px-3 py-2 text-left hover:bg-ice-soft dark:hover:bg-ice-soft/10 block font-mono text-[10px]"
                    >
                      <span className="text-grey uppercase font-sans font-semibold mr-1.5">[{m.data.node.type}]</span>
                      {m.data.node.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Colors Paint Manager */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-grey flex items-center gap-1.5">
                <Eye size={12} /> Color Objects By
              </label>
              <select
                value={colorBy}
                onChange={e => setColorBy(e.target.value as any)}
                className="w-full h-8 rounded border border-line bg-ice-soft dark:bg-navy-deep px-2 text-xs font-semibold focus:outline-none"
              >
                <option value="status">Compliance Status</option>
                <option value="phase">Rollout Phase</option>
                <option value="domain">Regulatory Domain</option>
              </select>
            </div>

            {/* Layers Checklist */}
            <div className="space-y-2 pt-2 border-t border-line">
              <label className="text-[10px] font-bold uppercase tracking-wider text-grey flex items-center gap-1.5">
                <Layers size={12} /> Active Ontology Layers
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'state', label: 'States (Launch Jurisdictions)' },
                  { id: 'license', label: 'Licenses & Permits' },
                  { id: 'requirement', label: 'Gating Requirements' },
                  { id: 'product', label: 'Exchange Products & Assets' },
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => toggleLayer(l.id)}
                    className="flex items-center gap-2.5 w-full text-left text-xs font-semibold hover:text-navy dark:hover:text-ice transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={activeLayers.has(l.id)}
                      readOnly
                      className="rounded border-grey/40 text-navy focus:ring-0 cursor-pointer h-3.5 w-3.5"
                    />
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Direction Selector */}
            <div className="space-y-2 pt-2 border-t border-line">
              <label className="text-[10px] font-bold uppercase tracking-wider text-grey flex items-center gap-1.5">
                <Sliders size={12} /> Layout Direction
              </label>
              <div className="grid grid-cols-2 gap-1 bg-ice-soft dark:bg-navy-deep p-0.5 rounded border border-line">
                <button
                  onClick={() => setLayoutDirection('LR')}
                  className={clsx(
                    'py-1 rounded text-[10px] font-bold font-mono transition-colors text-center',
                    layoutDirection === 'LR' ? 'bg-card text-navy dark:bg-navy dark:text-ice shadow-sm' : 'text-grey hover:text-navy dark:hover:text-ice'
                  )}
                >
                  Horizontal
                </button>
                <button
                  onClick={() => setLayoutDirection('TB')}
                  className={clsx(
                    'py-1 rounded text-[10px] font-bold font-mono transition-colors text-center',
                    layoutDirection === 'TB' ? 'bg-card text-navy dark:bg-navy dark:text-ice shadow-sm' : 'text-grey hover:text-navy dark:hover:text-ice'
                  )}
                >
                  Vertical
                </button>
              </div>
            </div>

            {/* Information Info Tip */}
            <div className="pt-2 border-t border-line text-[10px] text-grey leading-relaxed space-y-1 mt-auto">
              <p className="font-bold flex items-center gap-1"><Info size={10} /> Operator Guidelines:</p>
              <p>Traced pathways color-code flow links in blue. Double-click canvas to zoom, click node to inspect.</p>
            </div>
          </div>

          {/* Right Panel: Viewport Canvas & Timeline scrub */}
          <div className="flex-1 flex flex-col min-w-0 bg-card border border-line rounded-lg overflow-hidden shadow-sm relative">
            
            {/* ReactFlow Canvas Viewport */}
            <div className="flex-1 min-h-0 relative">
              <ReactFlow
                nodes={processedNodes}
                edges={processedEdges}
                nodeTypes={nodeTypes}
                onInit={setRfInstance}
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

            {/* Floating Rollout Playback Slider */}
            <div className="border-t border-line bg-ice-soft/40 dark:bg-navy-deep/20 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-xs font-bold font-mono tracking-tight flex items-center gap-1.5">
                    <Calendar size={13} className="text-cyan-500" /> {timelineStepLabels[timelineStep].title}
                  </h4>
                  <p className="text-[10px] text-grey-dark dark:text-grey-light mt-0.5 leading-relaxed">
                    {timelineStepLabels[timelineStep].desc}
                  </p>
                </div>
                <div className="font-mono text-[9px] bg-card border border-line rounded px-2 py-0.5 font-extrabold tracking-wider">
                  STEP {timelineStep} / 4
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={timelineStep}
                onChange={e => setTimelineStep(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-line rounded-lg outline-none"
              />
              <div className="flex justify-between text-[9px] font-mono font-bold text-grey uppercase px-1">
                <span>Month 0</span>
                <span>Month 6</span>
                <span>Month 12</span>
                <span>Month 18</span>
                <span>Post-CLARITY</span>
              </div>
            </div>

          </div>

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
                    <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Regime Type</span> {selectedStateObj.regimeType}</p>
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
                        <div className="space-y-1.5 pt-1 text-[11px] border-t border-line/55 leading-relaxed">
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

              {selectedLicObj && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <span className="font-semibold text-xs text-grey uppercase tracking-wider block">Issuing Authority</span>
                    <p className="text-sm font-medium">{selectedLicObj.issuingAuthority}</p>
                  </div>
                  <div className="space-y-2 border-t border-line pt-3">
                    <span className="font-semibold text-xs text-grey uppercase tracking-wider block">Exemptions Available</span>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {selectedLicObj.exemptions.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
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
    </ReactFlowProvider>
  );
}
