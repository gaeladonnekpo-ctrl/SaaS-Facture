"use client";

import React from "react";
import { useTheme } from "@/lib/theme/context";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import { Sun, Moon } from "lucide-react";

export function ThemeToggleButton() {
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useData();
  const { language } = useI18n();

  const handleToggle = () => {
    toggleTheme();
    showToast({
      type: "info",
      title: isDark
        ? (language === "en" ? "Light theme" : "Mode clair")
        : (language === "en" ? "Dark theme" : "Mode sombre"),
      message: isDark
        ? (language === "en" ? "Switched to daylight mode." : "Basculement vers l'affichage clair.")
        : (language === "en" ? "Switched to dark mode." : "Basculement vers l'affichage sombre."),
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-forest-900 hover:bg-sage-100 transition-all focus:outline-hidden shadow-2xs active:scale-95 group shrink-0"
      title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-label={isDark ? "Mode clair" : "Mode sombre"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-sage-600 group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}

