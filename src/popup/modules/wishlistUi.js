import {
  addToWishlist,
  renderWishlist,
  isInWishlist,
  removeFromWishlist,
  saveWishlist,
} from './wishlist.js';

export function initWishlistUi() {
  setupWishlistListener();
  initWishlistState();
  setupCentralizedWishlistNavigation();
  setupClearWishlistButton();
}

function setupWishlistListener() {
  const wishlistBtn = document.querySelector('.wishlist-btn');
  if (!wishlistBtn) return;

  const url = window.location.href;
  isInWishlist(url).then((present) => {
    if (present) wishlistBtn.classList.add('active');
  });

  wishlistBtn.addEventListener('click', async () => {
    const item = {
      name: document.querySelector('.product-name')?.textContent || '',
      price: document.querySelector('.product-price')?.textContent || '',
      clothingType: document.querySelector('.product-clothing-type')?.textContent || '',
      imageSrc: document.querySelector('.product-image')?.getAttribute('src') || '',
      url,
      storeName: window.location.hostname.replace(/^www\./, ''),
    };

    if (await isInWishlist(item.url)) {
      await removeFromWishlist(item.url);
      wishlistBtn.classList.remove('active');
    } else {
      await addToWishlist(item);
      wishlistBtn.classList.add('active');
    }

    if (document.getElementById('wishlist').classList.contains('active')) {
      const grid = document.getElementById('wishlist-grid');
      renderWishlist(grid);
    }
  });
}

async function initWishlistState() {
  const btn = document.querySelector('.wishlist-btn');
  if (btn && (await isInWishlist(window.location.href))) {
    btn.classList.add('active');
  }
}

function setupCentralizedWishlistNavigation() {
  const btn = document.querySelector('.centralized-wishlist-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const url = chrome.runtime.getURL('src/popup/centralized-wishlist.html');
    if (chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  });
}

function setupClearWishlistButton() {
  const btn = document.getElementById('clear-wishlist-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    if (confirm('Clear all wishlist items?')) {
      await saveWishlist([]);
      const grid = document.getElementById('wishlist-grid');
      renderWishlist(grid);
    }
  });
}
