export async function loadStores(dataUrl) {
  try {
    const response = await fetch(chrome.runtime.getURL(dataUrl));
    if (!response.ok) {
      throw new Error(`Failed to fetch ${dataUrl}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading stores:', error);
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
