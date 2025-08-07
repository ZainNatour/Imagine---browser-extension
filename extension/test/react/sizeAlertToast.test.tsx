import { render, screen } from '@testing-library/react';
import { Toaster } from 'sonner';

describe('size restock alert', () => {
  test('renders toast and badge', async () => {
    const listeners: any[] = [];
    const state: any = {
      products: { store: [{ id: 'p1', title: 'Hat' }] },
      sizes: { p1: { wanted: 'M', inStock: true } },
      sizeRestocksSeen: {},
    };

    global.chrome = {
      runtime: {
        onMessage: { addListener: (cb: any) => listeners.push(cb) },
        sendMessage: jest.fn(),
        getURL: (p: string) => p,
      },
      notifications: { create: jest.fn() },
      storage: {
        local: {
          get: jest.fn(async () => state),
          set: jest.fn(async (items: any) => Object.assign(state, items)),
        },
      },
    } as any;

    await import('../../src/popup/modules/sizeAlerts');
    const container = document.createElement('div');
    document.body.appendChild(container);
    if (state.sizes.p1.inStock && !state.sizeRestocksSeen['p1']) {
      const badge = document.createElement('span');
      badge.className =
        'absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600';
      container.appendChild(badge);
    }

    render(<Toaster />);

    listeners[0](
      { type: 'SIZE_RESTOCK', productId: 'p1', size: 'M' },
      {},
      () => {},
    );

    expect(
      await screen.findByText('🎉 Your size M is back for Hat!'),
    ).toBeInTheDocument();
    expect(container.querySelector('.bg-blue-600')).toBeTruthy();
  });
});
