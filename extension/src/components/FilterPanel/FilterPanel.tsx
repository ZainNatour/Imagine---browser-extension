import React, { useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/accordion';
import { Checkbox } from '../../ui/checkbox';
import { Slider } from '../../ui/slider';

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

  return (
    <aside className="bg-white rounded-2xl shadow-md p-4 w-64 lg:sticky lg:top-4 lg:ml-auto">
      <Accordion type="multiple" defaultValue={["demographic", "clothing", "price", "rating", "sort"]}>
        <AccordionItem value="demographic">
          <AccordionTrigger>Demographic</AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="clothing">
          <AccordionTrigger>Clothing Type</AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <Slider
              value={price}
              min={0}
              max={priceLabels.length - 1}
              step={1}
              onValueChange={(val) => setPrice(val)}
            />
            <div
              className="grid mt-2 text-xs w-full"
              style={{ gridTemplateColumns: `repeat(${priceLabels.length}, 1fr)` }}
            >
              {priceLabels.map((l, i) => (
                <span key={i} className="text-center">
                  {l}
                </span>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="rating">
          <AccordionTrigger>Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((n) => (
                <label key={n} className="flex items-center space-x-1">
                  <Checkbox
                    checked={rating.includes(n)}
                    onCheckedChange={() => toggleNum(n, rating, setRating)}
                  />
                  <span>{'★'.repeat(n)}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sort">
          <AccordionTrigger>Sort</AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
