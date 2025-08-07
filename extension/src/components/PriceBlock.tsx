import React from 'react';
import { Card } from '../ui/card';

export interface PriceBlockProps {
  price: number;
  oldPrice?: number;
  currency: string;
}

export const PriceBlock: React.FC<PriceBlockProps> = ({ price, oldPrice, currency }) => {
  const hasDiscount = typeof oldPrice === 'number' && oldPrice > price;
  const savings = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  return (
    <Card className="p-4 flex items-center gap-3">
      <span className="text-xl font-semibold">{currency}{price.toFixed(2)}</span>
      {hasDiscount && (
        <span className="text-sm line-through text-gray-500 dark:text-gray-400">
          {currency}{oldPrice!.toFixed(2)}
        </span>
      )}
      <span className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded">
        {currency}
      </span>
      {hasDiscount && (
        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">
          Save {savings}%
        </span>
      )}
    </Card>
  );
};
