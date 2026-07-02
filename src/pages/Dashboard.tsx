import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, ShieldCheck, Coins, Activity } from 'lucide-react';
import { Card, CardHeader, CardBody, Badge, ReadinessMeter } from '@/components/ui';
import { states, products, requirements, phases, readinessItems, redFlags } from '@/data';
import { useAuditStore } from '@/stores/useAuditStore';
import { toBadgeStatus } from '@/lib/status';

function StatCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-ice-soft p-2 text-navy dark:bg-ice-soft/10 dark:text-ice"><Icon size={20} /></div>
          <div>
            <div className="text-2xl font-bold leading-none font-mono">{value}</div>
            <div className="text-xs text-grey-dark dark:text-grey-light mt-1">{label}</div>
          </div>
        </div>
        {hint && <p className="mt-2 text-[10px] text-grey dark:text-grey-light/60 leading-tight">{hint}</p>}
      </CardBody>
    </Card>
  );
}

export function Dashboard() {
  const researched = states.filter(s => s.tier !== 'Unresearched');
  const readyOrConditional = states.filter(s => s.status === 'Ready' || s.status === 'Conditional');
  const blockers = requirements.filter(r => r.status === 'Blocked');
  const phase1States = states.filter(s => s.phase === 'Phase 1' && s.tier !== 'Unresearched');
  const criticalStates = states.filter(s => s.priority === 'Critical' || s.priority === 'High').slice(0, 6);

  const { resolvedRemediations } = useAuditStore();

  const unresolvedCriticalCount = redFlags.filter(rf => {
    if (rf.risk !== 'Critical' && rf.risk !== 'High') return false;
    return rf.remediations.some(r => !resolvedRemediations.includes(r.id));
  }).length;

  // Calculate readiness completion
  const totalReadiness = readinessItems.length;
  const completedReadiness = readinessItems.filter(r => r.status === 'Complete').length;
  const readinessPercent = Math.round((completedReadiness / totalReadiness) * 100);

  return (
    <div className="space-y-4 text-navy dark:text-ice">
      <div>
        <h1 className="text-2xl font-bold">LCX USA — Regulatory Launch Dashboard</h1>
        <p className="text-sm text-grey-dark dark:text-grey-light mt-1">
          Synthesized from the LCX USA U.S. Market Entry &amp; Regulatory Strategy research corpus (784-page multi-agent transcript).
        </p>
      </div>

      {/* Critical warning alerts */}
      {unresolvedCriticalCount > 0 && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300 font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-red-500" />
            <span>
              <strong>Critical Audit Warning</strong>: There are {unresolvedCriticalCount} unresolved Critical/High risk audit flags active. Resolve these before launching.
            </span>
          </div>
          <Link to="/red-flags" className="underline font-bold shrink-0 hover:text-red-500">
            Open Audit Log &rarr;
          </Link>
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={MapPin} label="States with research coverage" value={`${researched.length} / ${states.length}`} hint="Remaining states are unresearched, not assumed safe." />
        <StatCard icon={ShieldCheck} label="States launchable now (Ready/Conditional)" value={readyOrConditional.length} hint="Phase 1 candidates, pending counsel sign-off." />
        <StatCard icon={AlertTriangle} label="Blocked requirements" value={blockers.length} hint="Domain-level blockers across the ontology." />
        <StatCard icon={Coins} label="Tracked products / assets" value={products.length} hint="Architecture options + listed-asset classifications." />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left Column: Stats & Lists */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>Phase 1 Launch Candidates</CardHeader>
              <CardBody>
                <p className="text-xs text-grey-dark dark:text-grey-light mb-3">Zero-or-low-licensing states for a non-custodial / wallet-only launch.</p>
                <ul className="space-y-2">
                  {phase1States.map(s => (
                    <li key={s.id} className="flex items-center justify-between text-sm">
                      <Link to="/states" className="hover:underline font-medium">{s.name}</Link>
                      <Badge status={toBadgeStatus(s.status)}>{s.status}</Badge>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>Highest-Priority States</CardHeader>
              <CardBody>
                <p className="text-xs text-grey-dark dark:text-grey-light mb-3">Critical/high priority states from the licensing matrix, regardless of phase.</p>
                <ul className="space-y-2">
                  {criticalStates.map(s => (
                    <li key={s.id} className="flex items-center justify-between text-sm">
                      <Link to="/states" className="hover:underline font-medium">{s.name} <span className="text-grey dark:text-grey-light/60 font-mono text-[10px]">({s.tier.replace(/^Tier \d - /, '')})</span></Link>
                      <Badge status={toBadgeStatus(s.status)}>{s.status}</Badge>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>

          {/* Key Blockers List */}
          <Card>
            <CardHeader>Key Blocker Requirements</CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {blockers.map(r => (
                  <li key={r.id} className="border-l-2 border-status-blocked pl-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{r.name}</span>
                      <Badge status={toBadgeStatus(r.status)}>{r.phase}</Badge>
                    </div>
                    <p className="text-xs text-grey-dark dark:text-grey-light mt-1">{r.description}</p>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: CFIUS & Operational Readiness */}
        <div className="space-y-4">
          {/* CFIUS Corporate Setup Panel */}
          <Card status="blocked">
            <CardHeader className="flex items-center gap-2 text-status-blocked border-b border-line px-4 py-3 font-semibold bg-red-50/50 dark:bg-red-950/10">
              <AlertTriangle size={18} className="text-status-blocked" /> CFIUS Gating — Foreign Parent (LCX AG)
            </CardHeader>
            <CardBody className="space-y-2 text-xs">
              <p>
                <strong>CFIUS Trigger</strong>: Foreign ownership/control exceeding <strong>25% voting rights</strong> in LCX USA by Liechtenstein parent (LCX AG) triggers voluntary national security filing.
              </p>
              <p>
                <strong>Mitigation Strategy</strong>: Draft passive investor covenants restricting voting power to &lt; 10%, preventing U.S. board seats, and blocking access to non-public tech specs.
              </p>
              <div className="flex justify-between items-center pt-2 border-t border-line mt-2 text-xs">
                <span className="font-semibold text-status-blocked uppercase tracking-wider text-[10px]">Gated / High Risk</span>
                <Link to="/howey" className="text-navy dark:text-ice hover:underline font-medium">Verify structure &rarr;</Link>
              </div>
            </CardBody>
          </Card>

          {/* Compliance Readiness Summary Progress */}
          <Card>
            <CardHeader className="flex items-center justify-between border-b border-line px-4 py-3 font-semibold">
              <span>Compliance Readiness</span>
              <Activity size={18} className="text-navy dark:text-ice" />
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span>Completed Controls</span>
                  <span className="font-mono">{readinessPercent}% ({completedReadiness} / {totalReadiness})</span>
                </div>
                <ReadinessMeter percent={readinessPercent} />
              </div>
              <p className="text-xs text-grey-dark dark:text-grey-light">
                Covers U.S. incorporation, intercompany licensing agreements, U.S. Terms of Service drafting, CCO hiring, and TRUST/OFAC monitoring.
              </p>
              <div className="pt-2 border-t border-line">
                <Link to="/readiness" className="text-xs text-navy dark:text-ice font-semibold hover:underline block">
                  Open Readiness Checklist &rarr;
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Rollout Phases Overview */}
      <Card>
        <CardHeader>Rollout Phases</CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {phases.map(p => (
              <div key={p.id} className="rounded-md border border-line p-3 bg-card">
                <div className="font-bold text-sm">{p.name}</div>
                <p className="text-xs text-grey-dark dark:text-grey-light mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <p className="text-xs text-grey">
        This dashboard reflects research findings, not legal advice. Every "Ready" or "Conditional" status still requires counsel confirmation before launch.
      </p>
    </div>
  );
}
