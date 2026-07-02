import { Handle, Position } from 'reactflow';
import { Status, RegulatoryNode, Requirement } from '@/types/ontology';
import { useFilterStore } from '@/stores/useFilterStore';
import { Map, Shield, Key, Coins, Network, Clock } from 'lucide-react';
import { clsx } from 'clsx';


const statusBorder: Record<Status, string> = {
  Ready: 'border-l-status-ready',
  Conditional: 'border-l-status-conditional',
  Blocked: 'border-l-status-blocked',
  'Needs verification': 'border-l-status-unverified',
  Deferred: 'border-l-status-deferred',
};

const icons: Record<RegulatoryNode['type'], any> = {
  state: Map,
  license: Key,
  requirement: Shield,
  product: Coins,
  domain: Network,
  phase: Clock,
};

interface CustomNodeData {
  node: RegulatoryNode;
  isDimmed?: boolean;
  isHighlighted?: boolean;
}

export function CustomOntologyNode({ data }: { data: CustomNodeData }) {
  const { node, isDimmed, isHighlighted } = data;
  const clarityEnacted = useFilterStore(s => s.clarityEnacted);

  const IconComponent = icons[node.type] || Shield;
  const isReq = node.type === 'requirement';
  const req = isReq ? (node.data as Requirement) : null;
  const isPreempted = clarityEnacted && req?.preemptedUnderClarity;

  return (
    <div
      className={clsx(
        'flex items-center gap-2.5 rounded border bg-card p-2 text-left shadow-sm select-none font-sans transition-all duration-300 w-full',
        isPreempted
          ? 'border-dashed border-grey/40 opacity-55'
          : `border-line ${statusBorder[node.status]} border-l-4`,
        isHighlighted && 'ring-2 ring-cyan-500/50 shadow-md shadow-cyan-500/10 border-cyan-500 scale-[1.02]',
        isDimmed && 'opacity-15 grayscale pointer-events-none'
      )}
      style={{
        width: '100%',
        minHeight: '44px',
      }}
    >
      {/* Target input handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-grey-light !h-1.5 !w-1.5 !border-0 dark:!bg-grey-dark"
      />

      {/* Node Type Icon */}
      <div
        className={clsx(
          'rounded p-1.5 shrink-0 transition-colors',
          isPreempted
            ? 'bg-line text-grey'
            : node.status === 'Ready'
            ? 'bg-status-ready-bg text-status-ready'
            : node.status === 'Blocked'
            ? 'bg-status-blocked-bg text-status-blocked'
            : 'bg-ice-soft text-grey-dark dark:bg-ice-soft/10 dark:text-ice'
        )}
      >
        <IconComponent size={14} />
      </div>

      {/* Node Labels */}
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-navy dark:text-ice truncate leading-tight font-mono">
          {isPreempted ? `[Preempted] ${node.label}` : node.label}
        </div>
        <div className="text-[8px] font-semibold text-grey uppercase tracking-wider mt-0.5 font-sans flex items-center gap-1">
          <span>{node.type}</span>
          <span>·</span>
          <span>{node.phase}</span>
        </div>
      </div>

      {/* LED Status Beacon (Right corner) */}
      {!isPreempted && (
        <div className="shrink-0 flex items-center justify-center">
          <span
            className={clsx(
              'h-1.5 w-1.5 rounded-full block',
              node.status === 'Blocked' && 'animate-pulse-beacon',
              node.status === 'Ready' && 'bg-status-ready',
              node.status === 'Conditional' && 'bg-status-conditional',
              node.status === 'Blocked' && 'bg-status-blocked',
              node.status === 'Deferred' && 'bg-status-deferred',
              node.status === 'Needs verification' && 'bg-status-unverified'
            )}
          />
        </div>
      )}

      {/* Source output handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-grey-light !h-1.5 !w-1.5 !border-0 dark:!bg-grey-dark"
      />
    </div>
  );
}
export default CustomOntologyNode;
