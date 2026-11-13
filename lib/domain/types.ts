/** Date calendaire sans heure, au format AAAA-MM-JJ. */
export type ISODate = string;
/** Horodatage ISO 8601 complet. */
export type ISODateTime = string;

/** XOF (UEMOA) ou XAF (CEMAC) ; les deux s'affichent « FCFA ». */
export type Currency = "XOF" | "XAF";

/** Statuts stockés en base. « En retard » n'en fait pas partie : il est déduit. */
export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";
/** Statut montré à l'utilisateur. */
export type DisplayStatus = InvoiceStatus | "overdue";

export type PaymentMethod = "mobile_money" | "cash" | "bank_transfer" | "cheque" | "other";

export interface Organization {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  logoPath: string | null;
  /** Identifiant fiscal unique. */
  ifu: string | null;
  rccm: string | null;
  currency: Currency;
  /** Taux de TVA en pourcentage, par exemple 18. */
  vatRate: number;
  invoicePrefix: string;
  paymentTermsDays: number;
  invoiceFooter: string | null;
  timeZone: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  taxId: string | null;
  notes: string | null;
  archivedAt: ISODateTime | null;
  createdAt: ISODateTime;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  position: number;
  description: string;
  /** Jusqu'à trois décimales. */
  quantity: number;
  /** Entier, en FCFA. */
  unitPrice: number;
  /** Entier, en FCFA. */
  lineTotal: number;
}

/** Coordonnées figées sur la facture au moment de l'émission. */
export interface PartySnapshot {
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  taxId: string | null;
}

export interface Invoice {
  id: string;
  organizationId: string;
  customerId: string;
  /** Vide tant que la facture est un brouillon. */
  number: string | null;
  status: InvoiceStatus;
  issueDate: ISODate;
  dueDate: ISODate;
  /** Tous les montants sont des entiers en FCFA. */
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  amountPaid: number;
  notes: string | null;
  customerSnapshot: PartySnapshot | null;
  organizationSnapshot: PartySnapshot | null;
  publicToken: string | null;
  sentAt: ISODateTime | null;
  paidAt: ISODateTime | null;
  cancelledAt: ISODateTime | null;
  createdAt: ISODateTime;
  items: InvoiceItem[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  /** Entier, en FCFA. */
  amount: number;
  paidOn: ISODate;
  method: PaymentMethod;
  reference: string | null;
  createdAt: ISODateTime;
}
