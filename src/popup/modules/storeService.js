import { STORES_DATA_PATH } from "../../shared/constants.js";

export async function loadStores(dataUrl = STORES_DATA_PATH) {
  try {
    const response = await fetch(chrome.runtime.getURL(dataUrl));
    if (!response.ok) {
      throw new Error(`Failed to fetch ${dataUrl}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading stores:', error);
    if (error instanceof TypeError) {
      // Network or fetch failure, return an empty array so the UI can handle it
      return [];
    }
    throw new Error(`Failed to load stores: ${error.message}`);
  }
}

export function applyFilters(stores, filters, searchTerm = "") {
  const term = searchTerm.toLowerCase();
  return stores.filter((store) => {
    const matchesSearch =
      term === "" ||
      store.name.toLowerCase().includes(term) ||
      store.clothingType.toLowerCase().includes(term);
    const matchesDemographic =
      filters.targetDemographic.length === 0 ||
      filters.targetDemographic.some((demo) => store.targetDemographic.includes(demo));
    const matchesClothing =
      filters.clothingType.length === 0 ||
      filters.clothingType.includes(store.clothingType);
    const matchesPrice =
      filters.priceRange.length === 0 ||
      filters.priceRange.includes(store.priceRange);
    return matchesSearch && matchesDemographic && matchesClothing && matchesPrice;
  });
}
