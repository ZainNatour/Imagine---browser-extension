import { Request, Response } from 'express';
import crypto from 'crypto';
import { stores } from '../models/dataStore';
import { Store } from '../models/types';

export function listStores(_req: Request, res: Response) {
  res.json(stores);
}

export function addStore(req: Request, res: Response) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Store name required' });
  const store: Store = { id: crypto.randomUUID(), name };
  stores.push(store);
  res.json(store);
}
