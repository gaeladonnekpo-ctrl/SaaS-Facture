"use client";

import React from "react";
import { FloatingInvoiceCard } from "./floating-invoice-card";
import {
  LayoutDashboard,
  FileText,
  Users,
  Wallet,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export function HeroDashboardMockup() {
  return (
    <div
      className="max-w-6xl mx-auto mt-12 sm:mt-16 relative"
      data-purpose="dashboard-mockup"
    >
      {/* Base App Container */}
      <div className="rounded-3xl border border-line bg-forest-950 p-2.5 sm:p-4 landing-elevated-shadow overflow-hidden">
        <div className="rounded-2xl bg-white dark:bg-surface flex flex-col md:flex-row min-h-[520px] overflow-hidden border border-line/60">
          {/* Left Dark Sidebar */}
          <aside className="w-full md:w-60 bg-forest-900 p-5 flex flex-col justify-between text-white shrink-0">
            <div className="space-y-6">
              {/* Sidebar App Brand */}
              <div className="flex items-center gap-2.5 pb-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
                </div>
                <span className="landing-heading text-lg font-bold tracking-tight text-white">
                  DANHOMEY
                </span>
              </div>

              {/* Nav Items with Active Lime Badge */}
              <nav className="space-y-1.5 text-sm font-medium">
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-lime-400 text-forest-950 font-bold shadow-xs">
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 stroke-[2.5]" />
                    <span>Dashboard</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-white/70 hover:text-white transition">
                  <FileText className="w-4 h-4" />
                  <span>Factures &amp; Devis</span>
                </div>

                <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-white/70 hover:text-white transition">
                  <Users className="w-4 h-4" />
                  <span>Clients &amp; PME</span>
                </div>

                <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-white/70 hover:text-white transition">
                  <Wallet className="w-4 h-4" />
                  <span>Encaissements</span>
                </div>

                <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-white/70 hover:text-white transition">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Rapport Fiscal 18%</span>
                </div>
              </nav>
            </div>

            {/* Sidebar User Snippet */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-3 mt-6 md:mt-0">
              <div className="w-9 h-9 rounded-full bg-lime-400/20 border border-lime-400 text-lime-300 flex items-center justify-center font-bold text-xs shrink-0">
                KB
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate text-white">
                  Cabinet Koffi &amp; Fils
                </p>
                <p className="text-[10px] text-white/60 truncate">Cotonou, Bénin</p>
              </div>
            </div>
          </aside>

          {/* Main App Body */}
          <div className="flex-1 p-5 sm:p-7 bg-[#FCFDF9] dark:bg-canvas overflow-x-hidden">
            {/* Top search bar */}
            <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
              <div>
                <h3 className="landing-heading text-lg sm:text-2xl font-bold text-forest-950 dark:text-white">
                  Vue Globale Facturation
                </h3>
                <p className="text-xs text-ink-muted">
                  Période en cours • Zone FCFA (UEMOA / CEMAC)
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-surface px-3 py-1.5 rounded-xl border border-line text-xs text-ink-muted shadow-2xs">
                <Search className="w-3.5 h-3.5" />
                <span>Rechercher client, N° facture...</span>
              </div>
            </div>

            {/* Main Amount Header */}
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Total encaissé ce trimestre
                </p>
                <div className="text-2xl sm:text-4xl font-black text-forest-950 dark:text-white mt-1 tracking-tight">
                  48 350 000{" "}
                  <span className="text-base sm:text-xl font-bold text-forest-900/70 dark:text-sage-300">
                    FCFA
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-100 dark:bg-lime-950/80 border border-lime-300 dark:border-lime-700/60 text-forest-950 dark:text-lime-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Conforme TVA 18% UEMOA</span>
              </div>
            </div>

            {/* Stat Boxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white dark:bg-surface border border-line shadow-2xs">
                <div className="flex justify-between items-start text-xs text-ink-muted mb-2">
                  <span>Revenus du mois</span>
                  <span className="text-forest-950 font-bold bg-lime-200/80 dark:bg-lime-400/20 text-forest-900 dark:text-lime-300 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +18.4%
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-forest-950 dark:text-white">
                  8 450 000 FCFA
                </div>
                <p className="text-[11px] text-ink-muted mt-1">26 factures émises et réglées</p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-surface border border-line shadow-2xs">
                <div className="flex justify-between items-start text-xs text-ink-muted mb-2">
                  <span>Factures en attente</span>
                  <span className="text-amber-800 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded text-[11px]">
                    3 en cours
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-forest-950 dark:text-white">
                  1 200 000 FCFA
                </div>
                <p className="text-[11px] text-ink-muted mt-1">Relances WhatsApp programmées</p>
              </div>
            </div>

            {/* Assets / Evolution chart SVG */}
            <div className="p-4 rounded-xl bg-white dark:bg-surface border border-line shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Évolution des encaissements
                </span>
                <div className="flex gap-1.5 text-xs font-semibold text-ink-muted">
                  <span className="px-2.5 py-0.5 rounded-lg bg-forest-900 text-white dark:bg-lime-400 dark:text-forest-950">
                    Mois
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg hover:bg-sage-100 dark:hover:bg-forest-900/40 transition">
                    Trimestre
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg hover:bg-sage-100 dark:hover:bg-forest-900/40 transition">
                    Année
                  </span>
                </div>
              </div>

              {/* Mini vector chart with CSS line animation */}
              <div className="w-full h-28 relative">
                <svg
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 500 120"
                >
                  <defs>
                    <linearGradient id="landingChartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C8F135" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#C8F135" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    className="landing-chart-line"
                    d="M0,100 Q60,70 120,85 T240,40 T360,65 T480,20 L500,22"
                    fill="none"
                    stroke="#0A291E"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M0,100 Q60,70 120,85 T240,40 T360,65 T480,20 L500,22 L500,120 L0,120 Z"
                    fill="url(#landingChartGrad)"
                  />
                </svg>
                <div className="absolute top-2 right-12 bg-forest-900 text-lime-300 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-forest-800">
                  Pic : 14.2M FCFA
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Pop-up Invoice Card */}
      <FloatingInvoiceCard />
    </div>
  );
}
