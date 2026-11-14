"use client";

import React from "react";
import { AlertCircle, Clock, FileWarning, WalletCards } from "lucide-react";

const PROBLEMS = [
  {
    number: "01.",
    title: "Factures artisanales et non professionnelles",
    description:
      "Fichiers Word mal formatés, logos étirés et mises en page décalées qui décrédibilisent immédiatement votre expertise auprès des multinationales et institutions.",
    icon: FileWarning,
  },
  {
    number: "02.",
    title: "Erreurs de TVA 18% & calculs fiscaux complexes",
    description:
      "Mauvaise imputation des taux légaux, calculs manuels faux sur Excel et risques sérieux de redressements ou de refus de prise en charge par la comptabilité client.",
    icon: AlertCircle,
  },
  {
    number: "03.",
    title: "Relances et suivi des impayés impossibles",
    description:
      "Clients qui « oublient » de régler, aucun calendrier clair, trésorerie constamment sous tension et zéro visibilité consolidée sur ce qui est réellement dû.",
    icon: Clock,
  },
];

export function LandingProblems() {
  return (
    <section
      id="pourquoi-nous"
      className="py-16 sm:py-24 bg-surface border-y border-line"
      data-purpose="problem-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <p className="text-xs uppercase font-bold tracking-widest text-forest-800 dark:text-lime-400 mb-2">
            Constat du quotidien
          </p>
          <h2 className="landing-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 dark:text-white">
            Pourquoi continuer à perdre des heures chaque mois ?
          </h2>
          <p className="text-base sm:text-lg text-forest-900/70 dark:text-sage-300 mt-3.5 leading-relaxed">
            La gestion administrative ne devrait pas ralentir la croissance des champions économiques
            africains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {PROBLEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.number}
                className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-canvas border border-line relative hover:border-forest-700/40 dark:hover:border-lime-400/40 landing-card-shadow transition duration-300 group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="landing-heading text-2xl sm:text-3xl font-extrabold text-forest-900/30 dark:text-lime-400/30">
                    {item.number}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="landing-heading text-lg sm:text-xl font-bold text-forest-950 dark:text-white mb-2.5">
                  {item.title}
                </h3>
                <p className="text-sm text-forest-900/70 dark:text-sage-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
