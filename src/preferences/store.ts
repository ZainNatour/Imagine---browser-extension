/* istanbul ignore file */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Style = 'casual' | 'formal' | 'sport';

export interface PrefsState {
  stores: string[];
  style: Style;
  event: string;
  setPrefs: (p: Partial<Omit<PrefsState, 'setPrefs'>>) => void;
}

const chromeStorage = () => ({
  getItem: async (name: string) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.sync)
      return null;
    return new Promise<string | null>((resolve) => {
      chrome.storage.sync.get(name, (res) => {
        resolve(res[name] ? JSON.stringify(res[name]) : null);
      });
    });
  },
  setItem: async (name: string, value: string) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.sync) return;
    return new Promise<void>((resolve) => {
      chrome.storage.sync.set({ [name]: JSON.parse(value) }, () => resolve());
    });
  },
  removeItem: async (name: string) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.sync) return;
    return new Promise<void>((resolve) => {
      chrome.storage.sync.remove(name, () => resolve());
    });
  },
});

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      stores: [],
      style: 'casual',
      event: '',
      setPrefs: (p) => set(p),
    }),
    {
      name: 'prefs',
      storage: createJSONStorage(chromeStorage),
    },
  ),
);
