import React from 'react';
import { ScrollArea, ScrollBar } from '../ui/scrollarea';

export interface CarouselItem {
  id: string;
  name: string;
  image: string;
  price?: string;
}

interface Props {
  items: CarouselItem[];
}

export const SimilarProductsCarousel: React.FC<Props> = ({ items }) => (
  <ScrollArea className="w-full whitespace-nowrap scrollbar-none">
    <div className="flex w-max space-x-4 pb-2">
      {items.map((item) => (
        <div key={item.id} className="w-40 flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="rounded-lg aspect-square object-cover w-full"
          />
          <p className="text-sm mt-1">{item.name}</p>
          {item.price && <p className="text-sm font-semibold">{item.price}</p>}
        </div>
      ))}
    </div>
    <ScrollBar orientation="horizontal" className="hidden" />
  </ScrollArea>
);
