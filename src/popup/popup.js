import { loadStores, applyFilters } from './modules/storeService.js';
import { STORES_DATA_PATH } from '../shared/constants.js';
import { renderStores, updateLoadMoreButton, generateCheckboxes, getCheckedValues } from './modules/ui.js';
import { debounce } from './modules/debounce.js';
import { addToWishlist, renderWishlist } from './modules/wishlist.js';
import {
  getPhotos,
  addPhoto,
  removePhoto,
  getSelectedPhotoId,
  setSelectedPhotoId,
} from './modules/photoStorage.js';
import { requestTryOn } from './modules/tryOnService.js';

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

  initializeApp();
  initializeTabSwitching();
  initializeCollapsibleSections();
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
    if (targetContentId === 'dressing-room') {
      loadAndRenderPhotos();
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
  setupWishlistListener();
  setupAvatarToggle();
  setupModelGridControls();
  setupCentralizedWishlistNavigation();
  setupPhotoUpload();
}

function setupSearchListener({ searchBar, loadMoreButton, storeGrid }, state) {
  const updateStoreList = () => {
    renderStores(storeGrid, state.filteredStores, state.displayedStores);
    updateLoadMoreButton(
      loadMoreButton,
      state.displayedStores,
      state.filteredStores.length
    );
  };

  searchBar.addEventListener(
    'input',
    debounce(() => {
      state.filteredStores = applyFilters(
        state.stores,
        state.filters,
        searchBar.value
      );
      state.displayedStores = 8;
      updateStoreList();
    }, 300)
  );
}

function setupLoadMoreListener({ loadMoreButton, storeGrid }, state) {
  loadMoreButton.addEventListener('click', () => {
    state.displayedStores += 8;
    renderStores(storeGrid, state.filteredStores, state.displayedStores);
    updateLoadMoreButton(
      loadMoreButton,
      state.displayedStores,
      state.filteredStores.length
    );
  });
}

function setupFilterToggle(elements, state) {
  const { filterButton, filterSection } = elements;
  filterButton.addEventListener('click', () => {
    filterSection.style.display =
      filterSection.style.display === 'none' ? 'block' : 'none';
    if (filterSection.style.display === 'block') renderFilterOptions(elements, state);
  });
}

function setupWishlistListener() {
  const wishlistBtn = document.querySelector('.wishlist-btn');
  if (!wishlistBtn) return;
  wishlistBtn.addEventListener('click', () => {
    const item = {
      name: document.querySelector('.product-name')?.textContent || '',
      price: document.querySelector('.product-price')?.textContent || '',
      clothingType: document.querySelector('.product-clothing-type')?.textContent || '',
      imageSrc: document.querySelector('.product-image')?.getAttribute('src') || '',
      url: window.location.href,
      storeName: window.location.hostname.replace(/^www\./, ''),
    };
    addToWishlist(item);
    if (document.getElementById('wishlist').classList.contains('active')) {
      const grid = document.getElementById('wishlist-grid');
      renderWishlist(grid);
    }
  });
}

function setupAvatarToggle() {
  const swatch = document.querySelector('.avatar-swatch');
  const section = document.querySelector('.avatar-section');
  if (swatch && section) {
    swatch.addEventListener('click', () => {
      section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });
  }
}

function setupModelGridControls() {
  const grid = document.querySelector('.model-swatch-grid');
  const left = document.querySelector('.left-btn');
  const right = document.querySelector('.right-btn');
  if (!grid) return;
  const updateButtons = () => {
    if (left) left.disabled = grid.scrollLeft <= 0;
    if (right) right.disabled = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth;
  };
  if (left) left.addEventListener('click', () => grid.scrollBy({ left: -100, behavior: 'smooth' }));
  if (right) right.addEventListener('click', () => grid.scrollBy({ left: 100, behavior: 'smooth' }));
  grid.addEventListener('scroll', updateButtons);
  updateButtons();
}

