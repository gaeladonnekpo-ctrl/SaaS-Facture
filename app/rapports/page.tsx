"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { formatFCFA } from "@/lib/format/money";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Percent,
  Receipt,
  Users,
  ShieldCheck,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

export default function ReportsPage() {
  const { invoices, customers, organization, metrics, cashflow, showToast } = useData();
  const { t } = useI18n();

  // Financial aggregates
  const vatRate = organization?.vatRate ?? 18;
  const totalInvoiced = metrics?.totalInvoiced?.amount ?? 0;
  const totalCollected = metrics?.totalCollected?.amount ?? 0;
  const pendingAmount = metrics?.pendingAmount?.total ?? 0;
  const overdueAmount = metrics?.pendingAmount?.overduePart ?? 0;
  const overdueCount = metrics?.pendingAmount?.overdueCount ?? 0;

  // TVA Collectée (18% sur les montants encaissés ou facturés selon le régime)
  const totalVat = useMemo(() => {
    return (invoices || []).reduce((s, i) => s + (i.vatAmount || 0), 0);
  }, [invoices]);

  const vatCollected = useMemo(() => {
    return Math.round((totalCollected * vatRate) / (100 + vatRate));
  }, [totalCollected, vatRate]);

  // Top 5 clients by turnover
  const topCustomers = useMemo(() => {
    return [...(customers || [])]
      .sort((a, b) => (b.totalInvoiced || 0) - (a.totalInvoiced || 0))
      .slice(0, 5);
  }, [customers]);

  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  const handleExportCSV = () => {
    const lines: string[] = [];

    // En-tête général
    lines.push(`RAPPORT FINANCIER & FISCALITÉ - DANHOMEY FACTURE`);
    lines.push(`Organisation;${organization?.name || "DANHOMEY Technologies SARL"}`);
    lines.push(`Numéro IFU;${organization?.ifu || ""}`);
    lines.push(`Taux de TVA fiscal;${vatRate} %`);
    lines.push(`Date d'exportation;${new Date().toLocaleDateString("fr-FR")}`);
    lines.push("");

    // Section 1: KPI
    lines.push("SYNTHÈSE FINANCIÈRE GLOBALE");
    lines.push("Indicateur;Montant (FCFA);Détail");
    lines.push(`Chiffre d'affaires facturé;${totalInvoiced};+${metrics?.totalInvoiced?.changePercentage ?? 0} % vs période précédente`);
    lines.push(`Total encaissé (Banque / MoMo);${totalCollected};Taux de recouvrement : ${collectionRate} %`);
    lines.push(`TVA facturée (18 %);${totalVat};Taux normal UEMOA`);
    lines.push(`TVA effectivement encaissée;${vatCollected};Part perçue`);
    lines.push(`Créances en retard échu;${overdueAmount};${overdueCount} factures échues`);
    lines.push("");

    // Section 2: Déclaration TVA
    lines.push("DÉCLARATION FISCALE DE TVA (ZONE UEMOA)");
    lines.push("Poste fiscal;Montant (FCFA)");
    lines.push(`Base hors taxes totale (HT);${Math.round(totalInvoiced / 1.18)}`);
    lines.push(`TVA Brute facturée (18 %);${totalVat}`);
    lines.push(`TVA effectivement encaissée;${vatCollected}`);
    lines.push(`Total facturé toutes taxes comprises (TTC);${totalInvoiced}`);
    lines.push("");

    // Section 3: Trésorerie mensuelle
    lines.push("ÉVOLUTION MENSUELLE 2026");
    lines.push("Mois;Facturé (FCFA);Encaissé (FCFA);Écart (FCFA)");
    cashflow.forEach((m) => {
      lines.push(`${m.month} 2026;${m.invoiced};${m.collected};${m.invoiced - m.collected}`);
    });
    lines.push("");

    // Section 4: Top Clients
    lines.push("TOP CLIENTS PAR VOLUME FACTURÉ");
    lines.push("Rang;Client;Ville;Pays;Total Facturé (FCFA);Reste Dû (FCFA)");
    topCustomers.forEach((c, idx) => {
      lines.push(
        `${idx + 1};"${(c.name || "").replace(/"/g, '""')}";"${c.city || ""}";"${c.country || ""}";${c.totalInvoiced};${c.balanceDue}`
      );
    });

    const csvContent = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `DANHOMEY_Rapport_Financier_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: "success",
      title: "Rapport exporté",
      message: "Le rapport financier et fiscal a été téléchargé en CSV avec succès.",
    });
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
            <span className="font-semibold text-forest-950">{t("nav_reports", "Rapports")}</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">
            {t("rep_title", "Rapports financiers & Fiscalité")}
          </h1>
          <p className="text-xs text-ink-muted sm:text-sm mt-0.5">
            {t("rep_subtitle", "Synthèse d'activité, déclaration de TVA UEMOA (18 %) et performance de recouvrement.")}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs"
            title="Télécharger la synthèse financière et fiscale en fichier CSV (Excel)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-forest-700" />
            <span>{t("action_export_csv", "Exporter CSV")}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-sage-500" />
            <span>{t("rep_export_print", "Exporter le rapport (PDF / Imprimer)")}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-sage-500 uppercase tracking-wider">
            {t("rep_turnover", "Chiffre d'affaires facturé")}
          </span>
          <p className="tabular mt-1 text-xl font-bold text-forest-950 truncate">
            {formatFCFA(totalInvoiced)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{metrics?.totalInvoiced?.changePercentage ?? 0} % {t("rep_vs_previous_period", "vs période précédente")}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/40 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            {t("rep_total_collected_bank_momo", "Total encaissé en banque / MoMo")}
          </span>
          <p className="tabular mt-1 text-xl font-bold text-emerald-950 dark:text-emerald-100 truncate">
            {formatFCFA(totalCollected)}
          </p>
          <div className="mt-2 text-xs text-emerald-800 dark:text-emerald-300">
            {t("rep_collection_rate_prefix", "Taux de recouvrement :")} <strong>{collectionRate} %</strong>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/40 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            {t("rep_vat_invoiced_title", "TVA Facturée (18 %)")}
          </span>
          <p className="tabular mt-1 text-xl font-bold text-amber-950 dark:text-amber-100 truncate">
            {formatFCFA(totalVat)}
          </p>
          <p className="mt-2 text-xs text-amber-800 dark:text-amber-300">
            {t("rep_vat_standard_uemoa", "Taux normal UEMOA applicable")}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200/80 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/40 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
            {t("rep_overdue_claims", "Créances en retard échu")}
          </span>
          <p className="tabular mt-1 text-xl font-bold text-rose-950 dark:text-rose-100 truncate">
            {formatFCFA(overdueAmount)}
          </p>
          <p className="mt-2 text-xs text-rose-800 dark:text-rose-300">
            {t("rep_overdue_invoices_count_prefix", "Sur")} {overdueCount} {t("rep_overdue_invoices_count_suffix", "factures échues")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Monthly Breakdown & Fiscal Declaration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fiscal Summary Card */}
          <div className="rounded-2xl border border-line bg-surface p-5 lg:p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-forest-900" />
                <h2 className="text-sm font-bold text-forest-950">
                  {t("rep_vat_declaration", "Déclaration fiscale de TVA (Zone UEMOA)")}
                </h2>
              </div>
              <span className="inline-flex items-center rounded-full bg-lime-100 dark:bg-lime-950/80 px-2.5 py-0.5 text-[10px] font-bold text-forest-950 dark:text-lime-300 border border-lime-300/80 dark:border-lime-500/50">
                {t("inv_vat_rate", "Taux")} {organization.vatRate} %
              </span>
            </div>

            <p className="text-xs text-sage-600 leading-relaxed">
              {t("rep_vat_explanation", "Ce tableau récapitule la base imposable et la TVA collectée calculées automatiquement sur la période en cours conformément aux règles fiscales en vigueur (Bénin, Sénégal, Côte d'Ivoire, Togo, etc.).")}
            </p>

            <div className="divide-y divide-line-subtle border border-line rounded-xl overflow-hidden text-xs">
              <div className="flex items-center justify-between p-3 bg-sage-50/50">
                <span className="font-medium text-sage-600">{t("rep_vat_base", "Base hors taxes totale (HT) :")}</span>
                <span className="tabular font-bold text-forest-950">
                  {formatFCFA(Math.round(totalInvoiced / 1.18))}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface">
                <span className="font-medium text-sage-600">{t("rep_vat_gross", "TVA Brute facturée (18 %) :")}</span>
                <span className="tabular font-bold text-forest-950">
                  {formatFCFA(totalVat)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface">
                <span className="font-medium text-emerald-800">{t("rep_vat_actually_collected", "TVA effectivement encaissée :")}</span>
                <span className="tabular font-bold text-emerald-700">
                  {formatFCFA(vatCollected)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-sage-50/70 font-bold">
                <span className="text-forest-950">{t("inv_total_ttc", "Total facturé toutes taxes comprises (TTC) :")}</span>
                <span className="tabular text-forest-950 text-sm">
                  {formatFCFA(totalInvoiced)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Cashflow Table */}
          <div className="rounded-2xl border border-line bg-surface p-5 lg:p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-forest-900" />
                <h2 className="text-sm font-bold text-forest-950">
                  {t("rep_monthly_cashflow", "Évolution mensuelle Facturation vs Encaissements")}
                </h2>
              </div>
              <span className="text-xs text-ink-muted">Exercice 2026</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-sage-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">{t("rep_col_month", "Mois")}</th>
                    <th className="py-2.5 px-3 text-right">{t("rep_col_invoiced", "Facturé HT & TTC")}</th>
                    <th className="py-2.5 px-3 text-right">{t("rep_col_collected", "Encaissé")}</th>
                    <th className="py-2.5 px-3 text-right">{t("rep_col_gap", "Écart")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-subtle">
                  {cashflow.map((m) => {
                    const diff = m.invoiced - m.collected;
                    return (
                      <tr key={m.month} className="hover:bg-sage-50/50">
                        <td className="py-2.5 px-3 font-semibold text-forest-950">
                          {m.month} 2026
                        </td>
                        <td className="py-2.5 px-3 text-right tabular text-forest-950 font-medium">
                          {formatFCFA(m.invoiced)}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular text-emerald-700 font-semibold">
                          {formatFCFA(m.collected)}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular text-rose-700 font-medium">
                          {diff > 0 ? `-${formatFCFA(diff)}` : t("rep_settled_balance", "Solde réglé")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Top Clients */}
        <div className="space-y-6">
          {/* Top 5 Customers Card */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-forest-900" />
                <h3 className="text-xs font-semibold text-sage-600 uppercase tracking-wider">
                  {t("rep_top_customers_title", "Top 5 Clients par CA")}
                </h3>
              </div>
              <Link
                href="/clients"
                className="text-[11px] font-semibold text-forest-900 hover:underline"
              >
                {t("dash_view_all", "Voir tous")}
              </Link>
            </div>

            <div className="space-y-3">
              {topCustomers.map((cust, idx) => {
                const percent = totalInvoiced > 0 ? Math.round((cust.totalInvoiced / totalInvoiced) * 100) : 0;
                return (
                  <div key={cust.id} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-forest-950 truncate max-w-[180px]">
                        {idx + 1}. {cust.name}
                      </span>
                      <span className="tabular font-bold text-forest-900">
                        {formatFCFA(cust.totalInvoiced)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-sage-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-forest-900 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-ink-muted">
                      <span>{cust.city}, {cust.country}</span>
                      <span>{percent} % du volume total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal Compliance OHADA Card */}
          <div className="rounded-2xl border border-lime-300/80 bg-lime-50/60 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-forest-950">
              <ShieldCheck className="w-4 h-4 text-forest-900" />
              <span>{t("rep_ohada_compliance_title", "Conformité OHADA & DGI")}</span>
            </div>
            <p className="text-[11px] text-sage-600 leading-relaxed">
              {t("rep_ohada_compliance_desc", "Toutes les données de facturation sont calculées en FCFA selon l'Acte Uniforme OHADA portant sur le droit commercial général et les livres comptables légaux.")}
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
