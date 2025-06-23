const STORAGE_KEY = 'wishlistItems';

export function getWishlist() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] || []);
    });
  });
}

export function saveWishlist(items) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: items }, () => resolve());
  });
}

export async function addToWishlist(item) {
  const items = await getWishlist();
  if (!items.some((i) => i.url === item.url)) {
    items.push(item);
    await saveWishlist(items);
  }
}

export async function removeFromWishlist(url) {
  const items = await getWishlist();
  const updated = items.filter((i) => i.url !== url);
  await saveWishlist(updated);
  return updated;
}