function renderFilterOptions(elements, state) {
  const { filterSection, storeGrid, loadMoreButton, searchBar } = elements;
  const { stores } = state;

  /* eslint-disable indent */
  filterSection.innerHTML = `
    <h3>Target Demographic</h3>
    ${generateCheckboxes(
      'targetDemographic',
      [...new Set(stores.flatMap((s) => s.targetDemographic))],
      state.filters.targetDemographic,
    )}
    <h3>Clothing Type</h3>
    ${generateCheckboxes(
      'clothingType',
      [...new Set(stores.map((s) => s.clothingType))],
      state.filters.clothingType,
    )}
    <h3>Price Range</h3>
    ${generateCheckboxes(
      'priceRange',
      [...new Set(stores.map((s) => s.priceRange))],
      state.filters.priceRange,
    )}
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
    updateLoadMoreButton(
      loadMoreButton,
      state.displayedStores,
      state.filteredStores.length
    );
    filterSection.style.display = 'none';
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    state.filters = { targetDemographic: [], clothingType: [], priceRange: [] };
    state.filteredStores = applyFilters(stores, state.filters, searchBar.value);
    state.displayedStores = 8;
    renderStores(storeGrid, state.filteredStores, state.displayedStores);
    updateLoadMoreButton(
      loadMoreButton,
      state.displayedStores,
      state.filteredStores.length
    );
    filterSection.style.display = 'none';
  });

  document.getElementById('close-filters').addEventListener('click', () => {
    filterSection.style.display = 'none';
  });
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

async function loadAndRenderPhotos() {
  const container = document.getElementById('photo-gallery');
  if (!container) return;
  try {
    const photos = await getPhotos();
    const selectedId = await getSelectedPhotoId();
    renderPhotoGallery(container, photos, selectedId);
  } catch (error) {
    console.error('Failed to load photos:', error);
  }
}

function setupPhotoUpload() {
  const input = document.getElementById('photo-input');
  const trigger = document.getElementById('upload-trigger');
  if (!input || !trigger) return;

  trigger.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await addPhoto(reader.result);
        await loadAndRenderPhotos();
      } catch (e) {
        console.error('Failed to add photo:', e);
      } finally {
        input.value = '';
      }
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotoGallery(container, photos, selectedId) {
  container.innerHTML = '';
  photos.forEach((p) => {
    const item = document.createElement('div');
    item.className = 'photo-item';
    if (p.id === selectedId) item.classList.add('selected');

    const img = document.createElement('img');
    img.src = p.dataUrl;
    item.appendChild(img);

    const selectBtn = document.createElement('button');
    selectBtn.textContent = p.id === selectedId ? 'Selected' : 'Select';
    selectBtn.className = 'select-btn';
    selectBtn.disabled = p.id === selectedId;
    selectBtn.addEventListener('click', async () => {
      await setSelectedPhotoId(p.id);
      await loadAndRenderPhotos();
    });
    item.appendChild(selectBtn);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-btn';
    removeBtn.addEventListener('click', async () => {
      await removePhoto(p.id);
      await loadAndRenderPhotos();
    });
    item.appendChild(removeBtn);

    container.appendChild(item);
  });
}

async function showPhotoDialog(clothingUrl) {
  const photos = await getPhotos();
  if (!photos.length) {
    alert('Please upload a photo in the Dressing Room first.');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'photo-dialog-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'photo-dialog';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cancel';
  closeBtn.addEventListener('click', () => overlay.remove());
  dialog.appendChild(closeBtn);

  photos.forEach((p) => {
    const option = document.createElement('div');
    option.className = 'photo-option';

    const img = document.createElement('img');
    img.src = p.dataUrl;
    option.appendChild(img);

    const btn = document.createElement('button');
    btn.textContent = 'Try On';
    btn.addEventListener('click', async () => {
      overlay.remove();
      try {
        const url = await requestTryOn(p.id, clothingUrl);
        if (chrome.tabs) {
          chrome.tabs.create({ url });
        } else {
          window.open(url, '_blank');
        }
      } catch (e) {
        alert(e.message);
      }
    });
    option.appendChild(btn);

    dialog.appendChild(option);
  });

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}


