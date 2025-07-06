export async function onProductDetected(product, similars) {
  await chrome.storage.local.set({
    currentProduct: product,
    similarProducts: similars,
  });
}

export function registerProductListener() {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'productDetected') {
      void onProductDetected(msg.product, msg.similars);
    }
  });
}
