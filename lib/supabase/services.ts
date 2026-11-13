import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";
import type {
  MockInvoice,
  MockCustomer,
  MockPaymentRecord,
  MOCK_ORGANIZATION,
} from "../mock-data";
import type { DisplayStatus, PaymentMethod } from "../domain/types";
import { computeInvoiceTotals } from "../invoice/totals";

export interface SupabaseCustomerRow {
  id: string;
  organization_id: string;
  name: string;
  contact_person: string | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  tax_id: string | null;
  rccm: string | null;
  total_invoiced: number;
  total_paid: number;
  balance_due: number;
  invoices_count: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseInvoiceRow {
  id: string;
  organization_id: string;
  customer_id: string;
  number: string;
  issue_date: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  amount_paid: number;
  notes: string | null;
  public_token: string | null;
  created_at: string;
  updated_at: string;
  customers?: SupabaseCustomerRow | null;
  invoice_items?: SupabaseItemRow[];
  payments?: SupabasePaymentRow[];
}

export interface SupabaseItemRow {
  id: string;
  invoice_id: string;
  position: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at?: string;
}

export interface SupabasePaymentRow {
  id: string;
  organization_id: string;
  invoice_id: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference: string;
  note: string | null;
  created_at?: string;
}

export interface SupabaseOrgRow {
  id: string;
  name: string;
  slug: string;
  currency: string;
  vat_rate: number;
  invoice_prefix: string;
  next_invoice_number: number;
  tax_id: string | null;
  rccm: string | null;
  address: string | null;
  city: string;
  country: string;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  bank_name: string | null;
  bank_rib: string | null;
  mobile_money_info: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Convertit un client Supabase (snake_case) vers le modèle de domaine (camelCase)
 */
export function mapDbCustomerToModel(row: SupabaseCustomerRow): MockCustomer {
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person || row.name,
    email: row.email,
    phone: row.phone,
    address: row.address || "",
    city: row.city || "Cotonou",
    country: row.country || "Bénin",
    taxId: row.tax_id || "",
    rccm: row.rccm || undefined,
    totalInvoiced: Number(row.total_invoiced) || 0,
    totalPaid: Number(row.total_paid) || 0,
    balanceDue: Number(row.balance_due) || 0,
    invoicesCount: Number(row.invoices_count) || 0,
    createdAt: (row.created_at ? row.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)) as any,
  };
}

/**
 * Convertit une facture Supabase avec ses relations vers le modèle de domaine
 */
export function mapDbInvoiceToModel(row: SupabaseInvoiceRow): MockInvoice {
  const customer = row.customers;
  const items = (row.invoice_items || []).map((it, idx) => ({
    id: it.id,
    position: it.position || idx + 1,
    description: it.description,
    quantity: Number(it.quantity) || 1,
    unitPrice: Number(it.unit_price) || 0,
    lineTotal: Number(it.line_total) || Number(it.quantity) * Number(it.unit_price),
  }));

  const payments: MockPaymentRecord[] = (row.payments || []).map((p) => ({
    id: p.id,
    date: p.date as any,
    amount: Number(p.amount) || 0,
    method: p.method,
    reference: p.reference,
    note: p.note || undefined,
  }));

  const status = (row.status || "draft") as DisplayStatus;

  return {
    id: row.id,
    number: (row.number || "").replace(/--20\d\d-/g, "-").replace(/--/g, "-"),
    customerId: row.customer_id,
    customerName: customer?.name || "Client",
    customerContact: customer?.contact_person || customer?.name || "Direction",
    customerAddress: customer?.address || "",
    customerCity: customer?.city || "Cotonou",
    customerCountry: customer?.country || "Bénin",
    customerTaxId: customer?.tax_id || undefined,
    customerEmail: customer?.email || "",
    customerPhone: customer?.phone || "",
    issueDate: (row.issue_date || (row.created_at ? row.created_at.slice(0, 10) : "")) as any,
    dueDate: row.due_date as any,
    createdAt: (row.created_at ? row.created_at.slice(0, 10) : row.issue_date) as any,
    items,
    subtotal: Number(row.subtotal) || 0,
    vatRate: Number(row.vat_rate) || 18,
    vatAmount: Number(row.vat_amount) || 0,
    total: Number(row.total) || 0,
    amountPaid: Number(row.amount_paid) || 0,
    displayStatus: status,
    itemsCount: items.length,
    payments,
    notes: row.notes || undefined,
    publicToken: row.public_token || undefined,
  };
}

