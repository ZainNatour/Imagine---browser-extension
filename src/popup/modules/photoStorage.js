export async function getPhotos() {
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

export async function savePhotos(photos) {
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

export async function addPhoto(dataUrl) {
  const photos = await getPhotos();
  const id = Date.now().toString();
  photos.push({ id, dataUrl });
  await savePhotos(photos);
  return id;
}

export async function removePhoto(id) {
  const photos = await getPhotos();
  const updated = photos.filter((p) => p.id !== id);
  await savePhotos(updated);
  return updated;
}

export async function getSelectedPhotoId() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('selectedPhotoId', (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.selectedPhotoId || null);
      }
    });
  });
}

export async function setSelectedPhotoId(id) {
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
