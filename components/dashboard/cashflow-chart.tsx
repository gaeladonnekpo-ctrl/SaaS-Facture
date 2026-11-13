"use client";

import React, { useState } from "react";
import { formatFCFA } from "@/lib/format/money";
import type { MonthlyCashflow } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n/context";
import { BarChart3, Send } from "lucide-react";

interface CashflowChartProps {
  data: MonthlyCashflow[];
}

export function CashflowChart({ data }: CashflowChartProps) {
  const { language, t } = useI18n();
  const [activeMonthIndex, setActiveMonthIndex] = useState<number | null>(data.length - 1);

  // Maximum value for scaling the bar chart
  const maxValue = Math.max(...data.flatMap((d) => [d.invoiced, d.collected]), 1) * 1.15;
  const fallbackData: MonthlyCashflow = {
    month: language === "en" ? "November 2026" : "Novembre 2026",
    shortMonth: "Nov",
    invoiced: 0,
    collected: 0,
  };
  const activeData =
    (activeMonthIndex !== null ? data[activeMonthIndex] : data[data.length - 1]) ??
    fallbackData;

  const getLocalizedMonth = (shortMonth: string) => {
    if (language === "en") {
      switch (shortMonth.toLowerCase()) {
        case "juin":
          return "Jun";
        case "juil":
          return "Jul";
        case "août":
        case "aout":
          return "Aug";
        case "sept":
          return "Sep";
        case "oct":
          return "Oct";
        case "nov":
          return "Nov";
        default:
          return shortMonth;
      }
    }
    return shortMonth;
  };

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:gap-4 lg:grid-cols-3 lg:gap-5">
      {/* Main Chart Card (2 columns on desktop) */}
      <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-5 lg:p-6 shadow-card lg:col-span-2">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2.5 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-semibold text-sage-600 uppercase tracking-wider">
                {t("dash_cashflow_title", "Trésorerie & Activité")}
              </span>
              <span className="rounded-full bg-lime-100 dark:bg-lime-950/80 px-2 py-0.5 text-[10px] font-bold text-forest-950 dark:text-lime-300 border border-lime-300/80 dark:border-lime-500/50">
                {t("chart_semi_annual", "Semestriel")}
              </span>
            </div>
            <h2 className="mt-1 text-sm sm:text-base lg:text-lg font-bold text-forest-950">
              {t("chart_billing_vs_collections", "Facturation vs Encaissements réels")}
            </h2>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-forest-900" />
              <span className="text-forest-900 font-medium">{t("chart_invoiced", "Facturé")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-lime-400" />
              <span className="text-forest-900 font-medium">{t("chart_collected", "Encaissé")}</span>
            </div>
          </div>
        </div>

        {/* Selected Month Hover Metric Display */}
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl bg-sage-50/70 p-2.5 sm:p-3 border border-line-subtle text-xs">
          <span className="text-xs font-medium text-ink-muted">
            {t("chart_period_label", "Période :")} <strong className="text-forest-950">{getLocalizedMonth(activeData.shortMonth)} 2026</strong>
          </span>
          <span className="text-xs text-ink-muted">
            {t("chart_invoiced_label", "Facturé :")} <strong className="text-forest-900 tabular">{formatFCFA(activeData.invoiced)}</strong>
          </span>
          <span className="text-xs text-ink-muted">
            {t("chart_collected_label", "Encaissé :")} <strong className="text-emerald-700 tabular">{formatFCFA(activeData.collected)}</strong>
          </span>
        </div>

        {/* Chart Visualization */}
        <div className="mt-4 sm:mt-6 flex h-44 sm:h-52 items-end gap-1.5 xs:gap-3 sm:gap-5 lg:gap-6 pt-4 pb-2 border-b border-line-subtle">
          {data.map((item, idx) => {
            const invoicedHeight = Math.round((item.invoiced / maxValue) * 100);
            const collectedHeight = Math.round((item.collected / maxValue) * 100);
            const isHovered = activeMonthIndex === idx;
            const localizedShort = getLocalizedMonth(item.shortMonth);

            return (
              <div
                key={item.month}
                className="group relative flex flex-1 flex-col items-center h-full justify-end cursor-pointer"
                onMouseEnter={() => setActiveMonthIndex(idx)}
              >
                {/* Tooltip on active */}
                {isHovered && (
                  <div className="absolute -top-9 z-20 flex flex-col items-center rounded-lg bg-forest-950 px-2 py-0.5 text-[10px] sm:text-[11px] text-surface shadow-md whitespace-nowrap">
                    <span className="font-semibold text-lime-300">{localizedShort}</span>
                    <div className="w-1.5 h-1.5 rotate-45 bg-forest-950 -bottom-1 absolute" />
                  </div>
                )}

                {/* Bars group */}
                <div className="flex w-full items-end justify-center gap-1 sm:gap-2 h-full">
                  {/* Invoiced Bar */}
                  <div
                    className={`w-2.5 xs:w-3.5 sm:w-5 lg:w-6 rounded-t-md transition-all duration-300 ${
                      isHovered ? "bg-forest-950 ring-2 ring-forest-900/30" : "bg-forest-800/90"
                    }`}
                    style={{ height: `${invoicedHeight}%` }}
                    title={`${t("chart_invoiced", "Facturé")} : ${formatFCFA(item.invoiced)}`}
                  />
                  {/* Collected Bar */}
                  <div
                    className={`w-2.5 xs:w-3.5 sm:w-5 lg:w-6 rounded-t-md transition-all duration-300 ${
                      isHovered ? "bg-lime-400 ring-2 ring-lime-300/40" : "bg-lime-400/90"
                    }`}
                    style={{ height: `${collectedHeight}%` }}
                    title={`${t("chart_collected", "Encaissé")} : ${formatFCFA(item.collected)}`}
                  />
                </div>

                {/* X-axis Label */}
                <span
                  className={`mt-2 text-center text-[11px] sm:text-xs transition-colors ${
                    isHovered ? "font-bold text-forest-950" : "text-sage-500"
                  }`}
                >
                  {localizedShort}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Summary Card (1 column on desktop) */}
      <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 sm:p-5 lg:p-6 shadow-card">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-sage-600 uppercase tracking-wider">
              {t("chart_receivables_breakdown", "Répartition des créances")}
            </span>
            <div className="flex h-7 w-7 sm:h-8 sm:h-8 items-center justify-center rounded-lg bg-sage-100 text-forest-900 shrink-0">
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>

          <h3 className="mt-1.5 text-xs sm:text-sm font-bold text-forest-950">
            {t("chart_outstanding_balance_structure", "Structure du solde en cours")}
          </h3>
          <p className="text-[11px] sm:text-xs text-ink-muted mt-0.5">
            {t("chart_active_total_prefix", "Sur un total actif de")} 18 450 000 FCFA
          </p>

          {/* Stacked Horizontal Bar */}
          <div className="mt-3.5 sm:mt-5">
            <div className="flex h-2.5 sm:h-3 w-full overflow-hidden rounded-full bg-sage-100">
              <div
                className="bg-emerald-600 hover:opacity-90 transition-opacity"
                style={{ width: "77%" }}
                title={`${t("status_paid", "Payée")} : 77%`}
              />
              <div
                className="bg-amber-400 hover:opacity-90 transition-opacity"
                style={{ width: "16%" }}
                title={`${t("chart_awaiting_due_date", "En cours")} : 16%`}
              />
              <div
                className="bg-rose-500 hover:opacity-90 transition-opacity"
                style={{ width: "7%" }}
                title={`${t("status_overdue", "En retard")} : 7%`}
              />
            </div>

            {/* Metrics Breakdown List */}
            <div className="mt-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                  <span className="text-forest-900 font-medium truncate">{t("chart_settled_invoices", "Factures réglées")}</span>
                </div>
                <div className="tabular text-right font-semibold text-forest-950 shrink-0">
                  14 200 000 FCFA <span className="text-ink-muted font-normal text-[11px]">(77 %)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-forest-900 font-medium truncate">{t("chart_awaiting_due_date", "En attente d'échéance")}</span>
                </div>
                <div className="tabular text-right font-semibold text-forest-950 shrink-0">
                  3 050 000 FCFA <span className="text-ink-muted font-normal text-[11px]">(16 %)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-rose-700 font-semibold truncate">{t("chart_overdue_date", "Échéance dépassée")}</span>
                </div>
                <div className="tabular text-right font-semibold text-rose-700 shrink-0">
                  1 200 000 FCFA <span className="text-rose-400 font-normal text-[11px]">(7 %)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="mt-4 pt-3 border-t border-line-subtle">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/50 px-3 py-2 text-xs font-semibold text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors focus:outline-hidden"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t("chart_remind_overdue_btn", "Relancer les factures en retard")} (3)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
