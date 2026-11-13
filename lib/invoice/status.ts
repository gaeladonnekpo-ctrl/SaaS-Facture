import type { DisplayStatus, ISODate, InvoiceStatus } from "../domain/types";
import { amountDue } from "./totals";

export const STATUS_LABELS: Record<DisplayStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  overdue: "En retard",
  paid: "Payée",
  cancelled: "Annulée",
};

/** Date du jour (AAAA-MM-JJ) dans le fuseau de l'entreprise, pas en UTC. */
export function todayInTimeZone(timeZone: string, now: Date = new Date()): ISODate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

interface StatusInput {
  status: InvoiceStatus;
  dueDate: ISODate;
  total: number;
  amountPaid: number;
}

/**
 * « En retard » = envoyée, échéance strictement dépassée, reste dû positif.
 * Une facture qui échoit aujourd'hui n'est pas encore en retard.
 */
export function deriveDisplayStatus(invoice: StatusInput, today: ISODate): DisplayStatus {
  if (
    invoice.status === "sent" &&
    invoice.dueDate < today &&
    amountDue(invoice.total, invoice.amountPaid) > 0
  ) {
    return "overdue";
  }
  return invoice.status;
}

/** Statut d'une facture émise après enregistrement ou suppression d'un paiement. */
export function statusAfterPayments(total: number, amountPaid: number): "sent" | "paid" {
  return amountPaid >= total ? "paid" : "sent";
}

export function isEditable(status: InvoiceStatus): boolean {
  return status === "draft";
}
