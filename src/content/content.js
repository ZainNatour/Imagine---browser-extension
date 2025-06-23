(() => {

  function highlightProductImages() {
    document.querySelectorAll('img').forEach((img) => {
      if (img.naturalWidth > 100 && img.naturalHeight > 100) {
        img.style.outline = '2px solid #ff6600';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', highlightProductImages);
  } else {
    highlightProductImages();
  }
})();
