"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatFCFA } from "@/lib/format/money";
import { formatDate } from "@/lib/format/date";
import { StatusBadge } from "@/components/ui/status-badge";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import type { MockInvoice } from "@/lib/mock-data";
import type { DisplayStatus } from "@/lib/domain/types";
import {
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  ArrowRight,
  FileText,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  CreditCard,
  Pencil,
  MessageCircle,
  Copy,
  FileSpreadsheet,
  Plus,
} from "lucide-react";

interface RecentInvoicesTableProps {
  invoices: MockInvoice[];
}

type TabFilter = "all" | DisplayStatus;

export function RecentInvoicesTable({ invoices }: RecentInvoicesTableProps) {
  const { showToast } = useData();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleDownloadPDF = (invoice: MockInvoice) => {
    window.open(`/factures/${invoice.id}`, "_blank");
    showToast({
      type: "info",
      title: "Ouverture de la facture",
      message: `La facture ${invoice.number} est prête à être imprimée ou enregistrée en PDF.`,
    });
  };

  const handleExportCSV = (invoice: MockInvoice) => {
    const headers = [
      "Numéro facture",
      "Client",
      "Ville",
      "Pays",
      "Date d'émission",
      "Date d'échéance",
      "Prestation",
      "Quantité",
      "Prix unitaire HT (FCFA)",
      "Total ligne HT (FCFA)",
      "Sous-total facture HT (FCFA)",
      "Taux TVA",
      "Montant TVA (FCFA)",
      "Total TTC (FCFA)",
      "Statut",
    ];

    const items =
      invoice.items && invoice.items.length > 0
        ? invoice.items
        : [
            {
              id: "item_0",
              position: 1,
              description: "Prestation de services",
              quantity: 1,
              unitPrice: invoice.subtotal,
              lineTotal: invoice.subtotal,
            },
          ];

    const rows = items.map((it) => [
      `"${invoice.number}"`,
      `"${(invoice.customerName || "").replace(/"/g, '""')}"`,
      `"${(invoice.customerCity || "").replace(/"/g, '""')}"`,
      `"${(invoice.customerCountry || "").replace(/"/g, '""')}"`,
      `"${invoice.issueDate}"`,
      `"${invoice.dueDate}"`,
      `"${(it.description || "").replace(/"/g, '""')}"`,
      it.quantity,
      Math.round(it.unitPrice),
      Math.round(it.lineTotal || it.quantity * it.unitPrice),
      Math.round(invoice.subtotal),
      `${invoice.vatRate || 18} %`,
      Math.round(invoice.vatAmount),
      Math.round(invoice.total),
      `"${invoice.displayStatus}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `facture_${invoice.number}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: "success",
      title: "Export CSV réussi",
      message: `La facture ${invoice.number} a été téléchargée en CSV.`,
    });
    setOpenMenuId(null);
  };

  const handleShareWhatsApp = (invoice: MockInvoice) => {
    const publicUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/f/${invoice.id}`
        : "";
    const text = encodeURIComponent(
      `Bonjour, voici la facture ${invoice.number} d'un montant de ${formatFCFA(invoice.total)} émise par DANHOMEY Technologies SARL. Date d'échéance : ${formatDate(invoice.dueDate)}.\nConsultez et réglez en ligne ici : ${publicUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    showToast({
      type: "info",
      title: "Partage WhatsApp",
      message: `La facture ${invoice.number} a été ouverte sur WhatsApp.`,
    });
    setOpenMenuId(null);
  };

  const handleCopyLink = (invoice: MockInvoice) => {
    const publicUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/f/${invoice.id}`
        : "";
    if (publicUrl && navigator?.clipboard) {
      navigator.clipboard.writeText(publicUrl);
    }
    showToast({
      type: "info",
      title: "Lien copié",
      message: `Le lien public pour la facture ${invoice.number} a été copié.`,
    });
    setOpenMenuId(null);
  };

  // Count per tab
  const counts = useMemo(() => {
    return {
      all: invoices.length,
      paid: invoices.filter((i) => i.displayStatus === "paid").length,
      sent: invoices.filter((i) => i.displayStatus === "sent").length,
      overdue: invoices.filter((i) => i.displayStatus === "overdue").length,
      draft: invoices.filter((i) => i.displayStatus === "draft").length,
    };
  }, [invoices]);

  // Filtered list
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Tab filter
      if (activeTab !== "all" && invoice.displayStatus !== activeTab) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesNumber = invoice.number.toLowerCase().includes(q);
        const matchesClient = invoice.customerName.toLowerCase().includes(q);
        const matchesCity = invoice.customerCity.toLowerCase().includes(q);
        const matchesCountry = invoice.customerCountry.toLowerCase().includes(q);
        return matchesNumber || matchesClient || matchesCity || matchesCountry;
      }
      return true;
    });
  }, [invoices, activeTab, searchQuery]);

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map((i) => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-card overflow-hidden">
      {/* Header with Title and Search/Actions */}
      <div className="p-3.5 sm:p-5 lg:p-6 border-b border-line">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-forest-950">
                {t("dash_recent_invoices", "Dernières factures")}
              </h2>
              <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-sage-600 tabular">
                {filteredInvoices.length} {filteredInvoices.length > 1 ? t("table_displayed_suffix_plural", "affichées") : t("table_displayed_suffix", "affichée")}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-ink-muted hidden xs:block">
              {t("table_recent_invoices_sub", "Suivi en temps réel de vos émissions, encaissements et retards.")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sage-400" />
              <input
                type="text"
                placeholder={t("table_filter_placeholder", "Filtrer client, N°...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-line bg-sage-50/70 py-1.5 pl-8 pr-3 text-xs text-forest-950 placeholder:text-sage-400 focus:border-forest-700 focus:bg-surface focus:outline-hidden transition-all"
              />
            </div>

            {/* View all link */}
            <Link
              href="/factures"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shrink-0"
            >
              <span>{t("table_all_invoices", "Toutes les factures")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs (Unified Segmented Control Design) */}
        <div className="mt-3.5 sm:mt-5 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="inline-flex items-center gap-1 p-1 bg-sage-100/70 dark:bg-forest-950/80 rounded-2xl border border-line dark:border-forest-800/60 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "all"
                  ? "bg-forest-900 text-surface dark:bg-forest-800 dark:text-lime-300 shadow-xs"
                  : "text-sage-600 dark:text-sage-400 hover:bg-surface/80 dark:hover:bg-forest-900/60 hover:text-forest-900 dark:hover:text-forest-100"
              }`}
            >
              <span>{t("dash_view_all", "Toutes")}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular ${
                  activeTab === "all"
                    ? "bg-forest-800 text-lime-400 dark:bg-forest-900 dark:text-lime-400"
                    : "bg-sage-200/80 dark:bg-forest-850 text-sage-600 dark:text-sage-300"
                }`}
              >
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("paid")}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "paid"
                  ? "bg-forest-900 text-surface dark:bg-forest-800 dark:text-lime-300 shadow-xs"
                  : "text-sage-600 dark:text-sage-400 hover:bg-surface/80 dark:hover:bg-forest-900/60 hover:text-forest-900 dark:hover:text-forest-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{t("status_paid", "Payées")}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular ${
                  activeTab === "paid"
                    ? "bg-forest-800 text-lime-400 dark:bg-forest-900 dark:text-lime-400"
                    : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                }`}
              >
                {counts.paid}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sent")}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "sent"
                  ? "bg-forest-900 text-surface dark:bg-forest-800 dark:text-lime-300 shadow-xs"
                  : "text-sage-600 dark:text-sage-400 hover:bg-surface/80 dark:hover:bg-forest-900/60 hover:text-forest-900 dark:hover:text-forest-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{t("status_sent", "Envoyées")}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular ${
                  activeTab === "sent"
                    ? "bg-forest-800 text-lime-400 dark:bg-forest-900 dark:text-lime-400"
                    : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300"
                }`}
              >
                {counts.sent}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("overdue")}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "overdue"
                  ? "bg-forest-900 text-surface dark:bg-forest-800 dark:text-lime-300 shadow-xs"
                  : "text-sage-600 dark:text-sage-400 hover:bg-surface/80 dark:hover:bg-forest-900/60 hover:text-forest-900 dark:hover:text-forest-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>{t("status_overdue", "En retard")}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular ${
                  activeTab === "overdue"
                    ? "bg-forest-800 text-lime-400 dark:bg-forest-900 dark:text-lime-400"
                    : "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300"
                }`}
              >
                {counts.overdue}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("draft")}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "draft"
                  ? "bg-forest-900 text-surface dark:bg-forest-800 dark:text-lime-300 shadow-xs"
                  : "text-sage-600 dark:text-sage-400 hover:bg-surface/80 dark:hover:bg-forest-900/60 hover:text-forest-900 dark:hover:text-forest-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
              <span>{t("status_draft", "Brouillons")}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular ${
                  activeTab === "draft"
                    ? "bg-forest-800 text-lime-400 dark:bg-forest-900 dark:text-lime-400"
                    : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                }`}
              >
                {counts.draft}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table View (hidden on small mobile screens) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line bg-sage-50/50 text-sage-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="w-10 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={
                    filteredInvoices.length > 0 &&
                    selectedInvoices.length === filteredInvoices.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded-sm border-line text-forest-900 focus:ring-forest-700"
                  aria-label="Tout sélectionner"
                />
              </th>
              <th className="px-4 py-3">{t("inv_number", "N° Facture")}</th>
              <th className="px-4 py-3">{t("inv_client", "Client")}</th>
              <th className="px-4 py-3">{t("inv_issue_date", "Date d'émission")}</th>
              <th className="px-4 py-3">{t("inv_due_date", "Échéance")}</th>
              <th className="px-4 py-3 text-right">{t("inv_total_ttc", "Montant TTC")}</th>
              <th className="px-4 py-3 text-center">{t("action_status", "Statut")}</th>
              <th className="px-4 py-3 text-right">{t("table_th_actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-ink-muted">
                  <FileText className="mx-auto h-8 w-8 text-sage-300 mb-2" />
                  <p className="font-medium text-forest-950 dark:text-white">{t("table_empty_title", "Aucune facture trouvée")}</p>
                  <p className="text-xs text-sage-500 mt-0.5 mb-3">
                    {invoices.length === 0
                      ? "Vous n'avez pas encore émis de facture. Créez votre première facture FCFA dès maintenant !"
                      : t("table_empty_desc", "Modifiez vos filtres ou effectuez une autre recherche.")}
                  </p>
                  {invoices.length === 0 && (
                    <Link
                      href="/factures/nouvelle"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-950 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Créer une facture</span>
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => {
                const isSelected = selectedInvoices.includes(invoice.id);
                const isOverdue = invoice.displayStatus === "overdue";

                return (
                  <tr
                    key={invoice.id}
                    className={`group hover:bg-sage-50/80 transition-colors ${
                      isSelected ? "bg-lime-50/40" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(invoice.id)}
                        className="rounded-sm border-line text-forest-900 focus:ring-forest-700"
                        aria-label={`Sélectionner facture ${invoice.number}`}
                      />
                    </td>

                    {/* Invoice Number */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Link
                        href={`/factures/${invoice.id}`}
                        className="flex items-center gap-2 group/link"
                        title={`Ouvrir la facture ${invoice.number}`}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sage-100 dark:bg-sage-900/60 text-forest-800 dark:text-forest-100 border border-line-subtle group-hover/link:bg-forest-900 group-hover/link:text-lime-400 transition-colors">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-forest-950 tabular group-hover/link:text-forest-800 group-hover/link:underline">
                          {invoice.number}
                        </span>
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <Link
                          href={`/clients/${invoice.customerId}`}
                          className="font-semibold text-forest-950 hover:text-forest-800 hover:underline truncate"
                          title={`Fiche client de ${invoice.customerName}`}
                        >
                          {invoice.customerName}
                        </Link>
                        <span className="text-[11px] text-ink-muted flex items-center gap-1">
                          <span>{invoice.customerContact}</span>
                          <span>·</span>
                          <span>
                            {invoice.customerCity}, {invoice.customerCountry}
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* Issue Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap tabular text-sage-600">
                      {formatDate(invoice.issueDate)}
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap tabular">
                      <span
                        className={
                          isOverdue ? "font-semibold text-rose-700 flex items-center gap-1" : "text-sage-600"
                        }
                      >
                        {isOverdue && <AlertTriangle className="w-3 h-3" />}
                        {formatDate(invoice.dueDate)}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex flex-col items-end">
                        <span className="tabular font-bold text-forest-950 text-sm">
                          {formatFCFA(invoice.total)}
                        </span>
                        {invoice.amountPaid > 0 && invoice.amountPaid < invoice.total && (
                          <span className="text-[10px] text-emerald-700 tabular">
                            Payé : {formatFCFA(invoice.amountPaid)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <StatusBadge status={invoice.displayStatus} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Eye Button: View Invoice */}
                        <Link
                          href={`/factures/${invoice.id}`}
                          className="rounded-lg p-1.5 text-sage-500 hover:text-forest-900 hover:bg-sage-100 transition-colors"
                          title={t("action_view_invoice", "Visualiser la facture")}
                          aria-label={t("action_view_invoice", "Visualiser la facture")}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Download PDF Button */}
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(invoice)}
                          className="rounded-lg p-1.5 text-sage-500 hover:text-forest-900 hover:bg-sage-100 transition-colors"
                          title={t("action_download_pdf", "Imprimer / Enregistrer en PDF")}
                          aria-label={t("action_download_pdf", "Imprimer / Enregistrer en PDF")}
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Three Dots Menu: More Actions */}
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(openMenuId === invoice.id ? null : invoice.id)
                            }
                            className={`rounded-lg p-1.5 transition-colors ${
                              openMenuId === invoice.id
                                ? "bg-forest-900 text-lime-400"
                                : "text-sage-500 hover:text-forest-900 hover:bg-sage-100"
                            }`}
                            title={t("action_more_actions", "Plus d'actions")}
                            aria-label={t("action_more_actions", "Plus d'actions")}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === invoice.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setOpenMenuId(null)}
                                aria-hidden="true"
                              />
                              <div className="absolute right-0 mt-1 z-40 w-52 rounded-xl border border-line bg-surface p-1 shadow-dropdown text-xs text-left animate-in fade-in-50 zoom-in-95">
                                <Link
                                  href={`/factures/${invoice.id}`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-forest-950 hover:bg-sage-100 transition-colors font-medium"
                                >
                                  <Eye className="w-3.5 h-3.5 text-sage-500" />
                                  <span>{t("action_view_invoice", "Visualiser la facture")}</span>
                                </Link>
                                <Link
                                  href={`/factures/${invoice.id}/modifier`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-forest-950 hover:bg-sage-100 transition-colors font-medium"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-sage-500" />
                                  <span>{t("action_edit_invoice", "Modifier la facture")}</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleShareWhatsApp(invoice)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors font-medium"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{t("action_share_whatsapp", "Partager sur WhatsApp")}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExportCSV(invoice)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-forest-950 hover:bg-sage-100 transition-colors font-medium"
                                >
                                  <FileSpreadsheet className="w-3.5 h-3.5 text-forest-700" />
                                  <span>{t("action_export_csv", "Exporter en CSV")}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(invoice)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-forest-950 hover:bg-sage-100 transition-colors font-medium"
                                >
                                  <Copy className="w-3.5 h-3.5 text-sage-500" />
                                  <span>{t("action_copy_link", "Copier le lien public")}</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (<768px) */}
      <div className="md:hidden divide-y divide-line-subtle">
        {filteredInvoices.length === 0 ? (
          <div className="py-10 px-4 text-center text-ink-muted">
            <FileText className="mx-auto h-8 w-8 text-sage-300 mb-2" />
            <p className="font-medium text-forest-950">{t("table_empty_title", "Aucune facture trouvée")}</p>
            <p className="text-xs text-sage-500 mt-0.5">{t("table_empty_desc", "Modifiez vos filtres ou effectuez une autre recherche.")}</p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="p-3.5 hover:bg-sage-50/60 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-forest-950 tabular">
                      {invoice.number}
                    </span>
                    <span className="text-[10px] text-ink-muted">· {formatDate(invoice.issueDate)}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-forest-900 mt-0.5 truncate">
                    {invoice.customerName}
                  </h3>
                  <p className="text-[11px] text-ink-muted truncate">
                    {invoice.customerCity}, {invoice.customerCountry}
                  </p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={invoice.displayStatus} />
                </div>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between border-t border-line-subtle pt-2 text-xs">
                <div className="text-[11px]">
                  <span className="text-ink-muted">Échéance : </span>
                  <span
                    className={
                      invoice.displayStatus === "overdue"
                        ? "font-semibold text-rose-700"
                        : "text-forest-900 font-medium"
                    }
                  >
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>
                <div className="tabular text-xs sm:text-sm font-bold text-forest-950">
                  {formatFCFA(invoice.total)}
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-end gap-2">
                <Link
                  href={`/factures/${invoice.id}`}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs"
                  title={t("action_view_invoice", "Visualiser la facture")}
                >
                  <Eye className="w-3.5 h-3.5 text-sage-500" />
                  <span>{t("action_view_invoice", "Aperçu")}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(invoice)}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs"
                  title={t("action_download_pdf", "Télécharger la facture")}
                >
                  <Download className="w-3.5 h-3.5 text-sage-500" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-t border-line bg-sage-50/40 text-xs text-ink-muted">
        <div>
          <strong className="text-forest-950 font-semibold">{filteredInvoices.length}</strong>{" "}
          <span>{t("table_displayed_suffix", "facture(s) affichée(s)")}</span> ·{" "}
          <span>Total :</span> <strong className="text-forest-950 font-semibold">{invoices.length}</strong>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="rounded-lg border border-line bg-surface px-3 py-1.5 font-medium text-sage-400 opacity-60 cursor-not-allowed"
          >
            {t("period_prev_month", "Précédent")}
          </button>
          <span className="px-2 py-1 font-semibold text-forest-950">1</span>
          <button
            type="button"
            disabled
            className="rounded-lg border border-line bg-surface px-3 py-1.5 font-medium text-sage-400 opacity-60 cursor-not-allowed"
          >
            {t("period_next_month", "Suivant")}
          </button>
        </div>
      </div>
    </div>
  );
}

