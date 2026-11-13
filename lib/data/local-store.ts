import {
  MOCK_INVOICES,
  MOCK_CUSTOMERS,
  MOCK_ORGANIZATION,
  MOCK_USER,
  type MockInvoice,
  type MockCustomer,
  type MockPaymentRecord,
  type DashboardMetrics,
  type MonthlyCashflow,
} from "../mock-data";
import { computeInvoiceTotals } from "../invoice/totals";
import { formatNumber } from "../format/money";
import type { DisplayStatus, PaymentMethod } from "../domain/types";

const STORAGE_KEYS = {
  INVOICES: "danhomey_invoices_v1",
  CUSTOMERS: "danhomey_customers_v1",
  ORGANIZATION: "danhomey_org_v1",
  USER: "danhomey_user_v1",
  COUNTER: "danhomey_invoice_counter_v1",
};

// Helper to check if running in browser
const isClient = typeof window !== "undefined";

export function getInitialInvoices(): MockInvoice[] {
  if (!isClient) return MOCK_INVOICES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load invoices from localStorage", e);
  }
  return MOCK_INVOICES;
}

export function saveInvoices(invoices: MockInvoice[]): void {
  if (!isClient) return;
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  } catch (e) {
    console.error("Failed to save invoices to localStorage", e);
  }
}

export function getInitialCustomers(): MockCustomer[] {
  if (!isClient) return MOCK_CUSTOMERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load customers from localStorage", e);
  }
  return MOCK_CUSTOMERS;
}

export function saveCustomers(customers: MockCustomer[]): void {
  if (!isClient) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (e) {
    console.error("Failed to save customers to localStorage", e);
  }
}

export function getInitialOrganization(): typeof MOCK_ORGANIZATION {
  if (!isClient) return MOCK_ORGANIZATION;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load organization from localStorage", e);
  }
  return MOCK_ORGANIZATION;
}

export function saveOrganization(org: typeof MOCK_ORGANIZATION): void {
  if (!isClient) return;
  try {
    localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(org));
  } catch (e) {
    console.error("Failed to save organization to localStorage", e);
  }
}

export function getInitialUser(): typeof MOCK_USER {
  if (!isClient) return MOCK_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load user from localStorage", e);
  }
  return MOCK_USER;
}

export function saveUser(user: typeof MOCK_USER): void {
  if (!isClient) return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save user to localStorage", e);
  }
}

export function getNextInvoiceSequence(): number {
  if (!isClient) return 49;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUNTER);
    const count = raw ? parseInt(raw, 10) : 49;
    localStorage.setItem(STORAGE_KEYS.COUNTER, String(count + 1));
    return count;
  } catch {
    return 49;
  }
}

export function generateInvoiceNumber(rawPrefix = "FAC", year = new Date().getFullYear()): string {
  const seq = getNextInvoiceSequence();
  const padded = String(seq).padStart(4, "0");

  const cleanPrefix = (rawPrefix || "FAC").trim().replace(/[-_ ]+$/, "");
  if (new RegExp(`[-_ ]*${year}$`).test(cleanPrefix)) {
    return `${cleanPrefix}-${padded}`;
  }
  return `${cleanPrefix}-${year}-${padded}`;
}

