"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, Home, ChevronRight } from "lucide-react";
import { NotificationPopover } from "./notification-popover";
import { PeriodCalendarPopover } from "./period-calendar-popover";
import { HeaderSearchBar } from "./header-search-bar";
import { ThemeToggleButton } from "./theme-toggle-button";
import { LanguageSelectorPopover } from "./language-selector-popover";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationDictionary } from "@/lib/i18n/translations";
import { Logo } from "@/components/ui/logo";

interface TopHeaderProps {
  onOpenSidebar: () => void;
}

interface CrumbItem {
  label: string;
  href?: string;
}

interface PageMeta {
  breadcrumbs: CrumbItem[];
  title: string;
  titleHref?: string;
  badge?: string;
}

function getPageMeta(
  pathname: string,
  t: (key: keyof TranslationDictionary, fallback?: string) => string
): PageMeta {
  const homeLabel = t("nav_home", "Accueil");
  const dashLabel = t("nav_dashboard", "Tableau de bord");
  const invLabel = t("nav_invoices", "Factures");
  const custLabel = t("nav_customers", "Clients");
  const payLabel = t("nav_payments", "Paiements");
  const repLabel = t("nav_reports", "Rapports");
  const setLabel = t("nav_settings", "Paramètres");
  const supLabel = t("nav_support", "Support client");

  if (pathname === "/dashboard" || pathname === "/tableau-de-bord" || pathname === "/") {
    return {
      breadcrumbs: [
        { label: homeLabel, href: "/dashboard" },
        { label: dashLabel, href: "/dashboard" },
      ],
      title: t("dash_overview", "Vue d'ensemble"),
      titleHref: "/dashboard",
      badge: t("badge_live", "En direct"),
    };
  }
  if (pathname.startsWith("/factures/nouvelle")) {
    return {
      breadcrumbs: [
        { label: homeLabel, href: "/dashboard" },
        { label: invLabel, href: "/factures" },
        { label: t("nav_new_invoice", "Nouvelle facture") },
      ],
      title: t("nav_new_invoice", "Créer une facture"),
      titleHref: "/factures/nouvelle",
      badge: t("status_draft", "Brouillon"),
    };
  }
  if (pathname.includes("/modifier")) {
    return {
      breadcrumbs: [
        { label: homeLabel, href: "/dashboard" },
        { label: invLabel, href: "/factures" },
        { label: t("action_edit", "Modification") },
      ],
      title: t("action_edit", "Modifier la facture"),
    };
  }
  if (pathname.startsWith("/factures/")) {
    return {
      breadcrumbs: [
        { label: homeLabel, href: "/dashboard" },
        { label: invLabel, href: "/factures" },
        { label: t("inv_detail_title", "Détail facture") },
      ],
      title: t("inv_detail_title", "Fiche facture"),
      titleHref: "/factures",
    };
  }
  if (pathname === "/factures") {
    return {
      breadcrumbs: [
        { label: homeLabel, href: "/dashboard" },
        { label: invLabel, href: "/factures" },
      ],
      title: invLabel,
      titleHref: "/factures",
    };
  }
  if (pathname.startsWith("/clients/")) {
    return {
      breadcrumbs: [
        { label: homeLabel, href: "/dashboard" },
        { label: custLabel, href: "/clients" },
        { label: t("cust_title", "Fiche client") },
      ],
      title: t("cust_title", "Fiche client"),
      titleHref: "/clients",
    };
  }
  if (pathname === "/clients") {
    return {
      breadcrumbs: [
        { label: homeLabel, href: "/dashboard" },
        { label: custLabel, href: "/clients" },
      ],
      title: custLabel,
      titleHref: "/clients",
    };
  }
  if (pathname === "/paiements") {
    return {
      breadcrumbs: [
        { label: homeLabel, href: "/dashboard" },
        { label: payLabel, href: "/paiements" },
      ],
      title: payLabel,
      titleHref: "/paiements",
      badge: t("badge_mobile_money_bank", "Mobile Money & Banque"),
    };
  }
  if (pathname === "/rapports") {
    return {
      breadcrumbs: [
        { label: homeLabel, href: "/dashboard" },
        { label: repLabel, href: "/rapports" },
      ],
      title: repLabel,
      titleHref: "/rapports",
      badge: t("badge_vat_uemoa", "TVA 18 % UEMOA"),
    };
  }
  if (pathname === "/parametres") {
    return {
      breadcrumbs: [
        { label: homeLabel, href: "/dashboard" },
        { label: setLabel, href: "/parametres" },
      ],
      title: setLabel,
      titleHref: "/parametres",
    };
  }
  if (pathname === "/support") {
    return {
      breadcrumbs: [
        { label: homeLabel, href: "/dashboard" },
        { label: supLabel, href: "/support" },
      ],
      title: supLabel,
      titleHref: "/support",
      badge: t("badge_online", "En ligne"),
    };
  }

  return {
    breadcrumbs: [
      { label: homeLabel, href: "/dashboard" },
      { label: dashLabel, href: "/dashboard" },
    ],
    title: t("dash_overview", "Vue d'ensemble"),
    titleHref: "/dashboard",
  };
}

