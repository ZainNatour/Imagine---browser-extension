// photoStore.js
// Unified helpers for managing photos (file uploads or data-URLs)
// in chrome.storage.local.  Includes selection helpers.

//
// ─── LOW-LEVEL STORAGE HELPERS ────────────────────────────────────────────────
//
export function getPhotos() {
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

  const photos = await getPhotos();
  photos.push(photo);
  await savePhotos(photos);

  return photo; // { id, dataUrl }
}

export async function removePhoto(id) {
  const photos = await getPhotos();
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
