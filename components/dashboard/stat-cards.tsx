"use client";

import React from "react";
import { formatNumber } from "@/lib/format/money";
import type { DashboardMetrics } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n/context";
import {
  TrendingUp,
  Wallet,
  Clock,
  FileCheck2,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

interface StatCardsProps {
  metrics: DashboardMetrics;
}

export function StatCards({ metrics }: StatCardsProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 sm:gap-4">
      {/* 1. Montant Facturé */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-3.5 sm:p-4 xl:p-5 shadow-card transition-all hover:border-forest-700/30 hover:shadow-md group">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-sage-600 uppercase tracking-wider">
              {t("dash_total_invoiced", "Montant facturé")}
            </span>
            <div className="flex h-7 w-7 sm:h-8 sm:h-8 items-center justify-center rounded-lg bg-forest-900 text-lime-400 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
          </div>

          <div className="mt-2 sm:mt-2.5 flex items-baseline gap-1.5 flex-nowrap min-w-0">
            <span className="tabular text-lg sm:text-xl xl:text-2xl font-extrabold tracking-tight text-forest-950 truncate">
              {formatNumber(metrics.totalInvoiced.amount)}
            </span>
            <span className="text-[11px] sm:text-xs xl:text-sm font-bold text-sage-600 shrink-0 whitespace-nowrap">
              FCFA
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-line-subtle min-h-[32px] flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
            +{metrics.totalInvoiced.changePercentage} %
          </span>
          <span className="text-ink-muted text-[11px] truncate">
            {t("dash_vs_last_month", "vs mois dernier")}
          </span>
        </div>
      </div>

      {/* 2. Montant Payé / Encaissé */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-3.5 sm:p-4 xl:p-5 shadow-card transition-all hover:border-forest-700/30 hover:shadow-md group">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-sage-600 uppercase tracking-wider">
              {t("dash_total_collected", "Montant encaissé")}
            </span>
            <div className="flex h-7 w-7 sm:h-8 sm:h-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
          </div>

          <div className="mt-2 sm:mt-2.5 flex items-baseline gap-1.5 flex-nowrap min-w-0">
            <span className="tabular text-lg sm:text-xl xl:text-2xl font-extrabold tracking-tight text-forest-950 truncate">
              {formatNumber(metrics.totalCollected.amount)}
            </span>
            <span className="text-[11px] sm:text-xs xl:text-sm font-bold text-emerald-700 dark:text-emerald-300 shrink-0 whitespace-nowrap">
              FCFA
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-line-subtle min-h-[32px] flex flex-col justify-center">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span className="text-[11px]">{t("dash_collection_rate", "Recouvrement")}</span>
            <span className="font-bold text-forest-900 text-[11px]">
              {metrics.totalCollected.collectionRate} %
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-sage-100 dark:bg-forest-900/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 transition-all duration-500"
              style={{ width: `${metrics.totalCollected.collectionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Montant en Attente */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-3.5 sm:p-4 xl:p-5 shadow-card transition-all hover:border-forest-700/30 hover:shadow-md group">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-sage-600 uppercase tracking-wider">
              {t("dash_pending_amount", "Montant en attente")}
            </span>
            <div className="flex h-7 w-7 sm:h-8 sm:h-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
          </div>

          <div className="mt-2 sm:mt-2.5 flex items-baseline gap-1.5 flex-nowrap min-w-0">
            <span className="tabular text-lg sm:text-xl xl:text-2xl font-extrabold tracking-tight text-forest-950 truncate">
              {formatNumber(metrics.pendingAmount.total)}
            </span>
            <span className="text-[11px] sm:text-xs xl:text-sm font-bold text-amber-800 dark:text-amber-300 shrink-0 whitespace-nowrap">
              FCFA
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-line-subtle min-h-[32px] flex items-center">
          <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 px-2 py-1 text-[11px] font-medium text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 w-full truncate">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="truncate">
              {t("dash_overdue_part", "dont")} <strong className="font-bold tabular">{formatNumber(metrics.pendingAmount.overduePart)} FCFA</strong> {t("status_overdue", "en retard")}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Nombre de Factures */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-3.5 sm:p-4 xl:p-5 shadow-card transition-all hover:border-forest-700/30 hover:shadow-md group">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-sage-600 uppercase tracking-wider">
              {t("dash_invoices_count", "Total factures émises")}
            </span>
            <div className="flex h-7 w-7 sm:h-8 sm:h-8 items-center justify-center rounded-xl bg-sage-100 border border-line text-forest-900 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <FileCheck2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
          </div>

          <div className="mt-2 sm:mt-2.5 flex items-baseline gap-1.5">
            <span className="tabular text-lg sm:text-xl xl:text-2xl font-extrabold tracking-tight text-forest-950">
              {metrics.invoicesCount.total}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-ink-muted">
              {t("dash_records", "dossiers")}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-line-subtle min-h-[32px] flex items-center justify-between text-[11px] text-ink-muted">
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">{metrics.invoicesCount.paid} {t("status_paid", "payées")}</span>
          <span className="text-sage-300">·</span>
          <span className="font-semibold text-amber-700 dark:text-amber-300">{metrics.invoicesCount.sent} {t("status_sent", "envoyées")}</span>
          <span className="text-sage-300">·</span>
          <span className="font-semibold text-rose-700 dark:text-rose-300">{metrics.invoicesCount.overdue} {t("status_overdue", "en retard")}</span>
        </div>
      </div>
    </div>
  );
}
