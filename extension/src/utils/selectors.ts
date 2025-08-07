export interface HostSelectors {
  title?: string;
  price?: string;
  priceOld?: string;
  mainImage?: string;
  gallery?: string;
  similar?: string;
}

/**
 * Map of hostnames to CSS selectors used for scraping fallback data.
 */
export const selectors: Record<string, HostSelectors> = {
  'amazon.com': {
    title: '#productTitle',
    price: '#priceblock_ourprice, #priceblock_dealprice',
    priceOld: '.priceBlockStrikePriceString',
    mainImage: '#landingImage',
    gallery: '#altImages img',
    similar: '#sp_detail .a-carousel-card',
  },
  'asos.com': {
    title: '[data-test-id="product-title"]',
    price: '[data-id="current-price"]',
    mainImage: '[data-test-id="image-viewer"] img',
    gallery: '[data-test-id="thumbnail-list"] img',
    similar: '[data-test-id="also-wear"] a',
  },
  'zara.com': {
    title: '.title',
    price: '.price',
    mainImage: '.main img',
    gallery: '.gallery img',
    similar: '.similar a',
  },
  'hm.com': {
    title: '.title',
    price: '.price',
    mainImage: '.main img',
    gallery: '.gallery img',
    similar: '.similar a',
  },
  'uniqlo.com': {
    title: '.title',
    price: '.price',
    mainImage: '.main img',
    gallery: '.gallery img',
    similar: '.similar a',
  },
  'nike.com': {
    title: '.title',
    price: '.price',
    mainImage: '.main img',
    gallery: '.gallery img',
    similar: '.similar a',
  },
  'adidas.com': {
    title: '.title',
    price: '.price',
    mainImage: '.main img',
    gallery: '.gallery img',
    similar: '.similar a',
  },
  'gucci.com': {
    title: '.title',
    price: '.price',
    mainImage: '.main img',
    gallery: '.gallery img',
    similar: '.similar a',
  },
  'levi.com': {
    title: '.title',
    price: '.price',
    mainImage: '.main img',
    gallery: '.gallery img',
    similar: '.similar a',
  },
  'gap.com': {
    title: '.title',
    price: '.price',
    mainImage: '.main img',
    gallery: '.gallery img',
    similar: '.similar a',
  },
  'louisvuitton.com': {
    title: '.title',
    price: '.price',
    mainImage: '.main img',
    gallery: '.gallery img',
    similar: '.similar a',
  },
  'underarmour.com': {
    title: '.title',
    price: '.price',
    mainImage: '.main img',
    gallery: '.gallery img',
    similar: '.similar a',
  },
  'prada.com': {
    title: '.title',
    price: '.price',
    mainImage: '.main img',
    gallery: '.gallery img',
    similar: '.similar a',
  },
  'versace.com': {
    title: '.title',
    price: '.price',
    mainImage: '.main img',
    gallery: '.gallery img',
    similar: '.similar a',
  },
};
