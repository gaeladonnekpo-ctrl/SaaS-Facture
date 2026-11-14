"use client";

import React from "react";
import { UserCheck, FilePlus2, Banknote } from "lucide-react";

const STEPS = [
  {
    step: "1",
    title: "Inscris-toi en 60 secondes",
    description:
      "Renseigne simplement le nom de ton entreprise, ton pays et ta devise (FCFA XOF ou XAF). Aucune carte bancaire requise.",
    icon: UserCheck,
  },
  {
    step: "2",
    title: "Crée ta première facture",
    description:
      "Ajoute tes prestations. La TVA de 18% et les totaux sont calculés automatiquement avec toutes les mentions fiscales obligatoires.",
    icon: FilePlus2,
  },
  {
    step: "3",
    title: "Envoie & encaisse en FCFA",
    description:
      "Partage le lien sécurisé par WhatsApp ou télécharge le PDF. Encaisse via Mobile Money (Wave, MTN, Orange, Moov) ou virement bancaire.",
    icon: Banknote,
  },
];

export function LandingHowItWorks() {
  return (
    <section
      className="py-16 sm:py-24 bg-surface border-y border-line"
      data-purpose="how-it-works-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <p className="text-xs uppercase font-bold tracking-widest text-forest-800 dark:text-lime-400 mb-2">
            Simplicité radicale
          </p>
          <h2 className="landing-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 dark:text-white">
            Comment ça marche ?
          </h2>
          <p className="text-forest-900/70 dark:text-sage-300 text-base sm:text-lg mt-3">
            Passez de l&apos;inscription au premier paiement encaissé en moins de 3 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="flex flex-col items-start p-7 sm:p-8 rounded-3xl bg-canvas border border-line landing-card-shadow relative group hover:border-forest-700/40 dark:hover:border-lime-400/40 transition duration-300"
              >
                <div className="flex items-center justify-between w-full mb-6">
                  <span className="w-11 h-11 rounded-2xl bg-forest-900 text-lime-300 dark:bg-lime-400 dark:text-forest-950 font-black flex items-center justify-center text-lg shadow-sm">
                    {s.step}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-forest-900/5 dark:bg-forest-900/50 flex items-center justify-center text-forest-800 dark:text-lime-400">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="landing-heading text-xl font-bold text-forest-950 dark:text-white mb-2.5">
                  {s.title}
                </h3>
                <p className="text-sm text-forest-900/70 dark:text-sage-300 leading-relaxed">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
