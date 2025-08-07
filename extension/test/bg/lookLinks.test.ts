import { createLookLink } from '../../src/background/lookLinks';
import { Look } from '../../src/lookbook/store';

test('stores look and returns url', () => {
  (global as any).chrome = {
    storage: { local: {} },
    runtime: { getURL: (p: string) => 'chrome-extension://test/' + p },
  };
  const look: Look = { id: '123', name: 'Test', items: [] };
  const url = createLookLink(look);
  expect(url).toBe('chrome-extension://test/look.html#123');
  expect((chrome.storage.local as any).lookLinks['123']).toEqual(look);
});
