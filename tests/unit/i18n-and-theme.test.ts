import { describe, it, expect } from "vitest";
import {
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  type SupportedLanguage,
  type TranslationDictionary,
} from "@/lib/i18n/translations";

describe("Multilingual System (i18n)", () => {
  it("should support 12 distinct languages (FR, EN + 2 local languages per country)", () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(12);

    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain("fr");
    expect(codes).toContain("en");

    // Bénin 🇧🇯
    expect(codes).toContain("fon"); // Fongbé
    expect(codes).toContain("yo");  // Yorùbá

    // Côte d'Ivoire 🇨🇮
    expect(codes).toContain("diu"); // Dioula
    expect(codes).toContain("ba");  // Baoulé

    // Sénégal 🇸🇳
    expect(codes).toContain("wo");  // Wolof
    expect(codes).toContain("ff");  // Pulaar

    // Togo 🇹🇬
    expect(codes).toContain("ee");  // Éwé
    expect(codes).toContain("kbp"); // Kabyè

    // Burkina Faso 🇧🇫
    expect(codes).toContain("mos"); // Mooré

    // Cameroun 🇨🇲
    expect(codes).toContain("dua"); // Douala
  });

  it("should have complete translations dictionary for every supported language", () => {
    const requiredKeys: (keyof TranslationDictionary)[] = [
      "nav_dashboard",
      "nav_invoices",
      "nav_customers",
      "nav_payments",
      "nav_reports",
      "nav_settings",
      "nav_support",
      "nav_new_invoice",
      "action_search",
      "action_export_csv",
      "action_save",
      "action_pay",
      "action_share_whatsapp",
      "status_paid",
      "status_sent",
      "status_overdue",
      "status_draft",
      "dash_overview",
      "dash_welcome",
      "theme_light",
      "theme_dark",
      "theme_toggle",
      "lang_select",
    ];

    for (const lang of SUPPORTED_LANGUAGES) {
      const dict = TRANSLATIONS[lang.code as SupportedLanguage];
      expect(dict, `Dictionary should exist for language ${lang.code}`).toBeDefined();

      for (const key of requiredKeys) {
        expect(dict[key], `Key "${key}" should be defined and non-empty for ${lang.code}`).toBeTruthy();
        expect(typeof dict[key]).toBe("string");
      }
    }
  });

  it("should provide appropriate native names and flags for display", () => {
    const fon = SUPPORTED_LANGUAGES.find((l) => l.code === "fon");
    expect(fon?.nativeName).toBe("Fɔngbè");
    expect(fon?.flag).toBe("🇧🇯");

    const wo = SUPPORTED_LANGUAGES.find((l) => l.code === "wo");
    expect(wo?.nativeName).toBe("Wolof");
    expect(wo?.flag).toBe("🇸🇳");

    const diu = SUPPORTED_LANGUAGES.find((l) => l.code === "diu");
    expect(diu?.nativeName).toBe("Julakan");
    expect(diu?.flag).toBe("🇨🇮");

    const ee = SUPPORTED_LANGUAGES.find((l) => l.code === "ee");
    expect(ee?.nativeName).toBe("Eʋegbe");
    expect(ee?.flag).toBe("🇹🇬");
  });
});

