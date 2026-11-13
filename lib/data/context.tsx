"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  getInitialInvoices,
  saveInvoices,
  getInitialCustomers,
  saveCustomers,
  getInitialOrganization,
  saveOrganization,
  getInitialUser,
  saveUser,
  generateInvoiceNumber,
  computeLiveMetrics,
  computeLiveCashflow,
  resetStorage,
} from "./local-store";
import {
  type MockInvoice,
  type MockCustomer,
  type MockPaymentRecord,
  type DashboardMetrics,
  type MonthlyCashflow,
  MOCK_ORGANIZATION,
  MOCK_USER,
  MOCK_INVOICES,
  MOCK_CUSTOMERS,
} from "../mock-data";
import { computeInvoiceTotals } from "../invoice/totals";
import type { ToastMessage } from "@/components/ui/toast";
import type { PaymentMethod, DisplayStatus } from "../domain/types";
import {
  fetchCustomersFromSupabase,
  fetchInvoicesFromSupabase,
  fetchOrganizationFromSupabase,
  createCustomerInSupabase,
  updateCustomerInSupabase,
  deleteCustomerInSupabase,
  createInvoiceInSupabase,
  updateInvoiceInSupabase,
  updateInvoiceStatusInSupabase,
  emitInvoiceInSupabase,
  deleteInvoiceInSupabase,
  recordPaymentInSupabase,
  updateOrganizationInSupabase,
  updateProfileInSupabase,
} from "@/lib/supabase/services";
import { isSupabaseConfigured } from "../supabase/client";
import { useAuth } from "@/lib/auth/context";
import {
  type DatePeriodFilter,
  createDatePeriodFilter,
  isInvoiceMatchingDateFilter,
  getTodayISODate,
} from "@/lib/date-filter";

export interface CreateInvoiceInput {
  customerId: string;
  issueDate: string;
  dueDate: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  notes?: string;
  status: "draft" | "sent";
}

export interface UpdateInvoiceInput {
  customerId?: string;
  issueDate?: string;
  dueDate?: string;
  items?: { description: string; quantity: number; unitPrice: number }[];
  notes?: string;
  status?: DisplayStatus;
}

export interface CreateCustomerInput {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  rccm?: string;
}

