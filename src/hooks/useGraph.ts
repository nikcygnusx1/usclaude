import { useMemo } from 'react';
import { Node, Edge, MarkerType, Position } from 'reactflow';
import dagre from 'dagre';
import { ontologyGraph } from '@/data/ontology';
import { useFilterStore } from '@/stores/useFilterStore';
import { RegulatoryNode, Status } from '@/types/ontology';

const statusColor: Record<Status, string> = {
  Ready: '#10b981',
  Conditional: '#f59e0b',
  Blocked: '#ef4444',
  'Needs verification': '#64748b',
  Deferred: '#94a3b8',
};

const typeWidth: Record<RegulatoryNode['type'], number> = {
  state: 150, license: 190, requirement: 190, product: 190, domain: 210, phase: 150,
};

function layout(nodes: RegulatoryNode[], edges: { id: string; source: string; target: string }[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 32, ranksep: 110 });
  nodes.forEach(n => g.setNode(n.id, { width: typeWidth[n.type], height: 44 }));
  edges.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map(n => {
    const pos = g.node(n.id);
    return { ...n, x: pos?.x ?? 0, y: pos?.y ?? 0, w: typeWidth[n.type] };
  });
}

export function useGraph() {
  const { selectedStatuses, selectedPhases, selectedDomains, searchQuery } = useFilterStore();

  const filtered = useMemo(() => {
    let nodes = ontologyGraph.nodes;
    if (selectedStatuses.length) nodes = nodes.filter(n => selectedStatuses.includes(n.status));
    if (selectedPhases.length) nodes = nodes.filter(n => selectedPhases.includes(n.phase));
    if (selectedDomains.length) {
      nodes = nodes.filter(n => n.type !== 'domain' ? true : selectedDomains.includes(n.id));
    }
    if (searchQuery) nodes = nodes.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()));
    const ids = new Set(nodes.map(n => n.id));
    const edges = ontologyGraph.edges.filter(e => ids.has(e.source) && ids.has(e.target));
    return { nodes, edges };
  }, [selectedStatuses, selectedPhases, selectedDomains, searchQuery]);

  const laidOut = useMemo(() => layout(filtered.nodes, filtered.edges), [filtered]);

  const nodes: Node[] = laidOut.map(n => ({
    id: n.id,
    type: 'default',
    position: { x: n.x - n.w / 2, y: n.y - 22 },
    data: { label: n.label, node: n },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      width: n.w,
      borderRadius: 8,
      border: `2px solid ${statusColor[n.status]}`,
      background: 'var(--card)',
      color: 'var(--navy)',
      fontSize: 12,
      fontWeight: 500,
      padding: '6px 10px',
    },
  }));

  const edges: Edge[] = filtered.edges.map(e => ({
    id: e.id, source: e.source, target: e.target, type: 'smoothstep', animated: e.type === 'requires',
    label: e.type,
    labelStyle: { fontSize: 10, fill: '#64748b' },
    style: { stroke: '#94a3b8' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
  }));

  return { nodes, edges, nodeCount: filtered.nodes.length, edgeCount: filtered.edges.length };
}
