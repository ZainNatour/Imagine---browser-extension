import { renderWishlist } from './modules/wishlist.js';

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get('theme', ({ theme }) => {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.theme) {
      const theme = changes.theme.newValue;
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add(
        theme === 'dark' ? 'theme-dark' : 'theme-light'
      );
    }
  });
  const container = document.getElementById('wishlist-grid');
  renderWishlist(container);
});
