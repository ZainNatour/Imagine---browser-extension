export function renderStores(container, stores, displayed) {
  container.innerHTML = "";
  const visible = stores.slice(0, displayed);
  visible.forEach((store) => {
    const item = document.createElement("div");
    item.className = "store-item";
    const imageUrl = chrome.runtime.getURL(store.image);
    item.innerHTML = `<img src="${imageUrl}" alt="${store.name}" />\n        <p>${store.name}</p>`;
    item.addEventListener("click", () => {
      chrome.tabs.create({ url: store.url });
    });
    container.appendChild(item);
  });
}

export function updateLoadMoreButton(button, displayed, total) {
  button.style.display = displayed >= total ? "none" : "block";
}

export function generateCheckboxes(name, options, selected) {
  return options
    .map(
      (opt) => `
        <label>
          <input type="checkbox" name="${name}" value="${opt}" ${
        selected.includes(opt) ? "checked" : ""
      }>
          ${opt}
        </label>
      `
    )
    .join("");
}

export function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
    (input) => input.value
  );
}
