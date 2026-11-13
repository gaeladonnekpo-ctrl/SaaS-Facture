"use client";

import React, { useState, useMemo } from "react";
import {
  Smartphone,
  Landmark,
  ArrowLeftRight,
  Coins,
  Banknote,
  Search,
  Check,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  Info,
  ChevronRight,
} from "lucide-react";
import { PAYMENT_CATEGORIES, PAYMENT_PROVIDERS } from "@/lib/payment-methods/data";
import {
  PaymentCategory,
  PaymentProvider,
  ConfiguredPaymentMethod,
  PaymentTermsData,
} from "@/lib/payment-methods/types";
import { serializePaymentTerms } from "@/lib/payment-methods/serializer";
import { PaymentProviderLogo } from "./payment-provider-logo";

interface PaymentMethodsSelectorProps {
  initialData: PaymentTermsData;
  onChange: (serializedNotes: string, data: PaymentTermsData) => void;
  className?: string;
}

export function PaymentMethodsSelector({
  initialData,
  onChange,
  className = "",
}: PaymentMethodsSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<PaymentCategory>("mobile_money");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethods, setSelectedMethods] = useState<ConfiguredPaymentMethod[]>(
    initialData.methods || []
  );
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(
    initialData.paymentTermsDays ?? 30
  );
  const [customNotes, setCustomNotes] = useState<string>(initialData.customNotes || "");

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<PaymentCategory, number> = {
      mobile_money: 0,
      bank_transfer: 0,
      money_transfer: 0,
      crypto: 0,
      cash_cheque: 0,
    };
    selectedMethods.forEach((m) => {
      const p = PAYMENT_PROVIDERS.find((prov) => prov.id === m.providerId);
      if (p) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [selectedMethods]);

  // Filtered providers
  const filteredProviders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return PAYMENT_PROVIDERS.filter((provider) => {
      const matchesCategory = searchQuery.length > 0 || provider.category === activeCategory;
      if (!matchesCategory) return false;

      if (!query) return true;
      return (
        provider.name.toLowerCase().includes(query) ||
        provider.shortCode.toLowerCase().includes(query) ||
        provider.countryOrZone.toLowerCase().includes(query) ||
        provider.tagline.toLowerCase().includes(query)
      );
    });
  }, [activeCategory, searchQuery]);

  // Notify parent of state changes
  const notifyChange = (
    methods: ConfiguredPaymentMethod[],
    days: number,
    notes: string
  ) => {
    const updatedData: PaymentTermsData = {
      methods,
      paymentTermsDays: days,
      customNotes: notes,
    };
    const serialized = serializePaymentTerms(updatedData);
    onChange(serialized, updatedData);
  };

  // Toggle selection of a provider
  const handleToggleProvider = (provider: PaymentProvider) => {
    const isSelected = selectedMethods.some((m) => m.providerId === provider.id);
    let updated: ConfiguredPaymentMethod[];

    if (isSelected) {
      updated = selectedMethods.filter((m) => m.providerId !== provider.id);
    } else {
      // Initialize with default placeholder values
      const initialDetails: Record<string, string> = {};
      provider.fields.forEach((f) => {
        initialDetails[f.key] = f.defaultValue || "";
      });
      updated = [...selectedMethods, { providerId: provider.id, details: initialDetails }];
    }

    setSelectedMethods(updated);
    notifyChange(updated, paymentTermsDays, customNotes);
  };

  // Update a field inside a configured method
  const handleFieldChange = (providerId: string, fieldKey: string, value: string) => {
    const updated = selectedMethods.map((method) => {
      if (method.providerId === providerId) {
        return {
          ...method,
          details: {
            ...method.details,
            [fieldKey]: value,
          },
        };
      }
      return method;
    });

    setSelectedMethods(updated);
    notifyChange(updated, paymentTermsDays, customNotes);
  };

  // Update payment terms days (0, 15, 30, 60...)
  const handleDaysPreset = (days: number) => {
    setPaymentTermsDays(days);
    notifyChange(selectedMethods, days, customNotes);
  };

  // Update custom notes
  const handleCustomNotesChange = (val: string) => {
    setCustomNotes(val);
    notifyChange(selectedMethods, paymentTermsDays, val);
  };

  const getCategoryIcon = (id: PaymentCategory) => {
    switch (id) {
      case "mobile_money":
        return <Smartphone className="w-3.5 h-3.5" />;
      case "bank_transfer":
        return <Landmark className="w-3.5 h-3.5" />;
      case "money_transfer":
        return <ArrowLeftRight className="w-3.5 h-3.5" />;
      case "crypto":
        return <Coins className="w-3.5 h-3.5" />;
      case "cash_cheque":
        return <Banknote className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Search & Category Tabs */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            type="text"
            data-gramm="false"
            data-enable-grammarly="false"
            spellCheck={false}
            autoComplete="off"
            placeholder="Rechercher un opérateur (Wave, MTN, Moov), une banque (BOA, Ecobank, Coris) ou une crypto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-sage-50/70 dark:bg-forest-900/60 border border-line pl-10 pr-4 py-2.5 text-xs text-forest-950 dark:text-white placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-lime-400 transition-all"
          />
        </div>

        {/* Category Pills (Active only if not searching) */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {PAYMENT_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const selectedCount = categoryCounts[cat.id] || 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                    isActive
                      ? "bg-forest-900 text-white border-forest-900 dark:bg-lime-400 dark:text-forest-950 dark:border-lime-400 shadow-sm"
                      : "bg-surface text-ink-muted border-line hover:text-forest-950 dark:hover:text-white hover:bg-sage-50 dark:hover:bg-forest-900/40"
                  }`}
                >
                  <span className={isActive ? "text-lime-300 dark:text-forest-900" : "text-ink-muted"}>
                    {getCategoryIcon(cat.id)}
                  </span>
                  <span>{cat.shortLabel}</span>
                  {selectedCount > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-forest-950/20 dark:text-forest-950"
                          : "bg-forest-900 text-lime-400 dark:bg-lime-400 dark:text-forest-950"
                      }`}
                    >
                      {selectedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid of Providers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-sage-500 dark:text-sage-400 uppercase tracking-wider">
            {searchQuery
              ? `Résultats de recherche (${filteredProviders.length})`
              : PAYMENT_CATEGORIES.find((c) => c.id === activeCategory)?.name}
          </span>
          <span className="text-[11px] text-ink-muted">
            {selectedMethods.length}{" "}
            {selectedMethods.length > 1 ? "moyens sélectionnés" : "moyen sélectionné"}
          </span>
        </div>

        {filteredProviders.length === 0 ? (
          <div className="p-6 text-center rounded-2xl border border-dashed border-line bg-surface/50 text-xs text-ink-muted">
            Aucun moyen de paiement trouvé pour &laquo; {searchQuery} &raquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
            {filteredProviders.map((provider) => {
              const isSelected = selectedMethods.some((m) => m.providerId === provider.id);

              return (
                <div
                  key={provider.id}
                  onClick={() => handleToggleProvider(provider)}
                  className={`group cursor-pointer rounded-2xl border p-3 flex items-start gap-3 transition-all relative select-none ${
                    isSelected
                      ? "border-forest-900 dark:border-lime-400 bg-forest-900/5 dark:bg-lime-400/10 shadow-sm ring-1 ring-forest-900/20 dark:ring-lime-400/20"
                      : "border-line bg-surface hover:border-forest-700/40 dark:hover:border-lime-400/40 hover:bg-sage-50/50 dark:hover:bg-forest-900/30"
                  }`}
                >
                  {/* Provider Logo */}
                  <PaymentProviderLogo providerId={provider.id} size={36} />

                  {/* Provider Details */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-forest-950 dark:text-white truncate">
                        {provider.name}
                      </h4>
                    </div>
                    <p className="text-[10px] text-ink-muted truncate mt-0.5" title={provider.countryOrZone}>
                      {provider.countryOrZone}
                    </p>
                    <p className="text-[10px] text-ink-muted/80 line-clamp-1 mt-0.5">
                      {provider.tagline}
                    </p>
                  </div>

                  {/* Checkbox indicator */}
                  <div
                    className={`absolute top-3 right-3 w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-forest-900 dark:bg-lime-400 text-white dark:text-forest-950 shadow-xs"
                        : "border border-line bg-surface/80 text-transparent group-hover:border-forest-700"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Methods Configuration Cards */}
      {selectedMethods.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-line">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-forest-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-lime-400" />
              <span>Coordonnées pour les règlements sélectionnés</span>
            </h3>
            <span className="text-[11px] text-ink-muted">
              Apparaîtront clairement sur le document final
            </span>
          </div>

          <div className="space-y-3">
            {selectedMethods.map((configured) => {
              const provider = PAYMENT_PROVIDERS.find((p) => p.id === configured.providerId);
              if (!provider) return null;

              return (
                <div
                  key={configured.providerId}
                  className="rounded-2xl border border-line bg-sage-50/50 dark:bg-forest-900/40 p-3.5 sm:p-4 space-y-3 transition-all"
                >
                  {/* Method Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-line">
                    <div className="flex items-center gap-2.5">
                      <PaymentProviderLogo providerId={provider.id} size={28} />
                      <div>
                        <span className="text-xs font-bold text-forest-950 dark:text-white">
                          {provider.name}
                        </span>
                        <span className="text-[10px] text-ink-muted ml-2">
                          ({provider.countryOrZone})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleProvider(provider)}
                      className="p-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Retirer ce moyen de paiement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Form fields for this provider */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {provider.fields.map((field) => {
                      const val = configured.details[field.key] || "";

                      return (
                        <div key={field.key} className={field.key === "iban" || field.key === "address" ? "sm:col-span-2" : ""}>
                          <label className="block text-[11px] font-semibold text-forest-950 dark:text-white mb-1">
                            {field.label}
                          </label>
                          <input
                            type={field.type || "text"}
                            data-gramm="false"
                            data-enable-grammarly="false"
                            spellCheck={false}
                            autoComplete="off"
                            placeholder={field.placeholder}
                            value={val}
                            onChange={(e) =>
                              handleFieldChange(provider.id, field.key, e.target.value)
                            }
                            className="w-full rounded-xl bg-surface border border-line px-3 py-2 text-xs text-forest-950 dark:text-white placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-lime-400 font-mono"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Deadlines (Délai de règlement) & Additional Notes */}
      <div className="space-y-3 pt-3 border-t border-line">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="block text-xs font-bold text-forest-950 dark:text-white uppercase tracking-wider">
            Délai de règlement de la facture
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: "Comptant (0j)", days: 0 },
              { label: "15 jours", days: 15 },
              { label: "30 jours", days: 30 },
              { label: "45 jours", days: 45 },
              { label: "60 jours", days: 60 },
            ].map((preset) => (
              <button
                key={preset.days}
                type="button"
                onClick={() => handleDaysPreset(preset.days)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                  paymentTermsDays === preset.days
                    ? "bg-forest-900 text-white dark:bg-lime-400 dark:text-forest-950 border-forest-900 dark:border-lime-400 font-bold shadow-xs"
                    : "bg-surface border-line text-ink-muted hover:bg-sage-50 dark:hover:bg-forest-900/40"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Custom Instructions / Notes with anti-extension protection */}
        <div>
          <label className="block text-xs font-semibold text-forest-950 dark:text-white mb-1">
            Instructions ou mentions complémentaires (optionnel)
          </label>
          <input
            type="text"
            data-gramm="false"
            data-enable-grammarly="false"
            spellCheck={false}
            autoComplete="off"
            placeholder="Ex. Préciser le numéro de facture lors de votre virement ou envoi."
            value={customNotes}
            onChange={(e) => handleCustomNotesChange(e.target.value)}
            className="w-full rounded-xl bg-sage-50/70 dark:bg-forest-900/60 border border-line px-3.5 py-2.5 text-xs text-forest-950 dark:text-white placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-lime-400"
          />
        </div>
      </div>
    </div>
  );
}
