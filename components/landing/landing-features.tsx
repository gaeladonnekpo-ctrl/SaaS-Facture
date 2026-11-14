"use client";

import React from "react";
import { Zap, Calculator, Smartphone, Building2, Check } from "lucide-react";

const FEATURES = [
  {
    tag: "En 2 clics chrono",
    title: "Factures & devis professionnels instantanés",
    description:
      "Générez instantanément des PDF haute définition avec vos mentions légales complètes, votre logo et un QR Code de validation authenticité pour vos clients.",
    icon: Zap,
    bullets: [
      "Devis convertibles en facture en un clic",
      "Export PDF optimisé pour l'impression A4",
    ],
  },
  {
    tag: "Normes UEMOA & CEMAC",
    title: "TVA 18% calculée et ventilée sans effort",
    description:
      "Fini les doutes. L'application calcule automatiquement les montants Hors Taxes (HT), la TVA normalisée à 18% et le Total TTC en conformité avec votre code des impôts local.",
    icon: Calculator,
    bullets: [
      "Déclaration de fin de mois pré-remplie",
      "Prise en charge des exonérations légales (0 %)",
    ],
  },
  {
    tag: "Mobile Money Intégré",
    title: "Suivi et encaissement en temps réel",
    description:
      "Offrez à vos clients la liberté de régler immédiatement en FCFA par Wave, Orange Money, MTN MoMo, Moov ou virement bancaire local.",
    icon: Smartphone,
    bullets: [
      "Rapprochement et reçu automatique dès réception",
      "Support de 10+ opérateurs ouest et centre-africains",
    ],
  },
  {
    tag: "Répertoire Fiscal",
    title: "Gestion clients & traçabilité intégrale",
    description:
      "Sauvegardez les coordonnées de vos clients (IFU, RCCM, NINEA, NCC), retrouvez l'historique complet de leurs commandes et relancez en un clic sur WhatsApp.",
    icon: Building2,
    bullets: [
      "Relances WhatsApp personnalisables en un clic",
      "Fiches clients centralisées et sécurisées",
    ],
  },
];

export function LandingFeatures() {
  return (
    <section
      id="fonctionnalites"
      className="py-16 sm:py-24 bg-canvas"
      data-purpose="features-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <span className="inline-block px-3.5 py-1 rounded-full bg-forest-900 text-lime-300 dark:bg-lime-400 dark:text-forest-950 text-xs font-bold tracking-wider uppercase">
            Puissant &amp; accessible
          </span>
          <h2 className="landing-heading text-3xl sm:text-5xl font-bold text-forest-950 dark:text-white mt-4 tracking-tight">
            Tout pour piloter votre trésorerie d&apos;une main de maître
          </h2>
          <p className="text-base sm:text-lg text-forest-900/70 dark:text-sage-300 mt-3.5">
            Une suite pensée sur-mesure pour les règles commerciales et financières de nos pays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-7 sm:p-9 rounded-3xl bg-surface border border-line landing-card-shadow hover:border-forest-700/40 dark:hover:border-lime-400/40 transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-forest-900 text-lime-300 dark:bg-lime-400 dark:text-forest-950 flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  <div className="inline-block text-xs font-bold text-forest-950 dark:text-lime-300 bg-lime-100 dark:bg-lime-950/70 border border-lime-300/80 dark:border-lime-700/60 px-2.5 py-1 rounded-md mb-3.5">
                    {feat.tag}
                  </div>

                  <h3 className="landing-heading text-xl sm:text-2xl font-bold text-forest-950 dark:text-white mb-3">
                    {feat.title}
                  </h3>

                  <p className="text-forest-900/70 dark:text-sage-300 text-sm leading-relaxed mb-6">
                    {feat.description}
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs font-medium text-forest-900/80 dark:text-sage-200 border-t border-line/70 pt-4">
                  {feat.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-forest-900/10 dark:bg-lime-400/20 text-forest-900 dark:text-lime-300 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
