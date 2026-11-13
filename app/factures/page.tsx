"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatFCFA } from "@/lib/format/money";
import { formatDate } from "@/lib/format/date";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import type { DisplayStatus } from "@/lib/domain/types";
import {
  Plus,
  Search,
  Download,
  Eye,
  Filter,
  ArrowUpDown,
  MoreVertical,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Clock,
  RotateCcw,
  Calendar as CalendarIcon,
} from "lucide-react";

type StatusTab = "all" | DisplayStatus;

export default function InvoicesPage() {
  const {
    invoices: storeInvoices,
    filteredInvoices,
    dateFilter,
    resetDateFilter,
    metrics,
    showToast,
  } = useData();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Status counts based on filtered invoices
  const counts = useMemo(() => {
    return {
      all: filteredInvoices.length,
      paid: filteredInvoices.filter((i) => i.displayStatus === "paid").length,
      sent: filteredInvoices.filter((i) => i.displayStatus === "sent").length,
      overdue: filteredInvoices.filter((i) => i.displayStatus === "overdue").length,
      draft: filteredInvoices.filter((i) => i.displayStatus === "draft").length,
    };
  }, [filteredInvoices]);

  // Filtered and sorted invoices
  const invoices = useMemo(() => {
    return filteredInvoices.filter((inv) => {
      if (activeTab !== "all" && inv.displayStatus !== activeTab) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          inv.number.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          inv.customerCity.toLowerCase().includes(q) ||
          inv.customerCountry.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? b.issueDate.localeCompare(a.issueDate)
          : a.issueDate.localeCompare(b.issueDate);
      } else {
        return sortOrder === "desc" ? b.total - a.total : a.total - b.total;
      }
    });
  }, [filteredInvoices, activeTab, searchQuery, sortBy, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedIds.length === invoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(invoices.map((i) => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const exportToCSV = (targetInvoices: typeof invoices = invoices) => {
    if (targetInvoices.length === 0) {
      showToast({
        type: "info",
        title: "Aucune facture à exporter",
        message: "Il n'y a aucune facture correspondant à vos filtres actuels.",
      });
      return;
    }

    const headers = [
      "Numéro",
      "Client",
      "Ville",
      "Pays",
      "Date d'émission",
      "Date d'échéance",
      "Sous-total HT (FCFA)",
      "Taux TVA",
      "Montant TVA (FCFA)",
      "Total TTC (FCFA)",
      "Montant Encaissé (FCFA)",
      "Reste à payer (FCFA)",
      "Statut",
    ];

    const statusTranslations: Record<string, string> = {
      paid: "Payée",
      sent: "Envoyée",
      overdue: "En retard",
      draft: "Brouillon",
      cancelled: "Annulée",
    };

    const rows = targetInvoices.map((inv) => [
      `"${inv.number}"`,
      `"${(inv.customerName || "").replace(/"/g, '""')}"`,
      `"${(inv.customerCity || "").replace(/"/g, '""')}"`,
      `"${(inv.customerCountry || "").replace(/"/g, '""')}"`,
      `"${inv.issueDate}"`,
      `"${inv.dueDate}"`,
      Math.round(inv.subtotal),
      `${inv.vatRate || 18} %`,
      Math.round(inv.vatAmount),
      Math.round(inv.total),
      Math.round(inv.amountPaid || 0),
      Math.round(inv.total - (inv.amountPaid || 0)),
      `"${statusTranslations[inv.displayStatus] || inv.displayStatus}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `danhomey_factures_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: "success",
      title: "Export CSV téléchargé",
      message: `${targetInvoices.length} facture(s) exportée(s) avec succès (compatible Excel).`,
    });
  };

  const handleCopyLink = (inv: typeof invoices[number]) => {
    const publicUrl =
      typeof window !== "undefined" ? `${window.location.origin}/factures/${inv.id}` : "";
    if (publicUrl && navigator?.clipboard) {
      navigator.clipboard.writeText(publicUrl);
    }
    showToast({
      type: "info",
      title: "Lien copié",
      message: `Le lien de la facture ${inv.number} a été copié dans le presse-papier.`,
    });
  };

  return (
    <DashboardShell>
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Link href="/" className="hover:text-forest-900">
              {t("nav_dashboard", "Tableau de bord")}
            </Link>
            <span>/</span>
            <span className="font-semibold text-forest-950">{t("nav_invoices", "Factures")}</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">
            {t("nav_invoices", "Gestion des factures")}
          </h1>
          <p className="text-xs text-ink-muted sm:text-sm mt-0.5">
            Consultez, émettez, encaissez et suivez l&apos;ensemble de vos factures clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportToCSV(invoices)}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs active:scale-95"
            title="Exporter les factures au format CSV (Excel)"
          >
            <Download className="w-3.5 h-3.5 text-sage-500" />
            <span>{t("action_export_csv", "Exporter CSV")}</span>
          </button>

          <Link
            href="/factures/nouvelle"
            className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2 text-xs font-semibold text-surface shadow-sm hover:bg-forest-850 hover:shadow transition-all group active:scale-95"
          >
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-lime-400 text-forest-950 group-hover:rotate-90 transition-transform">
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>{t("nav_new_invoice", "Nouvelle facture")}</span>
          </Link>
        </div>
      </div>

      {/* Mini Summary Strip (Vantus ERP style) */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <div className="rounded-2xl border border-line bg-surface p-3 sm:p-3.5 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-sage-500 uppercase tracking-wider">
            {t("dash_total_invoiced", "Total facturé")}
          </span>
          <p className="tabular mt-1 text-sm sm:text-base lg:text-lg font-bold text-forest-950 truncate">
            {formatFCFA(metrics.totalInvoiced.amount)}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/40 p-3 sm:p-3.5 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            {t("dash_total_collected", "Total encaissé")}
          </span>
          <p className="tabular mt-1 text-sm sm:text-base lg:text-lg font-bold text-emerald-900 dark:text-emerald-100 truncate">
            {formatFCFA(metrics.totalCollected.amount)}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/40 p-3 sm:p-3.5 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            {t("dash_pending_amount", "En attente")}
          </span>
          <p className="tabular mt-1 text-sm sm:text-base lg:text-lg font-bold text-amber-950 dark:text-amber-100 truncate">
            {formatFCFA(metrics.pendingAmount.total)}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-200/80 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/40 p-3 sm:p-3.5 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
            {t("status_overdue", "En retard")}
          </span>
          <p className="tabular mt-1 text-sm sm:text-base lg:text-lg font-bold text-rose-900 dark:text-rose-100 truncate">
            {formatFCFA(metrics.pendingAmount.overduePart)}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-line bg-surface shadow-card overflow-hidden">
        {/* Active Date Filter Alert Bar */}
        {dateFilter.preset !== "all" && (
          <div className="mx-3.5 mt-3.5 sm:mx-5 sm:mt-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40 px-3.5 py-2.5 text-xs text-emerald-950 dark:text-emerald-100 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <CalendarIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-ink-muted">Période filtrée : </span>
                <span className="font-bold text-emerald-950 dark:text-emerald-100">{dateFilter.label}</span>
                <span className="ml-2 text-ink-muted">· {counts.all} facture{counts.all > 1 ? "s" : ""}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={resetDateFilter}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface border border-line px-2.5 py-1 text-xs font-semibold text-forest-900 hover:bg-sage-100 transition-colors shrink-0 shadow-2xs"
              title="Réinitialiser et afficher toutes les factures"
            >
              <RotateCcw className="w-3 h-3 text-sage-500" />
              <span>Tout afficher</span>
            </button>
          </div>
        )}

        {/* Controls Toolbar */}
        <div className="p-3.5 sm:p-5 border-b border-line space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Status Tabs */}
            <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === "all"
                    ? "bg-forest-900 text-surface font-semibold shadow-2xs"
                    : "text-sage-600 hover:bg-sage-100"
                }`}
              >
                <span>{t("dash_view_all", "Toutes")}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] tabular ${
                    activeTab === "all" ? "bg-forest-800 text-lime-300" : "bg-sage-200 text-sage-600"
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("paid")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === "paid"
                    ? "bg-emerald-800 text-surface font-semibold"
                    : "text-sage-600 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{t("status_paid", "Payées")}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] tabular ${
                    activeTab === "paid" ? "bg-emerald-900 text-emerald-200" : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {counts.paid}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sent")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === "sent"
                    ? "bg-amber-800 text-surface font-semibold"
                    : "text-sage-600 hover:bg-amber-50 hover:text-amber-800"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{t("status_sent", "Envoyées")}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] tabular ${
                    activeTab === "sent" ? "bg-amber-900 text-amber-200" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {counts.sent}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("overdue")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === "overdue"
                    ? "bg-rose-800 text-surface font-semibold"
                    : "text-sage-600 hover:bg-rose-50 hover:text-rose-800"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>{t("status_overdue", "En retard")}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] tabular ${
                    activeTab === "overdue" ? "bg-rose-900 text-rose-200" : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {counts.overdue}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("draft")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === "draft"
                    ? "bg-stone-800 text-surface font-semibold"
                    : "text-sage-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                <span>{t("status_draft", "Brouillons")}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] tabular ${
                    activeTab === "draft" ? "bg-stone-900 text-stone-200" : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {counts.draft}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sage-400" />
              <input
                type="text"
                placeholder={t("table_filter_placeholder", "Rechercher numéro, client, ville...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-line bg-sage-50/70 py-1.5 pl-8 pr-3 text-xs text-forest-950 placeholder:text-sage-400 focus:border-forest-700 focus:bg-surface focus:outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Batch Actions Toolbar (shows when items are selected) */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-forest-900 px-4 py-2.5 text-xs text-surface animate-in fade-in-50">
              <span className="font-semibold text-lime-400">
                {selectedIds.length} {t("inv_batch_selected", "facture(s) sélectionnée(s)")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const selectedInvs = storeInvoices.filter((i) => selectedIds.includes(i.id));
                    exportToCSV(selectedInvs);
                  }}
                  className="rounded-lg bg-forest-800 px-3 py-1 text-xs hover:bg-forest-700 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3 text-lime-400" />
                  <span>{t("action_export_csv", "Exporter")} ({selectedIds.length})</span>
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-forest-800 px-3 py-1 text-xs hover:bg-forest-700 transition-colors"
                >
                  {t("inv_mark_sent", "Marquer comme envoyées")}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-sage-400 hover:text-surface text-xs underline ml-2"
                >
                  {t("inv_deselect", "Désélectionner")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line bg-sage-50/50 text-sage-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={invoices.length > 0 && selectedIds.length === invoices.length}
                    onChange={toggleSelectAll}
                    className="rounded-sm border-line text-forest-900 focus:ring-forest-700"
                    aria-label="Tout sélectionner"
                  />
                </th>
                <th className="px-4 py-3">{t("inv_number", "N° Facture")}</th>
                <th className="px-4 py-3">{t("inv_client", "Client")}</th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (sortBy === "date") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      else {
                        setSortBy("date");
                        setSortOrder("desc");
                      }
                    }}
                    className="flex items-center gap-1 hover:text-forest-950"
                  >
                    <span>{t("inv_issue_date", "Émission")}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3">{t("inv_due_date", "Échéance")}</th>
                <th className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (sortBy === "amount") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      else {
                        setSortBy("amount");
                        setSortOrder("desc");
                      }
                    }}
                    className="flex items-center gap-1 ml-auto hover:text-forest-950"
                  >
                    <span>{t("inv_total_ttc", "Total TTC")}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center">{t("action_status", "Statut")}</th>
                <th className="px-4 py-3 text-right">{t("table_th_actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-muted">
                    <FileText className="mx-auto h-8 w-8 text-sage-300 mb-2" />
                    <p className="font-medium text-forest-950 dark:text-white">
                      {dateFilter.preset !== "all"
                        ? `Aucune facture pour ${dateFilter.label}`
                        : t("table_empty_title", "Aucune facture trouvée")}
                    </p>
                    <p className="text-xs text-sage-500 mt-0.5 mb-3">
                      {dateFilter.preset !== "all" && storeInvoices.length > 0 ? (
                        <>
                          Aucune facture n&apos;a été émise à cette date ou période.
                          <br />
                          {storeInvoices.length} facture{storeInvoices.length > 1 ? "s existent" : " existe"} en dehors de cette sélection.
                        </>
                      ) : storeInvoices.length === 0 ? (
                        "Vous n'avez pas encore émis de facture. Créez votre première facture FCFA dès maintenant !"
                      ) : (
                        t("table_empty_desc", "Modifiez vos filtres ou effectuez une autre recherche.")
                      )}
                    </p>
                    {dateFilter.preset !== "all" && storeInvoices.length > 0 ? (
                      <button
                        type="button"
                        onClick={resetDateFilter}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-surface text-forest-900 text-xs font-semibold hover:bg-sage-100 transition-colors shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-sage-500" />
                        <span>Tout afficher</span>
                      </button>
                    ) : storeInvoices.length === 0 ? (
                      <Link
                        href="/factures/nouvelle"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-950 transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Créer une facture</span>
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const isSelected = selectedIds.includes(inv.id);
                  const isOverdue = inv.displayStatus === "overdue";

                  return (
                    <tr
                      key={inv.id}
                      className={`group hover:bg-sage-50/70 transition-colors ${
                        isSelected ? "bg-lime-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(inv.id)}
                          className="rounded-sm border-line text-forest-900 focus:ring-forest-700"
                          aria-label={`Sélectionner facture ${inv.number}`}
                        />
                      </td>

                      {/* N° Facture with Link */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Link
                          href={`/factures/${inv.id}`}
                          className="flex items-center gap-2 group-hover:text-forest-700 transition-colors"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sage-100 dark:bg-sage-900/60 text-forest-900 dark:text-forest-100 border border-line-subtle group-hover:bg-lime-100 dark:group-hover:bg-lime-950/80 group-hover:text-forest-950 dark:group-hover:text-lime-300 transition-colors">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-forest-950 tabular underline-offset-2 hover:underline">
                            {inv.number}
                          </span>
                        </Link>
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <Link
                            href={`/clients/${inv.customerId}`}
                            className="font-semibold text-forest-950 hover:underline"
                          >
                            {inv.customerName}
                          </Link>
                          <span className="text-[11px] text-ink-muted">
                            {inv.customerCity}, {inv.customerCountry}
                          </span>
                        </div>
                      </td>

                      {/* Issue Date */}
                      <td className="px-4 py-3.5 tabular text-sage-600 whitespace-nowrap">
                        {formatDate(inv.issueDate)}
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-3.5 tabular whitespace-nowrap">
                        <span
                          className={
                            isOverdue
                              ? "font-semibold text-rose-700 flex items-center gap-1"
                              : "text-sage-600"
                          }
                        >
                          {isOverdue && <AlertTriangle className="w-3 h-3" />}
                          {formatDate(inv.dueDate)}
                        </span>
                      </td>

                      {/* Total TTC */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className="tabular font-bold text-forest-950 text-sm">
                            {formatFCFA(inv.total)}
                          </span>
                          {inv.amountPaid > 0 && inv.amountPaid < inv.total && (
                            <span className="text-[10px] text-emerald-700 tabular">
                              Payé : {formatFCFA(inv.amountPaid)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <StatusBadge status={inv.displayStatus} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/factures/${inv.id}`}
                            className="rounded-lg p-1.5 text-sage-500 hover:text-forest-900 hover:bg-sage-100 transition-colors"
                            title="Aperçu & détails"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => exportToCSV([inv])}
                            className="rounded-lg p-1.5 text-sage-500 hover:text-forest-900 hover:bg-sage-100 transition-colors"
                            title="Exporter en CSV"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(inv)}
                            className="rounded-lg p-1.5 text-sage-500 hover:text-forest-900 hover:bg-sage-100 transition-colors"
                            title="Copier le lien"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-line-subtle">
          {invoices.length === 0 ? (
            <div className="py-10 px-4 text-center text-ink-muted">
              <FileText className="mx-auto h-8 w-8 text-sage-300 mb-2" />
              <p className="font-medium text-forest-950">
                {dateFilter.preset !== "all"
                  ? `Aucune facture pour ${dateFilter.label}`
                  : "Aucune facture trouvée"}
              </p>
              <p className="text-xs text-sage-500 mt-0.5 mb-3">
                {dateFilter.preset !== "all"
                  ? "Aucune facture n'a été émise à cette date ou période."
                  : "Modifiez vos critères de recherche."}
              </p>
              {dateFilter.preset !== "all" && storeInvoices.length > 0 && (
                <button
                  type="button"
                  onClick={resetDateFilter}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-surface text-forest-900 text-xs font-semibold hover:bg-sage-100 transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-sage-500" />
                  <span>Tout afficher</span>
                </button>
              )}
            </div>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} className="p-4 hover:bg-sage-50/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/factures/${inv.id}`}
                      className="text-xs font-bold text-forest-950 tabular hover:underline"
                    >
                      {inv.number}
                    </Link>
                    <h3 className="text-sm font-semibold text-forest-900 mt-0.5">
                      {inv.customerName}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {inv.customerCity}, {inv.customerCountry}
                    </p>
                  </div>
                  <StatusBadge status={inv.displayStatus} />
                </div>

                <div className="mt-3 flex items-baseline justify-between border-t border-line-subtle pt-2 text-xs">
                  <div>
                    <span className="text-ink-muted">Échéance : </span>
                    <span
                      className={
                        inv.displayStatus === "overdue"
                          ? "font-semibold text-rose-700"
                          : "text-forest-900 font-medium"
                      }
                    >
                      {formatDate(inv.dueDate)}
                    </span>
                  </div>
                  <div className="tabular text-sm font-bold text-forest-950">
                    {formatFCFA(inv.total)}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <Link
                    href={`/factures/${inv.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-forest-900 hover:bg-sage-50"
                  >
                    <Eye className="w-3.5 h-3.5 text-sage-500" />
                    <span>Détails</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => exportToCSV([inv])}
                    className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-forest-900 hover:bg-sage-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-sage-500" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-t border-line bg-sage-50/40 text-xs text-ink-muted">
          <div>
            Affichage de <strong className="text-forest-950 font-semibold">{invoices.length}</strong> sur{" "}
            <strong className="text-forest-950 font-semibold">{storeInvoices.length}</strong> factures
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="rounded-lg border border-line bg-surface px-3 py-1.5 font-medium text-sage-400 opacity-60 cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="px-2 py-1 font-semibold text-forest-950">1</span>
            <button
              type="button"
              disabled
              className="rounded-lg border border-line bg-surface px-3 py-1.5 font-medium text-sage-400 opacity-60 cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

