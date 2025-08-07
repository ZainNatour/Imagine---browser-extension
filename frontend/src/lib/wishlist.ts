import { Product } from '../data/products';

const STORAGE_KEY = 'wishlist';

export function getWishlist(): Product[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Product[]) : [];
}

export function addToWishlist(product: Product) {
  if (typeof window === 'undefined') return;
  const items = getWishlist();
  if (!items.find((p) => p.id === product.id)) {
    const updated = [...items, product];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}

export function removeFromWishlist(id: string) {
  if (typeof window === 'undefined') return;
  const items = getWishlist().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
