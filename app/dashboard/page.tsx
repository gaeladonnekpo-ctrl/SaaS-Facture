"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCards } from "@/components/dashboard/stat-cards";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { RecentInvoicesTable } from "@/components/dashboard/recent-invoices-table";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import { Building2, ShieldAlert, Calendar as CalendarIcon, RotateCcw } from "lucide-react";

export default function DashboardPage() {
  const {
    metrics,
    cashflow,
    filteredInvoices,
    invoices: allInvoices,
    dateFilter,
    resetDateFilter,
    organization,
    user,
  } = useData();
  const { language, t } = useI18n();

  return (
    <DashboardShell>
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 rounded-2xl border border-line bg-gradient-to-r from-surface via-surface to-sage-50/70 p-3.5 sm:p-5 lg:p-6 shadow-card">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 dark:bg-lime-950/80 px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold text-forest-950 dark:text-lime-300 border border-lime-300/80 dark:border-lime-500/50 shrink-0">
              <Building2 className="w-3 h-3 text-forest-800 dark:text-lime-400" />
              {t("dash_business_space", "Espace Entreprise")}
            </span>
            <span className="text-xs text-ink-muted">·</span>
            <span className="text-[11px] sm:text-xs text-ink-muted truncate">
              {organization.city}, {organization.country}
            </span>
          </div>
          <h1 className="mt-1.5 text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-forest-950">
            {t("dash_welcome", "Ravi de vous revoir")}, {user.name} 👋
          </h1>
          <p className="mt-0.5 text-xs text-ink-muted sm:text-sm">
            {dateFilter.preset !== "all" ? (
              <>
                Voici l&apos;état de votre facturation pour :{" "}
                <strong className="text-forest-900 font-semibold">{dateFilter.label}</strong>.
              </>
            ) : (
              <>Voici l&apos;état global de l&apos;ensemble de votre facturation.</>
            )}
          </p>
        </div>

        {/* Quick summary alert pill */}
        <div className="flex items-center sm:self-center shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/90 dark:bg-rose-950/50 px-3 py-1.5 text-xs text-rose-800 dark:text-rose-200 shadow-2xs">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="whitespace-nowrap">
              <strong className="font-bold">{metrics.invoicesCount.overdue}</strong> {t("dash_overdue_alert", "factures en retard")}
            </span>
          </div>
        </div>
      </div>

      {/* Active Date Filter Alert Bar (when filtered) */}
      {dateFilter.preset !== "all" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40 p-3 sm:px-4 sm:py-3 text-xs text-emerald-950 dark:text-emerald-100 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-ink-muted">Indicateurs et factures filtrés sur : </span>
              <strong className="font-bold text-emerald-950 dark:text-emerald-100">{dateFilter.label}</strong>
              <span className="ml-2 text-ink-muted">· {filteredInvoices.length} facture{filteredInvoices.length > 1 ? "s" : ""}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={resetDateFilter}
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface border border-line px-2.5 py-1 text-xs font-semibold text-forest-900 hover:bg-sage-100 transition-colors shrink-0 shadow-2xs"
            title="Réinitialiser et afficher toutes les dates"
          >
            <RotateCcw className="w-3 h-3 text-sage-500" />
            <span>Tout afficher</span>
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <section aria-labelledby="kpis-heading">
        <h2 id="kpis-heading" className="sr-only">
          Indicateurs clés de performance
        </h2>
        <StatCards metrics={metrics} />
      </section>

      {/* Cashflow & Financial Velocity Chart */}
      <section aria-labelledby="cashflow-heading">
        <h2 id="cashflow-heading" className="sr-only">
          Évolution de la facturation et des encaissements
        </h2>
        <CashflowChart data={cashflow} />
      </section>

      {/* Recent Invoices Table */}
      <section aria-labelledby="invoices-heading">
        <h2 id="invoices-heading" className="sr-only">
          Liste des dernières factures émises
        </h2>
        <RecentInvoicesTable invoices={filteredInvoices} />
      </section>
    </DashboardShell>
  );
}
