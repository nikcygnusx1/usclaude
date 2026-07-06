import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactFlow, { Background, Controls, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '@/hooks/useGraph';
import { Badge, InspectorDrawer, CustomOntologyNode } from '@/components/ui';
import { OntologyMiniMap } from '@/components/ui/OntologyMiniMap';
import { toBadgeStatus } from '@/lib/status';
import { NODE_LAYOUT } from '@/lib/constants';
import { RegulatoryNode } from '@/types/ontology';
import { states, products, requirements, licenses, ontologyGraph } from '@/data';
import { Search, Calendar, Download } from 'lucide-react';

const nodeTypes = { custom: CustomOntologyNode };

const timelineStepLabels: Record<number, { title: string; desc: string }> = {
  0: { title: 'Month 0 — Setup', desc: 'Pre-launch baseline setup. Corporate structure, BSA/AML programs, and passive investor filings active.' },
  1: { title: 'Month 6 — Phase 1', desc: 'Non-custodial, crypto-only, institutional wallet trading active in exemption-friendly states.' },
  2: { title: 'Month 12 — Phase 2', desc: 'Custodial trading and fiat-ramps active. Wyoming SPDI trust charter and sponsor banking clearing ready.' },
  3: { title: 'Month 18 — Phase 3', desc: 'National retail launch. Multi-state money transmitter licenses and New York BitLicense active.' },
  4: { title: 'Post-CLARITY Act', desc: 'Federal preemption enacted. State Money Transmission license requirements preempted for spot trading.' },
};

const LAYER_PILLS = [
  { id: 'state', label: 'States', count: 50 },
  { id: 'license', label: 'Licenses', count: 6 },
  { id: 'requirement', label: 'Requirements', count: 10 },
  { id: 'product', label: 'Products', count: 8 },
  { id: 'competitor', label: 'Competitors', count: 10 },
];

export function OntologyExplorer() {
  const location = useLocation();
  const [colorBy, setColorBy] = useState<'status' | 'phase' | 'domain'>('status');
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(['state', 'license', 'requirement', 'product']));
  const [timelineStep, setTimelineStep] = useState<number>(3);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<RegulatoryNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focusId = params.get('focus');
    if (focusId) {
      const rawNode = ontologyGraph.nodes.find(n => n.id === focusId);
      if (rawNode) {
        if (!activeLayers.has(rawNode.type)) {
          setActiveLayers(prev => { const next = new Set(prev); next.add(rawNode.type); return next; });
        }
        const phaseSteps: Record<string, number> = { 'Pre-launch': 0, 'Phase 1': 1, 'Phase 2': 2, 'Phase 3': 3, 'Post-CLARITY': 4 };
        const neededStep = phaseSteps[rawNode.phase];
        if (neededStep !== undefined && timelineStep < neededStep) setTimelineStep(neededStep);
        setSelectedNodeId(focusId);
        setSelectedNode(rawNode);
      }
    }
  }, [location.search]);

  const { nodes: rawNodes, edges, nodeCount, edgeCount } = useGraph({ colorBy, activeLayers, timelineStep });

  useEffect(() => {
    if (rfInstance && selectedNodeId) {
      const matchNode = rawNodes.find(n => n.id === selectedNodeId);
      if (matchNode) rfInstance.setCenter(matchNode.position.x + 100, matchNode.position.y + 40, { zoom: 1.1, duration: 800 });
    }
  }, [rfInstance, selectedNodeId, rawNodes]);

  const nodes = useMemo(() => {
    const showDetails = zoomLevel >= 0.5;
    const scale = zoomLevel < 0.5 ? 0.6 : zoomLevel < 1.2 ? 1 : 1.2;
    return rawNodes.map(n => ({
      ...n,
      data: { ...(n.data as Record<string, unknown>), showDetails, scale },
      style: { ...n.style, width: Math.round(NODE_LAYOUT.WIDTH * scale), height: Math.round(NODE_LAYOUT.HEIGHT * scale) },
    }));
  }, [rawNodes, zoomLevel]);

  const toggleLayer = (layer: string) => {
    const next = new Set(activeLayers);
    if (next.has(layer)) next.delete(layer); else next.add(layer);
    setActiveLayers(next);
  };

  const highlightedNodeIds = useMemo(() => {
    const activeId = hoveredNodeId || selectedNodeId;
    if (!activeId) return new Set<string>();
    const visited = new Set<string>([activeId]);
    const incoming: Record<string, string[]> = {};
    edges.forEach((e: any) => { if (!incoming[e.target]) incoming[e.target] = []; incoming[e.target].push(e.source); });
    const queueUp = [activeId];
    while (queueUp.length > 0) { const curr = queueUp.shift()!; (incoming[curr] || []).forEach((p: string) => { if (!visited.has(p)) { visited.add(p); queueUp.push(p); } }); }
    const outgoing: Record<string, string[]> = {};
    edges.forEach((e: any) => { if (!outgoing[e.source]) outgoing[e.source] = []; outgoing[e.source].push(e.target); });
    const queueDown = [activeId];
    while (queueDown.length > 0) { const curr = queueDown.shift()!; (outgoing[curr] || []).forEach((c: string) => { if (!visited.has(c)) { visited.add(c); queueDown.push(c); } }); }
    return visited;
  }, [hoveredNodeId, selectedNodeId, edges]);

  const displayedNodes = useMemo(() => {
    const activeId = hoveredNodeId || selectedNodeId;
    if (!activeId) return nodes;
    return nodes.map(n => {
      const isHighlighted = n.id === activeId;
      const isDimmed = !highlightedNodeIds.has(n.id);
      return { ...n, data: { ...(n.data as Record<string, unknown>), isHighlighted, isDimmed } };
    });
  }, [hoveredNodeId, selectedNodeId, nodes, highlightedNodeIds]);

  const displayedEdges = useMemo(() => {
    const activeId = hoveredNodeId || selectedNodeId;
    if (!activeId) return edges;
    return edges.map((e: any) => {
      const isPath = highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target);
      if (isPath) return { ...e, animated: true, style: { ...e.style, stroke: '#06b6d4', strokeWidth: 2, opacity: 1 }, markerEnd: typeof e.markerEnd === 'object' ? { ...e.markerEnd, color: '#06b6d4' } : '#06b6d4' };
      return { ...e, animated: false, style: { ...e.style, opacity: 0.08 } };
    });
  }, [hoveredNodeId, selectedNodeId, edges, highlightedNodeIds]);

  const searchMatches = useMemo(() => {
    if (!searchQuery) return [];
    return nodes.filter(n => ((n.data as any).node as RegulatoryNode).label.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [searchQuery, nodes]);

  const handleSearchSelect = (n: any) => {
    setSelectedNodeId(n.id);
    setSelectedNode((n.data as any).node as RegulatoryNode);
    setSearchQuery('');
    if (rfInstance) rfInstance.setCenter(n.position.x + 100, n.position.y + 40, { zoom: 1.1, duration: 800 });
  };

  const selectedStateObj = useMemo(() => selectedNode?.type === 'state' ? states.find(s => s.id === selectedNode.id) ?? null : null, [selectedNode]);
  const selectedProductObj = useMemo(() => selectedNode?.type === 'product' ? products.find(p => p.id === selectedNode.id) ?? null : null, [selectedNode]);
  const selectedReqObj = useMemo(() => selectedNode?.type === 'requirement' ? requirements.find(r => r.id === selectedNode.id) ?? null : null, [selectedNode]);
  const selectedLicObj = useMemo(() => selectedNode?.type === 'license' ? licenses.find(l => l.id === selectedNode.id) ?? null : null, [selectedNode]);

  return (
    <ReactFlowProvider>
      <div className="flex h-[calc(100vh-6.5rem)] flex-col text-navy dark:text-ice overflow-hidden">

        {/* TOP TOOLBAR */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-line bg-card">
          <h1 className="text-lg font-bold shrink-0">Ontology Graph</h1>

          <div className="flex-1 max-w-xl mx-auto relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-grey" />
            <input
              type="text"
              placeholder="Search states, products, licenses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-line bg-ice-soft dark:bg-navy-deep text-xs text-navy dark:text-ice focus:outline-none placeholder-grey/50 font-mono"
            />
            {searchMatches.length > 0 && (
              <div className="absolute top-10 left-0 right-0 z-20 bg-card border border-line rounded-lg shadow-lg overflow-hidden text-xs divide-y divide-line">
                {searchMatches.map(m => (
                  <button key={m.id} onClick={() => handleSearchSelect(m)} className="w-full px-3 py-2 text-left hover:bg-ice-soft dark:hover:bg-ice-soft/10 block font-mono text-[10px]">
                    <span className="text-grey uppercase font-sans font-semibold mr-1.5">[{((m.data as any).node as RegulatoryNode).type}]</span>
                    {((m.data as any).node as RegulatoryNode).label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {LAYER_PILLS.map(p => {
              const active = activeLayers.has(p.id);
              return (
                <button key={p.id} onClick={() => toggleLayer(p.id)} className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all ${active ? 'bg-navy dark:bg-ice text-card dark:text-navy border-transparent' : 'border-line text-grey hover:bg-ice-soft'}`}>
                  <span>{p.label}</span>
                  <span className={`font-mono text-[9px] ${active ? 'opacity-70' : 'text-grey'}`}>{p.count}</span>
                </button>
              );
            })}
          </div>

          <select value={colorBy} onChange={e => setColorBy(e.target.value as any)} className="h-8 rounded border border-line bg-ice-soft dark:bg-navy-deep px-2 text-[10px] font-semibold focus:outline-none text-navy dark:text-ice shrink-0">
            <option value="status">Status</option>
            <option value="phase">Phase</option>
            <option value="domain">Domain</option>
          </select>

          <span className="text-[10px] font-mono text-grey shrink-0">{nodeCount}N {edgeCount}E</span>

          <button
            onClick={async () => {
              const el = document.querySelector('.react-flow__viewport') as HTMLElement;
              if (!el) return;
              const { toPng } = await import('html-to-image');
              const dataUrl = await toPng(el, { backgroundColor: '#ffffff' });
              const a = document.createElement('a');
              a.download = 'lcx-ontology.png';
              a.href = dataUrl;
              a.click();
            }}
            className="h-7 rounded border border-line px-2 text-[10px] font-semibold text-grey hover:bg-ice-soft shrink-0 flex items-center gap-1"
            title="Export as PNG"
          >
            <Download size={12} /> Export
          </button>
        </div>

        {/* CANVAS */}
        <div className="flex-1 min-h-0 relative bg-card">
          <ReactFlow
            nodes={displayedNodes}
            edges={displayedEdges}
            nodeTypes={nodeTypes}
            onInit={setRfInstance}
            onMove={(_, viewport) => setZoomLevel(viewport.zoom)}
            onNodeClick={(_, node) => {
              const rawNode = (node.data as any).node as RegulatoryNode;
              setSelectedNode(rawNode);
              setSelectedNodeId(rawNode.id);
            }}
            onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
            onNodeMouseLeave={() => setHoveredNodeId(null)}
            fitView
            defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} color="var(--line)" className="opacity-45" />
            <Controls className="!bg-card !border-line !shadow-sm dark:!bg-navy" />
          </ReactFlow>

          {/* FLOATING TIMELINE PILL */}
          <div className="absolute bottom-4 right-4 w-72 bg-card border border-line rounded-lg shadow-lg p-3 space-y-2">

          <OntologyMiniMap nodes={displayedNodes} />

          {/* FLOATING TIMELINE PILL */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-cyan-500" />
                <span className="text-[10px] font-bold font-mono">{timelineStepLabels[timelineStep].title}</span>
              </div>
              <span className="font-mono text-[9px] bg-ice-soft dark:bg-navy-deep border border-line rounded px-1.5 font-bold">{timelineStep}/4</span>
            </div>
            <p className="text-[9px] text-grey-dark dark:text-grey-light leading-snug">{timelineStepLabels[timelineStep].desc}</p>
            <input type="range" min="0" max="4" value={timelineStep} onChange={e => setTimelineStep(parseInt(e.target.value))} className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-line rounded-lg outline-none" />
            <div className="flex justify-between text-[8px] font-mono text-grey"><span>M0</span><span>M6</span><span>M12</span><span>M18</span><span>CLARITY</span></div>
          </div>
        </div>

      </div>

      <InspectorDrawer isOpen={!!selectedNode} onClose={() => { setSelectedNode(null); setSelectedNodeId(null); }} title={selectedNode?.label ?? ''}>
        {selectedNode && (
          <div className="space-y-4 text-sm text-navy dark:text-ice">
            <div className="flex flex-wrap gap-2">
              <Badge status={toBadgeStatus(selectedNode.status)}>{selectedNode.status}</Badge>
              <span className="text-xs rounded-full border border-line px-2.5 py-0.5 uppercase font-mono">{selectedNode.type}</span>
              <span className="text-xs rounded-full border border-line px-2.5 py-0.5 font-mono">{selectedNode.phase}</span>
            </div>
            {selectedStateObj && (<div className="space-y-3 pt-2"><p className="text-xs">{selectedStateObj.notes}</p><div className="space-y-2 border-t border-line pt-3"><p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Regime Type</span> {selectedStateObj.regimeType}</p>{selectedStateObj.minNetWorth && <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Minimum Corporate Net Worth</span> <span className="font-mono text-sm">{selectedStateObj.minNetWorth}</span></p>}{selectedStateObj.suretyBond && <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Surety Bond Collateral</span> <span className="font-mono text-sm">{selectedStateObj.suretyBond}</span></p>}{selectedStateObj.sandboxAvailable !== undefined && <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Regulatory Sandbox</span> {selectedStateObj.sandboxAvailable ? 'Exemption Available' : 'None'}</p>}{selectedStateObj.estTimeline && <p><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Estimated Pipeline Duration</span> <span className="font-mono">{selectedStateObj.estTimeline}</span></p>}</div></div>)}
            {selectedProductObj && (<div className="space-y-3 pt-2"><p className="text-xs">{selectedProductObj.description}</p>{selectedProductObj.howeyScore !== undefined && (<div className="bg-ice-soft dark:bg-ice-soft/10 rounded p-3 border border-line text-xs space-y-2"><p className="font-bold flex items-center justify-between"><span>Howey Securities Score:</span><span className="font-mono text-sm">{selectedProductObj.howeyScore}%</span></p>{selectedProductObj.howeyAnalysis && (<div className="space-y-1.5 pt-1 text-[11px] border-t border-line/55 leading-relaxed"><p><strong>Investment:</strong> {selectedProductObj.howeyAnalysis.investmentOfMoney}</p><p><strong>Enterprise:</strong> {selectedProductObj.howeyAnalysis.commonEnterprise}</p><p><strong>Profits:</strong> {selectedProductObj.howeyAnalysis.profitExpectation}</p><p><strong>Efforts:</strong> {selectedProductObj.howeyAnalysis.effortsOfOthers}</p></div>)}</div>)}{selectedProductObj.risks.length > 0 && (<div className="space-y-1.5 border-t border-line pt-3"><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Identified Gating Risks</span><ul className="list-disc list-inside text-xs space-y-1">{selectedProductObj.risks.map((r,i) => <li key={i}>{r}</li>)}</ul></div>)}</div>)}
            {selectedReqObj && (<div className="space-y-3 pt-2"><div className="space-y-2"><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Domain Classification</span><p className="text-sm font-medium">{selectedReqObj.domain}</p></div><div className="space-y-2 border-t border-line pt-3"><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Requirement Description</span><p className="text-xs leading-relaxed">{selectedReqObj.description}</p></div></div>)}
            {selectedLicObj && (<div className="space-y-3 pt-2"><div className="space-y-2"><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Issuing Authority</span><p className="text-sm font-medium">{selectedLicObj.issuingAuthority}</p></div><div className="space-y-2 border-t border-line pt-3"><span className="font-semibold text-xs text-grey uppercase tracking-wider block">Exemptions Available</span><ul className="list-disc list-inside text-xs space-y-1">{selectedLicObj.exemptions.map((x,i) => <li key={i}>{x}</li>)}</ul></div></div>)}
            <div className="pt-2 border-t border-line"><details className="group cursor-pointer"><summary className="text-[10px] font-bold uppercase tracking-wider text-grey select-none list-none flex items-center gap-1.5"><span className="transition-transform group-open:rotate-90">&rarr;</span><span>[Technical Registry Payload]</span></summary><pre className="mt-2 p-2.5 rounded bg-ice-soft dark:bg-navy-deep text-[10px] font-mono overflow-x-auto text-navy dark:text-ice border border-line leading-normal">{JSON.stringify(selectedNode.data || selectedNode, null, 2)}</pre></details></div>
          </div>
        )}
      </InspectorDrawer>
    </ReactFlowProvider>
  );
}

export default OntologyExplorer;
