"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import { formatFCFA } from "@/lib/format/money";
import {
  Search,
  Users,
  FileText,
  X,
  ArrowRight,
  CornerDownLeft,
  Plus,
  ChevronRight,
} from "lucide-react";

export function HeaderSearchBar() {
  const router = useRouter();
  const { customers, invoices } = useData();
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter clients matching query
  const matchingCustomers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.taxId.toLowerCase().includes(q)
    );
  }, [customers, query]);

  // Filter invoices matching query
  const matchingInvoices = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.number.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerCity.toLowerCase().includes(q) ||
        inv.displayStatus.toLowerCase().includes(q)
    );
  }, [invoices, query]);

  const handleSelectCustomer = (customerId: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/clients/${customerId}`);
  };

  const handleSelectInvoice = (invoiceId: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/factures/${invoiceId}`);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    // If there is an exact client match, jump to it
    if (matchingCustomers.length === 1 && matchingCustomers[0]) {
      handleSelectCustomer(matchingCustomers[0].id);
      return;
    }

    // Otherwise jump to invoices search or clients
    if (matchingInvoices.length > 0 && matchingInvoices[0]) {
      handleSelectInvoice(matchingInvoices[0].id);
      return;
    }

    // Default fallback to factures
    setIsOpen(false);
    router.push(`/factures`);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-28 sm:w-32 md:w-36 lg:w-40 xl:w-48 2xl:w-56 focus-within:w-36 sm:focus-within:w-40 md:focus-within:w-44 lg:focus-within:w-48 xl:focus-within:w-56 transition-all duration-200 shrink-0"
    >
      <form onSubmit={handleSubmit} className="relative flex items-center">
        {/* Search Icon / Button */}
        <button
          type="button"
          onClick={() => {
            inputRef.current?.focus();
            setIsOpen(true);
          }}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sage-400 hover:text-forest-900 transition-colors"
          title={t("action_search", "Rechercher")}
          aria-label={t("action_search", "Rechercher")}
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t("top_search_placeholder", "Rechercher...")}
          className="w-full rounded-xl border border-line bg-sage-50/70 py-1.5 pl-8 pr-8 text-xs text-forest-950 placeholder:text-sage-400 focus:border-forest-700 focus:bg-surface focus:outline-hidden transition-all shadow-2xs truncate"
        />

        {/* Action button on the right */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query.trim() ? (
            <>
              <button
                type="button"
                onClick={handleClear}
                className="h-5 w-5 flex items-center justify-center rounded-md text-sage-400 hover:text-forest-900 hover:bg-sage-100 transition-colors"
                title={t("action_clear", "Effacer")}
              >
                <X className="w-3 h-3" />
              </button>
              <button
                type="submit"
                className="h-5 px-1.5 flex items-center justify-center gap-0.5 rounded-md bg-forest-900 text-lime-400 hover:bg-forest-850 text-[10px] font-semibold transition-all active:scale-95 shadow-2xs"
                title={t("action_search", "Rechercher")}
              >
                <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
              </button>
            </>
          ) : (
            <kbd
              onClick={() => {
                inputRef.current?.focus();
                setIsOpen(true);
              }}
              className="hidden sm:inline-flex items-center justify-center h-4.5 px-1 rounded text-[9px] font-mono font-medium text-sage-400 bg-surface border border-line cursor-pointer hover:border-forest-700 hover:text-forest-900 transition-colors"
              title={t("search_press_enter", "Appuyez sur Entrée ↵")}
            >
              ↵
            </kbd>
          )}
        </div>
      </form>

      {/* Interactive Dropdown Results */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto w-80 sm:w-96 mt-2 z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-dropdown animate-in fade-in-50 zoom-in-95">
          {/* Case 1: When user has typed something */}
          {query.trim() !== "" ? (
            <div className="max-h-80 overflow-y-auto p-2 space-y-3">
              {/* Clients section */}
              {matchingCustomers.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-bold text-sage-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-forest-800" />
                    <span>{t("search_clients_found", "Clients trouvés")} ({matchingCustomers.length})</span>
                  </div>
                  <div className="mt-0.5 space-y-0.5">
                    {matchingCustomers.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCustomer(c.id)}
                        className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left hover:bg-sage-100/70 transition-colors group"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-xs text-forest-950 group-hover:text-forest-800 truncate">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-sage-500 truncate">
                            {c.city}, {c.country} • {c.phone}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-semibold text-forest-900 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200">
                          {t("search_view_customer", "Fiche client →")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices section */}
              {matchingInvoices.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-bold text-sage-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-forest-800" />
                    <span>{t("search_invoices_found", "Factures trouvées")} ({matchingInvoices.length})</span>
                  </div>
                  <div className="mt-0.5 space-y-0.5">
                    {matchingInvoices.slice(0, 4).map((inv) => (
                      <button
                        key={inv.id}
                        type="button"
                        onClick={() => handleSelectInvoice(inv.id)}
                        className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left hover:bg-sage-100/70 transition-colors group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-forest-950 group-hover:text-forest-800">
                              {inv.number}
                            </span>
                            <span className="text-xs text-ink-muted truncate">
                              {inv.customerName}
                            </span>
                          </div>
                          <p className="text-[11px] text-sage-500">
                            {inv.issueDate} • {formatFCFA(inv.total)}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-semibold text-forest-900 bg-sage-50 px-2 py-0.5 rounded-md border border-line">
                          {t("search_open_invoice", "Ouvrir →")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {matchingCustomers.length === 0 && matchingInvoices.length === 0 && (
                <div className="py-6 px-3 text-center space-y-2">
                  <p className="text-xs text-forest-950 font-medium">
                    {t("search_no_match", "Aucun client ni facture ne correspond à")} « <strong className="font-bold">{query}</strong> »
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    Vérifiez l&apos;orthographe ou parcourez la liste complète des clients.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/clients");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-forest-900 px-3 py-1.5 text-xs font-semibold text-surface shadow hover:bg-forest-850 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-lime-400" />
                    <span>{t("search_see_all_clients", "Consulter tous les clients")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Case 2: When user clicks into the bar before typing (Suggestions) */
            <div className="p-3 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-sage-400 uppercase tracking-wider block mb-1 px-1">
                  {t("search_recent_clients", "Clients récents")}
                </span>
                <div className="space-y-0.5">
                  {customers.slice(0, 3).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCustomer(c.id)}
                      className="w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left hover:bg-sage-100 transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Users className="w-3.5 h-3.5 text-sage-400 group-hover:text-forest-800 shrink-0" />
                        <span className="text-xs font-medium text-forest-950 truncate">
                          {c.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-sage-500 tabular shrink-0">
                        {c.city}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-line-subtle pt-2">
                <span className="text-[10px] font-bold text-sage-400 uppercase tracking-wider block mb-1 px-1">
                  {t("search_quick_shortcuts", "Raccourcis rapides")}
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/factures/nouvelle");
                    }}
                    className="flex items-center gap-2 rounded-xl bg-sage-50 p-2 text-left hover:bg-sage-100 transition-colors font-semibold text-forest-950"
                  >
                    <Plus className="w-3.5 h-3.5 text-forest-800 dark:text-lime-400 shrink-0" />
                    <span>{t("search_new_invoice", "Créer une facture")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/clients");
                    }}
                    className="flex items-center gap-2 rounded-xl bg-sage-50 p-2 text-left hover:bg-sage-100 transition-colors font-semibold text-forest-950"
                  >
                    <Users className="w-3.5 h-3.5 text-forest-800 shrink-0" />
                    <span>{t("search_customer_directory", "Annuaire clients")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="border-t border-line bg-sage-50/60 px-3 py-1.5 flex items-center justify-between text-[10px] text-sage-500">
            <span>{t("search_instant_auto", "Recherche automatique instantanée")}</span>
            <span>{t("search_press_enter", "Appuyez sur Entrée ↵")}</span>
          </div>
        </div>
      )}
    </div>
  );
}

