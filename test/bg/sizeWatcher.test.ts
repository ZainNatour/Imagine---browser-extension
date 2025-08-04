import { registerSizeWatcher } from '../../src/background/sizeWatcher';

describe('size watcher', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  test('emits message only when size becomes available', async () => {
    const state: any = {
      sizes: { p1: { wanted: 'M', inStock: false } },
      products: { store: [{ id: 'p1', url: 'https://example.com' }] },
    };

    const htmlOut =
      '<select name="size"><option disabled>M</option></select>';
    const htmlIn =
      '<select name="size"><option>M</option></select>';
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ text: async () => htmlOut })
      .mockResolvedValueOnce({ text: async () => htmlIn }) as any;

    global.chrome = {
      runtime: { sendMessage: jest.fn() },
      storage: {
        local: {
          get: jest.fn(async () => state),
          set: jest.fn(async (items: any) => Object.assign(state, items)),
        },
      },
    } as any;

    registerSizeWatcher();
    await jest.runOnlyPendingTimersAsync();
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();

    await jest.runOnlyPendingTimersAsync();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'SIZE_RESTOCK',
      productId: 'p1',
      size: 'M',
    });
  });
});
