import { selectors } from '../utils/selectors.js';

function text(sel) {
  for (const s of sel) {
    const el = document.querySelector(s);
    if (el) {
      const t = el.getAttribute('content') || el.textContent || '';
      const v = t.trim();
      if (v) return v;
    }
  }
  return '';
}

function fromJsonLd() {
  const scripts = Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  );
  for (const s of scripts) {
    try {
      const data = JSON.parse(s.textContent || '{}');
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (
          item['@type'] === 'Product' ||
          (Array.isArray(item['@type']) && item['@type'].includes('Product'))
        ) {
          const img = Array.isArray(item.image) ? item.image[0] : item.image;
          return {
            id: item.sku || '',
            title: item.name || '',
            priceCurrent: item.offers?.price || '',
            priceOld: item.offers?.highPrice || '',
            currency: item.offers?.priceCurrency || '',
            mainImage: img || '',
            imageGallery: Array.isArray(item.image) ? item.image : img ? [img] : [],
            rating: item.aggregateRating?.ratingValue || '',
            reviewsCount: item.aggregateRating?.reviewCount || '',
            brand: item.brand?.name || item.brand || '',
            seller: item.offers?.seller?.name || '',
            variants: [],
            breadcrumbs: [],
            availability: item.offers?.availability || '',
            shippingCost: item.offers?.shippingDetails?.shippingRate?.value || '',
          };
        }
      }
    } catch {
      // ignore parse errors
    }
  }
  return null;
}

function fromOpenGraph() {
  const get = (p) =>
    document.querySelector(`meta[property='${p}']`)?.getAttribute('content') || '';
  return {
    title: get('og:title'),
    mainImage: get('og:image'),
    priceCurrent: get('product:price:amount'),
    currency: get('product:price:currency'),
  };
}

function fromSelectors() {
  const host = window.location.hostname.replace(/^www\./, '');
  const conf = selectors[host];
  if (!conf) return {};
  const gallery = [];
  if (conf.gallery) {
    document.querySelectorAll(conf.gallery).forEach((img) => {
      const src = img.src;
      if (src) gallery.push(src);
    });
  }
  return {
    title: conf.title ? text([conf.title]) : '',
    priceCurrent: conf.price ? text([conf.price]) : '',
    priceOld: conf.priceOld ? text([conf.priceOld]) : '',
    mainImage: conf.mainImage ? document.querySelector(conf.mainImage)?.src || '' : '',
    imageGallery: gallery,
  };
}

function fromJsonBlob() {
  const state = window.__PRELOADED_STATE__ || window.__INITIAL_STATE__;
  if (state && state.product) {
    const p = state.product;
    return {
      id: p.id?.toString() || '',
      title: p.title || '',
      priceCurrent: p.price?.current?.toString() || '',
      priceOld: p.price?.old?.toString() || '',
      currency: p.price?.currency || '',
      mainImage: p.media?.images?.[0] || '',
      imageGallery: p.media?.images || [],
      rating: p.rating?.value?.toString() || '',
      reviewsCount: p.rating?.count?.toString() || '',
      brand: p.brand || '',
      seller: p.seller || '',
      variants: p.variants || [],
      breadcrumbs: p.breadcrumbs || [],
      availability: p.availability || '',
      shippingCost: p.shippingCost || '',
    };
  }
  const script = document.querySelector('script[id*="__NEXT_DATA__"]');
  if (script) {
    try {
      const json = JSON.parse(script.textContent || '{}');
      const p = json.product;
      if (p) {
        return {
          id: p.id?.toString() || '',
          title: p.title || '',
          priceCurrent: p.price?.current?.toString() || '',
          priceOld: p.price?.old?.toString() || '',
          currency: p.price?.currency || '',
          mainImage: p.media?.images?.[0] || '',
          imageGallery: p.media?.images || [],
          rating: p.rating?.value?.toString() || '',
          reviewsCount: p.rating?.count?.toString() || '',
          brand: p.brand || '',
          seller: p.seller || '',
          variants: p.variants || [],
          breadcrumbs: p.breadcrumbs || [],
          availability: p.availability || '',
          shippingCost: p.shippingCost || '',
        };
      }
    } catch {
      // ignore
    }
  }
  return null;
}

function merge(base, ...rest) {
  if (!base) return null;
  const result = { ...base };
  for (const obj of rest) {
    for (const [k, v] of Object.entries(obj)) {
      if (!result[k] && v) result[k] = v;
    }
  }
  if (!result.imageGallery) result.imageGallery = [];
  if (!result.variants) result.variants = [];
  if (!result.breadcrumbs) result.breadcrumbs = [];
  if (!result.id && result.title) result.id = result.title;
  return result;
}

function findSimilars() {
  const host = window.location.hostname.replace(/^www\./, '');
  const res = [];
  const conf = selectors[host];
  let nodes = [];
  if (conf?.similar) nodes = document.querySelectorAll(conf.similar);
  if (!nodes.length) {
    nodes = document.querySelectorAll('[class*="related"], [class*="similar"], [class*="recommend"]');
  }
  nodes.forEach((el) => {
    const link = el.querySelector('a') || el.closest('a');
    const img = el.querySelector('img');
    if (!img || !link) return;
    const title = img.getAttribute('alt') || link.textContent?.trim() || '';
    const priceMatch = el.textContent?.match(/\$\s?([\d,.]+)/);
    const price = priceMatch ? priceMatch[1] : '';
    res.push({
      id: link.getAttribute('href') || '',
      title,
      price,
      thumbnail: img.src || '',
    });
  });
  const unique = [];
  const seen = new Set();
  for (const p of res) {
    const key = p.thumbnail + p.id;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(p);
    }
    if (unique.length >= 4) break;
  }
  return unique;
}

export async function getProduct() {
  const base =
    fromJsonBlob() ||
    fromJsonLd() ||
    fromOpenGraph() ||
    fromSelectors();
  const product = base
    ? merge(base, fromJsonLd() || {}, fromOpenGraph(), fromSelectors())
    : null;
  const similars = findSimilars();
  if (product && !product.title && !product.priceCurrent && !product.mainImage) {
    return { product: null, similars };
  }
  return { product, similars };
}
