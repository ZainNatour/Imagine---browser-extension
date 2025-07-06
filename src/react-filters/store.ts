import { create } from 'zustand';

export interface FilterState {
  targetDemographic: string[];
  clothingType: string[];
  priceRange: string[];
  setFilter: (name: keyof Omit<FilterState, 'setFilter'>, values: string[]) => void;
  clearAll: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  targetDemographic: [],
  clothingType: [],
  priceRange: [],
  setFilter: (name, values) => set({ [name]: values } as unknown as Pick<FilterState, keyof FilterState>),
  clearAll: () => set({ targetDemographic: [], clothingType: [], priceRange: [] }),
}));
