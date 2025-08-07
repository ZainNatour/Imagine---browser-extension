import assert from 'node:assert/strict';

// In-memory chrome.storage.sync mock
const storage = { wishlist: [] };

global.chrome = {
  runtime: { lastError: null },
  storage: {
    sync: {
      get(query, cb) {
        const result = {};
        for (const key in query) {
          result[key] = key in storage ? storage[key] : query[key];
        }
        cb(result);
      },
      set(items, cb) {
        Object.assign(storage, items);
        cb && cb();
      },
    },
  },
};

import { toggleWishlist, getWishlist } from '../src/popup/modules/wishlist.js';

async function runTests() {
  const item = {
    url: 'https://example.com/product/1',
    imageSrc: 'https://example.com/img1.png',
    name: 'Test Item',
  };

  let result = await toggleWishlist(item);
  assert.equal(result, true, 'added on first toggle');
  let list = await getWishlist();
  assert.equal(list.length, 1, 'wishlist has one item');

  result = await toggleWishlist(item);
  assert.equal(result, false, 'removed on second toggle');
  list = await getWishlist();
  assert.equal(list.length, 0, 'wishlist empty after removal');

  result = await toggleWishlist(item);
  assert.equal(result, true, 'added again after removal');
  list = await getWishlist();
  assert.equal(list.length, 1, 'wishlist has one item again');

  result = await toggleWishlist(item);
  assert.equal(result, false, 'removed again on final toggle');
  list = await getWishlist();
  assert.equal(list.length, 0, 'wishlist empty at end');

  console.log('All tests passed');
}

runTests();
