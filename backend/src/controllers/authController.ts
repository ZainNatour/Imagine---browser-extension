import { Request, Response } from 'express';
import crypto from 'crypto';
import { users, sessions } from '../models/dataStore';
import { User } from '../models/types';
import { AuthRequest } from '../middleware/authMiddleware';

export function signUp(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user: User = {
    id: crypto.randomUUID(),
    username,
    password,
    settings: {}
  };
  users.push(user);
  res.json({ id: user.id, username: user.username });
}

export function login(req: Request, res: Response) {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = crypto.randomUUID();
  sessions.set(token, user.id);
  res.json({ token });
}

export function logout(req: AuthRequest, res: Response) {
  if (req.token) sessions.delete(req.token);
  res.json({ message: 'Logged out' });
}

export function getProfile(req: AuthRequest, res: Response) {
  const user = users.find(u => u.id === req.user?.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, username: user.username, settings: user.settings });
}

export function updateProfile(req: AuthRequest, res: Response) {
  const user = users.find(u => u.id === req.user?.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { settings } = req.body;
  user.settings = { ...user.settings, ...settings };
  res.json({ id: user.id, username: user.username, settings: user.settings });
}
