import { Request, Response } from 'express';

export function tryOnPlaceholder(_req: Request, res: Response) {
  res.json({ message: 'Virtual try-on integration coming soon' });
}
