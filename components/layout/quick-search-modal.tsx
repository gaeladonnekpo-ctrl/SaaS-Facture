"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data/context";
import { formatFCFA } from "@/lib/format/money";
import {
  Search,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Headphones,
  Plus,
  ArrowRight,
  X,
  Zap,
} from "lucide-react";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATIC_ACTIONS = [
  {
    title: "Créer une nouvelle facture",
    category: "Actions",
    href: "/factures/nouvelle",
    icon: Plus,
    keywords: "nouvelle creer ajouter facture vente devis",
  },
  {
    title: "Liste des factures",
    category: "Pages",
    href: "/factures",
    icon: FileText,
    keywords: "factures liste impayees brouillon",
  },
  {
    title: "Gestion des clients",
    category: "Pages",
    href: "/clients",
    icon: Users,
    keywords: "clients repertoire carnet annuaire",
  },
  {
    title: "Journal des paiements",
    category: "Pages",
    href: "/paiements",
    icon: CreditCard,
    keywords: "paiements encaissements mobile money virement wave mtn",
  },
  {
    title: "Rapports & Déclaration TVA 18 %",
    category: "Pages",
    href: "/rapports",
    icon: BarChart3,
    keywords: "rapports tva fiscalite uemoa chiffre d affaires ca",
  },
  {
    title: "Support client & Assistance",
    category: "Pages",
    href: "/support",
    icon: Headphones,
    keywords: "support assistance aide whatsapp contact",
  },
  {
    title: "Paramètres de l'entreprise & compte",
    category: "Pages",
    href: "/parametres",
    icon: Settings,
    keywords: "parametres ifu rccm rib profil configuration",
  },
];

export function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const router = useRouter();
  const { invoices, customers } = useData();
  const [query, setQuery] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset query on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    if (!query.trim()) return invoices.slice(0, 3);
    const q = query.toLowerCase();
    return invoices
      .filter(
        (inv) =>
          inv.number.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          inv.customerCity.toLowerCase().includes(q) ||
          inv.displayStatus.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [invoices, query]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!query.trim()) return customers.slice(0, 3);
    const q = query.toLowerCase();
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [customers, query]);

  // Filter navigation actions
  const filteredActions = useMemo(() => {
    if (!query.trim()) return STATIC_ACTIONS.slice(0, 4);
    const q = query.toLowerCase();
    return STATIC_ACTIONS.filter(
      (act) => act.title.toLowerCase().includes(q) || act.keywords.includes(q)
    );
  }, [query]);

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest-950/50 backdrop-blur-xs transition-opacity animate-in fade-in-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3 sm:py-3.5 bg-sage-50/50">
          <Search className="w-5 h-5 text-forest-800 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une facture, un client, une action..."
            className="w-full bg-transparent text-sm font-medium text-forest-950 placeholder:text-sage-400 focus:outline-hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-lg p-1 text-sage-400 hover:text-forest-900"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-sage-500 shadow-2xs">
              ÉCHAP
            </kbd>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-3 space-y-4">
          {/* Factures section */}
          {filteredInvoices.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold text-sage-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-forest-800" />
                <span>Factures ({filteredInvoices.length})</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {filteredInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => handleNavigate(`/factures/${inv.id}`)}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-sage-100/70 transition-colors group"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-forest-950 group-hover:text-forest-800">
                          {inv.number}
                        </span>
                        <span className="truncate text-xs text-ink-muted">
                          {inv.customerName}
                        </span>
                      </div>
                      <p className="text-[11px] text-sage-500 truncate">
                        Émise le {inv.issueDate} • {inv.customerCity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-xs text-forest-950 tabular block">
                        {formatFCFA(inv.total)}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-sage-600">
                        {inv.displayStatus}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clients section */}
          {filteredCustomers.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold text-sage-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-forest-800" />
                <span>Clients ({filteredCustomers.length})</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleNavigate(`/clients/${c.id}`)}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-sage-100/70 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-forest-950 group-hover:text-forest-800 truncate">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-sage-500 truncate">
                        {c.city}, {c.country} • {c.phone}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-forest-900 tabular">
                        {formatFCFA(c.totalInvoiced)}
                      </span>
                      <span className="text-[10px] text-sage-500 block">
                        {c.invoicesCount} facture(s)
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions & Pages section */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold text-sage-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-forest-800 dark:text-lime-400" />
                <span>Navigation &amp; Actions rapides</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {filteredActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.href}
                      type="button"
                      onClick={() => handleNavigate(act.href)}
                      className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-sage-100/70 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage-100 text-forest-800 group-hover:bg-forest-900 group-hover:text-lime-400 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-forest-950">
                          {act.title}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-sage-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredInvoices.length === 0 &&
            filteredCustomers.length === 0 &&
            filteredActions.length === 0 && (
              <div className="py-8 text-center text-xs text-ink-muted">
                Aucun résultat pour « <strong className="text-forest-950">{query}</strong> ».
              </div>
            )}
        </div>

        {/* Footer shortcuts info */}
        <div className="border-t border-line bg-sage-50/70 px-4 py-2 flex items-center justify-between text-[11px] text-sage-500">
          <span>Recherche en direct dans tout votre espace</span>
          <span>DANHOMEY Facture</span>
        </div>
      </div>
    </div>
  );
}

