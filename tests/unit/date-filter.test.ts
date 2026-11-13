import { describe, it, expect } from "vitest";
import {
  createDatePeriodFilter,
  createDateRangeFilter,
  isInvoiceMatchingDateFilter,
  getTodayISODate,
} from "@/lib/date-filter";
import { computeLiveMetrics } from "@/lib/data/local-store";
import type { MockInvoice } from "@/lib/mock-data";

function makeMockInvoice(overrides: Partial<MockInvoice> & Pick<MockInvoice, "id" | "number" | "issueDate" | "dueDate" | "total" | "amountPaid" | "displayStatus">): MockInvoice {
  return {
    id: overrides.id,
    number: overrides.number,
    customerId: overrides.customerId ?? "cust-1",
    customerName: overrides.customerName ?? "Client Test",
    customerContact: "Contact Person",
    customerEmail: "contact@client.bj",
    customerPhone: "+229 97 00 00 00",
    customerAddress: "Quartier Haie Vive",
    customerCity: overrides.customerCity ?? "Cotonou",
    customerCountry: overrides.customerCountry ?? "Bénin",
    customerTaxId: "IFU-12345678",
    issueDate: overrides.issueDate,
    dueDate: overrides.dueDate,
    createdAt: overrides.createdAt ?? overrides.issueDate,
    subtotal: overrides.subtotal ?? overrides.total * 0.847,
    vatRate: 18,
    vatAmount: overrides.vatAmount ?? overrides.total * 0.153,
    total: overrides.total,
    amountPaid: overrides.amountPaid,
    displayStatus: overrides.displayStatus,
    paymentMethod: "mobile_money",
    itemsCount: overrides.items?.length ?? 0,
    items: overrides.items ?? [],
    payments: [],
    notes: overrides.notes ?? "",
  };
}

