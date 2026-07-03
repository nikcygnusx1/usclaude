import { useMemo } from 'react';
import { Node, Edge, MarkerType, Position } from 'reactflow';
import dagre from 'dagre';
import { ontologyGraph } from '@/data/ontology';
import { RegulatoryNode, Status, Requirement, Phase } from '@/types/ontology';

const NODE_WIDTH = 250;
const NODE_HEIGHT = 100;


function layout(
  nodes: RegulatoryNode[],
  edges: { id: string; source: string; target: string }[],
  direction: 'LR' | 'TB' = 'LR'
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 36, ranksep: 140 });
  nodes.forEach(n => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  edges.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map(n => {
    const pos = g.node(n.id);
    return { ...n, x: pos?.x ?? 0, y: pos?.y ?? 0, w: NODE_WIDTH };
  });
}

// Color Palette Maps
const statusColors: Record<Status, string> = {
  Ready: 'rgb(var(--green))',
  Conditional: 'rgb(var(--amber))',
  Blocked: 'rgb(var(--red))',
  'Needs verification': 'rgb(var(--grey))',
  Deferred: 'rgba(var(--grey) / 0.7)',
};

const phaseColors: Record<Phase, string> = {
  'Pre-launch': 'rgb(var(--indigo))',
  'Phase 1': 'rgb(var(--green))',
  'Phase 2': 'rgb(var(--indigo))',
  'Phase 3': 'rgb(var(--red))',
  'Post-CLARITY': 'rgb(var(--amber))',
};

const getDomainColor = (domainName: string) => {
  if (domainName.includes('Entity')) return 'rgb(var(--indigo))';
  if (domainName.includes('Federal')) return 'rgb(var(--green))';
  if (domainName.includes('State')) return 'rgb(var(--indigo))';
  if (domainName.includes('Custody')) return 'rgb(var(--green))';
  if (domainName.includes('Payments')) return 'rgb(var(--indigo))';
  if (domainName.includes('Asset')) return 'rgb(var(--amber))';
  if (domainName.includes('Surveillance')) return 'rgb(var(--red))';
  if (domainName.includes('Product')) return 'rgb(var(--green))';
  return 'rgb(var(--grey))';
};

interface UseGraphParams {
  layoutDirection: 'LR' | 'TB';
  colorBy: 'status' | 'phase' | 'domain';
  activeLayers: Set<string>;
  timelineStep: number;
}

export function useGraph({ layoutDirection, colorBy, activeLayers, timelineStep }: UseGraphParams) {
  // Step thresholds for timeline scrubbing
  const allowedPhases = useMemo(() => {
    const phaseThresholds: Record<number, Phase[]> = {
      0: ['Pre-launch'],
      1: ['Pre-launch', 'Phase 1'],
      2: ['Pre-launch', 'Phase 1', 'Phase 2'],
      3: ['Pre-launch', 'Phase 1', 'Phase 2', 'Phase 3'],
      4: ['Pre-launch', 'Phase 1', 'Phase 2', 'Phase 3', 'Post-CLARITY'],
    };
    return phaseThresholds[timelineStep] || phaseThresholds[4];
  }, [timelineStep]);

  // Is CLARITY preemption active for this step
  const isClarityStepActive = timelineStep === 4;

  const filtered = useMemo(() => {
    let nodes = ontologyGraph.nodes;

    // 1. Filter by Active Layers (States, Licenses, etc.)
    nodes = nodes.filter(n => activeLayers.has(n.type));

    // 2. Filter by Timeline Step Rollout Phase
    nodes = nodes.filter(n => allowedPhases.includes(n.phase));

    const ids = new Set(nodes.map(n => n.id));
    const edges = ontologyGraph.edges.filter(e => ids.has(e.source) && ids.has(e.target));
    return { nodes, edges };
  }, [activeLayers, allowedPhases]);

  const laidOut = useMemo(() => layout(filtered.nodes, filtered.edges, layoutDirection), [filtered, layoutDirection]);

  const nodes: Node[] = laidOut.map(n => {
    // Determine dynamic painting color based on colorBy configuration
    let activeColor = '#64748b'; // default slate

    if (colorBy === 'status') {
      activeColor = statusColors[n.status] || '#64748b';
    } else if (colorBy === 'phase') {
      activeColor = phaseColors[n.phase] || '#64748b';
    } else if (colorBy === 'domain') {
      if (n.type === 'requirement') {
        const req = n.data as Requirement;
        activeColor = getDomainColor(req.domain);
      } else if (n.type === 'license') {
        // Group license under State MTL domain color
        activeColor = getDomainColor('State money transmission and consumer protection');
      } else if (n.type === 'product') {
        // Classify product under Listing and Token Domain color
        activeColor = getDomainColor('Asset listing and token classification');
      } else if (n.type === 'state') {
        activeColor = getDomainColor('State money transmission and consumer protection');
      } else {
        activeColor = '#64748b';
      }
    }

    const isReq = n.type === 'requirement';
    const req = isReq ? (n.data as Requirement) : null;
    const isPreempted = isClarityStepActive && req?.preemptedUnderClarity;

    return {
      id: n.id,
      type: 'custom', // custom node component in components/ui/CustomOntologyNode.tsx
      position: { x: n.x - NODE_WIDTH / 2, y: n.y - NODE_HEIGHT / 2 },
      data: {
        node: n,
        activeColor,
        isPreempted,
      },
      sourcePosition: layoutDirection === 'LR' ? Position.Right : Position.Bottom,
      targetPosition: layoutDirection === 'LR' ? Position.Left : Position.Top,
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        border: '0',
        padding: '0',
        background: 'transparent',
      },
    };
  });

  const edges: Edge[] = filtered.edges.map(e => {
    // Check if the target is a preempted requirement
    const targetNode = ontologyGraph.nodes.find(n => n.id === e.target);
    const isPreempted = isClarityStepActive && targetNode?.type === 'requirement' && (targetNode.data as Requirement).preemptedUnderClarity;

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
