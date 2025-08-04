import React, { useState, useEffect } from 'react';
import { PriceBlock } from '../components/PriceBlock';
import { SimilarProductsCarousel, CarouselItem } from '../components/SimilarProductsCarousel';
import { RecommendationCarousel } from '../components/RecommendationCarousel';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  currency: string;
  colors: string[];
  sizes: string[];
  similar: CarouselItem[];
}

interface Props {
  product?: Product;
  loading?: boolean;
}

const VariantSelector: React.FC<{ colors: string[]; sizes: string[] }> = ({ colors, sizes }) => {
  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState(sizes[0]);
  return (
    <div className="my-4 space-y-2">
      <div className="flex space-x-2">
        {colors.map((c) => (
          <button
            key={c}
            aria-label={c}
            className={`w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 ${
              color === c ? 'ring-2 ring-primary' : ''
            }`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <select
        className="w-full border rounded p-1 dark:bg-gray-800 dark:border-gray-600"
        value={size}
        onChange={(e) => setSize(e.target.value)}
      >
        {sizes.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

export const ProductTab: React.FC<Props> = ({ product, loading }) => {
  const [summary, setSummary] = useState<string | null>(null);
  useEffect(() => {
    if (!product) return;
    chrome.runtime.sendMessage(
      { type: 'GET_REVIEW_SUMMARY', id: product.id },
      (res: string) => setSummary(res),
    );
  }, [product?.id]);

  if (loading || !product) {
    return (
      <div className="p-4 animate-pulse space-y-4" data-testid="skeleton">
        <div className="bg-gray-300 dark:bg-gray-700 rounded-xl aspect-square w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
      </div>
    );
  }

  return (
    <div className="p-4 text-gray-900 dark:text-gray-100 max-w-md mx-auto grid gap-4 sm:grid-cols-2">
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className="w-full aspect-square object-cover rounded-xl mb-4 sm:mb-0"
      />
      <div>
        <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
        <PriceBlock price={product.price} oldPrice={product.oldPrice} currency={product.currency} />
        <VariantSelector colors={product.colors} sizes={product.sizes} />
        <button
          aria-label="Add to dressing room"
          title="Add to dressing room"
          className="mt-2 px-4 py-2 bg-primary text-white rounded"
        >
          Add to Dressing Room
        </button>
      </div>
      <div className="sm:col-span-2 mt-4">
        <SimilarProductsCarousel items={product.similar} />
      </div>
      <Accordion type="single" collapsible className="sm:col-span-2">
        <AccordionItem value="buzz">
          <AccordionTrigger>Customer Buzz</AccordionTrigger>
          <AccordionContent>
            {summary === 'loading' || summary === null ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <ul className="list-disc pl-4 space-y-1">
                {summary
                  .split(/\n|\.\s+/)
                  .filter(Boolean)
                  .map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="sm:col-span-2">
        <RecommendationCarousel seedIds={[product.id]} />
      </div>
    </div>
  );
};
