import { selectors } from '../utils/selectors';

export interface Product {
  id: string;
  title: string;
  priceCurrent: string;
  priceOld?: string;
  currency?: string;
  mainImage: string;
  imageGallery: string[];
  rating?: string;
  reviewsCount?: string;
  brand?: string;
  seller?: string;
  variants: string[];
  breadcrumbs: string[];
  availability?: string;
  shippingCost?: string;
}

export interface SimilarProduct {
  id: string;
  title: string;
  price: string;
  thumbnail: string;
}

/**
 * Return text content from the first matching selector.
 */
function text(sel: string[]): string {
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

/**
 * Scrape Product data using schema.org Product JSON-LD.
 */
function fromJsonLd(): Product | null {
  const scripts = Array.from(
    document.querySelectorAll('script[type="application/ld+json"]')
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
          const img = Array.isArray(item.image)
            ? item.image[0]
            : item.image;
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

/**
 * Scrape Product data from Open Graph tags.
 */
function fromOpenGraph(): Partial<Product> {
  const get = (p: string) =>
    document.querySelector(`meta[property='${p}']`)?.getAttribute('content') || '';
  return {
    title: get('og:title'),
    mainImage: get('og:image'),
    priceCurrent: get('product:price:amount'),
    currency: get('product:price:currency'),
  } as Partial<Product>;
}

/**
 * Fallback scraping using host specific selectors.
 */
function fromSelectors(): Partial<Product> {
  const host = window.location.hostname.replace(/^www\./, '');
  const conf = selectors[host];
  if (!conf) return {};
  const gallery: string[] = [];
  if (conf.gallery) {
    document.querySelectorAll(conf.gallery).forEach((img) => {
      const src = (img as HTMLImageElement).src;
      if (src) gallery.push(src);
    });
  }
  return {
    title: conf.title ? text([conf.title]) : '',
    priceCurrent: conf.price ? text([conf.price]) : '',
    priceOld: conf.priceOld ? text([conf.priceOld]) : '',
    mainImage: conf.mainImage
      ? (document.querySelector(conf.mainImage) as HTMLImageElement)?.src || ''
      : '',
    imageGallery: gallery,
  } as Partial<Product>;
}

/**
 * Attempt to read dedicated JSON blobs on the page.
 */
function fromJsonBlob(): Product | null {
  const state: any = (window as any).__PRELOADED_STATE__ || (window as any).__INITIAL_STATE__;
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

/**
 * Merge multiple partial product sources into one Product object.
 */
function merge(base: Partial<Product> | null, ...rest: Array<Partial<Product>>): Product | null {
  if (!base) return null;
  const result: any = { ...base };
  for (const obj of rest) {
    for (const [k, v] of Object.entries(obj)) {
      if (!result[k] && v) result[k] = v;
    }
  }
  if (!result.imageGallery) result.imageGallery = [];
  if (!result.variants) result.variants = [];
  if (!result.breadcrumbs) result.breadcrumbs = [];
  if (!result.id && result.title) result.id = result.title;
  return result as Product;
}

/**
 * Find similar products on the page.
 */
function findSimilars(): SimilarProduct[] {
  const host = window.location.hostname.replace(/^www\./, '');
  const res: SimilarProduct[] = [];
  const conf = selectors[host];
  let nodes: NodeListOf<Element> = [] as any;
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
  const unique: SimilarProduct[] = [];
  const seen = new Set<string>();
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

/**
 * Scrape product and similar products from the page.
 */
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
  if (
    product &&
    !product.title &&
    !product.priceCurrent &&
    !product.mainImage
  ) {
    return { product: null, similars };
  }
  return { product, similars };
}
