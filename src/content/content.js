(async () => {
  try {
    const { isOnlineStore } = await import(
      chrome.runtime.getURL('src/background/modules/urlUtils.js')
    );
    const currentUrl = new URL(window.location.href);
    const onStore = await isOnlineStore(currentUrl);

    function highlightProductImages() {
      document.querySelectorAll('img').forEach((img) => {
        if (img.naturalWidth > 100 && img.naturalHeight > 100) {
          img.style.outline = '2px solid #ff6600';
        }
      });
    }

    async function detectProduct() {
      const { getProduct } = await import(
        chrome.runtime.getURL('src/content/getProduct.js')
      );
      const { product, similars } = await getProduct();
      if (product) {
        chrome.runtime.sendMessage({
          type: 'productDetected',
          product,
          similars,
        });
      }
    }

    if (onStore) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          highlightProductImages();
          detectProduct();
        });
      } else {
        highlightProductImages();
        detectProduct();
      }
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

    function collectRecommended() {
      const containers = document.querySelectorAll(
        '.recommended-products, .similar-products, .related-products, [class*="recommended"], [class*="similar"], [class*="related"]'
      );
      const items = [];
      containers.forEach((container) => {
        container.querySelectorAll('a').forEach((a) => {
          const img = a.querySelector('img');
          if (!img || !img.src) return;
          const name = img.getAttribute('alt') || a.textContent.trim();
          items.push({ url: a.href || '', image: img.src, name });
        });
      });
      const unique = [];
      const seen = new Set();
      items.forEach((item) => {
        const key = `${item.url}|${item.image}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      });
      return unique;
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

    function parseJsonLdProduct() {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      for (const s of scripts) {
        try {
          const data = JSON.parse(s.textContent);
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            if (
              item['@type'] === 'Product' ||
              (Array.isArray(item['@type']) && item['@type'].includes('Product'))
            )
              return item;
            if (item['@graph']) {
              const graphItems = Array.isArray(item['@graph'])
                ? item['@graph']
                : [item['@graph']];
              for (const g of graphItems) {
                if (
                  g['@type'] === 'Product' ||
                  (Array.isArray(g['@type']) && g['@type'].includes('Product'))
                )
                  return g;
              }
            }
          }
        } catch {
          // ignore JSON parse errors
        }
      }
      return null;
    }

    function extractProductInfo() {
      const json = parseJsonLdProduct() || {};
      const info = {
        name:
          json.name ||
          textFromSelectors([
            '[itemprop="name"]',
            'h1',
            'meta[property="og:title"]',
          ]),
        price:
          (json.offers && json.offers.price) ||
          textFromSelectors([
            '[itemprop="price"]',
            '.price',
            '[class*="price"]',
          ]),
        colors: collectColors(),
        details:
          json.description ||
          textFromSelectors([
            '[itemprop="description"]',
            '.product-description',
            '[id*="description"]',
          ]),
        ratingValue:
          (json.aggregateRating && json.aggregateRating.ratingValue) ||
          collectRatingValue(),
        reviewSnippets:
          (Array.isArray(json.review)
            ? json.review
              .map((r) => r.reviewBody || r.description || r.name)
              .filter(Boolean)
              .slice(0, 3)
            : collectReviewSnippets()),
        clothingType:
          json.category || textFromSelectors(['[itemprop="category"]']),
        image:
          (Array.isArray(json.image) ? json.image[0] : json.image) ||
          document.querySelector('[itemprop="image"]')?.src ||
          document.querySelector('meta[property="og:image"]')?.content ||
          document.querySelector('img')?.src ||
          '',
        recommended: collectRecommended(),
      };
      return info;
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'getProductInfo') {
        sendResponse(extractProductInfo());
      }
    });
  } catch (err) {
    console.error('Content script failed', err);
  }
})();
