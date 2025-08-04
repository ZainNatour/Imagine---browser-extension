import { toast } from 'sonner';

if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg?.type === 'PRICE_DROP') {
      const { productId, newPrice } = msg;
      const { products = {}, priceDrops = {} } = await chrome.storage.local.get([
        'products',
        'priceDrops',
      ]);
      type ProductInfo = { id: string; title?: string };
      const allProducts = Object.values(products as Record<string, ProductInfo[]>).flat();
      const product = allProducts.find((p: ProductInfo) => p.id === productId);
      const title = product?.title || 'item';
      const old = priceDrops?.[productId]?.oldPrice;
      toast(`🔥 Price drop on ${title}: was $${old}, now $${newPrice}!`);
      if (chrome.notifications && chrome.notifications.create) {
        chrome.notifications.create('', {
          type: 'basic',
          iconUrl: chrome.runtime.getURL
            ? chrome.runtime.getURL('src/assets/icons/icon128.png')
            : 'src/assets/icons/icon128.png',
          title: 'Price Drop Alert',
          message: `Price drop on ${title}`,
        });
      }
      chrome.runtime.sendMessage({ type: 'PRICE_DROP_ACK', productId });
    }
  });
}

export {};
