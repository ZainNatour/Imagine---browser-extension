export function initTabs({
  renderWishlist,
  loadAndRenderPhotos,
  loadProductInfo,
} = {}) {
  const tabButtons = document.querySelectorAll('.tab-button:not(#options-button)');
  const optionsButton = document.getElementById('options-button');
  const tabContents = document.querySelectorAll('.tab-content');

  const switchTab = (clickedTab) => {
    tabButtons.forEach((button) => button.classList.remove('active'));
    tabContents.forEach((content) => content.classList.remove('active'));

    clickedTab.classList.add('active');
    const targetContentId = clickedTab.id.replace('-tab', '');
    document.getElementById(targetContentId).classList.add('active');
    if (targetContentId === 'wishlist' && renderWishlist) {
      const grid = document.getElementById('wishlist-grid');
      renderWishlist(grid);
    }
    if (targetContentId === 'dressing-room' && loadAndRenderPhotos) {
      loadAndRenderPhotos();
    }
    if (targetContentId === 'product-discovery' && loadProductInfo) {
      loadProductInfo();
    }
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => switchTab(button));
  });

  if (optionsButton) {
    optionsButton.addEventListener('click', () => {
      if (chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
    });
  }

  chrome.storage.local.get('homeSeen', ({ homeSeen }) => {
    const defaultId = homeSeen ? 'store-discovery-tab' : 'home-tab';
    const btn = document.getElementById(defaultId);
    if (btn) btn.click();
    if (!homeSeen) chrome.storage.local.set({ homeSeen: true });
  });
}

export function initCollapsibleSections() {
  const headers = document.querySelectorAll('.collapsible-header');
  headers.forEach((header) => {
    const toggle = () => {
      const section = header.closest('.collapsible-section');
      if (!section) return;
      const isOpen = section.classList.toggle('open');
      const arrow = header.querySelector('.arrow');
      if (arrow) {
        arrow.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
      }
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}
