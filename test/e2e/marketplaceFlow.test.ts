import React from 'react';
import { readFileSync } from 'fs';
import path from 'path';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Popup } from '../../src/popup/popup';
import { useMarketplaceStore } from '../../src/popup/MarketplaceTab';

(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const products = Array.from({ length: 40 }, (_, i) => ({
  id: `${i}`,
  name: `Product ${i}`,
  image: '/img.jpg',
  price: i,
  store: `Store${i % 4}`,
}));

beforeEach(() => {
  readFileSync(path.join(__dirname, '../../src/popup/popup.html'), 'utf-8');
  document.body.innerHTML = '<div id="root"></div>';
  (global as any).chrome = {
    runtime: {
      sendMessage: (_msg: string, cb: (res: any) => void) => cb(products),
    },
    storage: {
      sync: {
        get: (_key: string, cb: (res: any) => void) => cb({}),
        set: () => {},
      },
    },
  };
  useMarketplaceStore.setState({
    products: [],
    filters: { stores: [], price: [0, Number.MAX_SAFE_INTEGER], demographic: [], clothing: [], rating: [] },
    sort: '',
  });
});

test('lazy rows render on scroll', async () => {
  render(React.createElement(Popup), { container: document.getElementById('root')! });
  const trigger = screen.getByRole('tab', { name: 'Marketplace' });
  fireEvent.mouseDown(trigger);
  fireEvent.click(trigger);
  await waitFor(() => document.querySelectorAll('[data-testid="product-card"]').length > 0);
  const grid = document.querySelector('[data-testid="market-grid"]') as HTMLElement;
  const initialCount = document.querySelectorAll('[data-testid="product-card"]').length;
  expect(initialCount).toBeLessThan(products.length);
  act(() => {
    grid.scrollTop = 1200;
    fireEvent.scroll(grid);
  });
  await waitFor(() => expect(grid.scrollTop).toBe(1200));
  const afterCount = document.querySelectorAll('[data-testid="product-card"]').length;
  expect(afterCount).toBeLessThan(products.length);
});

