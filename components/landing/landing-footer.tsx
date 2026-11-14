"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const COUNTRIES = [
  "Bénin",
  "Côte d'Ivoire",
  "Sénégal",
  "Cameroun",
  "Togo",
  "Niger",
  "Burkina Faso",
  "Mali",
  "Gabon",
];

export function LandingFooter() {
  return (
    <footer
      className="bg-forest-950 text-white/80 pt-16 pb-12 border-t border-forest-850"
      data-purpose="site-footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Company Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block group focus:outline-hidden">
              <Logo variant="full" size="md" themeMode="dark" priority />
            </Link>

            <p className="text-sm text-white/60 leading-relaxed max-w-sm">
              La solution de facturation et de gestion d&apos;encaissements conçue pour la nouvelle
              génération de PME, freelances et créateurs d&apos;Afrique.
            </p>

            <div className="flex flex-wrap gap-2 text-xs text-lime-400 font-medium pt-2">
              {COUNTRIES.map((c) => (
                <span key={c} className="whitespace-nowrap">
                  • {c}
                </span>
              ))}
            </div>
          </div>

          {/* Links Column 1: Produit */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Produit
            </h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>
                <Link href="/factures" className="hover:text-lime-400 transition">
                  Facturation FCFA
                </Link>
              </li>
              <li>
                <a href="#fonctionnalites" className="hover:text-lime-400 transition">
                  Calculateur TVA 18%
                </a>
              </li>
              <li>
                <Link href="/paiements" className="hover:text-lime-400 transition">
                  Passerelle Mobile Money
                </Link>
              </li>
              <li>
                <Link href="/factures" className="hover:text-lime-400 transition">
                  Devis &amp; Rapprochement
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Conformité */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Conformité
            </h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>
                <span className="text-white/60">Normes UEMOA</span>
              </li>
              <li>
                <span className="text-white/60">Normes CEMAC</span>
              </li>
              <li>
                <span className="text-white/60">Réforme e-Facture</span>
              </li>
              <li>
                <span className="text-white/60">Sécurité des données &amp; RGPD/UEMOA</span>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Légal & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Assistance &amp; Légal
            </h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>
                <Link href="/support" className="hover:text-lime-400 transition">
                  Centre d&apos;aide &amp; Support
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="hover:text-lime-400 transition">
                  Espace Membre
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="hover:text-lime-400 transition">
                  Créer un compte
                </Link>
              </li>
              <li>
                <span className="text-white/60">Mentions légales</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Signature */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© 2026 DANHOMEY Facture Technologies. Tous droits réservés.</p>
          <p className="flex items-center gap-1 font-medium text-white/70">
            Conçu avec fierté et ambition en Afrique 🌍 • Conforme UEMOA &amp; CEMAC
          </p>
        </div>
      </div>
    </footer>
  );
}
