/**
 * Persist the detected product and similar products.
 */
export async function onProductDetected(product, similars) {
  await chrome.storage.local.set({
    currentProduct: product,
    similarProducts: similars,
  });
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
