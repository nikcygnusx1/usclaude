import { useMemo } from 'react';
import { Node, Edge, MarkerType, Position } from 'reactflow';
import dagre from 'dagre';
import { ontologyGraph } from '@/data/ontology';
import { useFilterStore } from '@/stores/useFilterStore';
import { RegulatoryNode, Status, Requirement } from '@/types/ontology';
import { domains } from '@/data/domains';
import { clsx } from 'clsx';
import React from 'react';

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

  const laidOut = useMemo(() => layout(filtered.nodes, filtered.edges), [filtered]);

  const nodes: Node[] = laidOut.map(n => {
    const isReq = n.type === 'requirement';
    const req = isReq ? (n.data as Requirement) : null;
    const isPreempted = clarityEnacted && req?.preemptedUnderClarity;
    const activeColor = statusColor[n.status];

    return {
      id: n.id,
      type: 'default',
      position: { x: n.x - n.w / 2, y: n.y - 22 },
      data: {
        label: React.createElement(
          'div',
          { className: 'flex items-center gap-2 justify-start font-mono text-[10px]' },
          React.createElement('span', {
            className: clsx(
              'h-1.5 w-1.5 rounded-full shrink-0',
              n.status === 'Blocked' && 'animate-pulse-beacon'
            ),
            style: {
              backgroundColor: isPreempted ? '#cbd5e1' : activeColor,
              boxShadow: isPreempted ? 'none' : `0 0 6px ${activeColor}`
            }
          }),
          React.createElement('span', { className: 'truncate' }, isPreempted ? `[Preempted] ${n.label}` : n.label)
        ),
        node: n,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        width: n.w,
        borderRadius: 6,
        border: isPreempted ? `1px dashed #cbd5e1` : `1px solid ${activeColor}`,
        background: 'var(--card)',
        color: isPreempted ? '#94a3b8' : 'var(--navy)',
        fontSize: 10,
        fontWeight: 600,
        padding: '6px 8px',
        opacity: isPreempted ? 0.65 : 1,
        boxShadow: isPreempted ? 'none' : `0 0 8px ${activeColor}15`,
        textAlign: 'left'
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
