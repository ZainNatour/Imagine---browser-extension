import { render, screen } from '@testing-library/react';
import { Toaster } from 'sonner';

describe('price alert toast', () => {
  test('renders toast on message', async () => {
    const listeners: any[] = [];
    const state = {
      products: { store: [{ id: 'p1', title: 'Hat' }] },
      priceDrops: { p1: { oldPrice: 100, newPrice: 50, seen: false } },
    };

    global.chrome = {
      runtime: {
        onMessage: { addListener: (cb: any) => listeners.push(cb) },
        sendMessage: jest.fn(),
        getURL: (p: string) => p,
      },
      notifications: { create: jest.fn() },
      storage: { local: { get: jest.fn(async () => state) } },
    } as any;

    await import('../../src/popup/modules/priceAlerts');

    render(<Toaster />);

    listeners[0](
      { type: 'PRICE_DROP', productId: 'p1', newPrice: 50 },
      {},
      () => {},
    );

    expect(
      await screen.findByText('🔥 Price drop on Hat: was $100, now $50!'),
    ).toBeInTheDocument();
  });
});
