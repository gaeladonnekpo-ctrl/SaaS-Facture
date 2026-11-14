"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface LandingFinalCTAProps {
  user?: User | null;
}

export function LandingFinalCTA({ user }: LandingFinalCTAProps) {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-canvas">
      <div className="max-w-6xl mx-auto rounded-3xl bg-forest-900 p-8 sm:p-14 lg:p-16 text-center text-white relative overflow-hidden landing-elevated-shadow border border-forest-800">
        {/* Background subtle radial glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-lime-300 text-xs font-bold uppercase tracking-wider mb-6 border border-white/10">
            Passez au niveau supérieur
          </span>

          <h2 className="landing-heading text-3xl sm:text-5xl font-extrabold tracking-tight mb-5 leading-tight text-white">
            Rejoins les milliers d&apos;entrepreneurs africains qui facturent comme des pros.
          </h2>

          <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            Crée ton compte en 60 secondes et génère ta première facture légale conforme TVA 18%
            dès aujourd&apos;hui.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-lime-400 text-forest-950 font-black text-base hover:bg-lime-300 transition duration-200 shadow-lg active:scale-95"
              >
                <span>Accéder à mon tableau de bord</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </Link>
            ) : (
              <Link
                href="/inscription"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-lime-400 text-forest-950 font-black text-base hover:bg-lime-300 transition duration-200 shadow-lg active:scale-95"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </Link>
            )}

            <Link
              href="/support"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-base transition duration-200 border border-white/15"
            >
              <MessageCircle className="w-4 h-4 text-lime-300" />
              <span>Discuter avec un conseiller</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
