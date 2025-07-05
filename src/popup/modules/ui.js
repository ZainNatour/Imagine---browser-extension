export function renderStores(container, stores, displayed) {
  container.textContent = "";
  const visible = stores.slice(0, displayed);
  visible.forEach((store) => {
    const item = document.createElement("div");
    item.className = "store-item card";

    const img = document.createElement("img");
    img.src = chrome.runtime.getURL(store.image);
    img.alt = store.name;

    const name = document.createElement("p");
    name.textContent = store.name;

    item.appendChild(img);
    item.appendChild(name);

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
  selected.includes(opt) ? 'checked' : ''
}>
          ${opt}
        </label>
      `,
    )
    .join('');
}

export function getCheckedValues(name) {
  return Array.from(
    document.querySelectorAll(`input[name="${name}"]:checked`),
  ).map((input) => input.value);
}
