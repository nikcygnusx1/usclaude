import { useMemo } from 'react';
import { Node, Edge, MarkerType, Position } from 'reactflow';
import dagre from 'dagre';
import { ontologyGraph } from '@/data/ontology';
import { useFilterStore } from '@/stores/useFilterStore';
import { RegulatoryNode, Requirement } from '@/types/ontology';
import { domains } from '@/data/domains';

const typeWidth: Record<RegulatoryNode['type'], number> = {
  state: 160,
  license: 200,
  requirement: 200,
  product: 200,
  domain: 200,
  phase: 150,
};

function layout(
  nodes: RegulatoryNode[],
  edges: { id: string; source: string; target: string }[],
  direction: 'LR' | 'TB' = 'LR'
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 36, ranksep: 120 });
  nodes.forEach(n => g.setNode(n.id, { width: typeWidth[n.type], height: 48 }));
  edges.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map(n => {
    const pos = g.node(n.id);
    return { ...n, x: pos?.x ?? 0, y: pos?.y ?? 0, w: typeWidth[n.type] };
  });
}

export function useGraph(layoutDirection: 'LR' | 'TB' = 'LR') {
  const { selectedStatuses, selectedPhases, selectedDomains, searchQuery, clarityEnacted } = useFilterStore();

  const filtered = useMemo(() => {
    let nodes = ontologyGraph.nodes;

    // Filter by domain
    if (selectedDomains.length) {
      const keptDomainIds = new Set(selectedDomains);
      const keptRequirementNodes = ontologyGraph.nodes.filter(n => {
        if (n.type !== 'requirement') return false;
        const req = n.data as Requirement;
        const dom = domains.find(d => d.name === req.domain);
        return dom && keptDomainIds.has(dom.id);
      });
      const keptRequirementIds = new Set(keptRequirementNodes.map(n => n.id));

      // Keep licenses that govern kept requirements
      const keptLicenseIds = new Set<string>();
      ontologyGraph.edges.forEach(e => {
        if (keptRequirementIds.has(e.target) && (e.type === 'governs' || e.type === 'enables')) {
          keptLicenseIds.add(e.source);
        }
      });

      // Keep states that require kept licenses
      const keptStateIds = new Set<string>();
      ontologyGraph.edges.forEach(e => {
        if (keptLicenseIds.has(e.target) && e.type === 'requires') {
          keptStateIds.add(e.source);
        }
      });

      // Keep products that require kept requirements
      const keptProductIds = new Set<string>();
      ontologyGraph.edges.forEach(e => {
        if (keptRequirementIds.has(e.target) && e.type === 'requires') {
          keptProductIds.add(e.source);
        }
      });

      // Keep phases triggered by kept products
      const keptPhaseIds = new Set<string>();
      ontologyGraph.edges.forEach(e => {
        if (keptProductIds.has(e.source) && e.type === 'triggers') {
          keptPhaseIds.add(e.target);
        }
      });

      nodes = nodes.filter(n => {
        if (n.type === 'domain') return keptDomainIds.has(n.id);
        if (n.type === 'requirement') return keptRequirementIds.has(n.id);
        if (n.type === 'license') return keptLicenseIds.has(n.id);
        if (n.type === 'state') return keptStateIds.has(n.id);
        if (n.type === 'product') return keptProductIds.has(n.id);
        if (n.type === 'phase') return keptPhaseIds.has(n.id);
        return false;
      });
    }

    // Filter by status and phase
    if (selectedStatuses.length) nodes = nodes.filter(n => selectedStatuses.includes(n.status));
    if (selectedPhases.length) nodes = nodes.filter(n => selectedPhases.includes(n.phase));

    // Filter by search query
    if (searchQuery) nodes = nodes.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()));

    const ids = new Set(nodes.map(n => n.id));
    const edges = ontologyGraph.edges.filter(e => ids.has(e.source) && ids.has(e.target));
    return { nodes, edges };
  }, [selectedStatuses, selectedPhases, selectedDomains, searchQuery]);

  const laidOut = useMemo(() => layout(filtered.nodes, filtered.edges, layoutDirection), [filtered, layoutDirection]);

  const nodes: Node[] = laidOut.map(n => {
    return {
      id: n.id,
      type: 'custom', // Hooks into components/ui/CustomOntologyNode
      position: { x: n.x - n.w / 2, y: n.y - 24 },
      data: {
        node: n,
      },
      sourcePosition: layoutDirection === 'LR' ? Position.Right : Position.Bottom,
      targetPosition: layoutDirection === 'LR' ? Position.Left : Position.Top,
      style: {
        width: n.w,
        border: '0',
        padding: '0',
        background: 'transparent',
      },
    };
  });

  const edges: Edge[] = filtered.edges.map(e => {
    // Check if the target is a preempted requirement
    const targetNode = ontologyGraph.nodes.find(n => n.id === e.target);
    const isPreempted = clarityEnacted && targetNode?.type === 'requirement' && (targetNode.data as Requirement).preemptedUnderClarity;

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      animated: e.type === 'requires' && !isPreempted,
      label: e.type,
      labelStyle: { fontSize: 8, fill: isPreempted ? '#cbd5e1' : '#64748b', fontFamily: 'monospace' },
      style: {
        stroke: isPreempted ? '#cbd5e1' : '#94a3b8',
        strokeDasharray: isPreempted ? '5,5' : undefined,
        strokeWidth: 1.5,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: isPreempted ? '#cbd5e1' : '#94a3b8' },
    };
  });

  return { nodes, edges, nodeCount: filtered.nodes.length, edgeCount: filtered.edges.length };
}
export default useGraph;
