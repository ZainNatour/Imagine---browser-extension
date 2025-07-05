export async function addPhoto(file) {
  const toDataUrl = async (f) => {
    if (typeof f === 'string') return f;
    if (f.arrayBuffer) {
      const buffer = Buffer.from(await f.arrayBuffer());
      const mime = f.type || 'application/octet-stream';
      return `data:${mime};base64,${buffer.toString('base64')}`;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(f);
    });
  };

  const dataUrl = await toDataUrl(file);
  const photo = { id: Date.now(), dataUrl };
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ photos: [] }, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        const photos = result.photos;
        photos.push(photo);
        chrome.storage.local.set({ photos }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(photo);
          }
        });
      }
    });
  });
}

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

export function deletePhoto(id) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ photos: [] }, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      const filtered = result.photos.filter((p) => p.id !== id);
      chrome.storage.local.set({ photos: filtered }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(filtered);
        }
      });
    });
  });
}
