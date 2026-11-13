import { describe, it, expect } from "vitest";
import { PAYMENT_PROVIDERS, PAYMENT_CATEGORIES } from "@/lib/payment-methods/data";
import {
  serializePaymentTerms,
  deserializePaymentTerms,
} from "@/lib/payment-methods/serializer";
import type { PaymentTermsData } from "@/lib/payment-methods/types";

describe("Catalogue et gestion des moyens de paiement UEMOA / Afrique de l'Ouest", () => {
  it("contient toutes les 5 catégories requises", () => {
    const categoryIds = PAYMENT_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain("mobile_money");
    expect(categoryIds).toContain("bank_transfer");
    expect(categoryIds).toContain("money_transfer");
    expect(categoryIds).toContain("crypto");
    expect(categoryIds).toContain("cash_cheque");
  });

  it("intègre tous les opérateurs Mobile Money exigés", () => {
    const momo = PAYMENT_PROVIDERS.filter((p) => p.category === "mobile_money");
    const momoNames = momo.map((p) => p.name.toLowerCase());

    expect(momoNames.some((n) => n.includes("airtel"))).toBe(true);
    expect(momoNames.some((n) => n.includes("celtis"))).toBe(true);
    expect(momoNames.some((n) => n.includes("moov"))).toBe(true);
    expect(momoNames.some((n) => n.includes("mtn"))).toBe(true);
    expect(momoNames.some((n) => n.includes("orange"))).toBe(true);
    expect(momoNames.some((n) => n.includes("t-money"))).toBe(true);
    expect(momoNames.some((n) => n.includes("wave"))).toBe(true);
  });

  it("intègre les principales banques de l'espace UEMOA", () => {
    const banks = PAYMENT_PROVIDERS.filter((p) => p.category === "bank_transfer");
    const bankCodes = banks.map((p) => p.shortCode);

    expect(bankCodes).toContain("BOA");
    expect(bankCodes).toContain("ECOBANK");
    expect(bankCodes).toContain("CORIS");
    expect(bankCodes).toContain("UBA");
    expect(bankCodes).toContain("NSIA");
    expect(bankCodes).toContain("SG");
    expect(bankCodes).toContain("ATLANTIQUE");
    expect(bankCodes).toContain("BIIC");
    expect(bankCodes).toContain("ORABANK");
  });

  it("intègre les services de transfert d'argent (Amana, MyNita, Sendwave, Taptap...)", () => {
    const transfers = PAYMENT_PROVIDERS.filter((p) => p.category === "money_transfer");
    const names = transfers.map((p) => p.name.toLowerCase());

    expect(names.some((n) => n.includes("amana"))).toBe(true);
    expect(names.some((n) => n.includes("binance"))).toBe(true);
    expect(names.some((n) => n.includes("mynita"))).toBe(true);
    expect(names.some((n) => n.includes("sendwave"))).toBe(true);
    expect(names.some((n) => n.includes("taptap"))).toBe(true);
    expect(names.some((n) => n.includes("western union"))).toBe(true);
    expect(names.some((n) => n.includes("moneygram"))).toBe(true);
  });

  it("intègre les cryptomonnaies principales (Bitcoin, Ethereum, USDT, USDC, Solana)", () => {
    const cryptos = PAYMENT_PROVIDERS.filter((p) => p.category === "crypto");
    const codes = cryptos.map((p) => p.shortCode);

    expect(codes).toContain("BTC");
    expect(codes).toContain("ETH");
    expect(codes).toContain("USDT");
    expect(codes).toContain("USDC");
    expect(codes).toContain("SOL");
  });

  it("sérialise et désérialise fidèlement les données de paiement sélectionnées", () => {
    const sampleData: PaymentTermsData = {
      methods: [
        {
          providerId: "wave",
          details: { phone: "+229 96 11 22 33", recipient: "DANHOMEY Technologies" },
        },
        {
          providerId: "bank_of_africa",
          details: {
            iban: "BJ66 BJ06 1010 0100 1234 5678 9012",
            holder: "DANHOMEY SARL",
            swift: "AFRIBJBX",
          },
        },
      ],
      paymentTermsDays: 15,
      customNotes: "Prière d'indiquer la référence de facture lors du virement.",
    };

    const serialized = serializePaymentTerms(sampleData);

    // Vérification du texte généré pour la facture
    expect(serialized).toContain("Wave");
    expect(serialized).toContain("+229 96 11 22 33");
    expect(serialized).toContain("Bank of Africa (BOA)");
    expect(serialized).toContain("BJ66 BJ06 1010 0100 1234 5678 9012");
    expect(serialized).toContain("15 jours");
    expect(serialized).toContain("BCEAO");

    // Vérification de la désérialisation
    const deserialized = deserializePaymentTerms(serialized);
    expect(deserialized.methods.length).toBe(2);
    expect(deserialized.methods[0]!.providerId).toBe("wave");
    expect(deserialized.methods[0]!.details.phone).toBe("+229 96 11 22 33");
    expect(deserialized.methods[1]!.providerId).toBe("bank_of_africa");
    expect(deserialized.paymentTermsDays).toBe(15);
    expect(deserialized.customNotes).toContain("Prière d'indiquer la référence");
  });

  it("gère gracieusement les textes libres existants ou legacy", () => {
    const legacyText = "Règlement par Mobile Money (Wave / MTN). Règlement sous 30 jours.";
    const parsed = deserializePaymentTerms(legacyText);

    expect(parsed.methods.length).toBeGreaterThanOrEqual(2);
    const providerIds = parsed.methods.map((m) => m.providerId);
    expect(providerIds).toContain("wave");
    expect(providerIds).toContain("mtn_momo");
    expect(parsed.paymentTermsDays).toBe(30);
  });
});

