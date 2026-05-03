/**
 * Local Storage Service
 * Mimics a database for persistent storage without AI dependencies
 */

import { Product, User } from '../types';

const STORAGE_KEYS = {
  USERS: 'mm_users',
  PRODUCTS: 'mm_products',
  ORDERS: 'mm_orders',
  REVIEWS: 'mm_reviews',
  CHATS: 'mm_chats',
  MESSAGES: 'mm_messages',
  NOTIFICATIONS: 'mm_notifications',
  CURRENT_USER: 'mm_current_user',
};

// Initial Sample Data (Empty for production)
const INITIAL_PRODUCTS: Product[] = [];

export const storage = {
  get: <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
  
  save: <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  getOne: <T extends { id: string }>(key: string, id: string): T | undefined => {
    return storage.get<T>(key).find(item => item.id === id);
  },

  insertOne: <T extends { id: string }>(key: string, item: Omit<T, 'id'>): T => {
    const data = storage.get<T>(key);
    const newItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 11)
    } as T;
    data.push(newItem);
    storage.save(key, data);
    return newItem;
  },

  updateOne: <T extends { id: string }>(key: string, id: string, updates: Partial<T>) => {
    const data = storage.get<T>(key);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      storage.save(key, data);
    }
  },

  deleteOne: <T extends { id: string }>(key: string, id: string) => {
    const data = storage.get<T>(key);
    const filtered = data.filter(item => item.id !== id);
    storage.save(key, filtered);
  },

  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      storage.save(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    } else {
      // Cleanup legacy demo products (start with sx-)
      const existingProducts = storage.get<Product>(STORAGE_KEYS.PRODUCTS);
      const filteredProducts = existingProducts.filter(p => !p.id?.startsWith('sx-'));
      if (filteredProducts.length !== existingProducts.length) {
        storage.save(STORAGE_KEYS.PRODUCTS, filteredProducts);
      }
    }
    // Add default admin if no users
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      storage.save(STORAGE_KEYS.USERS, [
        {
          id: 'admin1',
          email: 'admin@marketmaster.com',
          name: 'System Admin',
          phone: '233542541199',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  }
};

export { STORAGE_KEYS };
