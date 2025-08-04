import { registerPriceWatcher } from '../../src/background/priceWatcher';

describe('price watcher', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  test('emits message on price drop', async () => {
    const state: any = {
      prices: { p1: { last: 100, original: 100 } },
      products: { store: [{ id: 'p1', url: 'https://example.com' }] },
      priceDrops: {},
    };

    global.fetch = jest.fn().mockResolvedValue({
      text: async () => JSON.stringify({ price: 50 }),
    }) as any;

    global.chrome = {
      runtime: { sendMessage: jest.fn() },
      storage: {
        local: {
          get: jest.fn(async () => state),
          set: jest.fn(async (items: any) => Object.assign(state, items)),
        },
      },
    } as any;

    registerPriceWatcher();
    await jest.runOnlyPendingTimersAsync();

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'PRICE_DROP',
      productId: 'p1',
      newPrice: 50,
    });
  });
});
