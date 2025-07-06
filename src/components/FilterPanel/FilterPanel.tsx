import React, { useState } from 'react';
import { Transition } from '@headlessui/react';
import Slider from '@mui/material/Slider';

export interface FilterValues {
  demographic: string[];
  clothing: string[];
  price: number[];
  rating: number[];
  sort: string;
}

interface Props {
  demographics: string[];
  clothingTypes: string[];
  priceLabels: string[];
  sortOptions: string[];
  onApply: (values: FilterValues) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-2">
      <button
        className="w-full flex justify-between items-center py-2"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <span className={`transform transition-transform ${open ? 'rotate-90' : 'rotate-0'}`}>{'>'}</span>
      </button>
      <Transition
        show={open}
        enter="transition duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pl-2 space-y-2">
          {children}
        </div>
      </Transition>
    </div>
  );
}

function toggle(value: string, list: string[], setList: (v: string[]) => void) {
  setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
}
function toggleNum(value: number, list: number[], setList: (v: number[]) => void) {
  setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
}

export const FilterPanel: React.FC<Props> = ({
  demographics,
  clothingTypes,
  priceLabels,
  sortOptions,
  onApply,
}) => {
  const [demographic, setDemographic] = useState<string[]>([]);
  const [clothing, setClothing] = useState<string[]>([]);
  const [price, setPrice] = useState<number[]>([0, priceLabels.length - 1]);
  const [rating, setRating] = useState<number[]>([]);
  const [sort, setSort] = useState<string>(sortOptions[0]);

  const apply = () => {
    onApply({ demographic, clothing, price, rating, sort });
  };

  const marks = priceLabels.map((l, i) => ({ value: i, label: l }));

  return (
    <aside className="bg-white rounded-2xl shadow-md p-4 w-64 lg:sticky lg:top-4 lg:ml-auto">
      <Section title="Demographic">
        <div className="flex flex-wrap gap-2">
          {demographics.map((d) => (
            <button
              key={d}
              className={`px-2 py-1 rounded-2xl border text-sm ${
                demographic.includes(d) ? 'bg-primary text-white' : ''
              }`}
              onClick={() => toggle(d, demographic, setDemographic)}
            >
              {d}
            </button>
          ))}
        </div>
      </Section>
      <Section title="Clothing Type">
        <div className="flex flex-wrap gap-2">
          {clothingTypes.map((c) => (
            <button
              key={c}
              className={`px-2 py-1 rounded-2xl border text-sm ${
                clothing.includes(c) ? 'bg-primary text-white' : ''
              }`}
              onClick={() => toggle(c, clothing, setClothing)}
            >
              {c}
            </button>
          ))}
        </div>
      </Section>
      <Section title="Price Range">
        <Slider
          value={price}
          min={0}
          max={priceLabels.length - 1}
          step={1}
          marks={marks}
          onChange={(_, val) => setPrice(val as number[])}
        />
      </Section>
      <Section title="Rating">
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((n) => (
            <label key={n} className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={rating.includes(n)}
                onChange={() => toggleNum(n, rating, setRating)}
              />
              <span>{'★'.repeat(n)}</span>
            </label>
          ))}
        </div>
      </Section>
      <Section title="Sort">
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <label key={opt} className="flex items-center space-x-1">
              <input
                type="radio"
                name="sort"
                value={opt}
                checked={sort === opt}
                onChange={() => setSort(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </Section>
      <button
        onClick={apply}
        aria-label="Apply Filters"
        className="hidden lg:block mt-2 w-full bg-primary text-white py-2 rounded"
      >
        Apply
      </button>
      <button
        onClick={apply}
        aria-label="Apply Filters"
        className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white p-4 rounded-full shadow-md"
      >
        Apply
      </button>
    </aside>
  );
};