export function computeLiveMetrics(invoices: MockInvoice[]): DashboardMetrics {
  // Exclude cancelled and draft for invoiced volume
  const validInvoices = invoices.filter((i) => i.displayStatus !== "cancelled");
  const emittedInvoices = validInvoices.filter((i) => i.displayStatus !== "draft");

  const totalInvoiced = emittedInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalCollected = emittedInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const pendingAmount = Math.max(0, totalInvoiced - totalCollected);

  const overdueInvoices = emittedInvoices.filter((i) => i.displayStatus === "overdue");
  const overduePart = overdueInvoices.reduce(
    (sum, inv) => sum + Math.max(0, inv.total - inv.amountPaid),
    0
  );

  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  // Real month-over-month growth calculation
  const nowKey = new Date().toISOString().slice(0, 7);
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevKey = prevDate.toISOString().slice(0, 7);

  const currentMonthInvoiced = emittedInvoices
    .filter((i) => (i.issueDate || "").startsWith(nowKey))
    .reduce((sum, inv) => sum + inv.total, 0);

  const prevMonthInvoiced = emittedInvoices
    .filter((i) => (i.issueDate || "").startsWith(prevKey))
    .reduce((sum, inv) => sum + inv.total, 0);

  let changePercentage = 0;
  if (prevMonthInvoiced > 0) {
    changePercentage = Math.round(((currentMonthInvoiced - prevMonthInvoiced) / prevMonthInvoiced) * 100);
  } else if (currentMonthInvoiced > 0) {
    changePercentage = 100;
  }

  return {
    totalInvoiced: {
      amount: totalInvoiced,
      changePercentage,
      periodLabel: "vs mois dernier",
    },
    totalCollected: {
      amount: totalCollected,
      collectionRate,
      periodLabel: `Taux d'encaissement de ${collectionRate} %`,
    },
    pendingAmount: {
      total: pendingAmount,
      overduePart,
      pendingCount: emittedInvoices.filter((i) => i.displayStatus === "sent").length,
      overdueCount: overdueInvoices.length,
    },
    invoicesCount: {
      total: emittedInvoices.length,
      paid: emittedInvoices.filter((i) => i.displayStatus === "paid").length,
      sent: emittedInvoices.filter((i) => i.displayStatus === "sent").length,
      overdue: overdueInvoices.length,
      draft: validInvoices.filter((i) => i.displayStatus === "draft").length,
    },
  };
}

export function computeLiveCashflow(invoices: MockInvoice[]): MonthlyCashflow[] {
  const now = new Date();
  const months: { month: string; shortMonth: string; key: string; invoiced: number; collected: number }[] = [];

  const monthNames = [
    { full: "Janvier", short: "Jan" },
    { full: "Février", short: "Fév" },
    { full: "Mars", short: "Mar" },
    { full: "Avril", short: "Avr" },
    { full: "Mai", short: "Mai" },
    { full: "Juin", short: "Juin" },
    { full: "Juillet", short: "Juil" },
    { full: "Août", short: "Août" },
    { full: "Septembre", short: "Sept" },
    { full: "Octobre", short: "Oct" },
    { full: "Novembre", short: "Nov" },
    { full: "Décembre", short: "Déc" },
  ];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, "0")}`;
    const meta = monthNames[m] || { full: "Mois", short: "Mois" };
    months.push({
      month: `${meta.full} ${y}`,
      shortMonth: meta.short,
      key,
      invoiced: 0,
      collected: 0,
    });
  }

  // Aggregate exclusively from real user invoices & payments
  invoices.forEach((inv) => {
    if (inv.displayStatus === "cancelled" || inv.displayStatus === "draft") return;

    // Invoiced volume by invoice issueDate
    const invKey = (inv.issueDate || "").slice(0, 7);
    const targetMonth = months.find((m) => m.key === invKey);
    if (targetMonth) {
      targetMonth.invoiced += inv.total;
    }

    // Collections from payments
    if (inv.payments && inv.payments.length > 0) {
      inv.payments.forEach((p) => {
        const pKey = (p.date || inv.issueDate || "").slice(0, 7);
        const pMonth = months.find((m) => m.key === pKey);
        if (pMonth) {
          pMonth.collected += p.amount;
        }
      });
    } else if (inv.amountPaid > 0) {
      if (targetMonth) {
        targetMonth.collected += inv.amountPaid;
      }
    }
  });

  return months.map(({ month, shortMonth, invoiced, collected }) => ({
    month,
    shortMonth,
    invoiced,
    collected,
  }));
}

export function resetStorage(): void {
  if (!isClient) return;
  localStorage.removeItem(STORAGE_KEYS.INVOICES);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.ORGANIZATION);
  localStorage.removeItem(STORAGE_KEYS.COUNTER);
}
