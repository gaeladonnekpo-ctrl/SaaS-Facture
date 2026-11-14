"use client";

import React from "react";
import Link from "next/link";
import { HeroDashboardMockup } from "./hero-dashboard-mockup";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface LandingHeroProps {
  user?: User | null;
}

export function LandingHero({ user }: LandingHeroProps) {
  const scrollToMockup = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.querySelector('[data-purpose="dashboard-mockup"]');
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section
      className="pt-10 sm:pt-16 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden relative"
      data-purpose="hero-container"
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Regional Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-900/5 dark:bg-forest-900/40 border border-forest-900/10 dark:border-forest-700/50 text-forest-900 dark:text-lime-300 text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span>Conçu pour les entrepreneurs d&apos;Afrique de l&apos;Ouest et Centrale</span>
        </div>

        {/* Hero Headline */}
        <h1 className="landing-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold text-forest-950 dark:text-white tracking-tight leading-[1.08] mb-6">
          Fini le casse-tête des factures sur{" "}
          <span className="landing-underline-lime">Word &amp; Excel</span>.
        </h1>

        {/* Descriptive Subhead */}
        <p className="max-w-2xl mx-auto text-base sm:text-xl text-forest-900/70 dark:text-sage-300 font-normal leading-relaxed mb-9">
          Créez des factures 100% conformes en 2 clics, appliquez la TVA 18% automatiquement et
          faites-vous payer plus vite en FCFA.
        </p>

        {/* CTA Cluster */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-5"
          data-purpose="hero-buttons"
        >
          {user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-forest-900 hover:bg-forest-850 dark:bg-lime-400 dark:hover:bg-lime-300 text-white dark:text-forest-950 font-bold text-base landing-hero-cta text-center"
            >
              <span>Accéder à mon tableau de bord</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Link>
          ) : (
            <>
              <Link
                href="/inscription"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-forest-900 hover:bg-forest-850 dark:bg-lime-400 dark:hover:bg-lime-300 text-white dark:text-forest-950 font-bold text-base landing-hero-cta text-center"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <a
                href="#demo"
                onClick={scrollToMockup}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-surface border border-line hover:bg-sage-50 dark:hover:bg-forest-900 text-forest-950 dark:text-white font-semibold text-base landing-secondary-cta text-center shadow-2xs"
              >
                Voir la démo interactive
              </a>
            </>
          )}
        </div>

        {/* Reassurance Notes */}
        <p className="text-xs sm:text-sm text-ink-muted font-medium flex items-center justify-center flex-wrap gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-lime-400" />
            Sans carte bancaire
          </span>
          <span>•</span>
          <span>5 factures gratuites / mois</span>
          <span>•</span>
          <span>Configuration en 2 min</span>
        </p>
      </div>

      {/* Hero Dashboard Mockup */}
      <HeroDashboardMockup />
    </section>
  );
}
