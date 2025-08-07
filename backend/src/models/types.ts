export interface User {
  id: string;
  username: string;
  password: string;
  settings?: Record<string, any>;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  ownerId?: string;
}

export interface Store {
  id: string;
  name: string;
}
