import { User, Product, Store } from './types';

export const users: User[] = [];
export const products: Product[] = [];
export const stores: Store[] = [];
export const wishlists: Record<string, string[]> = {};
export const sessions: Map<string, string> = new Map();
