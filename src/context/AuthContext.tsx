import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { storage, STORAGE_KEYS } from '../services/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Omit<User, 'id' | 'createdAt'>, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initializing storage on first load
    storage.init();
    
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async () => {
    // Simulate google login by picking a random buyer or creating one
    const users = storage.get<User>(STORAGE_KEYS.USERS);
    const buyer = users.find(u => u.role === 'buyer');
    if (buyer) {
      setUser(buyer);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(buyer));
    }
  };

  const login = async (email: string, _password?: string) => {
    const users = storage.get<User>(STORAGE_KEYS.USERS);
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(foundUser));
    } else {
      throw new Error('User not found');
    }
  };

  const register = async (data: Omit<User, 'id' | 'createdAt'>, _password?: string) => {
    const newUser: User = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };

    storage.insertOne(STORAGE_KEYS.USERS, newUser);
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    storage.updateOne<User>(STORAGE_KEYS.USERS, user.id, updates);
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
