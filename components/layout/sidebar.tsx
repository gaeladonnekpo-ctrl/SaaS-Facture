"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { LogoutConfirmDialog } from "@/components/auth/logout-confirm-dialog";
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Headphones,
  Plus,
  ChevronDown,
  Building2,
  X,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationDictionary } from "@/lib/i18n/translations";
import { Logo } from "@/components/ui/logo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemDef {
  key: keyof TranslationDictionary;
  defaultName: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const NAV_ITEM_DEFS: NavItemDef[] = [
  {
    key: "nav_dashboard",
    defaultName: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    key: "nav_invoices",
    defaultName: "Factures",
    href: "/factures",
    icon: FileText,
  },
  {
    key: "nav_customers",
    defaultName: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    key: "nav_payments",
    defaultName: "Paiements",
    href: "/paiements",
    icon: CreditCard,
  },
  {
    key: "nav_reports",
    defaultName: "Rapports",
    href: "/rapports",
    icon: BarChart3,
  },
  {
    key: "nav_settings",
    defaultName: "Paramètres",
    href: "/parametres",
    icon: Settings,
  },
  {
    key: "nav_support",
    defaultName: "Support client",
    href: "/support",
    icon: Headphones,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { organization, user, invoices, customers } = useData();
  const { t } = useI18n();

  // State for logout confirmation dialog
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onClose) onClose();
      await signOut();
      window.location.replace("/connexion");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-forest-950/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-surface transition-transform duration-300 ease-in-out lg:static lg:w-72 lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Header: Logo & Mobile Close */}
        <div className="flex h-14 sm:h-16 lg:h-18 items-center justify-between px-4 sm:px-5 border-b border-line-subtle">
          <Link href="/" className="group min-w-0 focus:outline-hidden" onClick={onClose}>
            <Logo
              variant="full"
              size="md"
              withBadge={true}
              withTagline={true}
              tagline={t("sidebar_billing_zone", "Facturation UEMOA & CEMAC")}
              className="group-hover:opacity-95 transition-opacity"
              priority
            />
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sage-500 hover:bg-sage-100 lg:hidden focus:outline-hidden"
            aria-label="Fermer la navigation"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Organization Switcher */}
        <div className="p-3">
          <Link
            href="/parametres"
            onClick={onClose}
            className="flex items-center justify-between gap-2 rounded-xl border border-line bg-sage-50/60 p-2.5 text-left hover:bg-sage-100/70 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface border border-line text-forest-800 shadow-2xs">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-semibold text-forest-950 group-hover:text-forest-800">
                  {organization.name}
                </p>
                <p className="truncate text-[11px] text-ink-muted">
                  {organization.city}, {organization.country}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-sage-400 shrink-0 group-hover:text-forest-800 transition-colors" />
          </Link>
        </div>

        {/* Primary CTA in Sidebar */}
        <div className="px-3 pt-1 pb-3">
          <Link
            href="/factures/nouvelle"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-xs font-semibold text-surface shadow-sm hover:bg-forest-850 hover:shadow transition-all group focus:outline-hidden active:scale-[0.98]"
          >
            <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-lime-400 text-forest-950 group-hover:rotate-90 transition-transform">
              <Plus className="w-3 h-3 stroke-[2.8]" />
            </div>
            <span>{t("nav_new_invoice", "Nouvelle facture")}</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-sage-400 uppercase">
            {t("sidebar_menu_header", "Menu")}
          </div>
          {NAV_ITEM_DEFS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname === "/tableau-de-bord"
                : pathname.startsWith(item.href);

            const dynamicBadge =
              item.key === "nav_invoices"
                ? invoices.length
                : item.key === "nav_customers"
                ? customers.length
                : item.badge;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-forest-900 text-surface shadow-2xs"
                    : "text-sage-600 hover:bg-sage-100 hover:text-forest-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-lime-400" : "text-sage-400 group-hover:text-forest-800"
                    }`}
                  />
                  <span>{t(item.key, item.defaultName)}</span>
                </div>
                {dynamicBadge !== undefined && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tabular ${
                      isActive
                        ? "bg-forest-800 text-lime-300"
                        : "bg-sage-100 text-sage-600 group-hover:bg-sage-200"
                    }`}
                  >
                    {dynamicBadge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Help / Upgrade Banner */}
        <div className="p-3">
          <div className="rounded-xl border border-lime-300/40 dark:border-lime-700/40 bg-gradient-to-br from-lime-50/70 to-sage-100/60 dark:from-forest-900/60 dark:to-sage-950/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-forest-900 dark:text-lime-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-lime-400" />
              <span>{t("sidebar_uemoa_compliance", "Conformité UEMOA")}</span>
            </div>
            <p className="mt-1 text-[11px] text-sage-600 dark:text-sage-400 leading-relaxed">
              {t("sidebar_uemoa_desc", "TVA à 18 %, montants en lettres automatiques et mentions légales OHADA.")}
            </p>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-line-subtle bg-surface flex items-center justify-between gap-2">
          <Link
            href="/parametres"
            onClick={onClose}
            className="flex items-center gap-2.5 min-w-0 flex-1 rounded-xl p-1.5 hover:bg-sage-50 dark:hover:bg-forest-900/40 transition-colors"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-800 font-semibold text-xs text-lime-300 ring-2 ring-lime-200/60">
              {user.initials}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
            </div>
            <div className="truncate">
              <p className="truncate text-xs font-semibold text-forest-950 dark:text-white">{user.name}</p>
              <p className="truncate text-[11px] text-ink-muted">{user.role}</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="rounded-lg p-2 text-sage-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
            title={t("auth_logout", "Se déconnecter")}
            aria-label={t("auth_logout", "Se déconnecter")}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mandatory Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}

