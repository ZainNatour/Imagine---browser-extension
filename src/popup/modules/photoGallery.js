import {
  getPhotos,
  addPhoto,
  removePhoto,
  getSelectedPhotoId,
  setSelectedPhotoId,
  DEFAULT_MODELS,
} from './photoStorage.js';

const DEFAULT_MODEL_IDS = new Set(DEFAULT_MODELS.map((m) => m.id));

export function initPhotoGallery() {
  setupPhotoUpload();
  setupModelGridControls();
}

export async function loadAndRenderPhotos() {
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

  const openPicker = () => input.click();
  trigger.addEventListener('click', openPicker);
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  });

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

export function renderPhotoGallery(container, photos, selectedId) {
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

export function renderModelGrid(container, photos, selectedId) {
  container.innerHTML = '';
  photos.forEach((p, idx) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className =
      'model-swatch relative w-40 h-40 overflow-hidden rounded-xl shrink-0';
    swatch.setAttribute('aria-label', `Model ${idx + 1}`);
    if (p.id === selectedId) swatch.classList.add('selected');

    const img = document.createElement('img');
    img.src = p.dataUrl;
    img.alt = `Model ${idx + 1}`;
    img.className = 'absolute inset-0 w-full h-full object-cover';
    swatch.appendChild(img);

    const selectModel = async () => {
      await setSelectedPhotoId(p.id);
      await loadAndRenderPhotos();
    };
    swatch.addEventListener('click', selectModel);

    container.appendChild(swatch);
  });
}

