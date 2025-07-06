export function clearStoreCache(): void;
export function loadStores(dataUrl?: string): Promise<any[]>;
export function applyFilters(stores: any[], filters: any, searchTerm?: string): any[];
