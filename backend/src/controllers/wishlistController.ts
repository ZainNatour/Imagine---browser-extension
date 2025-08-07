import { Response } from 'express';
import { products, wishlists } from '../models/dataStore';
import { AuthRequest } from '../middleware/authMiddleware';

export function addToWishlist(req: AuthRequest, res: Response) {
  const { id } = req.params;
  if (!products.some(p => p.id === id)) {
    return res.status(404).json({ message: 'Product not found' });
  }
  const list = wishlists[req.user!.id] || [];
  if (!list.includes(id)) list.push(id);
  wishlists[req.user!.id] = list;
  res.json({ wishlist: list });
}

export function removeFromWishlist(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const list = wishlists[req.user!.id] || [];
  wishlists[req.user!.id] = list.filter(pid => pid !== id);
  res.json({ wishlist: wishlists[req.user!.id] });
}

export function getWishlist(req: AuthRequest, res: Response) {
  const list = wishlists[req.user!.id] || [];
  const items = list.map(id => products.find(p => p.id === id)).filter(Boolean);
  res.json(items);
}

export function getAllWishlists(_req: AuthRequest, res: Response) {
  const all = Object.entries(wishlists).map(([userId, ids]) => ({
    userId,
    products: ids.map(id => products.find(p => p.id === id)).filter(Boolean)
  }));
  res.json(all);
}
