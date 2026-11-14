"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "Mes factures sont-elles valides aux yeux de l'administration fiscale ?",
    a: "Absolument. DANHOMEY Facture respecte scrupuleusement les exigences des directions générales des impôts dans les zones UEMOA et CEMAC (mentions obligatoires, numérotation séquentielle inviolable, IFU/RCCM, montants en toutes lettres automatiques et taux de TVA 18% ventilé).",
  },
  {
    q: "Comment mes clients me règlent-ils par Mobile Money ?",
    a: "Chaque facture en ligne dispose d'instructions claires et d'un bouton de règlement instantané par Wave, Orange Money, MTN MoMo, Moov ou virement bancaire local. L'argent arrive directement sur votre compte marchand habituel.",
  },
  {
    q: "Puis-je exporter mes écritures pour mon expert-comptable ?",
    a: "Oui, vous pouvez exporter l'intégralité du journal des ventes et le relevé de TVA au format Excel compatible avec les principaux logiciels de comptabilité SYSCOHADA (Sage, Ciel, etc.).",
  },
  {
    q: "Puis-je personnaliser mes factures avec mon propre logo et mes coordonnées ?",
    a: "Tout à fait ! Vous pouvez téléverser le logo officiel de votre entreprise, configurer vos coordonnées bancaires complètes (IBAN, BIC, RIB) ainsi que vos numéros marchands Wave, MTN ou Orange Money.",
  },
  {
    q: "Quelle est la différence entre les devises FCFA XOF et XAF ?",
    a: "Le FCFA XOF est la devise de la zone UEMOA (Bénin, Côte d'Ivoire, Sénégal, Togo, Niger, Burkina Faso, Mali, Guinée-Bissau) et le XAF celle de la CEMAC (Cameroun, Gabon, Congo, Tchad, RCA, Guinée Équatoriale). DANHOMEY Facture gère nativement les deux zones.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-canvas" data-purpose="faq-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900/5 dark:bg-forest-900/40 text-forest-900 dark:text-lime-300 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ</span>
          </div>
          <h2 className="landing-heading text-3xl sm:text-5xl font-bold text-forest-950 dark:text-white">
            Questions fréquentes
          </h2>
          <p className="text-forest-900/70 dark:text-sage-300 text-sm sm:text-base mt-2.5">
            Tout ce qu&apos;il faut savoir avant de démarrer.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-surface border border-line overflow-hidden transition-all duration-200 landing-card-shadow"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full p-5 sm:p-6 text-left flex justify-between items-center gap-4 font-bold text-forest-950 dark:text-white hover:text-forest-800 transition-colors focus:outline-hidden"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base leading-snug">{faq.q}</span>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl bg-sage-50 dark:bg-forest-900 text-forest-900 dark:text-lime-300 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 bg-forest-900 text-white dark:bg-lime-400 dark:text-forest-950" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-forest-900/70 dark:text-sage-300 leading-relaxed border-t border-line/60">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
