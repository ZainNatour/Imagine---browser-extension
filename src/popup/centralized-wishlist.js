import {
  renderWishlist,
  getWishlist,
  saveWishlist,
  filterWishlist,
  sortWishlist,
} from './modules/wishlist.js';

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get('theme', ({ theme }) => {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  });

  const search = document.getElementById('wishlist-search');
  const sort = document.getElementById('wishlist-sort');
  const clearBtn = document.getElementById('clear-wishlist-btn');
  const container = document.getElementById('wishlist-grid');

  async function updateList() {
    let items = await getWishlist();
    items = filterWishlist(items, search.value);
    items = sortWishlist(items, sort.value);
    renderWishlist(container, items);
  }

  search.addEventListener('input', updateList);
  sort.addEventListener('change', updateList);
  clearBtn.addEventListener('click', async () => {
    if (confirm('Clear all wishlist items?')) {
      await saveWishlist([]);
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      if (changes.theme) {
        const theme = changes.theme.newValue;
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(
          theme === 'dark' ? 'theme-dark' : 'theme-light'
        );
      }
      if (changes.wishlist) {
        updateList();
      }
    }
  });

  updateList();
});
