import { Request, Response } from 'express';
import crypto from 'crypto';
import { products } from '../models/dataStore';
import { Product } from '../models/types';
import { AuthRequest } from '../middleware/authMiddleware';

export function saveProduct(req: AuthRequest, res: Response) {
  const { name, description, price } = req.body;
  if (!name) return res.status(400).json({ message: 'Product name required' });
  const product: Product = {
    id: crypto.randomUUID(),
    name,
    description,
    price,
    ownerId: req.user?.id
  };
  products.push(product);
  res.json(product);
}

export function listProducts(_req: Request, res: Response) {
  res.json(products);
}

export function getProduct(req: Request, res: Response) {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}
