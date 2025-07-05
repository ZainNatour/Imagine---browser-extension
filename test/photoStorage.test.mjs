import assert from 'node:assert/strict';
import { Blob } from 'node:buffer';

// Simple chrome.storage mock
const storage = { photos: [] };

global.chrome = {
  runtime: { lastError: null },
  storage: {
    local: {
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

import {
  addPhoto,
  getPhotos,
  deletePhoto,
  DEFAULT_MODELS,
} from '../src/popup/modules/photoStorage.js';

async function runTests() {
  const blob = new Blob(['hello'], { type: 'text/plain' });
  const added = await addPhoto(blob);
  assert.ok(added.id, 'photo has id');
  const list = await getPhotos();
  assert.equal(list.length, DEFAULT_MODELS.length + 1, 'photo added');
  assert.equal(list[DEFAULT_MODELS.length].id, added.id, 'id matches');

  await deletePhoto(added.id);
  const afterDelete = await getPhotos();
  assert.equal(afterDelete.length, DEFAULT_MODELS.length, 'photo deleted');
  console.log('All tests passed');
}

runTests();
