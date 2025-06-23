import { loadStores, applyFilters } from './modules/storeService.js';
import { renderStores, updateLoadMoreButton, generateCheckboxes, getCheckedValues } from './modules/ui.js';
import { debounce } from './modules/debounce.js';
import { addToWishlist, getWishlist, removeFromWishlist } from './modules/wishlist.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  initializeTabSwitching();
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'selectTab') {
      const button = document.getElementById(message.target);
      if (button) button.click();
    }
  });
});

function initializeTabSwitching() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  const switchTab = (clickedTab) => {
    tabButtons.forEach((button) => button.classList.remove('active'));
    tabContents.forEach((content) => content.classList.remove('active'));

    clickedTab.classList.add('active');
    const targetContentId = clickedTab.id.replace('-tab', '');
    document.getElementById(targetContentId).classList.add('active');
    if (clickedTab.id === 'wishlist-tab') {
      renderWishlist();
    }
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => switchTab(button));
  });

  document.getElementById('store-discovery-tab').click();
}

async function initializeApp() {
  const storeGrid = document.getElementById('store-grid');
  const loadMoreButton = document.getElementById('load-more');
  const searchBar = document.getElementById('search-bar');
  const filterButton = document.getElementById('filter-button');
  const filterSection = document.getElementById('filter-section');

  let stores = await loadStores('src/assets/data/stores.json');
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

    const avatarSwatch = document.querySelector('.avatar-swatch');
    const avatarSection = document.querySelector('.avatar-section');
    if (avatarSwatch && avatarSection) {
      avatarSwatch.addEventListener('click', () => {
        avatarSection.style.display = avatarSection.style.display === 'none' ? 'block' : 'none';
      });
    }

    const wishlistBtn = document.querySelector('.wishlist-btn');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', () => {
        const name = document.querySelector('.product-name')?.textContent.trim() || '';
        const price = document.querySelector('.product-price')?.textContent.trim() || '';
        const image = document.querySelector('.product-image')?.src || '';
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          const url = tabs[0]?.url || '';
          await addToWishlist({ name, price, image, url });
        });
      });
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

async function renderWishlist() {
  const grid = document.querySelector('#wishlist .wishlist-grid');
  if (!grid) return;
  const items = await getWishlist();
  grid.innerHTML = '';
  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'wishlist-item';

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;

    const info = document.createElement('p');
    info.textContent = `${item.name} - ${item.price}`;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', async () => {
      await removeFromWishlist(item.url);
      renderWishlist();
    });

    const visitBtn = document.createElement('button');
    visitBtn.className = 'visit-page-btn';
    visitBtn.textContent = 'Visit Page';
    visitBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: item.url });
    });

    div.appendChild(img);
    div.appendChild(info);
    div.appendChild(removeBtn);
    div.appendChild(visitBtn);
    grid.appendChild(div);
  });
}

