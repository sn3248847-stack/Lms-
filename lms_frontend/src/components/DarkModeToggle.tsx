"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle Dark Mode"
      className="p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-secondary/50 transition-all"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400 transition-transform hover:rotate-12" />
      ) : (
        <Moon className="w-5 h-5 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
