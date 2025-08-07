import { getAllProducts } from './onProductDetected.js';
import type { Product } from '../content/getProduct';

interface SizeInfo {
  wanted: string;
  inStock: boolean;
}

export function registerSizeWatcher() {
  const CHECK_INTERVAL = 12 * 60 * 60 * 1000; // 12h

  async function checkSizes() {
    const { sizes = {} } = await chrome.storage.local.get('sizes');
    const products: Product[] = await getAllProducts();

    for (const [productId, info] of Object.entries<SizeInfo>(sizes)) {
      if (info.inStock) continue;
      const product = products.find((p) => p.id === productId);
      if (!product?.url) continue;
      try {
        const res = await fetch(product.url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const options = Array.from(
          doc.querySelectorAll('select[name*=size] option:not([disabled])'),
        );
        const wanted = options.find(
          (o) =>
            o.textContent?.trim() === info.wanted ||
            o.getAttribute('value') === info.wanted,
        );
        if (wanted && !info.inStock) {
          info.inStock = true;
          sizes[productId] = info;
          await chrome.storage.local.set({ sizes });
          chrome.runtime.sendMessage({
            type: 'SIZE_RESTOCK',
            productId,
            size: info.wanted,
          });
        }
      } catch {
        /* ignore */
      }
    }
  }

  setInterval(checkSizes, CHECK_INTERVAL);
}

export default registerSizeWatcher;
