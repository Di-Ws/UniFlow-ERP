import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-dark-text hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm"
      aria-label="Toggle Theme"
    >
      {themeMode === 'light' ? (
        <Moon size={20} className="text-primary" />
      ) : (
        <Sun size={20} className="text-amber-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
