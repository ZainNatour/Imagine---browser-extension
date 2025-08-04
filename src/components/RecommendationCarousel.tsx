import React, { useEffect, useState } from 'react';
import { ScrollArea, ScrollBar } from '../ui/scrollarea';
import { fetchSuggestions, Product } from '../recommender/api';
import { usePrefsStore } from '../preferences/store';

interface Props {
  seedIds: string[];
}

export const RecommendationCarousel: React.FC<Props> = ({ seedIds }) => {
  const { stores, style, event } = usePrefsStore();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    fetchSuggestions(seedIds, { stores, style, event }).then(setItems).catch(() => setItems([]));
  }, [seedIds, stores, style, event]);

  if (items.length === 0) return <div>No suggestions yet</div>;

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex w-max space-x-4 pb-2">
        {items.map((item) => (
          <div key={item.id} className="w-40 flex-shrink-0" data-testid="product-card">
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="rounded-lg aspect-square object-cover w-full"
            />
            <p className="text-sm mt-1">{item.name}</p>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="hidden" />
    </ScrollArea>
  );
};
