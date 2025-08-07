export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  store: string;
}

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Smart Glasses',
    description: 'AR-enabled smart glasses',
    price: 299.99,
    image: '/images/glasses.jpg',
    store: 'Store A',
  },
  {
    id: '2',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling over-ear headphones',
    price: 199.99,
    image: '/images/headphones.jpg',
    store: 'Store B',
  },
  {
    id: '3',
    name: 'Smartwatch',
    description: 'Fitness-focused smartwatch',
    price: 149.99,
    image: '/images/smartwatch.jpg',
    store: 'Store A',
  },
];
