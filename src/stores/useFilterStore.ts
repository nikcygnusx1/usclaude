import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/persistence';
import { STORAGE_KEYS } from '@/lib/storage';
import { useAuditStore } from './useAuditStore';
import type { Status, Phase, Confidence, VerificationStatus, SourceAuthority } from '@/types/ontology';

interface FilterState {
  selectedStatuses: Status[];
  selectedPhases: Phase[];
  selectedDomains: string[];
  selectedConfidences: Confidence[];
  selectedVerificationStatuses: VerificationStatus[];
  selectedSourceAuthorities: SourceAuthority[];
  searchQuery: string;
  clarityEnacted: boolean;
  spdiEquivalence: boolean;
  micaPassport: boolean;
}

interface FilterStore extends FilterState {
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  toggleClarityEnacted: () => void;
  toggleFilterStoreField: (key: 'clarityEnacted' | 'spdiEquivalence' | 'micaPassport') => void;
  resetFilters: () => void;
}

const init: FilterState = {
  selectedStatuses: [],
  selectedPhases: [],
  selectedDomains: [],
  selectedConfidences: [],
  selectedVerificationStatuses: [],
  selectedSourceAuthorities: [],
  searchQuery: '',
  clarityEnacted: false,
  spdiEquivalence: false,
  micaPassport: false
};

export const useFilterStore = create<FilterStore>()(persist(set => ({
  ...init,
  setFilter: (key, value) => set({ [key]: value } as any),
  toggleClarityEnacted: () => set(s => {
    const nextVal = !s.clarityEnacted;
    try {
      const auditStore = useAuditStore.getState();
      if (auditStore.safeHarborToggles.commodityExempt !== nextVal) {
        useAuditStore.setState(prev => ({
          safeHarborToggles: { ...prev.safeHarborToggles, commodityExempt: nextVal }
        }));
      }
    } catch {}
    return { clarityEnacted: nextVal };
  }),
  toggleFilterStoreField: (key) => set(s => {
    const nextVal = !s[key];
    try {
      const auditStore = useAuditStore.getState();
      if (key === 'micaPassport') {
        if (auditStore.safeHarborToggles.micaExempt !== nextVal) {
          useAuditStore.setState(prev => ({
            safeHarborToggles: { ...prev.safeHarborToggles, micaExempt: nextVal }
          }));
        }
      } else if (key === 'clarityEnacted') {
        if (auditStore.safeHarborToggles.commodityExempt !== nextVal) {
          useAuditStore.setState(prev => ({
            safeHarborToggles: { ...prev.safeHarborToggles, commodityExempt: nextVal }
          }));
        }
      }
    } catch {}
    return { [key]: nextVal } as any;
  }),
  resetFilters: () => set({ ...init }),
}), {
  name: STORAGE_KEYS.FILTERS,
  storage: createJSONStorage(() => ({
    getItem: (n) => JSON.stringify(storage.get(n, null)),
    setItem: (n, v) => storage.set(n, JSON.parse(v)),
    removeItem: (n) => storage.remove(n),
  })),
}));

