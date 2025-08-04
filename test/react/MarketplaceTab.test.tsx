import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MarketplaceTab, useMarketplaceStore } from '../../src/popup/MarketplaceTab';

(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const stores = ['Nike', 'Adidas', 'Puma', 'Reebok'];
const products = Array.from({ length: 40 }, (_, i) => ({
  id: `${i}`,
  name: `${stores[i % 4]} Item ${i}`,
  image: '/img.jpg',
  price: i,
  store: stores[i % 4],
}));

beforeEach(() => {
  (global as any).chrome = {
    runtime: {
      sendMessage: (_msg: string, cb: (res: any) => void) => cb(products),
    },
  };
  useMarketplaceStore.setState({
    products: [],
    filters: { stores: [], price: [0, Number.MAX_SAFE_INTEGER], demographic: [], clothing: [], rating: [] },
    sort: '',
  });
});

test('filters by store and price', async () => {
  render(<MarketplaceTab />);
  await screen.findByText('Nike Item 0');
  const nikeChip = screen.getByRole('button', { name: 'Nike' });
  fireEvent.click(nikeChip);
  act(() => {
    useMarketplaceStore.getState().applyFilters({
      stores: useMarketplaceStore.getState().filters.stores,
      price: [0, 20],
      demographic: [],
      clothing: [],
      rating: [],
      sort: '',
    });
  });
  expect(screen.queryByText('Adidas Item 1')).toBeNull();
  const cards = screen.getAllByTestId('product-card');
  expect(cards.every((c) => c.getAttribute('data-store') === 'Nike')).toBe(true);
});

