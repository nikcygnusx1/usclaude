import { redFlags } from '@/data';
import { useAuditStore } from '@/stores/useAuditStore';
import { Card, CardBody, Badge, ReadinessMeter } from '@/components/ui';
import { AlertTriangle, ShieldCheck, CheckSquare, Square } from 'lucide-react';

export function RedFlags() {
  const { resolvedRemediations, toggleRemediation } = useAuditStore();

  // Calculate global stats
  const totalRemediations = redFlags.reduce((acc, rf) => acc + rf.remediations.length, 0);
  const completedRemediationsCount = redFlags.reduce((acc, rf) => {
    return acc + rf.remediations.filter(r => resolvedRemediations.includes(r.id)).length;
  }, 0);

  const mitigationPercent = totalRemediations > 0 ? Math.round((completedRemediationsCount / totalRemediations) * 100) : 0;

  // Count unresolved critical/high flags (a flag is unresolved if any of its remediations are unchecked)
  const unresolvedCriticalCount = redFlags.filter(rf => {
    if (rf.risk !== 'Critical' && rf.risk !== 'High') return false;
    return rf.remediations.some(r => !resolvedRemediations.includes(r.id));
  }).length;

  return (
    <div className="space-y-4 text-navy dark:text-ice">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Red Flags &amp; Audit Log</h1>
        <p className="text-sm text-grey-dark mt-1">
          Track and resolve critical legal contradictions, entity registration gaps, and regulatory friction points identified in the market entry corpus.
        </p>
      </div>

      {/* Audit Stats Panel */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="rounded-md bg-red-100 dark:bg-red-950/20 p-2 text-red-600 dark:text-red-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">{unresolvedCriticalCount}</div>
              <div className="text-xs text-grey-dark dark:text-grey-light mt-0.5">Active Critical/High Risks</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="rounded-md bg-green-100 dark:bg-green-950/20 p-2 text-green-600 dark:text-green-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">{completedRemediationsCount} / {totalRemediations}</div>
              <div className="text-xs text-grey-dark dark:text-grey-light mt-0.5">Remediation Gates Cleared</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span>Overall Audit Mitigation</span>
              <span className="font-mono">{mitigationPercent}%</span>
            </div>
            <ReadinessMeter percent={mitigationPercent} />
          </CardBody>
        </Card>
      </div>

      {/* Red Flags List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {redFlags.map(rf => {
          const completedCount = rf.remediations.filter(r => resolvedRemediations.includes(r.id)).length;
          const totalCount = rf.remediations.length;
          const isResolved = completedCount === totalCount;

          return (
            <Card
              key={rf.id}
              className={`border transition-all duration-300 ${
                isResolved
                  ? 'border-status-ready/20 bg-status-ready-bg/5 dark:bg-status-ready-bg/2'
                  : rf.risk === 'Critical'
                  ? 'border-red-500/20 hover:border-red-500/40'
                  : 'border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              <CardBody className="space-y-3">
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm leading-snug">{rf.title}</h3>
                  <Badge
                    status={
                      isResolved ? 'ready' : rf.risk === 'Critical' ? 'blocked' : 'conditional'
                    }
                  >
                    {isResolved ? 'Resolved' : rf.risk}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-grey-dark dark:text-grey-light leading-normal">{rf.description}</p>

                {/* Consequences Warning block */}
                {!isResolved && (
                  <div className="rounded bg-red-50 dark:bg-red-950/15 border border-red-100/50 dark:border-red-950/30 p-2.5 text-xs font-mono text-red-700 dark:text-red-300 leading-normal">
                    <span className="font-extrabold uppercase text-[9px] block mb-0.5">[Consequences of Inaction]</span>
                    {rf.consequences}
                  </div>
                )}

                {/* Remediation Checklist */}
                <div className="pt-2 border-t border-line space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-grey">
                    <span>Remediation Checklist</span>
                    <span className="font-mono">{completedCount} of {totalCount} done</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {rf.remediations.map(r => {
                      const active = resolvedRemediations.includes(r.id);
                      return (
                        <button
                          key={r.id}
                          onClick={() => toggleRemediation(r.id)}
                          className="flex items-start gap-2 w-full text-left text-xs p-1.5 rounded hover:bg-ice-soft dark:hover:bg-ice-soft/10 transition-colors"
                        >
                          <span className="mt-0.5 shrink-0 text-grey hover:text-navy dark:hover:text-ice">
                            {active ? (
                              <CheckSquare size={14} className="text-navy dark:text-ice" />
                            ) : (
                              <Square size={14} />
                            )}
                          </span>
                          <span className={active ? 'line-through text-grey dark:text-grey-light/50' : 'font-medium'}>
                            {r.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
