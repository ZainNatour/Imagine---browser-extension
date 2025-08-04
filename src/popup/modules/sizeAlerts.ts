import { toast } from 'sonner';

if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg?.type === 'SIZE_RESTOCK') {
      const { productId, size } = msg;
      const { products = {}, sizeRestocksSeen = {} } = await chrome.storage.local.get([
        'products',
        'sizeRestocksSeen',
      ]);
      type ProductInfo = { id: string; title?: string };
      const allProducts = Object.values(products as Record<string, ProductInfo[]>).flat();
      const product = allProducts.find((p: ProductInfo) => p.id === productId);
      const title = product?.title || 'item';
      toast(`🎉 Your size ${size} is back for ${title}!`);
      if (chrome.notifications && chrome.notifications.create) {
        chrome.notifications.create('', {
          type: 'basic',
          iconUrl: chrome.runtime.getURL
            ? chrome.runtime.getURL('src/assets/icons/icon128.png')
            : 'src/assets/icons/icon128.png',
          title: 'Size Restock Alert',
          message: `${title} is back in size ${size}`,
        });
      }
      sizeRestocksSeen[productId] = true;
      await chrome.storage.local.set({ sizeRestocksSeen });
      chrome.runtime.sendMessage({ type: 'SIZE_RESTOCK_ACK', productId });
    }
  });
}

export {};
