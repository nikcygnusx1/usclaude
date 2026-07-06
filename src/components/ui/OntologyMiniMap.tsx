import { useMemo } from 'react';

interface MiniMapCluster {
  type: string;
  label: string;
  color: string;
  count: number;
  cx: number;
  cy: number;
}

interface OntologyMiniMapProps {
  nodes: any[];
  onClusterClick?: (type: string) => void;
  bookmarkedIds?: Set<string>;
}

const TYPE_COLORS: Record<string, string> = {
  state: '#6366f1',
  license: '#10b981',
  requirement: '#f59e0b',
  product: '#06b6d4',
  domain: '#8b5cf6',
  phase: '#94a3b8',
  competitor: '#ec4899',
};

const TYPE_LABELS: Record<string, string> = {
  state: 'States',
  license: 'Licenses',
  requirement: 'Reqs',
  product: 'Products',
  domain: 'Domains',
  phase: 'Phases',
  competitor: 'Comp',
};

export function OntologyMiniMap({ nodes }: OntologyMiniMapProps) {
  const clusters = useMemo((): MiniMapCluster[] => {
    const groups: Record<string, { xs: number[]; ys: number[] }> = {};
    nodes.forEach(n => {
      const type = (n.data as any).node?.type || 'unknown';
      if (!groups[type]) groups[type] = { xs: [], ys: [] };
      groups[type].xs.push(n.position.x);
      groups[type].ys.push(n.position.y);
    });

    return Object.entries(groups).map(([type, coords]) => {
      const cx = coords.xs.reduce((a, b) => a + b, 0) / coords.xs.length;
      const cy = coords.ys.reduce((a, b) => a + b, 0) / coords.ys.length;
      return {
        type,
        label: TYPE_LABELS[type] || type,
        color: TYPE_COLORS[type] || '#94a3b8',
        count: coords.xs.length,
        cx,
        cy,
      };
    });
  }, [nodes]);

  if (clusters.length === 0) return null;

  const minX = Math.min(...clusters.map(c => c.cx));
  const maxX = Math.max(...clusters.map(c => c.cx));
  const minY = Math.min(...clusters.map(c => c.cy));
  const maxY = Math.max(...clusters.map(c => c.cy));
  const pad = 200;
  const vw = 220, vh = 140;
  const sx = (vw - 20) / (maxX - minX + pad * 2);
  const sy = (vh - 20) / (maxY - minY + pad * 2);
  const s = Math.min(sx, sy, 0.02);
  const ox = 10 - (minX - pad) * s;
  const oy = 10 - (minY - pad) * s;

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-card/90 backdrop-blur border border-line rounded-lg shadow-sm p-1.5 select-none" style={{ width: vw, height: vh }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${vw} ${vh}`}>
        {clusters.map(c => {
          const rx = ox + c.cx * s;
          const ry = oy + c.cy * s;
          const r = Math.max(7, Math.min(14, Math.sqrt(c.count) * 4));
          return (
            <g key={c.type}>
              <rect x={rx - r} y={ry - r} width={r * 2} height={r * 2} rx="4" fill={c.color} opacity="0.6" />
              <text x={rx} y={ry - r - 2} textAnchor="middle" fill={c.color} fontSize="7" fontWeight="700" fontFamily="Inter">{c.label}</text>
              <text x={rx} y={ry + 3.5} textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="JetBrains Mono">{c.count}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
