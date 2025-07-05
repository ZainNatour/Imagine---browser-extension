(async () => {
  const { isOnlineStore } = await import(
    chrome.runtime.getURL('src/background/modules/urlUtils.js')
  );
  const currentUrl = new URL(window.location.href);
  if (!(await isOnlineStore(currentUrl))) {
    return;
  }

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

  function textFromSelectors(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const txt = el.textContent?.trim();
        if (txt) return txt;
      }
    }
    return '';
  }

  function collectColors() {
    const elements = document.querySelectorAll(
      '[itemprop="color"], [class*="color"] option, select[name*="color"] option, [data-color]'
    );
    const colors = [];
    elements.forEach((el) => {
      const val =
        el.getAttribute('data-color') || el.textContent?.trim() || el.style.backgroundColor;
      if (val && !colors.includes(val)) colors.push(val);
    });
    return colors;
  }

  function collectSimilar() {
    const container = document.querySelector(
      '.similar-products, .related-products, [class*="similar"], [class*="related"]'
    );
    const items = [];
    if (container) {
      container.querySelectorAll('a img').forEach((img) => {
        const link = img.closest('a');
        if (img.src) {
          items.push({ link: link ? link.href : '', image: img.src });
        }
      });
    }
    return items;
  }

  function collectRatingValue() {
    const el =
      document.querySelector('[itemprop="ratingValue"]') ||
      document.querySelector('.rating');
    if (!el) return '';
    return (
      el.getAttribute('content') || el.textContent?.match(/[\d.]+/)?.[0] || ''
    );
  }

  function collectReviewSnippets() {
    const snippets = [];
    document
      .querySelectorAll(
        '[itemprop="review"] .review-text, .review-snippet, .review'
      )
      .forEach((el) => {
        const txt = el.textContent?.trim();
        if (txt) snippets.push(txt);
      });
    return snippets.slice(0, 3);
  }

  function extractProductInfo() {
    return {
      name: textFromSelectors(['[itemprop="name"]', 'h1', 'meta[property="og:title"]']),
      price: textFromSelectors(['[itemprop="price"]', '.price', '[class*="price"]']),
      colors: collectColors(),
      details: textFromSelectors([
        '[itemprop="description"]',
        '.product-description',
        '[id*="description"]',
      ]),
      ratingValue: collectRatingValue(),
      reviewSnippets: collectReviewSnippets(),
      clothingType: textFromSelectors(['[itemprop="category"]']),
      image:
        document.querySelector('[itemprop="image"]')?.src ||
        document.querySelector('meta[property="og:image"]')?.content ||
        document.querySelector('img')?.src ||
        '',
      similar: collectSimilar(),
    };
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getProductInfo') {
      sendResponse(extractProductInfo());
    }
  });
})();