/**
 * Convertit une organisation Supabase vers le modèle de domaine
 */
export function mapDbOrgToModel(row: SupabaseOrgRow): typeof MOCK_ORGANIZATION {
  return {
    id: row.id,
    name: row.name,
    city: row.city || "Cotonou",
    country: row.country || "Bénin",
    currency: "XOF" as const,
    ifu: row.tax_id || "3201910845321",
    rccm: row.rccm || "RB/COT/21 B 28941",
    address: row.address || "Quartier Haie Vive, Rue 340",
    phone: row.phone || "+229 97 00 12 34",
    email: row.email || "contact@danhomey.africa",
    bankName: row.bank_name || "BOA Bénin",
    bankIban: row.bank_rib || "BJ061 01001 00123456789 22",
    mobileMoneyWave: row.mobile_money_info || "+229 97 00 12 34",
    mobileMoneyMtn: "+229 96 00 56 78",
    vatRate: Number(row.vat_rate) || 18,
    invoicePrefix: row.invoice_prefix || "FAC",
    paymentTermsDays: 30,
    footerNote: "Dispensé d'immatriculation au régime simplifié. Facture établie selon les normes du SYSCOHADA révisé.",
  };
}

// -----------------------------------------------------------------------------
// SERVICES CLIENTS
// -----------------------------------------------------------------------------

export async function fetchCustomersFromSupabase(): Promise<MockCustomer[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return null;
    }

    return (data as SupabaseCustomerRow[]).map(mapDbCustomerToModel);
  } catch {
    return null;
  }
}

export async function createCustomerInSupabase(
  input: {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    taxId: string;
    rccm?: string;
  },
  orgId: string
): Promise<MockCustomer | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("customers")
      .insert({
        organization_id: orgId,
        name: input.name,
        contact_person: input.contactPerson,
        email: input.email,
        phone: input.phone,
        address: input.address,
        city: input.city,
        country: input.country,
        tax_id: input.taxId,
        rccm: input.rccm || null,
        total_invoiced: 0,
        total_paid: 0,
        balance_due: 0,
        invoices_count: 0,
      })
      .select()
      .single();

    if (error || !data) {
      return null;
    }

    return mapDbCustomerToModel(data as SupabaseCustomerRow);
  } catch {
    return null;
  }
}

export async function updateCustomerInSupabase(
  id: string,
  input: Partial<MockCustomer>
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    const payload: Record<string, any> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.contactPerson !== undefined) payload.contact_person = input.contactPerson;
    if (input.email !== undefined) payload.email = input.email;
    if (input.phone !== undefined) payload.phone = input.phone;
    if (input.address !== undefined) payload.address = input.address;
    if (input.city !== undefined) payload.city = input.city;
    if (input.country !== undefined) payload.country = input.country;
    if (input.taxId !== undefined) payload.tax_id = input.taxId;
    if (input.rccm !== undefined) payload.rccm = input.rccm;

    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from("customers").update(payload).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteCustomerInSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// SERVICES FACTURES
// -----------------------------------------------------------------------------

