"use client";

import React from "react";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "« DANHOMEY Facture a divisé par 4 le temps que nous passions sur les devis. Nos clients institutionnels apprécient la clarté des factures et nous sommes réglés bien plus rapidement. »",
    author: "Aïssatou Diallo",
    role: "Fondatrice Agence Teranga Digital • Dakar, Sénégal",
    initials: "AD",
  },
  {
    quote:
      "« Le calcul automatique de la TVA à 18% et la gestion directe en FCFA nous évitent enfin les erreurs comptables bêtes. La sérénité fiscale n'a pas de prix pour une PME. »",
    author: "Jean-Luc Kouamé",
    role: "CEO Agroivoire Logistique • Abidjan, Côte d'Ivoire",
    initials: "JK",
  },
  {
    quote:
      "« Mes clients paient 2 fois plus vite depuis que j'envoie des factures professionnelles avec lien Mobile Money. C'est l'outil indispensable pour tout freelance en Afrique. »",
    author: "Christian Mballa",
    role: "Freelance Tech & Consultant • Douala, Cameroun",
    initials: "CM",
  },
];

export function LandingTestimonials() {
  return (
    <section
      id="temoignages"
      className="py-16 sm:py-24 bg-canvas"
      data-purpose="testimonials-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800 dark:text-lime-400">
            Retours d&apos;expérience
          </span>
          <h2 className="landing-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 dark:text-white mt-2">
            Adopté par plus de 2 500 entrepreneurs
          </h2>
          <p className="text-forest-900/70 dark:text-sage-300 text-base sm:text-lg mt-3">
            Voici ce qu&apos;ils disent de leur passage à DANHOMEY Facture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="p-7 sm:p-9 rounded-3xl bg-surface border border-line landing-card-shadow flex flex-col justify-between hover:border-forest-700/40 dark:hover:border-lime-400/40 transition duration-300"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex gap-1 text-lime-500 dark:text-lime-400 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current stroke-none" />
                  ))}
                </div>

                <p className="text-forest-900/80 dark:text-sage-200 text-sm leading-relaxed mb-6 italic">
                  {t.quote}
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-5 border-t border-line">
                <div className="w-11 h-11 rounded-2xl bg-forest-900 text-lime-300 dark:bg-lime-400 dark:text-forest-950 font-bold flex items-center justify-center text-sm shrink-0 shadow-2xs">
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-forest-950 dark:text-white truncate">
                    {t.author}
                  </h4>
                  <p className="text-xs text-ink-muted truncate mt-0.5">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
