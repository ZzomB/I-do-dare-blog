'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-7 w-14 items-center rounded-full bg-muted border transition-colors duration-500 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="테마 변경"
    >
      <span className="absolute left-1 flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-sm transition-transform duration-500 ease-in-out dark:translate-x-7">
        <Sun className="absolute h-3 w-3 scale-100 rotate-0 transition-all duration-500 ease-in-out dark:scale-0 dark:-rotate-90 text-slate-700 dark:text-slate-200" />
        <Moon className="absolute h-3 w-3 scale-0 rotate-90 transition-all duration-500 ease-in-out dark:scale-100 dark:rotate-0 text-slate-700 dark:text-slate-200" />
      </span>
    </button>
  );
}
