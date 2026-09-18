"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className={`w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 ${className}`} />;
  }

  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`p-2 rounded-full transition-all duration-200 ${
        isDark
          ? "bg-[#252C1E] text-[#EBF1B1] hover:bg-[#2E3725] border border-[#353E2B]"
          : "bg-white text-[#3D422E] hover:bg-gray-100 border border-[#E5E7EB]"
      } shadow-2xs ${className}`}
      title={isDark ? "Switch to Nature Light" : "Switch to Nature Dark"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform rotate-0 scale-100 text-[#EBF1B1]" />
      ) : (
        <Moon className="w-4 h-4 transition-transform rotate-0 scale-100 text-[#3D422E]" />
      )}
    </button>
  );
}
