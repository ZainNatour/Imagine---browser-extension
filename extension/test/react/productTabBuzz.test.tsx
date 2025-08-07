import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductTab } from '../../src/popup/ProductTab';
import { CarouselItem } from '../../src/components/SimilarProductsCarousel';

beforeEach(() => {
  (global as any).chrome = {
    runtime: {
      sendMessage: (_msg: any, cb: (res: any) => void) => cb('Great product'),
    },
  };
});

test('shows review summary in accordion', async () => {
  const product = {
    id: '1',
    name: 'Shirt',
    image: '/shirt.jpg',
    price: 20,
    currency: '$',
    colors: ['#000'],
    sizes: ['S'],
    similar: [] as CarouselItem[],
  };
  render(<ProductTab product={product} />);
  fireEvent.click(await screen.findByText('Customer Buzz'));
  expect(await screen.findByText('Great product')).toBeInTheDocument();
});
