import { getAllProducts } from './onProductDetected.js';
import type { Product } from '../content/getProduct';

interface PriceInfo {
  last: number;
  original: number;
}

interface PriceDropInfo {
  newPrice: number;
  oldPrice: number;
  seen?: boolean;
}

function parsePrice(text: string): number | null {
  try {
    const json = JSON.parse(text);
    const val = json.price ?? json.priceCurrent ?? json.currentPrice;
    const num = parseFloat(String(val));
    if (!Number.isNaN(num)) return num;
  } catch {
    /* ignore */
  }
  const match = text.replace(/,/g, '').match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : null;
}

export function registerPriceWatcher() {
  const CHECK_INTERVAL = 12 * 60 * 60 * 1000; // 12h

  async function checkPrices() {
    const { prices = {}, priceDrops = {} } = await chrome.storage.local.get([
      'prices',
      'priceDrops',
    ]);
    const products: Product[] = await getAllProducts();

    for (const [productId, info] of Object.entries<PriceInfo>(prices)) {
      const product = products.find((p) => p.id === productId);
      if (!product?.url) continue;
      try {
        const res = await fetch(product.url);
        const text = await res.text();
        const current = parsePrice(text);
        if (current === null) continue;
        if (current < info.last) {
          const old = info.last;
          info.last = current;
          prices[productId] = info;
          priceDrops[productId] = {
            newPrice: current,
            oldPrice: old,
            seen: false,
          } satisfies PriceDropInfo;
          await chrome.storage.local.set({ prices, priceDrops });
          chrome.runtime.sendMessage({
            type: 'PRICE_DROP',
            productId,
            newPrice: current,
          });
        }
      } catch {
        /* ignore network errors */
      }
    }
  }

  setInterval(checkPrices, CHECK_INTERVAL);
}

export default registerPriceWatcher;

