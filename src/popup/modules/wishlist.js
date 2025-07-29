import { requestTryOn } from './tryOnService.js';
import { getSelectedPhotoId } from './photoStorage.js';
import { showMessage } from './notification.js';

export async function getWishlist() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({ wishlist: [] }, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.wishlist);
      }
    });
  });
}

export async function saveWishlist(items) {
  try {
    await new Promise((resolve, reject) => {
      chrome.storage.sync.set({ wishlist: items }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  } catch (err) {
    if (/quota/i.test(err?.message || '')) {
      showMessage(
        'Wishlist storage limit reached. Remove some items before adding more.',
      );
    }
    throw err;
  }
}

export async function addToWishlist(item) {
  try {
    const list = await getWishlist();
    const exists = list.some(
      (it) => it.url === item.url || it.imageSrc === item.imageSrc,
    );
    if (!exists) {
      list.push({ ...item, dateAdded: new Date().toISOString() });
      await saveWishlist(list);
    }
  } catch (error) {
    console.error('Failed to add item to wishlist:', error);
  }
}

export async function removeFromWishlist(identifier) {
  try {
    const list = await getWishlist();
    const filtered = list.filter(
      (item) => item.dateAdded !== identifier && item.url !== identifier,
    );
    await saveWishlist(filtered);
    return filtered;
  } catch (error) {
    console.error('Failed to remove item from wishlist:', error);
    return [];
  }
}

export function filterWishlist(items, term = '') {
  const t = term.toLowerCase();
  return items.filter(
    (i) =>
      i.name.toLowerCase().includes(t) ||
      (i.storeName && i.storeName.toLowerCase().includes(t)),
  );
}

function parsePrice(p) {
  const num = parseFloat(p?.replace(/[^0-9.]+/g, ''));
  return Number.isNaN(num) ? Infinity : num;
}

export function sortWishlist(items, sort = 'date-desc') {
  const sorted = [...items];
  sorted.sort((a, b) => {
    switch (sort) {
    case 'price-asc':
      return parsePrice(a.price) - parsePrice(b.price);
    case 'price-desc':
      return parsePrice(b.price) - parsePrice(a.price);
    case 'date-asc':
      return new Date(a.dateAdded) - new Date(b.dateAdded);
    case 'date-desc':
    default:
      return new Date(b.dateAdded) - new Date(a.dateAdded);
    }
  });
  return sorted;
}

export async function renderWishlist(container, items = null) {
  try {
    if (!items) {
      items = await getWishlist();
    }
    if (!container) return;
    container.innerHTML = '';
    if (!items.length) {
      container.textContent = 'Your wishlist is empty.';
      return;
    }
    items = sortWishlist(items);
    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'wishlist-item card';
      const img = document.createElement('img');
      img.src = /^https?:\/\//.test(item.imageSrc)
        ? item.imageSrc
        : chrome.runtime.getURL(item.imageSrc);
      img.alt = item.name;
      img.loading = 'lazy';
      div.appendChild(img);

      const nameP = document.createElement('p');
      nameP.textContent = item.name;
      div.appendChild(nameP);

      if (item.storeName) {
        const storeP = document.createElement('p');
        if (item.url) {
          const fav = document.createElement('img');
          fav.className = 'store-favicon';
          fav.alt = '';
          try {
            fav.src = `https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}`;
          } catch {
            /* ignore */
          }
          storeP.appendChild(fav);
        }
        storeP.appendChild(document.createTextNode(item.storeName));
        div.appendChild(storeP);
      }

      if (item.price) {
        const priceP = document.createElement('p');
        priceP.textContent = item.price;
        div.appendChild(priceP);
      }

      const dateP = document.createElement('p');
      dateP.textContent = `Date Added: ${new Date(item.dateAdded).toLocaleDateString()}`;
      div.appendChild(dateP);

      const tryBtn = document.createElement('button');
      tryBtn.className = 'try-on-btn btn btn-primary btn-rounded';
      tryBtn.textContent = 'Try On';
      tryBtn.addEventListener('click', async () => {
        try {
          const photoId = await getSelectedPhotoId();
          if (!photoId) {
            showMessage('Please select a photo in the Dressing Room first.');
            return;
          }
          const url = await requestTryOn(photoId, item.imageSrc);
          if (chrome.tabs) {
            chrome.tabs.create({ url });
          } else {
            window.open(url, '_blank');
          }
        } catch (err) {
          showMessage(err.message);
        }
      });
      div.appendChild(tryBtn);

      if (item.url) {
        const visitBtn = document.createElement('button');
        visitBtn.className = 'visit-page-btn btn btn-success btn-rounded';
        visitBtn.textContent = 'Visit Page';
        visitBtn.addEventListener('click', () => {
          chrome.tabs.create({ url: item.url });
        });
        div.appendChild(visitBtn);
      }

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn btn btn-error btn-rounded';
      removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
      removeBtn.setAttribute('aria-label', 'Remove from wishlist');
      removeBtn.addEventListener('click', async () => {
        await removeFromWishlist(item.dateAdded);
        renderWishlist(container);
      });
      div.appendChild(removeBtn);

      container.appendChild(div);
    });
  } catch (error) {
    console.error('Failed to render wishlist:', error);
    if (container) container.innerHTML = '<p>Error loading wishlist.</p>';
  }
}

export async function isInWishlist(url) {
  try {
    const list = await getWishlist();
    return list.some((item) => item.url === url);
  } catch (error) {
    console.error('Failed to check wishlist:', error);
    return false;
  }
}

export async function toggleWishlist(item) {
  const present = await isInWishlist(item.url || item.imageSrc);
  if (present) {
    await removeFromWishlist(item.url || item.dateAdded);
    return false;
  }
  await addToWishlist(item);
  return true;
}
