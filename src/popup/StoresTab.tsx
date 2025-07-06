import React, { useEffect, useState } from 'react';
let loadStores: () => Promise<Store[]>;
import { FilterPanel, FilterValues } from '../components/FilterPanel';

interface Store {
  name: string;
  image: string;
  clothingType: string;
  targetDemographic: string[];
  priceRange: string;
  url: string;
  rating?: number;
}

interface Props {
  initialStores?: Store[];
}

const priceCategories = ['Low', 'Mid', 'High', 'Luxury'];

function mapPriceRange(range: number[]): string[] {
  const [min, max] = range;
  return priceCategories.slice(min, max + 1);
}

function filterStores(
  stores: Store[],
  filters: { demographic: string[]; clothing: string[]; price: string[]; rating: number[] }
) {
  return stores.filter((s) => {
    const matchDemo =
      filters.demographic.length === 0 ||
      filters.demographic.some((d) => s.targetDemographic.includes(d));
    const matchClothing =
      filters.clothing.length === 0 || filters.clothing.includes(s.clothingType);
    const matchPrice = filters.price.length === 0 || filters.price.includes(s.priceRange);
    const matchRating =
      filters.rating.length === 0 || filters.rating.includes(s.rating || 0);
    return matchDemo && matchClothing && matchPrice && matchRating;
  });
}

export const StoresTab: React.FC<Props> = ({ initialStores }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [filtered, setFiltered] = useState<Store[]>([]);

  useEffect(() => {
    (async () => {
      if (!initialStores) {
        const mod = await import('./modules/storeService.js');
        loadStores = mod.loadStores;
      }
      const data = initialStores || (await loadStores());
      const withRatings = data.map((s) => ({ ...s, rating: Math.floor(Math.random() * 5) + 1 }));
      setStores(withRatings);
      setFiltered(withRatings);
    })();
  }, [initialStores]);

  const handleApply = (values: FilterValues) => {
    let result = filterStores(stores, {
      demographic: values.demographic,
      clothing: values.clothing,
      price: mapPriceRange(values.price),
      rating: values.rating,
    });
    if (values.sort === 'Name (A-Z)') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (values.sort === 'Name (Z-A)') {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    }
    setFiltered(result);
  };

  const demographics = Array.from(new Set(stores.flatMap((s) => s.targetDemographic)));
  const clothingTypes = Array.from(new Set(stores.map((s) => s.clothingType)));

  return (
    <div className="flex flex-col lg:flex-row">
      <FilterPanel
        demographics={demographics}
        clothingTypes={clothingTypes}
        priceLabels={priceCategories}
        sortOptions={['Name (A-Z)', 'Name (Z-A)']}
        onApply={handleApply}
      />
      <div className="grid grid-cols-2 gap-4 p-4 flex-1">
        {filtered.map((store) => (
          <a key={store.name} href={store.url} className="text-center">
            <img src={store.image} alt={store.name} className="w-full rounded-xl mb-1" />
            <p>{store.name}</p>
          </a>
        ))}
      </div>
    </div>
  );
};
