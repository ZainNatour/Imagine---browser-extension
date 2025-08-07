import React from 'react';
import { useFilterStore } from './store';
import { FilterChip } from './FilterChip';
import { FilterGroup } from './FilterGroup';
import { RangeSlider } from './RangeSlider';

interface Props {
  demographics: string[];
  clothingTypes: string[];
}

export const FilterPanel: React.FC<Props> = ({ demographics, clothingTypes }) => {
  const { targetDemographic, clothingType, priceRange, setFilter, clearAll } = useFilterStore();
  return (
    <aside className="p-4 bg-white w-64" aria-label="Store filters">
      <div className="mb-4 flex flex-wrap">
        {[...targetDemographic, ...clothingType, ...priceRange].map((chip) => (
          <FilterChip key={chip} label={chip} onRemove={() => {
            setFilter('targetDemographic', targetDemographic.filter((d) => d !== chip));
            setFilter('clothingType', clothingType.filter((c) => c !== chip));
            setFilter('priceRange', priceRange.filter((p) => p !== chip));
          }} />
        ))}
        {(targetDemographic.length || clothingType.length || priceRange.length) && (
          <button className="underline ml-auto" onClick={clearAll}>Clear all</button>
        )}
      </div>
      <FilterGroup title="Target Demographic" options={demographics} selected={targetDemographic} onChange={(v) => setFilter('targetDemographic', v)} />
      <FilterGroup title="Clothing Type" options={clothingTypes} selected={clothingType} onChange={(v) => setFilter('clothingType', v)} />
      <div className="mb-4">
        <span className="font-semibold">Price Range</span>
        <RangeSlider min={0} max={1000} value={priceRange.map(Number) as number[]} onChange={(vals) => setFilter('priceRange', vals.map(String))} />
      </div>
    </aside>
  );
};
