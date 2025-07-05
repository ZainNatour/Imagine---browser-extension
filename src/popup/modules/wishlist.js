import { requestTryOn } from './tryOnService.js';
import { getSelectedPhotoId } from './photoStorage.js';

export async function getWishlist() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ wishlist: [] }, (result) => {
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
    chrome.storage.local.set({ wishlist: items }, () => {
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
    list.push({ ...item, dateAdded: new Date().toISOString() });
    await saveWishlist(list);
  } catch (error) {
    console.error('Failed to add item to wishlist:', error);
  }
}

export async function removeFromWishlist(dateAdded) {
  try {
    const list = await getWishlist();
    const filtered = list.filter((item) => item.dateAdded !== dateAdded);
    await saveWishlist(filtered);
    return filtered;
  } catch (error) {
    console.error('Failed to remove item from wishlist:', error);
    return [];
  }
}

export async function renderWishlist(container) {
  try {
    const items = await getWishlist();
    if (!container) return;
    container.innerHTML = '';
    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'wishlist-item';
      const img = document.createElement('img');
      img.src = /^https?:\/\//.test(item.imageSrc)
        ? item.imageSrc
        : chrome.runtime.getURL(item.imageSrc);
      img.alt = item.name;
      div.appendChild(img);

      const nameP = document.createElement('p');
      nameP.textContent = `${item.name} - ${item.price}`;
      div.appendChild(nameP);

      const dateP = document.createElement('p');
      dateP.textContent = `Date Added: ${new Date(item.dateAdded).toLocaleDateString()}`;
      div.appendChild(dateP);

      const tryBtn = document.createElement('button');
      tryBtn.className = 'try-on-btn';
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
        visitBtn.className = 'visit-page-btn';
        visitBtn.textContent = 'Visit Page';
        visitBtn.addEventListener('click', () => {
          chrome.tabs.create({ url: item.url });
        });
        div.appendChild(visitBtn);
      }

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
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
