// photoStore.js
// Unified helpers for managing photos (file uploads or data-URLs)
// in chrome.storage.local.  Includes selection helpers.

// No built-in model photos are bundled with the extension. Placeholder
// images are fetched remotely at runtime.
export const DEFAULT_MODELS = [];

const DEFAULT_MODEL_IDS = new Set(DEFAULT_MODELS.map((m) => m.id));


//
// ─── LOW-LEVEL STORAGE HELPERS ────────────────────────────────────────────────
//
export function getPhotos() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ photos: [] }, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve([...DEFAULT_MODELS, ...result.photos]);
      }
    });
  });
}

function getUserPhotos() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ photos: [] }, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.photos);
      }
    });
  });
}

export function savePhotos(photos) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ photos }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

//
// ─── UTILITY: ENSURE WE HAVE A DATA-URL ───────────────────────────────────────
//
async function toDataUrl(input) {
  // Already a data-URL string?  Nothing to do.
  if (typeof input === 'string') return input;

  // File or Blob → data-URL
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result); // data:… base64
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(input);
    });
  }

  // Node environments lack FileReader - fallback using arrayBuffer
  if (input.arrayBuffer) {
    const buffer = await input.arrayBuffer();
    const mime = input.type || 'application/octet-stream';
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${mime};base64,${base64}`;
  }

  throw new Error('Unable to convert input to data URL');
}

//
// ─── HIGH-LEVEL CRUD OPERATIONS ──────────────────────────────────────────────
//
export async function addPhoto(fileOrDataUrl) {
  const dataUrl = await toDataUrl(fileOrDataUrl);
  const photo = { id: Date.now().toString(), dataUrl };

  const photos = await getUserPhotos();
  photos.push(photo);
  await savePhotos(photos);

  return photo; // { id, dataUrl }
}

export async function removePhoto(id) {
  if (DEFAULT_MODEL_IDS.has(id)) {
    return getPhotos();
  }
  const photos = await getUserPhotos();
  const updated = photos.filter((p) => p.id !== id);
  await savePhotos(updated);
  return updated; // remaining photos
}

// Optional alias for callers that used the old name
export const deletePhoto = removePhoto;

//
// ─── SELECTED PHOTO HELPERS ──────────────────────────────────────────────────
//
export function getSelectedPhotoId() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('selectedPhotoId', (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.selectedPhotoId ?? null);
      }
    });
  });
}

export function setSelectedPhotoId(id) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ selectedPhotoId: id }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}
