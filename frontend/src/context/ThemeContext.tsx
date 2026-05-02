import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';
type ThemeColor = 'indigo' | 'blue' | 'green' | 'purple';

interface ThemeContextType {
  themeMode: ThemeMode;
  themeColor: ThemeColor;
  toggleTheme: () => void;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    if (savedMode) return savedMode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    return (localStorage.getItem('themeColor') as ThemeColor) || 'indigo';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme-color', themeColor);
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, themeColor, toggleTheme, setThemeColor }}>
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
