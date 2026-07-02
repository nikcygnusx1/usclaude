import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/persistence';
import { STORAGE_KEYS } from '@/lib/storage';

export interface AuditLog {
  timestamp: string;
  message: string;
  category: 'Audit' | 'Architecture' | 'System' | 'Scenario';
}

export interface ReadinessAssignment {
  owner: string;
  notes: string;
  subtasks: Record<string, boolean>;
}

interface AuditStore {
  resolvedRemediations: string[];
  toggleRemediation: (id: string) => void;
  isRemediationResolved: (id: string) => boolean;
  auditLogs: AuditLog[];
  addAuditLog: (message: string, category?: AuditLog['category']) => void;
  clearAuditLogs: () => void;
  committedArchitecture: string | null;
  commitArchitecture: (arch: string | null) => void;
  readinessAssignments: Record<string, ReadinessAssignment>;
  updateReadinessAssignment: (
    id: string,
    owner: string,
    notes: string,
    subtasks?: Record<string, boolean>
  ) => void;
  readinessStatusOverrides: Record<string, 'Not Started' | 'In Progress' | 'Counsel Review' | 'Complete'>;
  updateReadinessStatus: (
    id: string,
    status: 'Not Started' | 'In Progress' | 'Counsel Review' | 'Complete'
  ) => void;
}

export const useAuditStore = create<AuditStore>()(
  persist(
    (set, get) => ({
      resolvedRemediations: [],
      toggleRemediation: (id) =>
        set((state) => {
          const isResolved = state.resolvedRemediations.includes(id);
          const next = isResolved
            ? state.resolvedRemediations.filter((x) => x !== id)
            : [...state.resolvedRemediations, id];

          const timestamp = new Date().toLocaleTimeString();
          const action = isResolved ? 'unchecked' : 'resolved';
          const logMsg = `CCO ${action} remediation: [${id}]`;
          const newLog: AuditLog = { timestamp, message: logMsg, category: 'Audit' };

          return {
            resolvedRemediations: next,
            auditLogs: [newLog, ...state.auditLogs].slice(0, 100),
          };
        }),
      isRemediationResolved: (id) => get().resolvedRemediations.includes(id),
      auditLogs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          message: 'System audit logs engine initialized successfully.',
          category: 'System',
        },
      ],
      addAuditLog: (message, category = 'System') =>
        set((state) => {
          const timestamp = new Date().toLocaleTimeString();
          const newLog: AuditLog = { timestamp, message, category };
          return { auditLogs: [newLog, ...state.auditLogs].slice(0, 100) };
        }),
      clearAuditLogs: () => set({ auditLogs: [] }),
      committedArchitecture: null,
      commitArchitecture: (arch) =>
        set((state) => {
          const timestamp = new Date().toLocaleTimeString();
          const logMsg = arch
            ? `CCO committed U.S. launch architecture to: Option [${arch}]`
            : `CCO cleared committed U.S. launch architecture`;
          const newLog: AuditLog = { timestamp, message: logMsg, category: 'Architecture' };
          return {
            committedArchitecture: arch,
            auditLogs: [newLog, ...state.auditLogs].slice(0, 100),
          };
        }),
      readinessAssignments: {},
      updateReadinessAssignment: (id, owner, notes, subtasks = {}) =>
        set((state) => {
          const prev = state.readinessAssignments[id] || { owner: '', notes: '', subtasks: {} };
          const nextAssignments = {
            ...state.readinessAssignments,
            [id]: { owner, notes, subtasks: { ...prev.subtasks, ...subtasks } },
          };

          const timestamp = new Date().toLocaleTimeString();
          const logMsg = `CCO updated task assignments for control: [${id}]`;
          const newLog: AuditLog = { timestamp, message: logMsg, category: 'System' };

          return {
            readinessAssignments: nextAssignments,
            auditLogs: [newLog, ...state.auditLogs].slice(0, 100),
          };
        }),
      readinessStatusOverrides: {},
      updateReadinessStatus: (id, status) =>
        set((state) => {
          const nextOverrides = {
            ...state.readinessStatusOverrides,
            [id]: status,
          };

          const timestamp = new Date().toLocaleTimeString();
          const logMsg = `CCO updated status for control [${id}] to: ${status}`;
          const newLog: AuditLog = { timestamp, message: logMsg, category: 'Audit' };

          return {
            readinessStatusOverrides: nextOverrides,
            auditLogs: [newLog, ...state.auditLogs].slice(0, 100),
          };
        }),
    }),
    {
      name: STORAGE_KEYS.AUDIT || 'lcx-usa-audit-store',
      storage: createJSONStorage(() => ({
        getItem: (n) => JSON.stringify(storage.get(n, null)),
        setItem: (n, v) => storage.set(n, JSON.parse(v)),
        removeItem: (n) => storage.remove(n),
      })),
    }
  )
);