interface DataContextType {
  isHydrated: boolean;
  invoices: MockInvoice[];
  filteredInvoices: MockInvoice[];
  dateFilter: DatePeriodFilter;
  setDateFilter: (filter: DatePeriodFilter) => void;
  resetDateFilter: () => void;
  customers: MockCustomer[];
  organization: typeof MOCK_ORGANIZATION;
  user: typeof MOCK_USER;
  metrics: DashboardMetrics;
  cashflow: MonthlyCashflow[];
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
  createInvoice: (input: CreateInvoiceInput) => MockInvoice;
  updateInvoice: (id: string, input: UpdateInvoiceInput) => MockInvoice;
  deleteInvoice: (id: string) => void;
  setInvoiceStatus: (id: string, status: DisplayStatus) => MockInvoice;
  emitInvoice: (id: string) => MockInvoice;
  recordPayment: (
    invoiceId: string,
    payment: {
      amount: number;
      method: PaymentMethod;
      reference: string;
      note?: string;
      providerId?: string;
      providerName?: string;
    }
  ) => MockInvoice;
  cancelInvoice: (id: string) => MockInvoice;
  duplicateInvoice: (id: string) => MockInvoice;
  createCustomer: (input: CreateCustomerInput) => MockCustomer;
  updateCustomer: (id: string, input: Partial<MockCustomer>) => void;
  deleteCustomer: (id: string) => void;
  updateOrganization: (input: Partial<typeof MOCK_ORGANIZATION>) => void;
  updateUser: (input: Partial<typeof MOCK_USER>) => void;
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, profile, isLoading: isAuthLoading } = useAuth();

  const [invoices, setInvoices] = useState<MockInvoice[]>([]);
  const [customers, setCustomers] = useState<MockCustomer[]>([]);
  const [organization, setOrganization] = useState<typeof MOCK_ORGANIZATION>(MOCK_ORGANIZATION);
  const [user, setUser] = useState<typeof MOCK_USER>(MOCK_USER);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load real data from Supabase whenever user auth state changes
  useEffect(() => {
    // If Supabase is not configured (e.g. running unit tests without credentials), use local store
    if (!isSupabaseConfigured()) {
      setInvoices(getInitialInvoices());
      setCustomers(getInitialCustomers());
      setOrganization(getInitialOrganization());
      setUser(getInitialUser());
      setIsHydrated(true);
      return;
    }

    if (isAuthLoading) return;

    if (!authUser) {
      // Unauthenticated: clear data
      setInvoices([]);
      setCustomers([]);
      setIsHydrated(true);
      return;
    }

    let isMounted = true;

    async function loadCloudData() {
      try {
        const [remoteCustomers, remoteInvoices, remoteOrg] = await Promise.all([
          fetchCustomersFromSupabase(),
          fetchInvoicesFromSupabase(),
          fetchOrganizationFromSupabase(),
        ]);

        if (isMounted) {
          setCustomers(remoteCustomers || []);
          setInvoices(remoteInvoices || []);
          if (remoteOrg) {
            setOrganization(remoteOrg);
          }
          if (profile) {
            const fullName = `${profile.firstName} ${profile.lastName}`.trim() || authUser?.email || "Utilisateur";
            const initials = `${(profile.firstName?.[0] || "").toUpperCase()}${(profile.lastName?.[0] || "").toUpperCase()}` || "U";
            setUser({
              id: profile.id || authUser?.id || "usr_active",
              name: fullName,
              email: authUser?.email || "",
              role: profile.role === "owner" ? "Directeur Général" : profile.role,
              avatarUrl: null,
              initials,
            });
          }
          setIsHydrated(true);
        }
      } catch (err) {
        console.error("Error loading data from Supabase:", err);
        if (isMounted) setIsHydrated(true);
      }
    }

    loadCloudData();

    return () => {
      isMounted = false;
    };
  }, [authUser, profile, isAuthLoading]);

  // Save changes to localStorage once hydrated
  useEffect(() => {
    if (isHydrated) {
      saveInvoices(invoices);
    }
  }, [invoices, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveCustomers(customers);
    }
  }, [customers, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveOrganization(organization);
    }
  }, [organization, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      saveUser(user);
    }
  }, [user, isHydrated]);

  // Toast helpers
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = String(Date.now()) + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => {
        dismissToast(id);
      }, 4000);
    },
    [dismissToast]
  );

  // Global Date/Period Filter state
  const [dateFilter, setDateFilterState] = useState<DatePeriodFilter>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("danhomey_date_filter_v1");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return createDatePeriodFilter("all");
  });

  const setDateFilter = useCallback((newFilter: DatePeriodFilter) => {
    setDateFilterState(newFilter);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("danhomey_date_filter_v1", JSON.stringify(newFilter));
      } catch {}
    }
  }, []);

  const resetDateFilter = useCallback(() => {
    const allFilter = createDatePeriodFilter("all");
    setDateFilterState(allFilter);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("danhomey_date_filter_v1");
      } catch {}
    }
  }, []);

  // Filtered invoices according to the active date filter
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => isInvoiceMatchingDateFilter(inv, dateFilter));
  }, [invoices, dateFilter]);

  // Dynamic calculated metrics & cashflow based on filtered invoices
  const metrics = useMemo(() => computeLiveMetrics(filteredInvoices), [filteredInvoices]);
  const cashflow = useMemo(() => computeLiveCashflow(filteredInvoices), [filteredInvoices]);

  // Actions
  const createInvoice = useCallback(
    (input: CreateInvoiceInput): MockInvoice => {
      const customer = customers.find((c) => c.id === input.customerId);
      const isSent = input.status === "sent";
      const number = isSent ? generateInvoiceNumber(organization.invoicePrefix) : `BROUILLON-${Date.now().toString().slice(-4)}`;

      // Compute exact totals
      const totals = computeInvoiceTotals(input.items, organization.vatRate);

      const itemsWithIds = input.items.map((item, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        position: idx + 1,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: totals.lineTotals[idx] ?? Math.round(item.quantity * item.unitPrice),
      }));

      const invoiceDate = input.issueDate || getTodayISODate();

      const newInvoice: MockInvoice = {
        id: `inv_${Date.now()}`,
        number,
        customerId: input.customerId,
        customerName: customer?.name ?? "Client Inconnu",
        customerContact: customer?.contactPerson ?? "",
        customerEmail: customer?.email ?? "",
        customerPhone: customer?.phone ?? "",
        customerAddress: customer?.address ?? "",
        customerCity: customer?.city ?? "Cotonou",
        customerCountry: customer?.country ?? "Bénin",
        customerTaxId: customer?.taxId ?? "",
        issueDate: invoiceDate,
        dueDate: input.dueDate,
        createdAt: invoiceDate,
        subtotal: totals.subtotal,
        vatRate: organization.vatRate,
        vatAmount: totals.vatAmount,
        total: totals.total,
        amountPaid: 0,
        displayStatus: input.status,
        itemsCount: itemsWithIds.length,
        items: itemsWithIds,
        payments: [],
        notes: input.notes,
      };

      setInvoices((prev) => [newInvoice, ...prev]);

      // Cloud Supabase persistence
      if (isSupabaseConfigured()) {
        const orgId = profile?.organizationId || organization.id;
        createInvoiceInSupabase(input, orgId, number, organization.vatRate)
          .then((remote) => {
            if (remote) {
              setInvoices((prev) => prev.map((inv) => (inv.id === newInvoice.id ? remote : inv)));
            }
          })
          .catch(console.warn);
      }

      // Update customer stats if emitted
      if (isSent && customer) {
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === customer.id) {
              return {
                ...c,
                totalInvoiced: c.totalInvoiced + totals.total,
                balanceDue: c.balanceDue + totals.total,
                invoicesCount: c.invoicesCount + 1,
              };
            }
            return c;
          })
        );
      }

      showToast({
        type: "success",
        title: isSent ? "Facture émise" : "Brouillon sauvegardé",
        message: isSent
          ? `La facture ${number} pour ${newInvoice.customerName} a été émise avec succès.`
          : `Le brouillon a été enregistré avec succès.`,
      });

      return newInvoice;
    },
    [customers, organization, profile?.organizationId, showToast]
  );

  const emitInvoice = useCallback(
    (id: string): MockInvoice => {
      let emitted: MockInvoice | null = null;
      const nextNumber = generateInvoiceNumber(organization.invoicePrefix);

      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === id) {
            emitted = {
              ...inv,
              number: nextNumber,
              displayStatus: "sent",
            };
            return emitted;
          }
          return inv;
        })
      );

      if (emitted) {
        const inv = emitted as MockInvoice;
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === inv.customerId) {
              return {
                ...c,
                totalInvoiced: c.totalInvoiced + inv.total,
                balanceDue: c.balanceDue + Math.max(0, inv.total - inv.amountPaid),
                invoicesCount: c.invoicesCount + 1,
              };
            }
            return c;
          })
        );

        if (isSupabaseConfigured()) {
          emitInvoiceInSupabase(id, nextNumber).catch(console.warn);
        }

        showToast({
          type: "success",
          title: "Facture émise",
          message: `Le brouillon a été émis sous le numéro officiel ${nextNumber}.`,
        });
        return emitted;
      }
      throw new Error(`Invoice ${id} not found.`);
    },
    [organization.invoicePrefix, showToast]
  );

  const recordPayment = useCallback(
    (
      invoiceId: string,
      payment: {
        amount: number;
        method: PaymentMethod;
        reference: string;
        note?: string;
        providerId?: string;
        providerName?: string;
      }
    ): MockInvoice => {
      let updated: MockInvoice | null = null;

      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === invoiceId) {
            const newPaymentRecord: MockPaymentRecord = {
              id: `pay_${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              amount: payment.amount,
              method: payment.method,
              reference: payment.reference,
              note: payment.note,
              providerId: payment.providerId,
              providerName: payment.providerName,
            };

            const newAmountPaid = inv.amountPaid + payment.amount;
            const newStatus = newAmountPaid >= inv.total ? "paid" : inv.displayStatus === "draft" ? "sent" : inv.displayStatus;

            updated = {
              ...inv,
              amountPaid: newAmountPaid,
              displayStatus: newStatus,
              payments: [...inv.payments, newPaymentRecord],
            };
            return updated;
          }
          return inv;
        })
      );

      if (updated) {
        const inv = updated as MockInvoice;
        // Reduce customer balance
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === inv.customerId) {
              return {
                ...c,
                totalPaid: c.totalPaid + payment.amount,
                balanceDue: Math.max(0, c.balanceDue - payment.amount),
              };
            }
            return c;
          })
        );

        // Cloud Supabase sync
        if (isSupabaseConfigured()) {
          const orgId = profile?.organizationId || organization.id;
          recordPaymentInSupabase(invoiceId, payment, orgId).catch(console.warn);
        }

        showToast({
          type: "success",
          title: "Paiement enregistré",
          message: `Règlement de ${payment.amount.toLocaleString("fr-FR")} FCFA enregistré avec succès.`,
        });
        return updated;
      }
      throw new Error(`Invoice ${invoiceId} not found.`);
    },
    [organization.id, profile?.organizationId, showToast]
  );

  const cancelInvoice = useCallback(
    (id: string): MockInvoice => {
      let cancelled: MockInvoice | null = null;

      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === id) {
            cancelled = { ...inv, displayStatus: "cancelled" };
            return cancelled;
          }
          return inv;
        })
      );

      if (cancelled) {
        const inv = cancelled as MockInvoice;
        const dueReversal = Math.max(0, inv.total - inv.amountPaid);
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === inv.customerId) {
              return {
                ...c,
                balanceDue: Math.max(0, c.balanceDue - dueReversal),
              };
            }
            return c;
          })
        );

        showToast({
          type: "info",
          title: "Facture annulée",
          message: `La facture ${inv.number} a été marquée comme annulée.`,
        });

        // Cloud Supabase sync
        if (isSupabaseConfigured()) {
          updateInvoiceStatusInSupabase(id, "cancelled").catch(console.warn);
        }

        return cancelled;
      }
      throw new Error(`Invoice ${id} not found.`);
    },
    [showToast]
  );

  const duplicateInvoice = useCallback(
    (id: string): MockInvoice => {
      const original = invoices.find((i) => i.id === id);
      if (!original) throw new Error(`Invoice ${id} not found.`);

      const copy: MockInvoice = {
        ...original,
        id: `inv_${Date.now()}`,
        number: `BROUILLON-${Date.now().toString().slice(-4)}`,
        displayStatus: "draft",
        amountPaid: 0,
        payments: [],
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      };

      setInvoices((prev) => [copy, ...prev]);

      // Cloud Supabase sync
      if (isSupabaseConfigured()) {
        const orgId = profile?.organizationId || organization.id;
        createInvoiceInSupabase(
          {
            customerId: copy.customerId,
            issueDate: copy.issueDate,
            dueDate: copy.dueDate,
            items: copy.items.map((it) => ({
              description: it.description,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
            })),
            notes: copy.notes,
            status: "draft",
          },
          orgId,
          copy.number,
          copy.vatRate
        )
          .then((remote) => {
            if (remote) {
              setInvoices((prev) => prev.map((inv) => (inv.id === copy.id ? remote : inv)));
            }
          })
          .catch(console.warn);
      }

      showToast({
        type: "info",
        title: "Facture dupliquée",
        message: `Une nouvelle facture brouillon a été créée à partir de ${original.number}.`,
      });

      return copy;
    },
    [invoices, organization.id, profile?.organizationId, showToast]
  );

  const updateInvoice = useCallback(
    (id: string, input: UpdateInvoiceInput): MockInvoice => {
      let updated: MockInvoice | null = null;
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id !== id) return inv;

          const customer = input.customerId
            ? customers.find((c) => c.id === input.customerId)
            : customers.find((c) => c.id === inv.customerId);

          const itemsToUse = input.items || inv.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          }));

          const totals = computeInvoiceTotals(itemsToUse, inv.vatRate);
          const itemsWithIds = itemsToUse.map((it, idx) => ({
            id: inv.items[idx]?.id || `item_${Date.now()}_${idx}`,
            position: idx + 1,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            lineTotal: totals.lineTotals[idx] ?? Math.round(it.quantity * it.unitPrice),
          }));

          updated = {
            ...inv,
            customerId: customer?.id ?? inv.customerId,
            customerName: customer?.name ?? inv.customerName,
            customerContact: customer?.contactPerson ?? inv.customerContact,
            customerEmail: customer?.email ?? inv.customerEmail,
            customerPhone: customer?.phone ?? inv.customerPhone,
            customerAddress: customer?.address ?? inv.customerAddress,
            customerCity: customer?.city ?? inv.customerCity,
            customerCountry: customer?.country ?? inv.customerCountry,
            customerTaxId: customer?.taxId ?? inv.customerTaxId,
            issueDate: input.issueDate ?? inv.issueDate,
            dueDate: input.dueDate ?? inv.dueDate,
            subtotal: totals.subtotal,
            vatAmount: totals.vatAmount,
            total: totals.total,
            displayStatus: input.status ?? inv.displayStatus,
            itemsCount: itemsWithIds.length,
            items: itemsWithIds,
            notes: input.notes !== undefined ? input.notes : inv.notes,
          };
          return updated;
        })
      );

      if (updated) {
        showToast({
          type: "success",
          title: "Facture modifiée",
          message: `La facture ${(updated as MockInvoice).number} a été mise à jour.`,
        });

        // Cloud Supabase sync
        if (isSupabaseConfigured()) {
          updateInvoiceInSupabase(id, input, (updated as MockInvoice).vatRate).catch(console.warn);
        }

        return updated;
      }
      throw new Error(`Invoice ${id} not found.`);
    },
    [customers, showToast]
  );

  const deleteInvoice = useCallback(
    (id: string) => {
      const target = invoices.find((i) => i.id === id);
      setInvoices((prev) => prev.filter((i) => i.id !== id));

      if (target) {
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === target.customerId) {
              return {
                ...c,
                totalInvoiced: Math.max(0, c.totalInvoiced - target.total),
                balanceDue: Math.max(0, c.balanceDue - Math.max(0, target.total - target.amountPaid)),
                invoicesCount: Math.max(0, c.invoicesCount - 1),
              };
            }
            return c;
          })
        );

        showToast({
          type: "info",
          title: "Facture supprimée",
          message: `La facture ${target.number} a été supprimée définitivement.`,
        });

        // Cloud Supabase sync
        if (isSupabaseConfigured()) {
          deleteInvoiceInSupabase(id).catch(console.warn);
        }
      }
    },
    [invoices, showToast]
  );

  const setInvoiceStatus = useCallback(
    (id: string, status: DisplayStatus): MockInvoice => {
      let updated: MockInvoice | null = null;
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id !== id) return inv;
          let newAmountPaid = inv.amountPaid;
          if (status === "paid" && newAmountPaid < inv.total) {
            newAmountPaid = inv.total;
          }
          updated = {
            ...inv,
            displayStatus: status,
            amountPaid: newAmountPaid,
          };
          return updated;
        })
      );

      if (updated) {
        showToast({
          type: "success",
          title: "Statut mis à jour",
          message: `La facture ${(updated as MockInvoice).number} est maintenant marquée comme "${status}".`,
        });

        // Cloud Supabase sync
        if (isSupabaseConfigured()) {
          updateInvoiceStatusInSupabase(id, status).catch(console.warn);
        }
        return updated;
      }
      throw new Error(`Invoice ${id} not found.`);
    },
    [showToast]
  );

  const deleteCustomer = useCallback(
    (id: string) => {
      const target = customers.find((c) => c.id === id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));

      // Cloud Supabase sync
      if (isSupabaseConfigured()) {
        deleteCustomerInSupabase(id).catch(console.warn);
      }

      showToast({
        type: "info",
        title: "Client supprimé",
        message: target ? `Le client ${target.name} a été supprimé.` : "Client supprimé.",
      });
    },
    [customers, showToast]
  );

  const createCustomer = useCallback(
    (input: CreateCustomerInput): MockCustomer => {
      const newCustomer: MockCustomer = {
        id: `cust_${Date.now()}`,
        ...input,
        totalInvoiced: 0,
        totalPaid: 0,
        balanceDue: 0,
        invoicesCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setCustomers((prev) => [newCustomer, ...prev]);

      // Cloud Supabase sync
      if (isSupabaseConfigured()) {
        const orgId = profile?.organizationId || organization.id;
        createCustomerInSupabase(input, orgId)
          .then((remote) => {
            if (remote) {
              setCustomers((prev) => prev.map((c) => (c.id === newCustomer.id ? remote : c)));
            }
          })
          .catch(console.warn);
      }

      showToast({
        type: "success",
        title: "Client ajouté",
        message: `${newCustomer.name} (${newCustomer.city}, ${newCustomer.country}) a été enregistré.`,
      });

      return newCustomer;
    },
    [organization.id, profile?.organizationId, showToast]
  );

  const updateCustomer = useCallback(
    (id: string, input: Partial<MockCustomer>) => {
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...input } : c))
      );

      // Cloud Supabase sync
      if (isSupabaseConfigured()) {
        updateCustomerInSupabase(id, input).catch(console.warn);
      }

      showToast({
        type: "success",
        message: "Informations client mises à jour.",
      });
    },
    [showToast]
  );

  const updateOrganization = useCallback(
    (input: Partial<typeof MOCK_ORGANIZATION>) => {
      setOrganization((prev) => ({ ...prev, ...input }));

      // Cloud Supabase sync
      if (isSupabaseConfigured()) {
        const orgId = profile?.organizationId || organization.id;
        updateOrganizationInSupabase(orgId, input).catch(console.warn);
      }

      showToast({
        type: "success",
        title: "Configuration enregistrée",
        message: "Les paramètres de l'organisation ont été mis à jour.",
      });
    },
    [organization.id, profile?.organizationId, showToast]
  );

  const updateUser = useCallback(
    (input: Partial<typeof MOCK_USER>) => {
      setUser((prev) => {
        const nextInitials = input.name
          ? input.name
              .trim()
              .split(/\s+/)
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : prev.initials;
        return {
          ...prev,
          ...input,
          initials: input.initials ?? nextInitials,
        };
      });
      // Cloud Supabase sync
      if (isSupabaseConfigured() && authUser?.id) {
        const parts = input.name ? input.name.trim().split(/\s+/) : [];
        const firstName = parts.length > 1 ? parts[0] : input.name;
        const lastName = parts.length > 1 ? parts.slice(1).join(" ") : undefined;
        updateProfileInSupabase(authUser.id, {
          firstName,
          lastName,
          role: input.role,
        }).catch(console.warn);
      }

      showToast({
        type: "success",
        title: "Profil mis à jour",
        message: "Vos informations de profil ont été enregistrées avec succès.",
      });
    },
    [authUser?.id, showToast]
  );

  const resetDemoData = useCallback(() => {
    resetStorage();
    setInvoices(MOCK_INVOICES);
    setCustomers(MOCK_CUSTOMERS);
    setOrganization(MOCK_ORGANIZATION);
    setUser(MOCK_USER);
    showToast({
      type: "info",
      title: "Données réinitialisées",
      message: "L'application a été remise à zéro avec les données d'exemple initiales.",
    });
  }, [showToast]);

  return (
    <DataContext.Provider
      value={{
        isHydrated,
        invoices,
        filteredInvoices,
        dateFilter,
        setDateFilter,
        resetDateFilter,
        customers,
        organization,
        user,
        metrics,
        cashflow,
        toasts,
        showToast,
        dismissToast,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        setInvoiceStatus,
        emitInvoice,
        recordPayment,
        cancelInvoice,
        duplicateInvoice,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        updateOrganization,
        updateUser,
        resetDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider.");
  }
  return context;
}

