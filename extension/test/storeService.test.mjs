import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let fetchCount = 0;

global.chrome = {
  runtime: {
    // In tests, map extension URLs to files under `src/assets`.
    getURL: (p) => pathToFileURL(join(__dirname, '..', 'src/assets', p)).href,
  },
};

global.fetch = async (url) => {
  fetchCount++;
  if (url.startsWith('file://')) {
    const data = await fs.readFile(new URL(url), 'utf8');
    return { ok: true, json: async () => JSON.parse(data) };
  }
  throw new Error('Unsupported protocol in test fetch');
};

import { loadStores, clearStoreCache } from '../src/popup/modules/storeService.js';

async function runTests() {
  clearStoreCache();
  fetchCount = 0;
  const stores1 = await loadStores('data/stores.json');
  assert.ok(Array.isArray(stores1) && stores1.length > 0, 'loaded stores');
  assert.equal(fetchCount, 1, 'fetch called first time');

  const stores2 = await loadStores('data/stores.json');
  assert.equal(fetchCount, 1, 'cache used on second call');
  assert.strictEqual(stores1, stores2, 'same cached array');

  clearStoreCache();
  const stores3 = await loadStores('data/stores.json');
  assert.equal(fetchCount, 2, 'fetch called after clearing cache');
  assert.ok(Array.isArray(stores3), 'stores loaded again');

  console.log('All tests passed');
}

runTests();
