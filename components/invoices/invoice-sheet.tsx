"use client";

import React, { useState } from "react";
import { formatFCFA } from "@/lib/format/money";
import { formatDate } from "@/lib/format/date";
import { amountInWords } from "@/lib/invoice/amount-in-words";
import { StatusBadge } from "@/components/ui/status-badge";
import { useI18n } from "@/lib/i18n/context";
import { useData } from "@/lib/data/context";
import type { MockInvoice } from "@/lib/mock-data";
import { MOCK_ORGANIZATION } from "@/lib/mock-data";
import { Logo } from "@/components/ui/logo";
import { PaymentMethodsDisplay } from "./payment-methods-display";
import {
  Building2,
  Phone,
  Mail,
  Landmark,
  Smartphone,
  Printer,
  Download,
  CheckCircle2,
  FileText,
  Receipt,
  ShieldCheck,
} from "lucide-react";

interface InvoiceSheetProps {
  invoice: MockInvoice;
  initialMode?: "invoice" | "receipt";
  showToolbar?: boolean;
}

export function InvoiceSheet({
  invoice,
  initialMode = "invoice",
  showToolbar = false,
}: InvoiceSheetProps) {
  const { t } = useI18n();
  const { organization: storeOrg } = useData();
  const organization = storeOrg || MOCK_ORGANIZATION;
  const [docMode, setDocMode] = useState<"invoice" | "receipt">(initialMode);

  const balanceDue = Math.max(0, invoice.total - invoice.amountPaid);
  const isPaid = invoice.displayStatus === "paid" || balanceDue === 0;
  const isPartial = invoice.amountPaid > 0 && balanceDue > 0;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {/* Optional In-Sheet Mode Switcher Toolbar */}
      {showToolbar && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface p-3 sm:p-4 rounded-2xl border border-line shadow-card print:hidden">
          <div className="flex items-center gap-1.5 p-1 bg-sage-100/70 rounded-xl border border-line">
            <button
              type="button"
              onClick={() => setDocMode("invoice")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                docMode === "invoice"
                  ? "bg-forest-900 text-surface shadow-xs"
                  : "text-forest-900 hover:bg-surface/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t("inv_mode_invoice", "Facture")}</span>
            </button>
            <button
              type="button"
              onClick={() => setDocMode("receipt")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                docMode === "receipt"
                  ? "bg-forest-900 text-surface shadow-xs"
                  : "text-forest-900 hover:bg-surface/60"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{t("inv_mode_receipt", "Reçu de paiement")}</span>
              {isPaid && (
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-4 py-2 text-xs font-semibold text-surface shadow-sm hover:bg-forest-850 transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-lime-400" />
            <span>
              {docMode === "receipt"
                ? t("inv_download_receipt", "Télécharger le reçu (PDF)")
                : t("inv_download_invoice", "Télécharger la facture (PDF)")}
            </span>
          </button>
        </div>
      )}

      {/* Official A4 Sheet */}
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-10 lg:p-12 shadow-card print:shadow-none print:border-none print:p-0">
        {/* Top Header: Organization & Invoice/Receipt Meta */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-8 border-b border-line">
          {/* Organization Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3.5">
              <Logo variant="icon" size="lg" priority />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-forest-950">
                  {organization.name}
                </h1>
                <p className="text-xs text-ink-muted">
                  {t("inv_sheet_services_consulting", "Solutions Numériques & Conseil")}
                </p>
              </div>
            </div>

            <div className="text-xs text-sage-600 space-y-0.5 leading-relaxed">
              <p>
                {organization.address}, {organization.city} — {organization.country}
              </p>
              <p className="font-semibold text-forest-900">
                <span>{t("inv_sheet_ifu_label", "IFU :")} {organization.ifu}</span> ·{" "}
                <span>{t("inv_sheet_rccm_label", "RCCM :")} {organization.rccm}</span>
              </p>
              <p>
                {t("inv_sheet_phone_label", "Tél :")} {organization.phone} ·{" "}
                {t("inv_sheet_email_label", "Email :")} {organization.email}
              </p>
            </div>
          </div>

          {/* Document Title, Stamp & Meta Box */}
          <div className="sm:text-right space-y-2">
            <div className="flex sm:justify-end items-center gap-2">
              <StatusBadge status={invoice.displayStatus} />
              {docMode === "receipt" && isPaid && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {t("inv_receipt_stamp_paid", "PAYÉ INTÉGRALEMENT")}
                </span>
              )}
            </div>

            <div className="text-2xl sm:text-3xl font-black tracking-tight text-forest-950 uppercase">
              {docMode === "receipt"
                ? t("inv_receipt_title", "Reçu d'encaissement")
                : t("inv_sheet_title", "Facture")}
            </div>

            <div className="text-sm font-bold tabular text-forest-800">
              {docMode === "receipt" ? "REC-" : ""}
              {invoice.number}
            </div>

            <div className="pt-2 text-xs space-y-1 text-ink-muted tabular">
              <p>
                {docMode === "receipt"
                  ? t("inv_receipt_payment_date", "Date d'encaissement :")
                  : t("inv_issue_date", "Date d'émission :")}{" "}
                <strong className="text-forest-950">{formatDate(invoice.issueDate)}</strong>
              </p>
              <p>
                {t("inv_due_date", "Date d'échéance")} :{" "}
                <strong className="text-forest-950">{formatDate(invoice.dueDate)}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Client Snapshot Box */}
        <div className="my-8 rounded-2xl border border-line bg-sage-50/60 p-5 sm:p-6">
          <span className="text-[11px] font-bold text-sage-500 uppercase tracking-wider">
            {docMode === "receipt"
              ? t("inv_receipt_received_from", "Reçu de l'entreprise :")
              : t("inv_sheet_billed_to", "Facturé à l'attention de :")}
          </span>
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h2 className="text-base font-bold text-forest-950">
                {invoice.customerName}
              </h2>
              <p className="text-xs text-sage-600 mt-0.5">{invoice.customerContact}</p>
              <p className="text-xs text-sage-600">{invoice.customerAddress}</p>
              <p className="text-xs text-sage-600 font-medium">
                {invoice.customerCity}, {invoice.customerCountry}
              </p>
            </div>
            <div className="sm:text-right text-xs text-sage-600 space-y-1">
              {invoice.customerTaxId && (
                <p>
                  <strong className="text-forest-900">{t("inv_sheet_ifu_label", "IFU :")}</strong>{" "}
                  <span className="tabular">{invoice.customerTaxId}</span>
                </p>
              )}
              {invoice.customerEmail && (
                <p>{t("inv_sheet_email_label", "Email :")} {invoice.customerEmail}</p>
              )}
              {invoice.customerPhone && (
                <p>{t("inv_sheet_phone_label", "Tél :")} {invoice.customerPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-xs min-w-[500px] sm:min-w-0">
            <thead>
              <tr className="border-b-2 border-forest-900/20 text-forest-950 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-2 w-10 text-center">#</th>
                <th className="py-3 px-2">{t("inv_sheet_table_item_desc", "Désignation de la prestation / produit")}</th>
                <th className="py-3 px-2 text-right w-16">{t("inv_sheet_table_qty", "Qté")}</th>
                <th className="py-3 px-2 text-right w-32">{t("inv_sheet_table_unit_price", "Prix unitaire HT")}</th>
                <th className="py-3 px-2 text-right w-36">{t("inv_sheet_table_amount_ht", "Montant HT")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {invoice.items.map((item, index) => (
                <tr key={item.id} className="hover:bg-sage-50/50">
                  <td className="py-3 px-2 text-center text-sage-400 tabular font-medium">
                    {index + 1}
                  </td>
                  <td className="py-3 px-2 text-forest-950 font-medium">
                    {item.description}
                  </td>
                  <td className="py-3 px-2 text-right tabular text-forest-900">
                    {String(item.quantity).replace(".", ",")}
                  </td>
                  <td className="py-3 px-2 text-right tabular text-forest-900">
                    {formatFCFA(item.unitPrice)}
                  </td>
                  <td className="py-3 px-2 text-right tabular font-bold text-forest-950">
                    {formatFCFA(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row justify-between gap-6">
          {/* Payment Methods Info Box */}
          <div className="max-w-md w-full space-y-2">
            <span className="text-[11px] font-bold text-sage-500 uppercase tracking-wider block">
              {t("inv_sheet_payment_methods", "Modalités de paiement")}
            </span>
            <PaymentMethodsDisplay notes={invoice.notes} />
          </div>

          {/* Calculation Table */}
          <div className="w-full sm:w-80">
            <dl className="tabular text-xs space-y-2">
              <div className="flex justify-between py-1 text-ink-muted">
                <dt>{t("inv_subtotal_ht", "Sous-total HT :")}</dt>
                <dd className="font-semibold text-forest-900">{formatFCFA(invoice.subtotal)}</dd>
              </div>
              <div className="flex justify-between py-1 text-ink-muted">
                <dt>{t("inv_vat_amount", "TVA")} ({invoice.vatRate} %) :</dt>
                <dd className="font-semibold text-forest-900">{formatFCFA(invoice.vatAmount)}</dd>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-forest-900 text-sm font-bold text-forest-950">
                <dt>{t("inv_total_ttc", "Total TTC :")}</dt>
                <dd className="text-base">{formatFCFA(invoice.total)}</dd>
              </div>

              {invoice.amountPaid > 0 && (
                <>
                  <div className="flex justify-between py-1 text-emerald-700 font-semibold">
                    <dt>{t("inv_sheet_already_paid", "Montant déjà réglé :")}</dt>
                    <dd className="tabular">- {formatFCFA(invoice.amountPaid)}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-t border-dashed border-line text-sm font-bold">
                    <dt className={balanceDue > 0 ? "text-rose-700" : "text-emerald-700"}>
                      {t("inv_sheet_net_to_pay", "Net à payer :")}
                    </dt>
                    <dd className={balanceDue > 0 ? "text-rose-700" : "text-emerald-700"}>
                      {formatFCFA(balanceDue)}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </div>

        {/* Amount in Words Legal Box (Usage obligatoire zone FCFA) */}
        <div className="mt-8 rounded-2xl border border-lime-300/80 dark:border-lime-700/60 bg-lime-50/60 dark:bg-forest-900/60 p-4">
          <p className="text-xs font-bold text-forest-950 dark:text-lime-300">
            {t("inv_sheet_amount_words_stop", "Arrêtée la présente facture à la somme de :")}
          </p>
          <p className="mt-1 text-xs italic font-medium text-forest-900 dark:text-emerald-100 capitalize leading-relaxed">
            {amountInWords(invoice.total)}.
          </p>
        </div>

        {/* Notes & Legal Footer */}
        <div className="mt-10 pt-6 border-t border-line text-[11px] text-sage-500 text-center leading-relaxed">
          <p className="font-medium text-forest-900">
            {organization.footerNote || "Facture établie conformément aux règles OHADA et de l'UEMOA."}
          </p>
          <p className="mt-1">
            {t(
              "inv_sheet_bceao_legal",
              "En cas de retard de paiement, une pénalité égale à 3 fois le taux d'intérêt légal de la BCEAO sera exigée."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
