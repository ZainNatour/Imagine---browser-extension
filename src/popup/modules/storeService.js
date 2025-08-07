import { STORES_DATA_PATH } from "../../shared/constants.js";

let cachedStores;

export function clearStoreCache() {
  cachedStores = undefined;
}

export async function loadStores(dataUrl = STORES_DATA_PATH) {
  if (cachedStores) {
    return cachedStores;
  }
  try {
    const response = await fetch(chrome.runtime.getURL(dataUrl));
    if (!response.ok) {
      throw new Error(`Failed to fetch ${dataUrl}: ${response.status}`);
    }
    cachedStores = await response.json();
    return cachedStores;
  } catch (error) {
    console.error("Error loading stores:", error);
    throw error;
  }
}

export function applyFilters(stores, filters, searchTerm = "") {
  const term = searchTerm.toLowerCase();
  return stores.filter((store) => {
    const matchesSearch =
      term === "" ||
      store.name.toLowerCase().includes(term) ||
      store.clothingType.toLowerCase().includes(term);

    const storeDemographics = store.targetDemographic.map((d) => d.toLowerCase());
    const filterDemographics = filters.targetDemographic.map((d) => d.toLowerCase());
    const matchesDemographic =
      filterDemographics.length === 0 ||
      filterDemographics.some((demo) => storeDemographics.includes(demo));

    const storeClothingType = store.clothingType.toLowerCase();
    const filterClothingTypes = filters.clothingType.map((t) => t.toLowerCase());
    const matchesClothing =
      filterClothingTypes.length === 0 ||
      filterClothingTypes.includes(storeClothingType);

    const storePriceRange = store.priceRange.toLowerCase();
    const filterPriceRanges = filters.priceRange.map((p) => p.toLowerCase());
    const matchesPrice =
      filterPriceRanges.length === 0 ||
      filterPriceRanges.includes(storePriceRange);

    return matchesSearch && matchesDemographic && matchesClothing && matchesPrice;
  });
}