export function TopHeader({ onOpenSidebar }: TopHeaderProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const pageMeta = useMemo(() => getPageMeta(pathname, t), [pathname, t]);

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 lg:h-18 w-full items-center justify-between gap-3 sm:gap-4 lg:gap-6 border-b border-line bg-surface/95 px-3 sm:px-6 lg:px-8 backdrop-blur-md transition-colors">
      {/* Left section: Hamburger (mobile) & Interactive Dynamic Breadcrumbs & Title */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0 max-w-[42%] sm:max-w-[50%] lg:max-w-[45%]">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-forest-900 hover:bg-sage-100 lg:hidden focus:outline-hidden shrink-0 shadow-2xs active:scale-95 transition-transform"
          aria-label={t("aria_open_nav", "Ouvrir le menu de navigation")}
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        {/* Mobile Official Logo Emblem */}
        <Link href="/dashboard" className="lg:hidden shrink-0" title="DANHOMEY Facture">
          <Logo variant="icon" size="sm" />
        </Link>

        <div className="flex flex-col min-w-0 justify-center">
          {/* Breadcrumbs with interactive active links */}
          <nav aria-label={t("aria_breadcrumbs", "Fil d'Ariane")} className="hidden sm:flex items-center gap-1 text-[11px] text-ink-muted overflow-hidden">
            {pageMeta.breadcrumbs.map((crumb, idx) => {
              const isLast = idx === pageMeta.breadcrumbs.length - 1;
              const isFirst = idx === 0;

              return (
                <React.Fragment key={`${crumb.label}-${idx}`}>
                  {idx > 0 && (
                    <ChevronRight className="w-3 h-3 text-sage-300 shrink-0" />
                  )}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-sage-600 hover:bg-sage-100 hover:text-forest-950 transition-colors font-medium group whitespace-nowrap shrink-0 max-w-[120px] truncate"
                      title={`Aller à ${crumb.label}`}
                    >
                      {isFirst && <Home className="w-3 h-3 text-sage-400 group-hover:text-forest-800 shrink-0" />}
                      <span className="truncate">{crumb.label}</span>
                    </Link>
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 max-w-[150px] truncate ${
                        isLast
                          ? "font-semibold text-forest-950 bg-forest-50/60 dark:bg-forest-900/40 border border-forest-200/50 dark:border-forest-700/50 shadow-2xs"
                          : "text-sage-600 font-medium"
                      }`}
                      title={crumb.label}
                    >
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Dynamic Interactive Title */}
          <div className="flex items-center gap-2 mt-0.5 min-w-0">
            {pageMeta.titleHref ? (
              <Link
                href={pageMeta.titleHref}
                className="group flex items-center gap-2 min-w-0 hover:opacity-90 transition-opacity"
                title={`Afficher ${pageMeta.title}`}
              >
                <h1 className="text-xs sm:text-base lg:text-lg font-bold text-forest-950 tracking-tight group-hover:text-forest-800 transition-colors truncate">
                  {pageMeta.title}
                </h1>
              </Link>
            ) : (
              <h1 className="text-xs sm:text-base lg:text-lg font-bold text-forest-950 tracking-tight truncate">
                {pageMeta.title}
              </h1>
            )}

            {pageMeta.badge && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-700/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="whitespace-nowrap">{pageMeta.badge}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center / Right Section */}
      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5 shrink-0 ml-auto min-w-0">
        {/* Interactive Search Bar with Live Results & Action Button */}
        <div className="hidden md:block">
          <HeaderSearchBar />
        </div>

        {/* Period Selector with interactive mini-calendar */}
        <PeriodCalendarPopover />

        {/* Multilingual Selector Popover */}
        <LanguageSelectorPopover />

        {/* Dark Mode / Light Mode Toggle Button */}
        <ThemeToggleButton />

        {/* Notifications Popover */}
        <NotificationPopover />

        {/* Primary CTA Link Button */}
        <Link
          href="/factures/nouvelle"
          className="flex h-9 items-center gap-1.5 sm:gap-2 rounded-xl bg-forest-900 px-2.5 sm:px-3 text-xs font-semibold text-surface shadow-xs hover:bg-forest-850 active:scale-95 transition-all group shrink-0"
        >
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-lime-400 text-forest-950 group-hover:scale-110 transition-transform shrink-0">
            <Plus className="w-2.5 h-2.5 stroke-[3]" />
          </div>
          <span className="hidden 2xl:inline whitespace-nowrap">{t("nav_new_invoice", "Créer une facture")}</span>
          <span className="hidden sm:inline 2xl:hidden whitespace-nowrap">+ {t("inv_invoice", "Facture")}</span>
          <span className="sm:hidden text-xs font-semibold whitespace-nowrap">+</span>
        </Link>
      </div>
    </header>
  );
}
