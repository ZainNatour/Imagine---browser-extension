import { loadStores, applyFilters } from './modules/storeService.js';
import { renderStores, updateLoadMoreButton, generateCheckboxes, getCheckedValues } from './modules/ui.js';
import { debounce } from './modules/debounce.js';
import { addToWishlist, renderWishlist } from './modules/wishlist.js';

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get('theme', ({ theme }) => {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  });

  initializeApp();
  initializeTabSwitching();
  initializeCollapsibleSections();
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'selectTab') {
      const button = document.getElementById(message.target);
      if (button) button.click();
    }
  });
});

function initializeTabSwitching() {
  const tabButtons = document.querySelectorAll('.tab-button:not(#options-button)');
  const optionsButton = document.getElementById('options-button');
  const tabContents = document.querySelectorAll('.tab-content');

  const switchTab = (clickedTab) => {
    tabButtons.forEach((button) => button.classList.remove('active'));
    tabContents.forEach((content) => content.classList.remove('active'));

    clickedTab.classList.add('active');
    const targetContentId = clickedTab.id.replace('-tab', '');
    document.getElementById(targetContentId).classList.add('active');
    if (targetContentId === 'wishlist') {
      const grid = document.getElementById('wishlist-grid');
      renderWishlist(grid);
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

  document.getElementById('store-discovery-tab').click();
}

async function initializeApp() {
  const storeGrid = document.getElementById('store-grid');
  const loadMoreButton = document.getElementById('load-more');
  const searchBar = document.getElementById('search-bar');
  const filterButton = document.getElementById('filter-button');
  const filterSection = document.getElementById('filter-section');

  let stores = [];
  try {
    stores = await loadStores('src/assets/data/stores.json');
  } catch (error) {
    console.error(error);
    storeGrid.innerHTML = '<p>Unable to load stores. Please try again later.</p>';
    return;
  }
  let filters = { targetDemographic: [], clothingType: [], priceRange: [] };
  let displayedStores = 8;
  let filteredStores = stores;

  renderStores(storeGrid, filteredStores, displayedStores);
  updateLoadMoreButton(loadMoreButton, displayedStores, filteredStores.length);
  initializeEventListeners();

  function initializeEventListeners() {
    searchBar.addEventListener(
      'input',
      debounce(() => {
        filteredStores = applyFilters(stores, filters, searchBar.value);
        displayedStores = 8;
        renderStores(storeGrid, filteredStores, displayedStores);
        updateLoadMoreButton(loadMoreButton, displayedStores, filteredStores.length);
      }, 300)
    );

    loadMoreButton.addEventListener('click', () => {
      displayedStores += 8;
      renderStores(storeGrid, filteredStores, displayedStores);
      updateLoadMoreButton(loadMoreButton, displayedStores, filteredStores.length);
    });

    filterButton.addEventListener('click', () => {
      filterSection.style.display = filterSection.style.display === 'none' ? 'block' : 'none';
      if (filterSection.style.display === 'block') {
        renderFilterOptions();
      }
    });

    const wishlistBtn = document.querySelector('.wishlist-btn');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', () => {
        const item = {
          name: document.querySelector('.product-name')?.textContent || '',
          price: document.querySelector('.product-price')?.textContent || '',
          clothingType: document.querySelector('.product-clothing-type')?.textContent || '',
          imageSrc: document.querySelector('.product-image')?.getAttribute('src') || ''
        };
        addToWishlist(item);
        if (document.getElementById('wishlist').classList.contains('active')) {
          const grid = document.getElementById('wishlist-grid');
          renderWishlist(grid);
        }
      });
    }

    const avatarSwatch = document.querySelector('.avatar-swatch');
    const avatarSection = document.querySelector('.avatar-section');
    if (avatarSwatch && avatarSection) {
      avatarSwatch.addEventListener('click', () => {
        avatarSection.style.display = avatarSection.style.display === 'none' ? 'block' : 'none';
      });
    }

    const modelGrid = document.querySelector('.model-swatch-grid');
    const leftBtn = document.querySelector('.left-btn');
    const rightBtn = document.querySelector('.right-btn');

    if (modelGrid) {
      const updateButtons = () => {
        if (leftBtn) leftBtn.disabled = modelGrid.scrollLeft <= 0;
        if (rightBtn)
          rightBtn.disabled =
            modelGrid.scrollLeft + modelGrid.clientWidth >= modelGrid.scrollWidth;
      };

      if (leftBtn) {
        leftBtn.addEventListener('click', () => {
          modelGrid.scrollBy({ left: -100, behavior: 'smooth' });
        });
      }

      if (rightBtn) {
        rightBtn.addEventListener('click', () => {
          modelGrid.scrollBy({ left: 100, behavior: 'smooth' });
        });
      }

      modelGrid.addEventListener('scroll', updateButtons);
      updateButtons();
    }
  }

  function renderFilterOptions() {
    filterSection.innerHTML = `
      <h3>Target Demographic</h3>
      ${generateCheckboxes(
        'targetDemographic',
        [...new Set(stores.flatMap((s) => s.targetDemographic))],
        filters.targetDemographic
      )}
      <h3>Clothing Type</h3>
      ${generateCheckboxes(
        'clothingType',
        [...new Set(stores.map((s) => s.clothingType))],
        filters.clothingType
      )}
      <h3>Price Range</h3>
      ${generateCheckboxes(
        'priceRange',
        [...new Set(stores.map((s) => s.priceRange))],
        filters.priceRange
      )}
      <div class="filter-buttons">
        <button id="apply-filters">Apply</button>
        <button id="clear-filters">Clear</button>
        <button id="close-filters">Exit</button>
      </div>
    `;

    document.getElementById('apply-filters').addEventListener('click', () => {
      filters = {
        targetDemographic: getCheckedValues('targetDemographic'),
        clothingType: getCheckedValues('clothingType'),
        priceRange: getCheckedValues('priceRange'),
      };
      filteredStores = applyFilters(stores, filters, searchBar.value);
      displayedStores = 8;
      renderStores(storeGrid, filteredStores, displayedStores);
      updateLoadMoreButton(loadMoreButton, displayedStores, filteredStores.length);
      filterSection.style.display = 'none';
    });

    document.getElementById('clear-filters').addEventListener('click', () => {
      filters = { targetDemographic: [], clothingType: [], priceRange: [] };
      filteredStores = applyFilters(stores, filters, searchBar.value);
      displayedStores = 8;
      renderStores(storeGrid, filteredStores, displayedStores);
      updateLoadMoreButton(loadMoreButton, displayedStores, filteredStores.length);
      filterSection.style.display = 'none';
    });

    document.getElementById('close-filters').addEventListener('click', () => {
      filterSection.style.display = 'none';
    });
  }
}

function initializeCollapsibleSections() {
  const headers = document.querySelectorAll('.collapsible-header');
  headers.forEach((header) => {
    header.addEventListener('click', () => {
      const section = header.closest('.collapsible-section');
      if (!section) return;
      const isOpen = section.classList.toggle('open');
      const arrow = header.querySelector('.arrow');
      if (arrow) {
        arrow.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
      }
    });
  });
}


