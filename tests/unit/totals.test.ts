import { describe, expect, it } from "vitest";
import { amountDue, computeInvoiceTotals, computeLineTotal, computeVatAmount } from "../../lib/invoice/totals";

describe("computeLineTotal", () => {
  it("multiplie quantité entière et prix", () => {
    expect(computeLineTotal(3, 25_000)).toBe(75_000);
  });
  it("arrondit au franc le plus proche pour une quantité décimale", () => {
    expect(computeLineTotal(1.5, 333)).toBe(500); // 499,5 → 500
    expect(computeLineTotal(0.333, 1000)).toBe(333);
    expect(computeLineTotal(2.375, 1250)).toBe(2969); // 2968,75 → 2969
  });
  it("ne subit pas les erreurs de virgule flottante", () => {
    expect(computeLineTotal(1.005, 1000)).toBe(1005); // 1.005 * 1000 = 1004.999… en flottant
    expect(computeLineTotal(0.1, 3)).toBe(0); // 0,3 → 0
    expect(computeLineTotal(0.5, 1)).toBe(1); // 0,5 → 1 (arrondi supérieur)
  });
  it("accepte un prix nul (ligne offerte)", () => {
    expect(computeLineTotal(2, 0)).toBe(0);
  });
  it("refuse les entrées invalides", () => {
    expect(() => computeLineTotal(0, 1000)).toThrow();
    expect(() => computeLineTotal(-1, 1000)).toThrow();
    expect(() => computeLineTotal(1, -5)).toThrow();
    expect(() => computeLineTotal(1, 99.5)).toThrow();
    expect(() => computeLineTotal(1.2345, 1000)).toThrow();
    expect(() => computeLineTotal(Number.NaN, 1000)).toThrow();
  });
});

describe("computeVatAmount", () => {
  it("applique 18 %", () => {
    expect(computeVatAmount(100_000, 18)).toBe(18_000);
  });
  it("arrondit au franc le plus proche", () => {
    expect(computeVatAmount(12_345, 18)).toBe(2222); // 2222,1
    expect(computeVatAmount(25, 18)).toBe(5); // 4,5 → 5
    expect(computeVatAmount(1, 18)).toBe(0); // 0,18
  });
  it("gère un taux décimal (19,25 % au Cameroun)", () => {
    expect(computeVatAmount(100_000, 19.25)).toBe(19_250);
  });
  it("gère un taux nul", () => {
    expect(computeVatAmount(100_000, 0)).toBe(0);
  });
  it("refuse un taux hors limites", () => {
    expect(() => computeVatAmount(1000, -1)).toThrow();
    expect(() => computeVatAmount(1000, 101)).toThrow();
  });
});

describe("computeInvoiceTotals", () => {
  it("calcule sous-total, TVA et total", () => {
    const totals = computeInvoiceTotals(
      [
        { quantity: 2, unitPrice: 150_000 },
        { quantity: 1, unitPrice: 45_000 },
        { quantity: 10, unitPrice: 2500 },
      ],
      18,
    );
    expect(totals.lineTotals).toEqual([300_000, 45_000, 25_000]);
    expect(totals.subtotal).toBe(370_000);
    expect(totals.vatAmount).toBe(66_600);
    expect(totals.total).toBe(436_600);
  });
  it("calcule la TVA sur le sous-total, pas ligne par ligne", () => {
    // Ligne par ligne : 3 × arrondi(0,54) = 3 ; sur le sous-total : arrondi(1,62) = 2.
    const totals = computeInvoiceTotals(
      [
        { quantity: 1, unitPrice: 3 },
        { quantity: 1, unitPrice: 3 },
        { quantity: 1, unitPrice: 3 },
      ],
      18,
    );
    expect(totals.vatAmount).toBe(2);
    expect(totals.total).toBe(11);
  });
  it("renvoie zéro pour une facture sans ligne", () => {
    expect(computeInvoiceTotals([], 18)).toEqual({ lineTotals: [], subtotal: 0, vatAmount: 0, total: 0 });
  });
  it("reste exact sur de très grands montants", () => {
    const totals = computeInvoiceTotals([{ quantity: 999.999, unitPrice: 9_999_999_999 }], 18);
    expect(totals.subtotal).toBe(9_999_989_999_000);
    expect(totals.vatAmount).toBe(1_799_998_199_820);
    expect(totals.total).toBe(11_799_988_198_820);
  });
});

describe("amountDue", () => {
  it("renvoie le reste à payer, jamais négatif", () => {
    expect(amountDue(100_000, 40_000)).toBe(60_000);
    expect(amountDue(100_000, 100_000)).toBe(0);
    expect(amountDue(100_000, 120_000)).toBe(0);
  });
});
