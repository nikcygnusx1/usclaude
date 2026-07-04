import { Status, Phase } from '@/types/ontology';

export const STATUS_DOT_BG: Record<string, string> = {
  Ready: 'bg-status-ready',
  Conditional: 'bg-status-conditional',
  Blocked: 'bg-status-blocked',
  Deferred: 'bg-status-deferred',
  'Needs verification': 'bg-status-unverified',
};

export const STATUS_TILE_BG: Record<string, string> = {
  Ready: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400',
  Conditional: 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400',
  Blocked: 'bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-400',
  Deferred: 'bg-slate-500/10 border-slate-500/25 text-slate-600 dark:text-slate-400',
  'Needs verification': 'bg-slate-400/10 border-slate-400/25 text-slate-500 dark:text-slate-400',
};

export const STATUS_FILL_COLOR: Record<Status, string> = {
  Ready: 'rgb(var(--green))',
  Conditional: 'rgb(var(--amber))',
  Blocked: 'rgb(var(--red))',
  Deferred: 'rgba(var(--grey) / 0.7)',
  'Needs verification': 'rgb(var(--grey))',
};

export const MAP_FILL: Record<string, string> = {
  ready: 'rgb(var(--green))',
  blocked: 'rgb(var(--red))',
  conditional: 'rgb(var(--amber))',
  default: 'rgb(var(--grey))',
  unresearched: 'rgba(var(--grey) / 0.25)',
  filtered: 'rgba(var(--grey) / 0.08)',
};

export const PHASE_COLORS: Record<Phase, string> = {
  'Pre-launch': 'rgb(var(--indigo))',
  'Phase 1': 'rgb(var(--green))',
  'Phase 2': 'rgb(var(--indigo))',
  'Phase 3': 'rgb(var(--red))',
  'Post-CLARITY': 'rgb(var(--amber))',
};

export function getDomainColor(domainName: string): string {
  if (domainName.includes('Entity')) return 'rgb(var(--indigo))';
  if (domainName.includes('Federal')) return 'rgb(var(--green))';
  if (domainName.includes('State')) return 'rgb(var(--indigo))';
  if (domainName.includes('Custody')) return 'rgb(var(--green))';
  if (domainName.includes('Payments')) return 'rgb(var(--indigo))';
  if (domainName.includes('Asset')) return 'rgb(var(--amber))';
  if (domainName.includes('Surveillance')) return 'rgb(var(--red))';
  if (domainName.includes('Product')) return 'rgb(var(--green))';
  return 'rgb(var(--grey))';
}

export function howeyScoreColor(score: number): string {
  if (score >= 70) return 'text-status-blocked';
  if (score >= 40) return 'text-status-conditional';
  return 'text-status-ready';
}

export function howeyScoreBg(score: number): string {
  if (score >= 70) return 'bg-status-blocked';
  if (score >= 40) return 'bg-status-conditional';
  return 'bg-status-ready';
}

export function howeyScoreLabel(score: number): string {
  if (score >= 75) return 'Critical Risk';
  if (score >= 45) return 'Medium Risk';
  return 'Low Risk';
}
