import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock chrome.runtime.getURL to return file URLs
global.chrome = {
  runtime: {
    getURL: (p) => pathToFileURL(join(__dirname, '..', p)).href,
  },
};

// Simple fetch mock for file URLs
global.fetch = async (url) => {
  if (url.startsWith('file://')) {
    const data = await fs.readFile(new URL(url), 'utf8');
    return { json: async () => JSON.parse(data) };
  }
  throw new Error('Unsupported protocol in test fetch');
};

import { isOnlineStore } from '../src/background/modules/urlUtils.js';

async function runTests() {
  const realUrl = new URL('https://www.zara.com');
  assert.equal(await isOnlineStore(realUrl), true, 'recognizes real domain');

  const subdomainUrl = new URL('https://shop.zara.com');
  assert.equal(await isOnlineStore(subdomainUrl), true, 'recognizes subdomain');

  const fakeUrl = new URL('https://zaracom.com');
  assert.equal(await isOnlineStore(fakeUrl), false, 'ignores similar fake domain');

  const trickyUrl = new URL('https://zara.com.fake.com');
  assert.equal(await isOnlineStore(trickyUrl), false, 'ignores domain within larger host');

  console.log('All tests passed');
}

runTests();
