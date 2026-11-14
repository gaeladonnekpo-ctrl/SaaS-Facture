"use client";

import React, { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useData } from "@/lib/data/context";
import type { SupportedLanguage } from "@/lib/i18n/translations";
import { Globe, Check, ChevronDown } from "lucide-react";

export function LanguageSelectorPopover() {
  const { language, setLanguage, currentLanguage, languages } = useI18n();
  const { showToast } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguage, name: string) => {
    setLanguage(code);
    setIsOpen(false);
    showToast({
      type: "success",
      title: "Langue modifiée",
      message: `L'application est maintenant affichée en ${name}.`,
    });
  };

  const internationalLanguages = languages.filter((l) => l.category === "international");
  const localLanguages = languages.filter((l) => l.category === "local");

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Trigger Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface px-2 sm:px-2.5 text-xs font-semibold text-forest-900 hover:bg-sage-100 transition-colors focus:outline-hidden shadow-2xs active:scale-95 group shrink-0"
        title="Changer la langue de l'application"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{currentLanguage.flag}</span>
        <span className="hidden sm:inline uppercase text-[11px] font-bold text-forest-950 tracking-wider">
          {currentLanguage.code}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-sage-400 group-hover:text-forest-900 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop for mobile and desktop click-away */}
          <div
            className="fixed inset-0 z-40 bg-forest-950/20 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-80 z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-dropdown animate-in fade-in-50 zoom-in-95 max-h-[calc(100vh-5rem)] sm:max-h-[480px] flex flex-col">
            <div className="border-b border-line px-3.5 py-2.5 flex items-center justify-between bg-sage-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-forest-800" />
              <span className="text-xs font-bold text-forest-950">Sélectionner une langue</span>
            </div>
            <span className="text-[10px] text-ink-muted">UEMOA &amp; International</span>
          </div>

          <div className="max-h-96 overflow-y-auto p-2 space-y-3">
            {/* Section 1: Langues Internationales */}
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sage-400">
                Langues Internationales
              </div>
              <div className="space-y-0.5 mt-0.5">
                {internationalLanguages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelect(lang.code, lang.name)}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors group ${
                        isSelected
                          ? "bg-forest-900 text-surface font-semibold"
                          : "hover:bg-sage-100/70 text-forest-950"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <div>
                          <p className="font-semibold leading-tight">{lang.name}</p>
                          <p
                            className={`text-[10px] ${
                              isSelected ? "text-lime-300" : "text-sage-500"
                            }`}
                          >
                            {lang.nativeName}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-lime-400 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Langues Locales Africaines */}
            <div>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sage-400">
                Langues Locales (Afrique de l&apos;Ouest &amp; Centrale)
              </div>
              <div className="space-y-0.5 mt-0.5">
                {localLanguages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelect(lang.code, `${lang.name} (${lang.country})`)}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors group ${
                        isSelected
                          ? "bg-forest-900 text-surface font-semibold"
                          : "hover:bg-sage-100/70 text-forest-950"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold leading-tight">{lang.name}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-sm ${
                                isSelected
                                  ? "bg-forest-800 text-lime-300"
                                  : "bg-sage-100 text-sage-600"
                              }`}
                            >
                              {lang.country}
                            </span>
                          </div>
                          <p
                            className={`text-[10px] ${
                              isSelected ? "text-lime-300" : "text-sage-500"
                            }`}
                          >
                            {lang.nativeName}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-lime-400 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);
}

