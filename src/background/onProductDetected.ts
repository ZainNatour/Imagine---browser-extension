import type { Product, SimilarProduct } from '../content/getProduct';

/**
 * Persist the detected product and similar products.
 */
export async function onProductDetected(product: Product | null, similars: SimilarProduct[]) {
  await chrome.storage.local.set({
    currentProduct: product,
    similarProducts: similars,
  });
}

/**
 * Return all products saved in storage across stores.
 */
export async function getAllProducts() {
  const { products } = await chrome.storage.local.get('products');
  // products may be an object mapping store -> Product[]
  return Object.values<Product[]>(products || {}).flat();
}

/**
 * Register message listener for product detection events.
 */
export function registerProductListener() {
  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (sender.id !== chrome.runtime.id) {
      return;
    }
    if (msg && msg.type === 'productDetected') {
      void onProductDetected(msg.product, msg.similars);
    }
  });
}
