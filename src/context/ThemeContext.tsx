import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Storage key helper
  const getThemeKey = (userId?: string) => `sneakerx-theme-${userId || 'guest'}`;

  const [theme, setTheme] = useState<Theme>(() => {
    // Initial load - try guest key first or default to dark
    const saved = localStorage.getItem(getThemeKey()) || localStorage.getItem('sneakerx-theme');
    return (saved as Theme) || 'dark';
  });

  // Effect to load theme when user changes
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(getThemeKey(user.id)) as Theme;
      if (saved) {
        setTheme(saved);
      }
    }
  }, [user]);

  // Effect to apply theme class and save to localStorage
  useEffect(() => {
    const key = getThemeKey(user?.id);
    localStorage.setItem(key, theme);
    
    // Also update guest key if not logged in to maintain consistent guest experience
    if (!user) {
      localStorage.setItem(getThemeKey(), theme);
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, user]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
