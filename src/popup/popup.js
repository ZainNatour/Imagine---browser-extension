document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  initializeTabSwitching(); // Initialize tab switching AFTER all tabs have been initialized
});

function initializeTabSwitching() {
  // Get tab buttons and content containers
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  // Function to handle tab switching
  function switchTab(clickedTab) {
    // Remove 'active' class from all buttons and contents
    tabButtons.forEach((button) => button.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    // Add 'active' class to the clicked tab and corresponding content
    clickedTab.classList.add("active");
    const targetContentId = clickedTab.id.replace("-tab", "");
    document.getElementById(targetContentId).classList.add("active");
  }

  // Add click event listeners to all tabs
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchTab(button);
    });
  });

  // Set the default active tab (Store Discovery)
  document.getElementById("store-discovery-tab").click();
}

function initializeApp() {
  const storeGrid = document.getElementById("store-grid");
  const loadMoreButton = document.getElementById("load-more");
  const searchBar = document.getElementById("search-bar");
  const filterButton = document.getElementById("filter-button");
  const filterSection = document.getElementById("filter-section");

  let stores = [];
  let filteredStores = [];
  let displayedStores = 8; // Default number of stores to display
  let filters = {
    targetDemographic: [],
    clothingType: [],
    priceRange: [],
  };

  loadStores();
  initializeEventListeners();

  function loadStores() {
    fetch(chrome.runtime.getURL("src/assets/data/stores.json"))
      .then((response) => response.json())
      .then((data) => {
        stores = data;
        filteredStores = stores;
        renderStores();
      });
  }

  function renderStores(clear = true) {
    if (clear) storeGrid.innerHTML = "";

    const visibleStores = filteredStores.slice(0, displayedStores);
    visibleStores.forEach((store) => {
      const storeItem = document.createElement("div");
      storeItem.className = "store-item";
      const imageUrl = chrome.runtime.getURL(store.image);

      storeItem.innerHTML = `
        <img src="${imageUrl}" alt="${store.name}" />
        <p>${store.name}</p>
      `;
      storeItem.addEventListener("click", () => {
        chrome.tabs.create({ url: store.url });
      });
      storeGrid.appendChild(storeItem);
    });

    updateLoadMoreButton();
  }

  function updateLoadMoreButton() {
    if (displayedStores >= filteredStores.length) {
      loadMoreButton.style.display = "none";
    } else {
      loadMoreButton.style.display = "block";
    }
  }

  function initializeEventListeners() {
    searchBar.addEventListener(
      "input",
      debounce(() => {
        const searchTerm = searchBar.value.toLowerCase();
        if (searchTerm === "") {
          resetFiltersAndSearch();
        } else {
          filteredStores = stores.filter(
            (store) =>
              store.name.toLowerCase().includes(searchTerm) ||
              store.clothingType.toLowerCase().includes(searchTerm)
          );
          displayedStores = 8; // Reset displayed stores
          renderStores();
        }
      }, 300)
    );

    loadMoreButton.addEventListener("click", () => {
      displayedStores += 8;
      renderStores(false); // Render additional stores without clearing the grid
    });

    filterButton.addEventListener("click", () => {
      filterSection.style.display =
        filterSection.style.display === "none" ? "block" : "none";
      if (filterSection.style.display === "block") {
        renderFilterOptions();
      }
    });

    // Personalized Avatar Section Handling
    const avatarSwatch = document.querySelector(".avatar-swatch");
    const avatarSection = document.querySelector(".avatar-section");

    avatarSwatch.addEventListener("click", () => {
      avatarSection.style.display =
        avatarSection.style.display === "none" ? "block" : "none";
    });
  }

  function resetFiltersAndSearch() {
    filteredStores = stores;
    displayedStores = 8;
    renderStores();
  }

  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  function renderFilterOptions() {
    filterSection.innerHTML = `
      <h3>Target Demographic</h3>
      ${generateCheckboxes(
        "targetDemographic",
        [...new Set(stores.flatMap((store) => store.targetDemographic))],
        filters.targetDemographic
      )}
      <h3>Clothing Type</h3>
      ${generateCheckboxes(
        "clothingType",
        [...new Set(stores.map((store) => store.clothingType))],
        filters.clothingType
      )}
      <h3>Price Range</h3>
      ${generateCheckboxes(
        "priceRange",
        [...new Set(stores.map((store) => store.priceRange))],
        filters.priceRange
      )}
      <div class="filter-buttons">
        <button id="apply-filters">Apply</button>
        <button id="clear-filters">Clear</button>
        <button id="close-filters">Exit</button>
      </div>
    `;

    document.getElementById("apply-filters").addEventListener("click", () => {
      applyFilters();
      filterSection.style.display = "none";
    });

    document.getElementById("clear-filters").addEventListener("click", () => {
      clearFilters();
      renderStores();
      filterSection.style.display = "none";
    });

    document.getElementById("close-filters").addEventListener("click", () => {
      filterSection.style.display = "none";
    });
  }

  function generateCheckboxes(filterName, options, selectedOptions) {
    return options
      .map(
        (option) => `
          <label>
            <input type="checkbox" name="${filterName}" value="${option}" ${
          selectedOptions.includes(option) ? "checked" : ""
        }>
            ${option}
          </label>
        `
      )
      .join("");
  }

  function applyFilters() {
    const selectedFilters = {
      targetDemographic: getCheckedValues("targetDemographic"),
      clothingType: getCheckedValues("clothingType"),
      priceRange: getCheckedValues("priceRange"),
    };

    filters = selectedFilters;

    filteredStores = stores.filter((store) => {
      const matchesDemographic =
        selectedFilters.targetDemographic.length === 0 ||
        selectedFilters.targetDemographic.some((demo) =>
          store.targetDemographic.includes(demo)
        );
      const matchesClothing =
        selectedFilters.clothingType.length === 0 ||
        selectedFilters.clothingType.includes(store.clothingType);
      const matchesPrice =
        selectedFilters.priceRange.length === 0 ||
        selectedFilters.priceRange.includes(store.priceRange);

      return matchesDemographic && matchesClothing && matchesPrice;
    });

    displayedStores = 8;
    renderStores();
  }

  function getCheckedValues(name) {
    return Array.from(
      document.querySelectorAll(`input[name="${name}"]:checked`)
    ).map((input) => input.value);
  }

  function clearFilters() {
    filters = {
      targetDemographic: [],
      clothingType: [],
      priceRange: [],
    };
    searchBar.value = ""; // Clear the search bar
    filteredStores = stores;
    displayedStores = 8;
  }
}
