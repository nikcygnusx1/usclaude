import { clsx } from 'clsx';
type BadgeStatus = 'ready' | 'conditional' | 'blocked' | 'deferred' | 'unverified';
interface BadgeProps { status: BadgeStatus; children: React.ReactNode; className?: string; }
const statusStyles: Record<BadgeStatus, string> = {
  ready: 'bg-status-ready-bg text-status-ready', conditional: 'bg-status-conditional-bg text-status-conditional',
  blocked: 'bg-status-blocked-bg text-status-blocked', deferred: 'bg-status-deferred-bg text-status-deferred', unverified: 'bg-status-unverified-bg text-status-unverified',
};
export function Badge({ status, children, className }: BadgeProps) { return <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyles[status], className)} aria-label={`Status: ${status}`}>{children}</span>; }
