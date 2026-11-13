"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { formatFCFA } from "@/lib/format/money";
import { formatDate } from "@/lib/format/date";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import type { PaymentMethod } from "@/lib/domain/types";
import type { MockInvoice } from "@/lib/mock-data";
import { RecordPaymentModal } from "@/components/invoices/record-payment-modal";
import { PaymentProviderLogo } from "@/components/invoices/payment-provider-logo";
import {
  CreditCard,
  Search,
  Download,
  FileText,
  Smartphone,
  Building,
  Coins,
  ArrowRight,
  Plus,
  X,
} from "lucide-react";

type MethodFilter = "all" | PaymentMethod;

export default function PaymentsPage() {
  const { invoices, showToast } = useData();
  const { t } = useI18n();
  const [selectedMethod, setSelectedMethod] = useState<MethodFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<MockInvoice | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Unpaid invoices eligible for collection
  const unpaidInvoices = useMemo(() => {
    return (invoices || []).filter(
      (inv) => (inv.total - inv.amountPaid) > 0 && inv.displayStatus !== "cancelled"
    );
  }, [invoices]);

  const handleOpenEncaissement = () => {
    if (unpaidInvoices.length === 0) {
      showToast({
        type: "info",
        title: "Aucune facture en attente",
        message: "Toutes vos factures émises sont déjà intégralement réglées.",
      });
      return;
    }
    if (unpaidInvoices.length === 1 && unpaidInvoices[0]) {
      setSelectedInvoiceForPayment(unpaidInvoices[0]);
      setIsRecordModalOpen(true);
    } else {
      setIsPickerOpen(true);
    }
  };

  // Flatten all payments across all invoices with invoice context
  const allPayments = useMemo(() => {
    return (invoices || []).flatMap((inv) =>
      (inv.payments || []).map((p) => ({
        ...p,
        invoiceId: inv.id,
        invoiceNumber: inv.number || "",
        customerId: inv.customerId,
        customerName: inv.customerName || "",
        customerCity: inv.customerCity || "",
        customerCountry: inv.customerCountry || "",
        providerId: p.providerId,
        providerName: p.providerName,
      }))
    ).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [invoices]);

  const filteredPayments = useMemo(() => {
    return allPayments.filter((p) => {
      if (selectedMethod !== "all" && p.method !== selectedMethod) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          (p.reference || "").toLowerCase().includes(q) ||
          (p.customerName || "").toLowerCase().includes(q) ||
          (p.invoiceNumber || "").toLowerCase().includes(q) ||
          (p.note ? p.note.toLowerCase().includes(q) : false)
        );
      }
      return true;
    });
  }, [allPayments, selectedMethod, searchQuery]);

  const exportPaymentsCSV = () => {
    if (filteredPayments.length === 0) {
      showToast({
        type: "info",
        title: t("pay_empty_title", "Aucun encaissement trouvé"),
        message: t("pay_empty_desc", "Aucun règlement ne correspond aux critères de filtre sélectionnés."),
      });
      return;
    }

    const headers = [
      t("pay_col_ref", "Référence règlement"),
      t("pay_col_date", "Date"),
      t("inv_number", "N° Facture"),
      t("pay_col_customer", "Client"),
      t("cust_city", "Ville"),
      t("cust_country", "Pays"),
      t("pay_col_method", "Mode de règlement"),
      t("pay_col_amount", "Montant encaissé (FCFA)"),
      "Note / Référence externe",
    ];

    const methodLabels: Record<PaymentMethod, string> = {
      mobile_money: t("pay_mobile_money", "Mobile Money"),
      bank_transfer: t("pay_bank_transfer", "Virement bancaire"),
      cash: t("pay_cash", "Espèces"),
      cheque: t("pay_cheque", "Chèque"),
      other: "Autre",
    };

    const rows = filteredPayments.map((p) => [
      `"${p.reference}"`,
      `"${p.date}"`,
      `"${p.invoiceNumber}"`,
      `"${p.customerName.replace(/"/g, '""')}"`,
      `"${p.customerCity.replace(/"/g, '""')}"`,
      `"${p.customerCountry.replace(/"/g, '""')}"`,
      `"${methodLabels[p.method] || p.method}"`,
      Math.round(p.amount),
      `"${(p.note || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `danhomey_paiements_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: "success",
      title: t("pay_export_statement", "Relevé des paiements exporté"),
      message: `${filteredPayments.length} paiement(s) exporté(s) au format CSV (compatible Excel).`,
    });
  };

  const totalCollected = allPayments.reduce((s, p) => s + p.amount, 0);
  const mobileMoneyTotal = allPayments
    .filter((p) => p.method === "mobile_money")
    .reduce((s, p) => s + p.amount, 0);
  const transferTotal = allPayments
    .filter((p) => p.method === "bank_transfer")
    .reduce((s, p) => s + p.amount, 0);

  const getMethodBadge = (method: PaymentMethod, providerId?: string, providerName?: string) => {
    if (providerId) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface dark:bg-forest-900/60 px-2.5 py-0.5 text-[11px] font-semibold text-forest-950 dark:text-white border border-line shadow-2xs">
          <PaymentProviderLogo providerId={providerId} size={18} />
          <span>{providerName || providerId}</span>
        </span>
      );
    }

    switch (method) {
      case "mobile_money":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
            <Smartphone className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
            <span>{t("pay_mobile_money", "Mobile Money")}</span>
          </span>
        );
      case "bank_transfer":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 dark:bg-sky-950/70 px-2.5 py-0.5 text-[11px] font-semibold text-sky-900 dark:text-sky-300 border border-sky-300/60 dark:border-sky-700/60">
            <Building className="w-3 h-3 text-sky-700 dark:text-sky-400" />
            <span>{t("pay_bank_transfer", "Virement bancaire")}</span>
          </span>
        );
      case "cash":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
            <Coins className="w-3 h-3 text-amber-700 dark:text-amber-400" />
            <span>{t("pay_cash", "Espèces")}</span>
          </span>
        );
      case "cheque":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-stone-800/70 px-2.5 py-0.5 text-[11px] font-semibold text-stone-900 dark:text-stone-300 border border-stone-300/60 dark:border-stone-700/60">
            <FileText className="w-3 h-3 text-stone-700 dark:text-stone-400" />
            <span>{t("pay_cheque", "Chèque")}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-stone-800/70 px-2.5 py-0.5 text-[11px] font-semibold text-stone-900 dark:text-stone-300 border border-stone-300/60 dark:border-stone-700/60">
            <span>{t("pay_other", "Autre")}</span>
          </span>
        );
    }
  };

  return (
    <DashboardShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Link href="/" className="hover:text-forest-900">
              {t("nav_dashboard", "Tableau de bord")}
            </Link>
            <span>/</span>
            <span className="font-semibold text-forest-950">{t("nav_payments", "Paiements")}</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">
            {t("pay_history_title", "Historique des encaissements")}
          </h1>
          <p className="text-xs text-ink-muted sm:text-sm mt-0.5">
            {t("pay_history_sub", "Suivi des règlements reçus par Mobile Money, virement bancaire et espèces.")}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={exportPaymentsCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-sage-500" />
            <span>{t("pay_export_statement", "Exporter le relevé")}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenEncaissement}
            className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-3.5 py-2 text-xs font-semibold text-surface hover:bg-forest-850 shadow-sm transition-all active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5 text-lime-400" />
            <span>Enregistrer un encaissement</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/40 p-3.5 sm:p-4 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            {t("pay_total_collected_title", "Total des règlements encaissés")}
          </span>
          <p className="tabular mt-1 text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-100 truncate">
            {formatFCFA(totalCollected)}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
            {allPayments.length} {t("pay_recorded_tx", "transactions enregistrées")}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-4 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-sage-500 uppercase tracking-wider">
            {t("pay_momo_title", "Mobile Money (Wave / MTN)")}
          </span>
          <p className="tabular mt-1 text-lg sm:text-xl font-bold text-forest-950 truncate">
            {formatFCFA(mobileMoneyTotal)}
          </p>
          <p className="text-[11px] text-ink-muted mt-0.5">
            {totalCollected > 0
              ? `${Math.round((mobileMoneyTotal / totalCollected) * 100)} % ${t("pay_pct_collections", "des encaissements")}`
              : "0 %"}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-4 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-sage-500 uppercase tracking-wider">
            {t("pay_bank_transfer_title", "Virements bancaires")}
          </span>
          <p className="tabular mt-1 text-lg sm:text-xl font-bold text-forest-950 truncate">
            {formatFCFA(transferTotal)}
          </p>
          <p className="text-[11px] text-ink-muted mt-0.5">
            {totalCollected > 0
              ? `${Math.round((transferTotal / totalCollected) * 100)} % ${t("pay_pct_collections", "des encaissements")}`
              : "0 %"}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-line bg-surface shadow-card overflow-hidden">
        {/* Filter and Search Bar */}
        <div className="p-3.5 sm:p-5 border-b border-line space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Payment Method Tabs */}
            <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedMethod("all")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedMethod === "all"
                    ? "bg-forest-900 text-surface shadow-2xs"
                    : "text-sage-600 hover:bg-sage-100"
                }`}
              >
                {t("pay_filter_all", "Tous")} ({allPayments.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("mobile_money")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedMethod === "mobile_money"
                    ? "bg-emerald-800 text-surface shadow-2xs"
                    : "text-sage-600 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                {t("pay_mobile_money", "Mobile Money")}
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("bank_transfer")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedMethod === "bank_transfer"
                    ? "bg-sky-800 text-surface shadow-2xs"
                    : "text-sage-600 hover:bg-sky-50 hover:text-sky-800"
                }`}
              >
                {t("pay_bank_transfer", "Virement bancaire")}
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("cash")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedMethod === "cash"
                    ? "bg-amber-800 text-surface shadow-2xs"
                    : "text-sage-600 hover:bg-amber-50 hover:text-amber-800"
                }`}
              >
                {t("pay_cash", "Espèces")}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sage-400" />
              <input
                type="text"
                placeholder={t("pay_search_placeholder", "Rechercher référence, client, facture...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-line bg-sage-50/70 py-1.5 pl-8 pr-3 text-xs text-forest-950 placeholder:text-sage-400 focus:border-forest-700 focus:bg-surface focus:outline-hidden transition-all"
              />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line bg-sage-50/50 text-sage-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">{t("pay_col_date", "Date")}</th>
                <th className="px-4 py-3">{t("pay_col_ref", "Référence")}</th>
                <th className="px-4 py-3">{t("pay_col_customer", "Client")}</th>
                <th className="px-4 py-3">{t("pay_col_invoice", "Facture associée")}</th>
                <th className="px-4 py-3">{t("pay_col_method", "Moyen")}</th>
                <th className="px-4 py-3 text-right">{t("pay_col_amount", "Montant encaissé")}</th>
                <th className="px-4 py-3 text-right">{t("pay_col_action", "Action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    <CreditCard className="mx-auto h-8 w-8 text-sage-300 mb-2" />
                    <p className="font-medium text-forest-950">{t("pay_empty_title", "Aucun encaissement trouvé")}</p>
                    <p className="text-xs text-sage-500 mt-0.5">
                      {t("pay_empty_desc", "Aucun règlement ne correspond aux critères de filtre sélectionnés.")}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-sage-50/60 transition-colors">
                    <td className="px-4 py-3.5 tabular text-sage-600 whitespace-nowrap">
                      {formatDate(payment.date)}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-forest-950 tabular">
                        {payment.reference}
                      </span>
                      {payment.note && (
                        <p className="text-[10px] text-ink-muted italic truncate max-w-xs">
                          {payment.note}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <Link
                        href={`/clients/${payment.customerId}`}
                        className="font-medium text-forest-950 hover:underline"
                      >
                        {payment.customerName}
                      </Link>
                      <p className="text-[10px] text-ink-muted">
                        {payment.customerCity}, {payment.customerCountry}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Link
                        href={`/factures/${payment.invoiceId}`}
                        className="font-semibold text-forest-900 underline-offset-2 hover:underline tabular"
                      >
                        {payment.invoiceNumber}
                      </Link>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getMethodBadge(payment.method, payment.providerId, payment.providerName)}
                    </td>

                    <td className="px-4 py-3.5 text-right tabular font-bold text-emerald-700 text-sm whitespace-nowrap">
                      +{formatFCFA(payment.amount)}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/factures/${payment.invoiceId}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-forest-900 hover:bg-sage-100 transition-colors"
                      >
                        <span>{t("inv_invoice", "Facture")}</span>
                        <ArrowRight className="w-3 h-3 text-sage-400" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-line-subtle">
          {filteredPayments.length === 0 ? (
            <div className="py-10 px-4 text-center text-ink-muted">
              <CreditCard className="mx-auto h-8 w-8 text-sage-300 mb-2" />
              <p className="font-medium text-forest-950">{t("pay_empty_title", "Aucun encaissement trouvé")}</p>
              <p className="text-xs text-sage-500 mt-0.5">{t("pay_empty_desc", "Aucun règlement ne correspond aux critères de filtre sélectionnés.")}</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-sage-50/60 transition-colors space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] text-ink-muted tabular">{formatDate(payment.date)}</span>
                    <h3 className="text-xs font-bold text-forest-950 mt-0.5">{payment.reference}</h3>
                    <p className="text-xs text-forest-900 font-medium">{payment.customerName}</p>
                  </div>
                  <div className="text-right">
                    <span className="tabular text-sm font-bold text-emerald-700">
                      +{formatFCFA(payment.amount)}
                    </span>
                    <div className="mt-1">{getMethodBadge(payment.method, payment.providerId, payment.providerName)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-line-subtle pt-2 text-xs">
                  <span className="text-ink-muted">
                    {t("inv_invoice", "Facture")} : <strong className="text-forest-950">{payment.invoiceNumber}</strong>
                  </span>
                  <Link
                    href={`/factures/${payment.invoiceId}`}
                    className="inline-flex items-center gap-1 font-semibold text-forest-900 hover:underline"
                  >
                    <span>{t("action_view", "Voir")}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invoice Picker Modal if multiple unpaid invoices */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-bold text-forest-950 text-sm">
                  Sélectionner la facture à encaisser
                </h3>
                <p className="text-[11px] text-ink-muted">
                  {unpaidInvoices.length} factures avec solde restant dû
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="p-1 rounded-lg text-sage-400 hover:text-forest-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
              {unpaidInvoices.map((inv) => {
                const due = Math.max(0, inv.total - inv.amountPaid);
                return (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setSelectedInvoiceForPayment(inv);
                      setIsPickerOpen(false);
                      setIsRecordModalOpen(true);
                    }}
                    className="cursor-pointer rounded-xl border border-line bg-surface p-3 hover:border-forest-700 hover:bg-sage-50/70 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-forest-950 text-xs">{inv.number}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                          En attente
                        </span>
                      </div>
                      <p className="text-[11px] text-forest-900 font-medium mt-0.5">
                        {inv.customerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 tabular">
                        {formatFCFA(due)}
                      </span>
                      <p className="text-[10px] text-ink-muted">Reste dû</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <RecordPaymentModal
          isOpen={isRecordModalOpen}
          onClose={() => {
            setIsRecordModalOpen(false);
            setSelectedInvoiceForPayment(null);
          }}
          invoice={selectedInvoiceForPayment}
        />
      )}
    </DashboardShell>
  );
}
