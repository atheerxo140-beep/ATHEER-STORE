'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';

interface ThemeModeContextType {
  mode: ThemeMode;
  isDark: boolean;
  isLight: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: 'dark',
  isDark: true,
  isLight: false,
  setMode: () => {},
  toggleMode: () => {},
});

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('atheer_theme_mode') as ThemeMode | null;
      if (saved === 'light' || saved === 'dark') {
        applyMode(saved);
      } else {
        applyMode('dark');
      }
    } catch (e) {
      applyMode('dark');
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'atheer_theme_mode' && (e.newValue === 'light' || e.newValue === 'dark')) {
        applyMode(e.newValue as ThemeMode);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const applyMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    if (typeof document !== 'undefined') {
      if (newMode === 'light') {
        document.documentElement.classList.add('theme-light');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.classList.remove('theme-light');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  };

  const setMode = (newMode: ThemeMode) => {
    applyMode(newMode);
    try {
      localStorage.setItem('atheer_theme_mode', newMode);
    } catch (e) {}
  };

  const toggleMode = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
  };

  return (
    <ThemeModeContext.Provider
      value={{
        mode,
        isDark: mode === 'dark',
        isLight: mode === 'light',
        setMode,
        toggleMode,
      }}
    >
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);
