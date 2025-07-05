export async function getWishlist() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ wishlist: [] }, (result) => {
      resolve(result.wishlist);
    });
  });
}

export async function saveWishlist(items) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ wishlist: items }, () => resolve());
  });
}

export async function addToWishlist(item) {
  const list = await getWishlist();
  list.push({ ...item, dateAdded: new Date().toISOString() });
  await saveWishlist(list);
}

export async function renderWishlist(container) {
  const items = await getWishlist();
  if (!container) return;
  container.innerHTML = '';
  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'wishlist-item';

    const img = document.createElement('img');
    img.src = chrome.runtime.getURL(item.imageSrc);
    img.alt = item.name;
    div.appendChild(img);

    const nameP = document.createElement('p');
    nameP.textContent = `${item.name} - ${item.price}`;
    div.appendChild(nameP);

    const dateP = document.createElement('p');
    dateP.textContent = `Date Added: ${new Date(item.dateAdded).toLocaleDateString()}`;
    div.appendChild(dateP);

    const tryBtn = document.createElement('button');
    tryBtn.className = 'try-on-btn';
    tryBtn.textContent = 'Try On';
    div.appendChild(tryBtn);

    if (item.url) {
      const visitBtn = document.createElement('button');
      visitBtn.className = 'visit-page-btn';
      visitBtn.textContent = 'Visit Page';
      visitBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: item.url });
      });
      div.appendChild(visitBtn);
    }

    container.appendChild(div);
  });
}
