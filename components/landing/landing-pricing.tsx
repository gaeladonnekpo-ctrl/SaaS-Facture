"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

export function LandingPricing() {
  return (
    <section
      id="tarifs"
      className="py-16 sm:py-24 bg-surface border-y border-line"
      data-purpose="pricing-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800 dark:text-lime-400">
            Tarification limpide
          </span>
          <h2 className="landing-heading text-3xl sm:text-5xl font-bold text-forest-950 dark:text-white mt-2">
            Investissez dans votre tranquillité
          </h2>
          <p className="text-forest-900/70 dark:text-sage-300 text-base sm:text-lg mt-3">
            Tarifs forfaitaires en Francs CFA, sans frais cachés ni commissions imprévues.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Gratuit */}
          <div className="p-7 sm:p-9 rounded-3xl bg-canvas border border-line flex flex-col justify-between landing-card-shadow hover:border-forest-700/40 dark:hover:border-lime-400/40 transition duration-300">
            <div>
              <h3 className="landing-heading text-xl font-bold text-forest-950 dark:text-white">
                Gratuit
              </h3>
              <p className="text-xs text-ink-muted mt-1">Pour tester et démarrer sereinement</p>

              <div className="mt-6 mb-6">
                <span className="landing-heading text-4xl sm:text-5xl font-black text-forest-950 dark:text-white">
                  0
                </span>
                <span className="text-sm font-bold text-ink-muted"> FCFA / mois</span>
              </div>

              <ul className="space-y-3.5 text-sm text-forest-900/80 dark:text-sage-200 border-t border-line pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-forest-800 dark:text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>
                    Jusqu&apos;à <strong>5 factures</strong> / mois
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-forest-800 dark:text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>1 utilisateur unique</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-forest-800 dark:text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>Calcul automatique TVA 18%</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-forest-800 dark:text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>Export PDF officiel</span>
                </li>
              </ul>
            </div>

            <Link
              href="/inscription?plan=gratuit"
              className="mt-8 block w-full py-3.5 px-4 rounded-full border border-line hover:border-forest-800 bg-surface dark:bg-forest-900 text-center font-bold text-forest-950 dark:text-white text-sm hover:bg-forest-900 hover:text-white dark:hover:bg-lime-400 dark:hover:text-forest-950 transition shadow-2xs"
            >
              Créer mon compte gratuit
            </Link>
          </div>

          {/* Plan 2: Pro Entrepreneur (Featured Plan) */}
          <div className="p-7 sm:p-9 rounded-3xl bg-forest-900 text-white border-2 border-lime-400 landing-elevated-shadow flex flex-col justify-between relative transform lg:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-lime-400 text-forest-950 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Recommandé</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="landing-heading text-xl font-bold text-white">
                    Pro Entrepreneur
                  </h3>
                  <p className="text-xs text-white/70 mt-1">Pour les indépendants et TPE en croissance</p>
                </div>
              </div>

              <div className="mt-6 mb-6">
                <span className="landing-heading text-4xl sm:text-5xl font-black text-white">
                  5 000
                </span>
                <span className="text-sm font-semibold text-lime-300"> FCFA / mois</span>
              </div>

              <ul className="space-y-3.5 text-sm text-white/90 border-t border-white/10 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>
                    <strong>Factures &amp; Devis illimités</strong>
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>Relances automatiques par WhatsApp</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>Paiements Mobile Money (Wave, MTN, Orange, Moov)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>Export comptable Excel et journal de TVA</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>Suppression filigrane DANHOMEY sur les factures</span>
                </li>
              </ul>
            </div>

            <Link
              href="/inscription?plan=pro"
              className="mt-8 block w-full py-3.5 px-4 rounded-full bg-lime-400 hover:bg-lime-300 text-forest-950 font-black text-center text-sm transition shadow-md active:scale-95"
            >
              Activer l&apos;offre Pro
            </Link>
          </div>

          {/* Plan 3: Business */}
          <div className="p-7 sm:p-9 rounded-3xl bg-canvas border border-line flex flex-col justify-between landing-card-shadow hover:border-forest-700/40 dark:hover:border-lime-400/40 transition duration-300">
            <div>
              <h3 className="landing-heading text-xl font-bold text-forest-950 dark:text-white">
                Business &amp; Cabinet
              </h3>
              <p className="text-xs text-ink-muted mt-1">
                Pour les agences et structures multi-collaborateurs
              </p>

              <div className="mt-6 mb-6">
                <span className="landing-heading text-4xl sm:text-5xl font-black text-forest-950 dark:text-white">
                  15 000
                </span>
                <span className="text-sm font-bold text-ink-muted"> FCFA / mois</span>
              </div>

              <ul className="space-y-3.5 text-sm text-forest-900/80 dark:text-sage-200 border-t border-line pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-forest-800 dark:text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>Toutes les fonctionnalités Pro</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-forest-800 dark:text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>
                    <strong>Jusqu&apos;à 10 utilisateurs</strong> &amp; gestion des rôles
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-forest-800 dark:text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>Multi-sociétés &amp; filiales</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-forest-800 dark:text-lime-400 shrink-0 stroke-[2.5]" />
                  <span>Support VIP WhatsApp dédié 7j/7</span>
                </li>
              </ul>
            </div>

            <Link
              href="/inscription?plan=business"
              className="mt-8 block w-full py-3.5 px-4 rounded-full border border-line hover:border-forest-800 bg-surface dark:bg-forest-900 text-center font-bold text-forest-950 dark:text-white text-sm hover:bg-forest-900 hover:text-white dark:hover:bg-lime-400 dark:hover:text-forest-950 transition shadow-2xs"
            >
              Choisir l&apos;offre Business
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
