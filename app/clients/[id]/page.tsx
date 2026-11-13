"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatFCFA } from "@/lib/format/money";
import { formatDate } from "@/lib/format/date";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import { getCustomerById, getInvoicesByCustomerId } from "@/lib/mock-data";
import {
  ArrowLeft,
  Plus,
  Mail,
  Phone,
  Building2,
  FileText,
  MapPin,
  Calendar,
  AlertTriangle,
  Download,
  Eye,
  ArrowRight,
} from "lucide-react";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = use(params);
  const { t } = useI18n();
  const { isHydrated, customers, invoices: allInvoices, showToast } = useData();
  const customer = customers.find((c) => c.id === id) ?? getCustomerById(id);
  const invoices = allInvoices.filter((i) => i.customerId === id);

  if (!customer) {
    if (!isHydrated) {
      return (
        <DashboardShell>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest-800 border-t-transparent mb-3" />
            <p className="text-sm font-semibold text-forest-950">Chargement de la fiche client...</p>
          </div>
        </DashboardShell>
      );
    }
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-line bg-surface p-8 shadow-card">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-300 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-forest-950">
            {t("cust_not_found_title", "Client introuvable")}
          </h2>
          <p className="text-xs text-sage-600 mt-1 max-w-md">
            {t("cust_not_found_desc", "Ce compte client n'existe pas ou a été supprimé.")}
          </p>
          <Link
            href="/clients"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2 text-xs font-semibold text-surface shadow-sm hover:bg-forest-850"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("cust_back_to_list", "Retour à la liste des clients")}</span>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const exportCustomerInvoicesCSV = () => {
    if (invoices.length === 0) {
      showToast({ type: "info", message: "Aucune facture à exporter pour ce client." });
      return;
    }

    const headers = [
      "Numéro de facture",
      "Client",
      "Date d'émission",
      "Date d'échéance",
      "Montant HT (FCFA)",
      "TVA 18% (FCFA)",
      "Montant TTC (FCFA)",
      "Montant réglé (FCFA)",
      "Reste à payer (FCFA)",
      "Statut",
    ];

    const rows = invoices.map((inv) => [
      inv.number,
      `"${inv.customerName.replace(/"/g, '""')}"`,
      inv.issueDate,
      inv.dueDate,
      inv.subtotal,
      inv.vatAmount,
      inv.total,
      inv.amountPaid,
      inv.total - inv.amountPaid,
      `"${inv.displayStatus}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Factures_${customer.name.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: "success",
      title: "Export réussi",
      message: `${invoices.length} facture(s) de ${customer.name} exportée(s) en CSV.`,
    });
  };

  return (
    <DashboardShell>
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-forest-900 hover:bg-sage-100 transition-colors shadow-2xs"
            title="Retour à la liste des clients"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Link href="/clients" className="hover:text-forest-900 transition-colors">
                {t("nav_customers", "Clients")}
              </Link>
              <span>/</span>
              <span className="font-semibold text-forest-900">{customer.name}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">
              {t("cust_title", "Fiche client")} : {customer.name}
            </h1>
          </div>
        </div>

        <Link
          href={`/factures/nouvelle?customer=${customer.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2 text-xs font-semibold text-surface shadow-sm hover:bg-forest-850 hover:shadow transition-all group shrink-0 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-lime-400" />
          <span>{t("nav_new_invoice", "Nouvelle facture")}</span>
        </Link>
      </div>

      {/* Client Identity Hero Card */}
      <div className="rounded-card border border-line bg-surface p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-line">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-900 text-lime-400 font-extrabold text-xl shadow-xs">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-forest-950">{customer.name}</h2>
              <p className="text-xs text-sage-600 mt-0.5">{customer.contactPerson}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-2.5 py-0.5 text-[11px] font-medium text-forest-900">
                  <MapPin className="w-3 h-3 text-sage-500" />
                  {customer.city}, {customer.country}
                </span>
                <span className="inline-flex items-center rounded-full bg-lime-100 dark:bg-lime-950/80 px-2.5 py-0.5 text-[11px] font-bold text-forest-950 dark:text-lime-300 border border-lime-300/80 dark:border-lime-500/50">
                  IFU : {customer.taxId}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-sage-600 space-y-1.5 sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-line-subtle">
            <p className="flex sm:justify-end items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sage-400" />
              <span>{customer.email}</span>
            </p>
            <p className="flex sm:justify-end items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sage-400" />
              <span className="tabular">{customer.phone}</span>
            </p>
            <p className="text-ink-muted">{customer.address}</p>
          </div>
        </div>

        {/* 3 Metric Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="rounded-xl border border-line bg-sage-50/50 p-4">
            <span className="text-[11px] font-semibold text-sage-500 uppercase tracking-wider">
              {t("cust_total_invoiced", "Total facturé à ce client")}
            </span>
            <p className="tabular mt-1 text-lg font-bold text-forest-950">
              {formatFCFA(customer.totalInvoiced)}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/40 p-4">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {t("dash_total_collected", "Total encaissé")}
            </span>
            <p className="tabular mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-100">
              {formatFCFA(customer.totalPaid)}
            </p>
          </div>
          <div className="rounded-xl border border-rose-200/80 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/40 p-4">
            <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              {t("cust_balance_due", "Solde restant dû")}
            </span>
            <p className="tabular mt-1 text-lg font-bold text-rose-900 dark:text-rose-100">
              {formatFCFA(customer.balanceDue)}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Invoices History */}
      <div className="rounded-card border border-line bg-surface shadow-card overflow-hidden">
        <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-forest-950">
              {t("cust_detail_invoices_history", "Historique des factures")} ({invoices.length})
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {t("cust_detail_invoices_subtitle", "Toutes les factures émises pour ce client.")}
            </p>
          </div>
          {invoices.length > 0 && (
            <button
              type="button"
              onClick={exportCustomerInvoicesCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs self-start sm:self-auto"
              title="Exporter les factures de ce client en CSV"
            >
              <Download className="w-3.5 h-3.5 text-sage-600" />
              <span>{t("action_export_csv", "Exporter CSV")}</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line bg-sage-50/50 text-sage-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">{t("inv_number", "N° Facture")}</th>
                <th className="px-4 py-3">{t("inv_issue_date", "Date d'émission")}</th>
                <th className="px-4 py-3">{t("inv_due_date", "Échéance")}</th>
                <th className="px-4 py-3 text-right">{t("inv_total_ttc", "Montant TTC")}</th>
                <th className="px-4 py-3 text-center">{t("action_status", "Statut")}</th>
                <th className="px-4 py-3 text-right">{t("table_th_actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    {t("table_empty_title", "Aucune facture enregistrée pour ce client.")}
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-sage-50/70">
                    <td className="px-4 py-3.5 font-semibold text-forest-950 tabular">
                      <Link
                        href={`/factures/${inv.id}`}
                        className="hover:underline flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-sage-400" />
                        <span>{inv.number}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 tabular text-sage-600">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="px-4 py-3.5 tabular text-sage-600">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular font-bold text-forest-950">
                      {formatFCFA(inv.total)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={inv.displayStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/factures/${inv.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-forest-900 hover:bg-sage-100"
                      >
                        <span>{t("action_view", "Voir")}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