describe("Système de filtrage des factures par date", () => {
  const sampleInvoices: MockInvoice[] = [
    makeMockInvoice({
      id: "inv-1",
      number: "FAC-2026-0001",
      customerId: "cust-1",
      customerName: "Wartilo SA",
      customerCity: "Cotonou",
      customerCountry: "Bénin",
      issueDate: "2026-11-08", // Émise le 8 novembre 2026
      dueDate: "2026-12-08",
      createdAt: "2026-11-08",
      subtotal: 1_000_000,
      vatAmount: 180_000,
      total: 1_180_000,
      amountPaid: 1_180_000,
      displayStatus: "paid",
    }),
    makeMockInvoice({
      id: "inv-2",
      number: "FAC-2026-0002",
      customerId: "cust-2",
      customerName: "WOBAHO Sarl",
      customerCity: "Cotonou",
      customerCountry: "Niger",
      issueDate: "2026-11-13", // Émise le 13 novembre 2026
      dueDate: "2026-12-13",   // Échéance le 13 décembre 2026
      createdAt: "2026-11-13",
      subtotal: 2_150_000,
      vatAmount: 387_000,
      total: 2_537_000,
      amountPaid: 0,
      displayStatus: "sent",
    }),
    makeMockInvoice({
      id: "inv-3",
      number: "FAC-2026-0003",
      customerId: "cust-3",
      customerName: "Alpha Tech",
      customerCity: "Lomé",
      customerCountry: "Togo",
      issueDate: "2026-10-15", // Émise le 15 octobre 2026
      dueDate: "2026-11-15",
      createdAt: "2026-10-15",
      subtotal: 500_000,
      vatAmount: 90_000,
      total: 590_000,
      amountPaid: 0,
      displayStatus: "overdue",
    }),
  ];

  it("1. Sélection d'une date précise : seules les factures créées à cette date apparaissent", () => {
    // L'utilisateur choisit le 8 novembre 2026
    const filterNov8 = createDatePeriodFilter("custom_date", "2026-11-08", "fr");
    expect(filterNov8.specificDate).toBe("2026-11-08");

    const matched = sampleInvoices.filter((inv) => isInvoiceMatchingDateFilter(inv, filterNov8));

    // Seule inv-1 (8 nov) doit correspondre
    expect(matched.length).toBe(1);
    expect(matched[0]?.id).toBe("inv-1");
    expect(matched[0]?.number).toBe("FAC-2026-0001");

    // La facture du 13 novembre (inv-2) NE DOIT PAS apparaître
    const hasInv2 = matched.some((inv) => inv.id === "inv-2");
    expect(hasInv2).toBe(false);
  });

  it("2. Sélection du 13 novembre 2026 : seule inv-2 est affichée", () => {
    const filterNov13 = createDatePeriodFilter("custom_date", "2026-11-13", "fr");
    const matched = sampleInvoices.filter((inv) => isInvoiceMatchingDateFilter(inv, filterNov13));

    expect(matched.length).toBe(1);
    expect(matched[0]?.id).toBe("inv-2");
    expect(matched[0]?.issueDate).toBe("2026-11-13");
  });

  it("3. Distingue rigoureusement la date d'émission de la date d'échéance", () => {
    // inv-2 a issueDate = "2026-11-13" et dueDate = "2026-12-13"
    // Un filtre sur le 13 décembre 2026 ne doit PAS matcher inv-2 car elle a été créée le 13 novembre !
    const filterDec13 = createDatePeriodFilter("custom_date", "2026-12-13", "fr");
    const matched = sampleInvoices.filter((inv) => isInvoiceMatchingDateFilter(inv, filterDec13));

    expect(matched.length).toBe(0);
  });

  it("4. Filtre réinitialisé ('all') : toutes les factures réapparaissent", () => {
    const filterAll = createDatePeriodFilter("all", undefined, "fr");
    const matched = sampleInvoices.filter((inv) => isInvoiceMatchingDateFilter(inv, filterAll));

    expect(matched.length).toBe(3);
  });

  it("5. Les indicateurs et statistiques sont recalculés exclusivement sur les factures filtrées", () => {
    // Toutes les factures
    const globalMetrics = computeLiveMetrics(sampleInvoices);
    expect(globalMetrics.totalInvoiced.amount).toBe(1_180_000 + 2_537_000 + 590_000); // 4 307 000 FCFA
    expect(globalMetrics.totalCollected.amount).toBe(1_180_000);
    expect(globalMetrics.pendingAmount.total).toBe(2_537_000 + 590_000);
    expect(globalMetrics.invoicesCount.total).toBe(3);

    // Filtre sur le 8 novembre 2026
    const filterNov8 = createDatePeriodFilter("custom_date", "2026-11-08", "fr");
    const filteredNov8 = sampleInvoices.filter((inv) => isInvoiceMatchingDateFilter(inv, filterNov8));
    const metricsNov8 = computeLiveMetrics(filteredNov8);

    // Montant facturé doit être exactement 1 180 000 FCFA
    expect(metricsNov8.totalInvoiced.amount).toBe(1_180_000);
    expect(metricsNov8.totalCollected.amount).toBe(1_180_000);
    expect(metricsNov8.totalCollected.collectionRate).toBe(100);
    expect(metricsNov8.pendingAmount.total).toBe(0);
    expect(metricsNov8.invoicesCount.total).toBe(1);

    // Filtre sur le 13 novembre 2026
    const filterNov13 = createDatePeriodFilter("custom_date", "2026-11-13", "fr");
    const filteredNov13 = sampleInvoices.filter((inv) => isInvoiceMatchingDateFilter(inv, filterNov13));
    const metricsNov13 = computeLiveMetrics(filteredNov13);

    expect(metricsNov13.totalInvoiced.amount).toBe(2_537_000);
    expect(metricsNov13.totalCollected.amount).toBe(0);
    expect(metricsNov13.pendingAmount.total).toBe(2_537_000);
    expect(metricsNov13.invoicesCount.total).toBe(1);
    expect(metricsNov13.invoicesCount.sent).toBe(1);
  });

  it("6. getTodayISODate retourne une date locale valide au format YYYY-MM-DD", () => {
    const today = getTodayISODate();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const now = new Date();
    expect(today.startsWith(String(now.getFullYear()))).toBe(true);
  });

  it("7. Sélection d'une plage de dates personnalisée (ex: du 8 au 13 novembre 2026)", () => {
    const rangeFilter = createDateRangeFilter("2026-11-08", "2026-11-13", "fr");
    expect(rangeFilter.preset).toBe("custom_range");
    expect(rangeFilter.startDate).toBe("2026-11-08");
    expect(rangeFilter.endDate).toBe("2026-11-13");
    expect(rangeFilter.specificDate).toBe(null);
    expect(rangeFilter.label).toContain("8");
    expect(rangeFilter.label).toContain("13");

    const matched = sampleInvoices.filter((inv) => isInvoiceMatchingDateFilter(inv, rangeFilter));
    // inv-1 (8 nov) et inv-2 (13 nov) doivent être incluses
    expect(matched.length).toBe(2);
    expect(matched.some((i) => i.id === "inv-1")).toBe(true);
    expect(matched.some((i) => i.id === "inv-2")).toBe(true);
    // inv-3 (15 oct) est en dehors de la plage
    expect(matched.some((i) => i.id === "inv-3")).toBe(false);
  });

  it("8. Inversion automatique des dates si l'utilisateur clique la date de fin avant la date de début", () => {
    const invertedRange = createDateRangeFilter("2026-11-13", "2026-11-08", "fr");
    expect(invertedRange.startDate).toBe("2026-11-08");
    expect(invertedRange.endDate).toBe("2026-11-13");

    const matched = sampleInvoices.filter((inv) => isInvoiceMatchingDateFilter(inv, invertedRange));
    expect(matched.length).toBe(2);
  });
});
