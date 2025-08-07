import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductTab } from '../../src/popup/ProductTab';
import { CarouselItem } from '../../src/components/SimilarProductsCarousel';

beforeEach(() => {
  (global as any).chrome = {
    runtime: {
      sendMessage: (_msg: any, cb: (res: any) => void) => cb('loading'),
    },
  };
});

test('shows skeleton when loading', () => {
  render(<ProductTab loading />);
  expect(screen.getByTestId('skeleton')).toBeInTheDocument();
});

test('renders product info', () => {
  const product = {
    id: '1',
    name: 'Shirt',
    image: '/shirt.jpg',
    price: 20,
    oldPrice: 30,
    currency: '$',
    colors: ['#000'],
    sizes: ['S'],
    similar: [] as CarouselItem[]
  };
  render(<ProductTab product={product} />);
  expect(screen.getByText('Shirt')).toBeInTheDocument();
  expect(screen.getByLabelText('Add to cart')).toBeInTheDocument();
  expect(screen.getByLabelText('Add to wishlist')).toBeInTheDocument();
  expect(screen.getByLabelText('Try on')).toBeInTheDocument();
});
