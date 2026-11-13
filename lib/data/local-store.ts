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
import { isSupabaseConfigured } from "../supabase/client";

export const EMPTY_ORGANIZATION: typeof MOCK_ORGANIZATION = {
  id: "",
  name: "Mon Entreprise",
  city: "Cotonou",
  country: "Bénin",
  currency: "XOF" as const,
  ifu: "",
  rccm: "",
  address: "",
  phone: "",
  email: "",
  bankName: "",
  bankIban: "",
  mobileMoneyWave: "",
  mobileMoneyMtn: "",
  vatRate: 18,
  invoicePrefix: "FAC",
  paymentTermsDays: 30,
  footerNote: "Facture établie selon les normes du SYSCOHADA révisé.",
};

export const EMPTY_USER: typeof MOCK_USER = {
  id: "",
  name: "Utilisateur",
  email: "",
  role: "Directeur Général",
  avatarUrl: null,
  initials: "U",
};

function getStorageKeys(userId?: string) {
  const prefix = userId ? `danhomey_${userId}_` : "danhomey_shared_";
  return {
    INVOICES: `${prefix}invoices_v2`,
    CUSTOMERS: `${prefix}customers_v2`,
    ORGANIZATION: `${prefix}org_v2`,
    USER: `${prefix}user_v2`,
    COUNTER: `${prefix}counter_v2`,
  };
}

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (typeof (globalThis as any).localStorage !== "undefined" && (globalThis as any).localStorage?.getItem) {
    return (globalThis as any).localStorage;
  }
  return null;
}

export function getInitialInvoices(userId?: string): MockInvoice[] {
  const storage = getStorage();
  if (!storage) return !isSupabaseConfigured() && !userId ? MOCK_INVOICES : [];
  if (isSupabaseConfigured() && !userId) return [];
  try {
    const raw = storage.getItem(getStorageKeys(userId).INVOICES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load invoices from localStorage", e);
  }
  return !isSupabaseConfigured() && !userId ? MOCK_INVOICES : [];
}

export function saveInvoices(invoices: MockInvoice[], userId?: string): void {
  const storage = getStorage();
  if (!storage || !userId) return;
  try {
    storage.setItem(getStorageKeys(userId).INVOICES, JSON.stringify(invoices));
  } catch (e) {
    console.error("Failed to save invoices to localStorage", e);
  }
}

export function getInitialCustomers(userId?: string): MockCustomer[] {
  const storage = getStorage();
  if (!storage) return !isSupabaseConfigured() && !userId ? MOCK_CUSTOMERS : [];
  if (isSupabaseConfigured() && !userId) return [];
  try {
    const raw = storage.getItem(getStorageKeys(userId).CUSTOMERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load customers from localStorage", e);
  }
  return !isSupabaseConfigured() && !userId ? MOCK_CUSTOMERS : [];
}

export function saveCustomers(customers: MockCustomer[], userId?: string): void {
  const storage = getStorage();
  if (!storage || !userId) return;
  try {
    storage.setItem(getStorageKeys(userId).CUSTOMERS, JSON.stringify(customers));
  } catch (e) {
    console.error("Failed to save customers to localStorage", e);
  }
}

export function getInitialOrganization(userId?: string): typeof MOCK_ORGANIZATION {
  const storage = getStorage();
  if (!storage) return !isSupabaseConfigured() && !userId ? MOCK_ORGANIZATION : EMPTY_ORGANIZATION;
  if (isSupabaseConfigured() && !userId) return EMPTY_ORGANIZATION;
  try {
    const raw = storage.getItem(getStorageKeys(userId).ORGANIZATION);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load organization from localStorage", e);
  }
  return !isSupabaseConfigured() && !userId ? MOCK_ORGANIZATION : EMPTY_ORGANIZATION;
}

export function saveOrganization(org: typeof MOCK_ORGANIZATION, userId?: string): void {
  const storage = getStorage();
  if (!storage || !userId) return;
  try {
    storage.setItem(getStorageKeys(userId).ORGANIZATION, JSON.stringify(org));
  } catch (e) {
    console.error("Failed to save organization to localStorage", e);
  }
}

export function getInitialUser(userId?: string): typeof MOCK_USER {
  const storage = getStorage();
  if (!storage) return !isSupabaseConfigured() && !userId ? MOCK_USER : EMPTY_USER;
  if (isSupabaseConfigured() && !userId) return EMPTY_USER;
  try {
    const raw = storage.getItem(getStorageKeys(userId).USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load user from localStorage", e);
  }
  return !isSupabaseConfigured() && !userId ? MOCK_USER : EMPTY_USER;
}

export function saveUser(user: typeof MOCK_USER, userId?: string): void {
  const storage = getStorage();
  if (!storage || !userId) return;
  try {
    storage.setItem(getStorageKeys(userId).USER, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save user to localStorage", e);
  }
}

export function getNextInvoiceSequence(userId?: string): number {
  const storage = getStorage();
  if (!storage) return 49;
  try {
    const key = getStorageKeys(userId).COUNTER;
    const raw = storage.getItem(key);
    const count = raw ? parseInt(raw, 10) : 49;
    storage.setItem(key, String(count + 1));
    return count;
  } catch {
    return 49;
  }
}

export function generateInvoiceNumber(rawPrefix = "FAC", year = new Date().getFullYear(), userId?: string): string {
  const seq = getNextInvoiceSequence(userId);
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

export function resetStorage(userId?: string): void {
  const storage = getStorage();
  if (!storage) return;
  const keys = getStorageKeys(userId);
  storage.removeItem(keys.INVOICES);
  storage.removeItem(keys.CUSTOMERS);
  storage.removeItem(keys.ORGANIZATION);
  storage.removeItem(keys.USER);
  storage.removeItem(keys.COUNTER);
}
