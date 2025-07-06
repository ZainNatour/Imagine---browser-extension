import React from 'react';

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
  <div className="overflow-x-auto flex space-x-4 snap-x snap-mandatory pb-2">
    {items.map((item) => (
      <div key={item.id} className="snap-start w-40 flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="rounded-lg aspect-square object-cover w-full"
        />
        <p className="text-sm mt-1">{item.name}</p>
        {item.price && <p className="text-sm font-semibold">{item.price}</p>}
      </div>
    ))}
  </div>
);
