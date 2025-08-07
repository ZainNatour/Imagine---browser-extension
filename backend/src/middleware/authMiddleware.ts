import { Request, Response, NextFunction } from 'express';
import { sessions, users } from '../models/dataStore';

export interface AuthRequest extends Request {
  user?: { id: string; username: string };
  token?: string;
}

export function authGuard(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'No authorization header' });
  const token = header.replace('Bearer ', '');
  const userId = sessions.get(token);
  if (!userId) return res.status(401).json({ message: 'Invalid token' });
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(401).json({ message: 'User not found' });
  req.user = { id: user.id, username: user.username };
  req.token = token;
  next();
}
