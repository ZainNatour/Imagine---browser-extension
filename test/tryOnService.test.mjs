import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let fetchCalled = false;

global.fetch = async () => {
  fetchCalled = true;
  return { ok: true, json: async () => ({ imageUrl: 'https://example.com' }) };
};

// chrome.storage mock with no apiEndpoint configured
global.chrome = {
  runtime: {
    lastError: null,
    getURL: (p) => pathToFileURL(join(__dirname, '..', p)).href,
  },
  storage: {
    sync: {
      get: (_keys, cb) => cb({ apiEndpoint: undefined }),
    },
  },
};

import { requestTryOn } from '../src/popup/modules/tryOnService.js';

async function runTests() {
  fetchCalled = false;
  const placeholder = 'https://example.com/placeholder.jpg';
  const url = await requestTryOn('1', 'https://example.com/item');
  assert.equal(fetchCalled, false, 'fetch should not be called without api url');
  assert.equal(url, placeholder, 'returns placeholder image');
  console.log('All tests passed');
}

runTests();
