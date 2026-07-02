import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/persistence';
import { STORAGE_KEYS } from '@/lib/storage';

interface AuditStore {
  resolvedRemediations: string[];
  toggleRemediation: (id: string) => void;
  isRemediationResolved: (id: string) => boolean;
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
          return { resolvedRemediations: next };
        }),
      isRemediationResolved: (id) => get().resolvedRemediations.includes(id),
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
