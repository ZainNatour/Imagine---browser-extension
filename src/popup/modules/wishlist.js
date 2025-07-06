import { requestTryOn } from './tryOnService.js';
import { getSelectedPhotoId } from './photoStorage.js';

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
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ wishlist: items }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
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

export async function renderWishlist(container) {
  try {
    let items = await getWishlist();
    if (!container) return;
    container.innerHTML = '';
    if (!items.length) {
      container.textContent = 'Your wishlist is empty.';
      return;
    }
    items = items.sort(
      (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded),
    );
    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'wishlist-item card';
      const img = document.createElement('img');
      img.src = /^https?:\/\//.test(item.imageSrc)
        ? item.imageSrc
        : chrome.runtime.getURL(item.imageSrc);
      img.alt = item.name;
      div.appendChild(img);

      const nameP = document.createElement('p');
      nameP.textContent = item.name;
      div.appendChild(nameP);

      if (item.storeName) {
        const storeP = document.createElement('p');
        storeP.textContent = item.storeName;
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
            alert('Please select a photo in the Dressing Room first.');
            return;
          }
          const url = await requestTryOn(photoId, item.imageSrc);
          if (chrome.tabs) {
            chrome.tabs.create({ url });
          } else {
            window.open(url, '_blank');
          }
        } catch (err) {
          alert(err.message);
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
      removeBtn.textContent = 'Remove';
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
