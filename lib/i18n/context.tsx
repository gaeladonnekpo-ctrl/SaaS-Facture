"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  type SupportedLanguage,
  type TranslationDictionary,
  type LanguageInfo,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
} from "./translations";

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof TranslationDictionary, fallback?: string) => string;
  currentLanguage: LanguageInfo;
  languages: LanguageInfo[];
}

const LANGUAGE_STORAGE_KEY = "danhomey_lang";

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("fr");

  // Load language from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage | null;
      if (saved && TRANSLATIONS[saved]) {
        setLanguageState(saved);
        if (typeof document !== "undefined") {
          document.documentElement.lang = saved;
        }
      }
    } catch {}
  }, []);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (!TRANSLATIONS[newLang]) return;
    setLanguageState(newLang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLang;
    }
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch {}
  }, []);

  const t = useCallback(
    (key: keyof TranslationDictionary, fallback?: string): string => {
      const currentDict = TRANSLATIONS[language];
      if (currentDict && currentDict[key]) {
        return currentDict[key];
      }
      // Fallback to French
      const frenchDict = TRANSLATIONS.fr;
      if (frenchDict && frenchDict[key]) {
        return frenchDict[key];
      }
      return fallback || key;
    },
    [language]
  );

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]!;

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguage,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider.");
  }
  return context;
}

