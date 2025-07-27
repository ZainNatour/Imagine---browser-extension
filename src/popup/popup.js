import { loadStores, applyFilters } from './modules/storeService.js';
import { STORES_DATA_PATH } from '../shared/constants.js';
import { renderStores, updateLoadMoreButton, generateCheckboxes, getCheckedValues } from './modules/ui.js';
import { debounce } from './modules/debounce.js';
import { renderWishlist } from './modules/wishlist.js';
import { initTabs, initCollapsibleSections } from './modules/tabSwitching.js';
import { initWishlistUi } from './modules/wishlistUi.js';
import { initPhotoGallery, loadAndRenderPhotos } from './modules/photoGallery.js';
import { initTryOnUi, loadProductInfo, showPhotoDialog } from './modules/tryOnInteractions.js';

// Theme and storage sync
function applyTheme(theme) {
  document.body.classList.remove('theme-dark', 'theme-light');
  document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
}

function initTheme() {
  chrome.storage.sync.get('theme', ({ theme }) => applyTheme(theme));
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.theme) {
      applyTheme(changes.theme.newValue);
    }
    if (area === 'sync' && changes.wishlist) {
      const grid = document.getElementById('wishlist-grid');
      if (grid) renderWishlist(grid);
    }
  });
}

// Store discovery setup (existing logic)
async function initializeApp() {
  const elements = {
    storeGrid: document.getElementById('store-grid'),
    loadMoreButton: document.getElementById('load-more'),
    searchBar: document.getElementById('search-bar'),
    filterButton: document.getElementById('filter-button'),
    filterSection: document.getElementById('filter-section'),
  };
  let stores;
  try {
    stores = await loadStores(STORES_DATA_PATH);
  } catch (error) {
    console.error(error);
    elements.storeGrid.innerHTML = '<p>Unable to load stores. Please try again later.</p>';
    return;
  }
  const state = {
    stores,
    filters: { targetDemographic: [], clothingType: [], priceRange: [] },
    displayedStores: 8,
    filteredStores: stores,
  };
  renderStores(elements.storeGrid, state.filteredStores, state.displayedStores);
  updateLoadMoreButton(elements.loadMoreButton, state.displayedStores, state.filteredStores.length);
  setupEventListeners(elements, state);
}

function setupEventListeners(elements, state) {
  setupSearchListener(elements, state);
  setupLoadMoreListener(elements, state);
  setupFilterToggle(elements, state);
}

function setupSearchListener({ searchBar, loadMoreButton, storeGrid }, state) {
  const updateStoreList = () => {
    renderStores(storeGrid, state.filteredStores, state.displayedStores);
    updateLoadMoreButton(loadMoreButton, state.displayedStores, state.filteredStores.length);
  };

  searchBar.addEventListener(
    'input',
    debounce(() => {
      state.filteredStores = applyFilters(state.stores, state.filters, searchBar.value);
      state.displayedStores = 8;
      updateStoreList();
    }, 300)
  );
}

function setupLoadMoreListener({ loadMoreButton, storeGrid }, state) {
  loadMoreButton.addEventListener('click', () => {
    state.displayedStores += 8;
    renderStores(storeGrid, state.filteredStores, state.displayedStores);
    updateLoadMoreButton(loadMoreButton, state.displayedStores, state.filteredStores.length);
  });
}

function setupFilterToggle(elements, state) {
  const { filterButton, filterSection } = elements;
  filterButton.addEventListener('click', () => {
    filterSection.style.display = filterSection.style.display === 'none' ? 'block' : 'none';
    if (filterSection.style.display === 'block') renderFilterOptions(elements, state);
  });
}

function renderFilterOptions(elements, state) {
  const { filterSection, storeGrid, loadMoreButton, searchBar } = elements;
  const { stores } = state;
  /* eslint-disable indent */
  filterSection.innerHTML = `
    <h3>Target Demographic</h3>
    ${generateCheckboxes('targetDemographic', [...new Set(stores.flatMap((s) => s.targetDemographic))], state.filters.targetDemographic)}
    <h3>Clothing Type</h3>
    ${generateCheckboxes('clothingType', [...new Set(stores.map((s) => s.clothingType))], state.filters.clothingType)}
    <h3>Price Range</h3>
    ${generateCheckboxes('priceRange', [...new Set(stores.map((s) => s.priceRange))], state.filters.priceRange)}
    <div class="filter-buttons">
      <button id="apply-filters">Apply</button>
      <button id="clear-filters">Clear</button>
      <button id="close-filters">Exit</button>
    </div>
  `;
  /* eslint-enable indent */

  document.getElementById('apply-filters').addEventListener('click', () => {
    state.filters = {
      targetDemographic: getCheckedValues('targetDemographic'),
      clothingType: getCheckedValues('clothingType'),
      priceRange: getCheckedValues('priceRange'),
    };
    state.filteredStores = applyFilters(stores, state.filters, searchBar.value);
    state.displayedStores = 8;
    renderStores(storeGrid, state.filteredStores, state.displayedStores);
    updateLoadMoreButton(loadMoreButton, state.displayedStores, state.filteredStores.length);
    filterSection.style.display = 'none';
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    state.filters = { targetDemographic: [], clothingType: [], priceRange: [] };
    state.filteredStores = applyFilters(stores, state.filters, searchBar.value);
    state.displayedStores = 8;
    renderStores(storeGrid, state.filteredStores, state.displayedStores);
    updateLoadMoreButton(loadMoreButton, state.displayedStores, state.filteredStores.length);
    filterSection.style.display = 'none';
  });

  document.getElementById('close-filters').addEventListener('click', () => {
    filterSection.style.display = 'none';
  });
}

// Entry
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initializeApp();
  initTabs({ renderWishlist, loadAndRenderPhotos, loadProductInfo });
  initCollapsibleSections();
  initWishlistUi();
  initPhotoGallery();
  initTryOnUi();

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'selectTab') {
      const button = document.getElementById(message.target);
      if (button) button.click();
    }
    if (message.action === 'contextTryOn') {
      const tabButton = document.getElementById('dressing-room-tab');
      if (tabButton) tabButton.click();
      if (message.srcUrl) showPhotoDialog(message.srcUrl);
    }
  });
});
