import { loadStores, applyFilters } from './modules/storeService.js';
import { renderStores, updateLoadMoreButton, generateCheckboxes, getCheckedValues } from './modules/ui.js';
import { debounce } from './modules/debounce.js';

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
  const tabButtons = document.querySelectorAll('.tab-button:not(#options-button)');
  const optionsButton = document.getElementById('options-button');
  const tabContents = document.querySelectorAll('.tab-content');

  const switchTab = (clickedTab) => {
    tabButtons.forEach((button) => button.classList.remove('active'));
    tabContents.forEach((content) => content.classList.remove('active'));

    clickedTab.classList.add('active');
    const targetContentId = clickedTab.id.replace('-tab', '');
    document.getElementById(targetContentId).classList.add('active');
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

