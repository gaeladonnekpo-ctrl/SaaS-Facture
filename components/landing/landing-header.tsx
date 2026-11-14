"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface LandingHeaderProps {
  user?: User | null;
}

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Pourquoi nous", href: "#pourquoi-nous" },
  { label: "Témoignages", href: "#temoignages" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
];

export function LandingHeader({ user }: LandingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 backdrop-blur-md bg-canvas/90 border-b border-line/70 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-hidden"
          title="DANHOMEY Facture · Accueil"
        >
          <Logo variant="full" size="md" withTagline={false} priority />
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-8 text-[15px] font-medium text-forest-900/80 dark:text-sage-300"
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item.href)}
              className="hover:text-forest-950 dark:hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3 sm:gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-forest-900 hover:bg-forest-850 dark:bg-lime-400 dark:hover:bg-lime-300 dark:text-forest-950 rounded-full transition-all duration-200 landing-pill-shadow active:scale-95 shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Mon Tableau de bord</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          ) : (
            <>
              <Link
                href="/connexion"
                className="px-4 py-2.5 text-sm font-semibold text-forest-900 dark:text-sage-200 hover:text-forest-700 rounded-full border border-line bg-surface/80 hover:bg-surface transition-all shadow-2xs"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="px-5 py-2.5 text-sm font-bold text-white bg-forest-900 hover:bg-forest-850 dark:bg-lime-400 dark:hover:bg-lime-300 dark:text-forest-950 rounded-full transition-all duration-200 landing-pill-shadow active:scale-95 shadow-sm"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-forest-900 rounded-full"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Espace</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-forest-900 hover:bg-sage-100 transition-colors focus:outline-hidden"
            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-20 z-40 bg-forest-950/40 backdrop-blur-xs md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-20 z-50 border-b border-line bg-surface/98 p-5 shadow-2xl md:hidden animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-3.5 mb-6 text-base font-semibold text-forest-900 dark:text-white">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className="py-1 px-2 rounded-lg hover:bg-sage-100 dark:hover:bg-forest-900/40 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-line flex flex-col gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-forest-900 text-white font-bold text-sm shadow-md active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Accéder à mon Tableau de bord</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/connexion"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center font-semibold text-forest-900 dark:text-sage-200 rounded-xl border border-line bg-surface hover:bg-sage-50 transition-colors text-sm"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 text-center font-bold text-white bg-forest-900 hover:bg-forest-850 rounded-xl text-sm shadow-md active:scale-95 transition-all"
                  >
                    Créer un compte gratuit
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
