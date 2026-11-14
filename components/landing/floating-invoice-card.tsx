"use client";

import React from "react";
import { Download, FileText, CheckCircle2 } from "lucide-react";

export function FloatingInvoiceCard() {
  return (
    <div
      className="w-[92%] sm:w-80 md:w-96 rounded-2xl bg-surface border-2 border-forest-900 dark:border-lime-400 shadow-2xl absolute -bottom-8 sm:bottom-6 right-2 sm:right-6 lg:-right-4 p-4 sm:p-5 z-20 transition-transform duration-300 hover:-translate-y-1 landing-float-card"
      data-purpose="floating-invoice-modal"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <span className="text-xs font-bold uppercase tracking-wider text-forest-950 dark:text-white flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-forest-800 dark:text-lime-400" />
          <span>Facture N° 2024-089</span>
        </span>
        <span className="flex h-2.5 w-2.5 rounded-full bg-lime-400 ring-2 ring-forest-900/20" />
      </div>

      {/* Client Highlight Banner */}
      <div className="mt-3 p-3 rounded-xl bg-lime-100/60 dark:bg-forest-900/80 border border-lime-300 dark:border-lime-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-forest-900 text-lime-300 font-bold text-xs flex items-center justify-center shrink-0">
            KA
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-forest-950 dark:text-white leading-tight truncate">
              Koffi &amp; Associés SARL
            </h4>
            <p className="text-[10px] text-ink-muted truncate">
              IFU: 320194829104 • Abidjan
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-900 text-lime-300 shrink-0">
          Payée
        </span>
      </div>

      {/* Transaction details */}
      <div className="mt-3.5 space-y-2 text-xs">
        <div className="flex justify-between text-ink-muted">
          <span>Montant HT :</span>
          <span className="font-semibold text-forest-950 dark:text-white">3 000 000 FCFA</span>
        </div>
        <div className="flex justify-between text-ink-muted">
          <span>TVA (18% normalisé) :</span>
          <span className="font-semibold text-forest-950 dark:text-white">540 000 FCFA</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-forest-950 dark:text-white pt-1.5 border-t border-line">
          <span>Total TTC :</span>
          <span className="text-base text-forest-950 dark:text-lime-300">3 540 000 FCFA</span>
        </div>
        <div className="flex justify-between text-[11px] text-ink-muted pt-1">
          <span>Moyen de paiement :</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Wave Business</span>
          </span>
        </div>
      </div>

      {/* Action buttons inside card */}
      <div className="mt-4 pt-3 border-t border-line flex items-center gap-2">
        <button
          type="button"
          onClick={() => alert("Aperçu interactif de la facture")}
          className="w-1/2 py-2 px-3 text-xs font-semibold text-forest-900 dark:text-sage-200 bg-sage-100 hover:bg-sage-200 dark:bg-forest-900 dark:hover:bg-forest-850 rounded-lg transition"
        >
          Aperçu PDF
        </button>
        <button
          type="button"
          onClick={() => alert("Téléchargement de la facture conforme UEMOA")}
          className="w-1/2 py-2 px-3 text-xs font-semibold text-white bg-forest-900 hover:bg-forest-850 dark:bg-lime-400 dark:text-forest-950 dark:hover:bg-lime-300 rounded-lg transition flex items-center justify-center gap-1.5"
        >
          <span>Télécharger</span>
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
