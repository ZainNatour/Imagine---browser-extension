/* istanbul ignore file */
import { create } from 'zustand';

export interface PlacedItem {
  productId: string;
  x: number;
  y: number;
  z: number;
}

export interface Look {
  id: string;
  name: string;
  items: PlacedItem[];
}

interface LookbookState {
  looks: Look[];
  current: Look | null;
  createLook: (name: string) => void;
  addItem: (item: PlacedItem) => void;
  moveItem: (productId: string, x: number, y: number) => void;
  saveLook: () => Promise<void>;
  deleteLook: (id: string) => void;
}

export const useLookbookStore = create<LookbookState>((set, get) => ({
  looks: [],
  current: null,
  createLook: (name) => {
    const id = crypto.randomUUID();
    const look: Look = { id, name, items: [] };
    set((state) => ({ looks: [...state.looks, look], current: look }));
  },
  addItem: (item) =>
    set((state) => {
      if (!state.current) return state;
      const updated = { ...state.current, items: [...state.current.items, item] };
      return {
        looks: state.looks.map((l) => (l.id === updated.id ? updated : l)),
        current: updated,
      };
    }),
  moveItem: (productId, x, y) =>
    set((state) => {
      if (!state.current) return state;
      const items = state.current.items.map((it) =>
        it.productId === productId ? { ...it, x, y } : it,
      );
      const updated = { ...state.current, items };
      return {
        looks: state.looks.map((l) => (l.id === updated.id ? updated : l)),
        current: updated,
      };
    }),
  saveLook: async () => {
    const { looks } = get();
    await new Promise<void>((resolve) => {
      chrome.storage.sync.set({ looks }, () => resolve());
    });
  },
  deleteLook: (id) =>
    set((state) => ({
      looks: state.looks.filter((l) => l.id !== id),
      current: state.current && state.current.id === id ? null : state.current,
    })),
}));
