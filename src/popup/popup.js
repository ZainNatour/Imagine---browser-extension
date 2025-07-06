import { loadStores, applyFilters } from './modules/storeService.js';
import { STORES_DATA_PATH } from '../shared/constants.js';
import { renderStores, updateLoadMoreButton, generateCheckboxes, getCheckedValues } from './modules/ui.js';
import { debounce } from './modules/debounce.js';
import {
  addToWishlist,
  renderWishlist,
  isInWishlist,
  removeFromWishlist,
} from './modules/wishlist.js';
import {
  getPhotos,
  addPhoto,
  removePhoto,
  getSelectedPhotoId,
  setSelectedPhotoId,
  DEFAULT_MODELS,
} from './modules/photoStorage.js';
import { requestTryOn } from './modules/tryOnService.js';

const DEFAULT_MODEL_IDS = new Set(DEFAULT_MODELS.map((m) => m.id));

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
  initWishlistState();
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
    if (targetContentId === 'product-discovery') {
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
  setupTryOnButton();
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

async function setupWishlistListener() {
  const wishlistBtn = document.querySelector('.wishlist-btn');
  if (!wishlistBtn) return;

  const url = window.location.href;
  if (await isInWishlist(url)) {
    wishlistBtn.classList.add('active');
  }

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
  const modelGrid = document.querySelector('.model-swatch-grid');
  if (!container) return;
  try {
    const photos = await getPhotos();
    const selectedId = await getSelectedPhotoId();
    renderPhotoGallery(container, photos, selectedId);
    if (modelGrid) renderModelGrid(modelGrid, photos, selectedId);
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

function setupTryOnButton() {
  const container = document.querySelector('.try-on-button');
  const btn = container?.querySelector('button');
  if (!btn) return;
  btn.textContent = 'Open Try-On';
  btn.title = 'Open the virtual try-on dialog';
  btn.addEventListener('click', () => {
    const img = document.querySelector('.product-image');
    const url = img?.src;
    if (url) showPhotoDialog(url);
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
    img.alt = 'User photo';
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
    if (!DEFAULT_MODEL_IDS.has(p.id)) item.appendChild(removeBtn);

    container.appendChild(item);
  });
}

function renderModelGrid(container, photos, selectedId) {
  container.innerHTML = '';
  photos.forEach((p) => {
    const swatch = document.createElement('div');
    swatch.className = 'model-swatch';
    if (p.id === selectedId) swatch.classList.add('selected');
    const img = document.createElement('img');
    img.src = p.dataUrl;
    img.alt = 'Model photo';
    swatch.appendChild(img);
    swatch.addEventListener('click', async () => {
      await setSelectedPhotoId(p.id);
      await loadAndRenderPhotos();
    });
    container.appendChild(swatch);
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
    img.alt = 'User photo';
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

function requestProductInfo() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs || !tabs.length) {
        resolve(null);
        return;
      }
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { action: 'getProductInfo' }, (res) => {
        if (chrome.runtime.lastError) {
          resolve(null);
        } else {
          resolve(res);
        }
      });
    });
  });
}

async function loadProductInfo() {
  try {
    const info = await requestProductInfo();
    const placeholder = document.querySelector('.product-placeholder');
    if (info) {
      if (placeholder) placeholder.style.display = 'none';
      renderProductInfo(info);
    } else if (placeholder) {
      placeholder.style.display = 'block';
    }
  } catch (e) {
    console.error('Failed to load product info', e);
  }
}

function renderProductInfo(info) {
  const placeholder = document.querySelector('.product-placeholder');
  if (placeholder) placeholder.style.display = 'none';
  const imageEl = document.querySelector('.product-image');
  if (imageEl && info.image) imageEl.src = info.image;
  const nameEl = document.querySelector('.product-name');
  if (nameEl && info.name) nameEl.textContent = info.name;
  const priceEl = document.querySelector('.product-price');
  if (priceEl && info.price) priceEl.textContent = info.price;
  const typeEl = document.querySelector('.product-clothing-type');
  if (typeEl && info.clothingType) typeEl.textContent = info.clothingType;

  const colorSection = document.querySelector('.product-colors-section');
  const colorGrid = colorSection?.querySelector('.color-grid');
  if (colorGrid && Array.isArray(info.colors) && info.colors.length > 0) {
    colorSection.style.display = '';
    colorGrid.innerHTML = '';
    info.colors.forEach((c) => {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = c;
      colorGrid.appendChild(swatch);
    });
  } else if (colorSection) {
    colorSection.style.display = 'none';
  }

  const sections = document.querySelectorAll(
    '.collapsible-section .collapsible-content'
  );
  if (sections[0] && info.details) {
    sections[0].textContent = info.details;
    sections[0].parentElement.style.display = '';
  } else if (sections[0]) {
    sections[0].parentElement.style.display = 'none';
  }

  if (sections[1]) {
    const container = sections[1];
    container.innerHTML = '';
    if (info.ratingValue) {
      const p = document.createElement('p');
      p.textContent = `Rating: ${info.ratingValue}`;
      container.appendChild(p);
    }
    if (Array.isArray(info.reviewSnippets) && info.reviewSnippets.length) {
      info.reviewSnippets.forEach((s) => {
        const p = document.createElement('p');
        p.textContent = s;
        container.appendChild(p);
      });
    }
    container.parentElement.style.display = container.childElementCount
      ? ''
      : 'none';
  }

  const grid = document.querySelector('.similar-products-grid');
  const section = grid?.closest('.similar-products-section');
  if (grid && Array.isArray(info.recommended) && info.recommended.length) {
    grid.innerHTML = '';
    info.recommended.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'similar-product-item';

      const link = document.createElement('a');
      if (item.url) link.href = item.url;

      const img = document.createElement('img');
      img.src = item.image;
      link.appendChild(img);
      div.appendChild(link);

      if (item.name) {
        const p = document.createElement('p');
        p.textContent = item.name;
        div.appendChild(p);
      }

      grid.appendChild(div);
    });
    if (section) section.style.display = '';
  } else if (section) {
    section.style.display = 'none';
  }
}


