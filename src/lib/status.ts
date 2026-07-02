import { Status } from '@/types/ontology';

export type BadgeStatusKey = 'ready' | 'conditional' | 'blocked' | 'deferred' | 'unverified';

export function toBadgeStatus(status: Status): BadgeStatusKey {
  switch (status) {
    case 'Ready': return 'ready';
    case 'Conditional': return 'conditional';
    case 'Blocked': return 'blocked';
    case 'Deferred': return 'deferred';
    case 'Needs verification': return 'unverified';
    default: return 'unverified';
  }
}
