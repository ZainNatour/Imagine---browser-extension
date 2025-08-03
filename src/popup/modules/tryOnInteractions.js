import { requestTryOn } from './tryOnService.js';
import { notify } from '../../ui/toast.js';

export function initTryOnUi() {
  setupTryOnButton();
}

export function setupTryOnButton() {
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

export async function showPhotoDialog(clothingUrl) {
  const { getPhotos } = await import('./photoStorage.js');
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
        notify('Try-on ready!');
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

export function requestProductInfo() {
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

export async function loadProductInfo() {
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

  const sections = document.querySelectorAll('.collapsible-section .collapsible-content');
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
    container.parentElement.style.display = container.childElementCount ? '' : 'none';
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

