"use client";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="relative group">
      <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300">
        {theme === 'dark' ? <Moon size={20} /> : theme === 'light' ? <Sun size={20} /> : <Monitor size={20} />}
      </button>
      <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <button onClick={() => setTheme('light')} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
          <Sun size={16} /> Light Theme
        </button>
        <button onClick={() => setTheme('dark')} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
          <Moon size={16} /> Dark Theme
        </button>
        <button onClick={() => setTheme('system')} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
          <Monitor size={16} /> System
        </button>
      </div>
    </div>
  );
}
