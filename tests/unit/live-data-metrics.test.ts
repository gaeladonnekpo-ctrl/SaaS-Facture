import { describe, it, expect } from "vitest";
import { computeLiveMetrics, computeLiveCashflow } from "@/lib/data/local-store";
import type { MockInvoice } from "@/lib/mock-data";

describe("Live Data & Strict Zero-Mock Metrics Calculation", () => {
  it("computes strictly 0 across all metrics and cashflow for a new user with 0 invoices", () => {
    const emptyInvoices: MockInvoice[] = [];

    const metrics = computeLiveMetrics(emptyInvoices);
    expect(metrics.totalInvoiced.amount).toBe(0);
    expect(metrics.totalCollected.amount).toBe(0);
    expect(metrics.pendingAmount.total).toBe(0);
    expect(metrics.invoicesCount.total).toBe(0);
    expect(metrics.totalInvoiced.changePercentage).toBe(0);

    const cashflow = computeLiveCashflow(emptyInvoices);
    expect(cashflow).toHaveLength(6);
    cashflow.forEach((m) => {
      expect(m.invoiced).toBe(0);
      expect(m.collected).toBe(0);
    });
  });

  it("computes accurate metrics for a single user invoice without any mock baseline", () => {
    const singleInvoice: MockInvoice = {
      id: "inv_real_1",
      number: "FAC-2026-0001",
      customerId: "cust_1",
      customerName: "WOBAHO Sarl",
      customerContact: "Mansa Moussa Coulibaly",
      customerEmail: "contact@client.bj",
      customerPhone: "+226 76944362",
      customerAddress: "Zone Résidentielle",
      customerCity: "Cotonou",
      customerCountry: "Niger",
      issueDate: "2026-11-12",
      dueDate: "2026-12-12",
      subtotal: 2150000,
      vatRate: 18,
      vatAmount: 387000,
      total: 2537000,
      amountPaid: 0,
      displayStatus: "sent",
      itemsCount: 1,
      items: [
        {
          id: "item_1",
          position: 1,
          description: "Prestation informatique",
          quantity: 1,
          unitPrice: 2150000,
          lineTotal: 2150000,
        },
      ],
      payments: [],
    };

    const metrics = computeLiveMetrics([singleInvoice]);
    expect(metrics.totalInvoiced.amount).toBe(2537000);
    expect(metrics.totalCollected.amount).toBe(0);
    expect(metrics.pendingAmount.total).toBe(2537000);
    expect(metrics.invoicesCount.total).toBe(1);
    expect(metrics.invoicesCount.sent).toBe(1);
    expect(metrics.invoicesCount.paid).toBe(0);

    const cashflow = computeLiveCashflow([singleInvoice]);
    expect(cashflow).toHaveLength(6);
    // Find the month matching 2026-11
    const novEntry = cashflow.find((c) => c.shortMonth === "Nov");
    expect(novEntry).toBeDefined();
    expect(novEntry?.invoiced).toBe(2537000);
    expect(novEntry?.collected).toBe(0);

    // Other months should have exactly 0
    const otherMonths = cashflow.filter((c) => c.shortMonth !== "Nov");
    otherMonths.forEach((m) => {
      expect(m.invoiced).toBe(0);
      expect(m.collected).toBe(0);
    });
  });

  it("updates collections reactively when a payment is recorded", () => {
    const paidInvoice: MockInvoice = {
      id: "inv_real_1",
      number: "FAC-2026-0001",
      customerId: "cust_1",
      customerName: "WOBAHO Sarl",
      customerContact: "Mansa",
      customerEmail: "contact@client.bj",
      customerPhone: "+226 76944362",
      customerAddress: "Zone Résidentielle",
      customerCity: "Cotonou",
      customerCountry: "Bénin",
      issueDate: "2026-11-12",
      dueDate: "2026-12-12",
      subtotal: 2150000,
      vatRate: 18,
      vatAmount: 387000,
      total: 2537000,
      amountPaid: 2537000,
      displayStatus: "paid",
      itemsCount: 1,
      items: [],
      payments: [
        {
          id: "pay_1",
          date: "2026-11-13",
          amount: 2537000,
          method: "mobile_money",
          reference: "WAVE-TRX-849102",
          note: "Reçu intégralement par Wave",
          providerId: "wave",
          providerName: "Wave Mobile Money",
        },
      ],
    };

    const metrics = computeLiveMetrics([paidInvoice]);
    expect(metrics.totalInvoiced.amount).toBe(2537000);
    expect(metrics.totalCollected.amount).toBe(2537000);
    expect(metrics.pendingAmount.total).toBe(0);
    expect(metrics.totalCollected.collectionRate).toBe(100);
    expect(metrics.invoicesCount.paid).toBe(1);

    const cashflow = computeLiveCashflow([paidInvoice]);
    const novEntry = cashflow.find((c) => c.shortMonth === "Nov");
    expect(novEntry?.invoiced).toBe(2537000);
    expect(novEntry?.collected).toBe(2537000);
  });
});

