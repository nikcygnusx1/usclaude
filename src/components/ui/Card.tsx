import { clsx } from 'clsx';
type StatusType = 'ready' | 'conditional' | 'blocked' | 'deferred' | 'unverified';
interface CardProps { children: React.ReactNode; className?: string; status?: StatusType; }
const statusBorderMap: Record<StatusType, string> = {
  ready: 'border-l-status-ready', conditional: 'border-l-status-conditional',
  blocked: 'border-l-status-blocked', deferred: 'border-l-status-deferred', unverified: 'border-l-status-unverified',
};
export function Card({ children, className, status }: CardProps) { return <div className={clsx('rounded-lg border border-line bg-card shadow-sm', status && 'border-l-4', status && statusBorderMap[status], className)}>{children}</div>; }
export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={clsx('px-4 py-3 border-b border-line font-semibold', className)}>{children}</div>; }
export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={clsx('px-4 py-3', className)}>{children}</div>; }
export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={clsx('px-4 py-3 border-t border-line bg-ice-soft text-sm', className)}>{children}</div>; }