export async function fetchInvoicesFromSupabase(): Promise<MockInvoice[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        customers (*),
        invoice_items (*),
        payments (*)
      `)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return null;
    }

    return (data as SupabaseInvoiceRow[]).map(mapDbInvoiceToModel);
  } catch {
    return null;
  }
}

export async function createInvoiceInSupabase(
  input: {
    customerId: string;
    issueDate: string;
    dueDate: string;
    items: { description: string; quantity: number; unitPrice: number }[];
    notes?: string;
    status: "draft" | "sent";
  },
  orgId: string,
  invoiceNumber: string,
  vatRate = 18
): Promise<MockInvoice | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const totals = computeInvoiceTotals(input.items, vatRate);

    // 1. Insert invoice header
    const { data: invData, error: invError } = await supabase
      .from("invoices")
      .insert({
        organization_id: orgId,
        customer_id: input.customerId,
        number: invoiceNumber,
        issue_date: input.issueDate,
        due_date: input.dueDate,
        status: input.status,
        subtotal: totals.subtotal,
        vat_rate: vatRate,
        vat_amount: totals.vatAmount,
        total: totals.total,
        amount_paid: 0,
        notes: input.notes || null,
      })
      .select(`
        *,
        customers (*)
      `)
      .single();

    if (invError || !invData) {
      return null;
    }

    // 2. Insert line items
    const itemsPayload = input.items.map((it, idx) => ({
      invoice_id: invData.id,
      position: idx + 1,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unitPrice,
      line_total: Math.round(it.quantity * it.unitPrice),
    }));

    const { data: itemsData } = await supabase
      .from("invoice_items")
      .insert(itemsPayload)
      .select();

    // 3. Update customer stats (aggregate recalculation)
    try {
      const { data: custInvoices } = await supabase
        .from("invoices")
        .select("total, amount_paid")
        .eq("customer_id", input.customerId);

      if (custInvoices) {
        const totalInvoiced = custInvoices.reduce((sum: number, i: any) => sum + (Number(i.total) || 0), 0);
        const totalPaid = custInvoices.reduce((sum: number, i: any) => sum + (Number(i.amount_paid) || 0), 0);
        await supabase
          .from("customers")
          .update({
            total_invoiced: totalInvoiced,
            total_paid: totalPaid,
            balance_due: Math.max(0, totalInvoiced - totalPaid),
            invoices_count: custInvoices.length,
          })
          .eq("id", input.customerId);
      }
    } catch {
      // Ignored non-blocking
    }

    const fullRow: SupabaseInvoiceRow = {
      ...invData,
      invoice_items: (itemsData as SupabaseItemRow[]) || [],
      payments: [],
    };

    return mapDbInvoiceToModel(fullRow);
  } catch {
    return null;
  }
}

export async function updateInvoiceStatusInSupabase(
  id: string,
  status: DisplayStatus
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    const dbStatus = status === "overdue" ? "sent" : status;
    const { error } = await supabase
      .from("invoices")
      .update({ status: dbStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    return !error;
  } catch {
    return false;
  }
}

export async function updateInvoiceInSupabase(
  id: string,
  input: {
    customerId?: string;
    issueDate?: string;
    dueDate?: string;
    items?: { description: string; quantity: number; unitPrice: number }[];
    notes?: string;
    status?: DisplayStatus;
  },
  vatRate = 18
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (input.customerId) payload.customer_id = input.customerId;
    if (input.issueDate) payload.issue_date = input.issueDate;
    if (input.dueDate) payload.due_date = input.dueDate;
    if (input.notes !== undefined) payload.notes = input.notes || null;
    if (input.status) {
      payload.status = input.status === "overdue" ? "sent" : input.status;
    }

    if (input.items && input.items.length > 0) {
      const totals = computeInvoiceTotals(input.items, vatRate);
      payload.subtotal = totals.subtotal;
      payload.vat_amount = totals.vatAmount;
      payload.total = totals.total;

      // Replace items: delete old items and insert new ones
      await supabase.from("invoice_items").delete().eq("invoice_id", id);
      const itemsPayload = input.items.map((it, idx) => ({
        invoice_id: id,
        position: idx + 1,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        line_total: Math.round(it.quantity * it.unitPrice),
      }));
      await supabase.from("invoice_items").insert(itemsPayload);
    }

    const { error } = await supabase.from("invoices").update(payload).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function emitInvoiceInSupabase(
  id: string,
  newNumber: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("invoices")
      .update({
        number: newNumber,
        status: "sent",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return !error;
  } catch {
    return false;
  }
}

export async function deleteInvoiceInSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function recordPaymentInSupabase(
  invoiceId: string,
  payment: {
    amount: number;
    method: PaymentMethod;
    reference: string;
    note?: string;
    providerId?: string;
    providerName?: string;
  },
  orgId: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    const formattedNote = payment.providerName
      ? payment.note
        ? `[${payment.providerName}] ${payment.note}`
        : `[${payment.providerName}]`
      : payment.note || null;

    // 1. Insert payment record
    const { error: payErr } = await supabase.from("payments").insert({
      organization_id: orgId,
      invoice_id: invoiceId,
      amount: payment.amount,
      date: new Date().toISOString().slice(0, 10),
      method: payment.method,
      reference: payment.reference,
      note: formattedNote,
    });

    if (payErr) {
      return false;
    }

    // 2. Fetch invoice to update amount_paid
    const { data: inv } = await supabase
      .from("invoices")
      .select("total, amount_paid, customer_id")
      .eq("id", invoiceId)
      .single();

    if (inv) {
      const newAmountPaid = (Number(inv.amount_paid) || 0) + payment.amount;
      const newStatus = newAmountPaid >= Number(inv.total) ? "paid" : "sent";

      await supabase
        .from("invoices")
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId);

      // 3. Update customer balance
      if (inv.customer_id) {
        const { data: custInvoices } = await supabase
          .from("invoices")
          .select("total, amount_paid")
          .eq("customer_id", inv.customer_id);

        if (custInvoices) {
          const totalInvoiced = custInvoices.reduce((sum: number, i: any) => sum + (Number(i.total) || 0), 0);
          const totalPaid = custInvoices.reduce((sum: number, i: any) => sum + (Number(i.amount_paid) || 0), 0);
          await supabase
            .from("customers")
            .update({
              total_invoiced: totalInvoiced,
              total_paid: totalPaid,
              balance_due: Math.max(0, totalInvoiced - totalPaid),
            })
            .eq("id", inv.customer_id);
        }
      }
    }

    return true;
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// SERVICES ORGANISATION
// -----------------------------------------------------------------------------

export async function fetchOrganizationFromSupabase(): Promise<typeof MOCK_ORGANIZATION | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from("organizations").select("*").limit(1).maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDbOrgToModel(data as SupabaseOrgRow);
  } catch {
    return null;
  }
}

export async function updateOrganizationInSupabase(
  orgId: string,
  input: Partial<typeof MOCK_ORGANIZATION>
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    const payload: Record<string, any> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.ifu !== undefined) payload.tax_id = input.ifu;
    if (input.rccm !== undefined) payload.rccm = input.rccm;
    if (input.address !== undefined) payload.address = input.address;
    if (input.city !== undefined) payload.city = input.city;
    if (input.country !== undefined) payload.country = input.country;
    if (input.phone !== undefined) payload.phone = input.phone;
    if (input.email !== undefined) payload.email = input.email;
    if (input.bankName !== undefined) payload.bank_name = input.bankName;
    if (input.bankIban !== undefined) payload.bank_rib = input.bankIban;
    if (input.mobileMoneyWave !== undefined) payload.mobile_money_info = input.mobileMoneyWave;
    if (input.vatRate !== undefined) payload.vat_rate = input.vatRate;
    if (input.invoicePrefix !== undefined) payload.invoice_prefix = input.invoicePrefix;

    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from("organizations").update(payload).eq("id", orgId);
    return !error;
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// SERVICES PROFILS UTILISATEURS
// -----------------------------------------------------------------------------

export async function updateProfileInSupabase(
  userId: string,
  input: { firstName?: string; lastName?: string; role?: string }
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (input.firstName !== undefined) payload.first_name = input.firstName;
    if (input.lastName !== undefined) payload.last_name = input.lastName;
    if (input.role !== undefined) payload.role = input.role;

    const { error } = await supabase.from("profiles").update(payload).eq("id", userId);
    return !error;
  } catch {
    return false;
  }
}
