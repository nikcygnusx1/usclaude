import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/persistence';
import { STORAGE_KEYS } from '@/lib/storage';
import type { Status, Phase, Confidence, VerificationStatus, SourceAuthority } from '@/types/ontology';

interface FilterState {
  selectedStatuses: Status[]; selectedPhases: Phase[]; selectedDomains: string[];
  selectedConfidences: Confidence[]; selectedVerificationStatuses: VerificationStatus[];
  selectedSourceAuthorities: SourceAuthority[]; searchQuery: string;
}
interface FilterStore extends FilterState {
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}
const init: FilterState = { selectedStatuses:[], selectedPhases:[], selectedDomains:[], selectedConfidences:[], selectedVerificationStatuses:[], selectedSourceAuthorities:[], searchQuery:'' };
export const useFilterStore = create<FilterStore>()(persist(set => ({
  ...init,
  setFilter: (key, value) => set({ [key]: value }),
  resetFilters: () => set({ ...init }),
}), {
  name: STORAGE_KEYS.FILTERS,
  storage: createJSONStorage(() => ({
    getItem: (n) => JSON.stringify(storage.get(n, null)),
    setItem: (n, v) => storage.set(n, JSON.parse(v)),
    removeItem: (n) => storage.remove(n),
  })),
}));
