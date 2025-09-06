'use client';

import { useTheme } from '@/lib/themeContext';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder to prevent layout shift and hydration errors
    return <div className="w-10 h-10 p-2" />;
  }

  // This logic now *exactly* mirrors the customer-facing navbar button.
  // In light mode, it shows a Moon icon (to switch to dark).
  // In dark mode, it shows a Sun icon (to switch to light).
  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
      <span className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 dark:bg-zinc-700 text-white text-xs rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        {theme === 'light' ? 'Switch to dark' : 'Switch to light'}
      </span>
    </button>
  );
};

export default ThemeToggleButton;
