"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  CreditCard,
  Search,
  Check,
  ShieldCheck,
  Smartphone,
  Landmark,
  ArrowLeftRight,
  Coins,
  Banknote,
  Calendar,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { formatFCFA } from "@/lib/format/money";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import type { MockInvoice } from "@/lib/mock-data";
import type { PaymentMethod } from "@/lib/domain/types";
import { PAYMENT_CATEGORIES, PAYMENT_PROVIDERS } from "@/lib/payment-methods/data";
import { PaymentCategory, PaymentProvider } from "@/lib/payment-methods/types";
import { deserializePaymentTerms } from "@/lib/payment-methods/serializer";
import { PaymentProviderLogo } from "./payment-provider-logo";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: MockInvoice;
  onSuccess?: () => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: RecordPaymentModalProps) {
  const { recordPayment, showToast } = useData();
  const { t } = useI18n();

  const balanceDue = Math.max(0, invoice.total - invoice.amountPaid);

  // Deserialized payment terms from invoice notes to get methods requested by the seller
  const termsData = useMemo(() => {
    return deserializePaymentTerms(invoice.notes);
  }, [invoice.notes]);

  const invoiceSuggestedMethods = useMemo(() => {
    if (!termsData.methods || termsData.methods.length === 0) return [];
    return termsData.methods
      .map((m) => {
        const provider = PAYMENT_PROVIDERS.find((p) => p.id === m.providerId);
        return provider ? { ...provider, details: m.details } : null;
      })
      .filter((p): p is PaymentProvider & { details: Record<string, string> } => Boolean(p));
  }, [termsData]);

  // Form states
  const [amountStr, setAmountStr] = useState<string>(String(balanceDue));
  const [selectedCategory, setSelectedCategory] = useState<PaymentCategory>("mobile_money");
  const [selectedProviderId, setSelectedProviderId] = useState<string>(() => {
    const firstSuggested = invoiceSuggestedMethods[0];
    return firstSuggested ? firstSuggested.id : "wave";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [reference, setReference] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default amount when balanceDue changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setAmountStr(String(balanceDue));
      const firstSuggested = invoiceSuggestedMethods[0];
      if (firstSuggested) {
        setSelectedProviderId(firstSuggested.id);
        setSelectedCategory(firstSuggested.category);
      } else {
        setSelectedProviderId("wave");
        setSelectedCategory("mobile_money");
      }
      setReference(`REC-${Date.now().toString().slice(-6)}`);
      setNote("");
      setSearchQuery("");
      setPaymentDate(new Date().toISOString().slice(0, 10));
    }
  }, [isOpen, balanceDue, invoiceSuggestedMethods]);

  const selectedProvider: PaymentProvider = useMemo(() => {
    return (
      PAYMENT_PROVIDERS.find((p) => p.id === selectedProviderId) ??
      PAYMENT_PROVIDERS[0]!
    );
  }, [selectedProviderId]);

  // Filtered providers
  const filteredProviders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return PAYMENT_PROVIDERS.filter((provider) => {
      const matchesCategory = searchQuery.length > 0 || provider.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!query) return true;
      return (
        provider.name.toLowerCase().includes(query) ||
        provider.shortCode.toLowerCase().includes(query) ||
        provider.countryOrZone.toLowerCase().includes(query) ||
        provider.tagline.toLowerCase().includes(query)
      );
    });
  }, [selectedCategory, searchQuery]);

  const parsedAmount = Math.round(Number(amountStr.replace(/\s/g, ""))) || 0;

  const handleSelectProvider = (prov: PaymentProvider) => {
    setSelectedProviderId(prov.id);
    setSelectedCategory(prov.category);
    // Update suggested reference prefix if default
    if (reference.startsWith("REC-") || !reference.trim()) {
      setReference(`${prov.shortCode || "PAY"}-${Date.now().toString().slice(-6)}`);
    }
  };

  const mapCategoryToMethod = (cat: PaymentCategory, provId: string): PaymentMethod => {
    if (cat === "mobile_money") return "mobile_money";
    if (cat === "bank_transfer") return "bank_transfer";
    if (cat === "cash_cheque") {
      return provId.includes("cheque") ? "cheque" : "cash";
    }
    return "other";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedAmount <= 0) {
      showToast({
        type: "error",
        message: "Le montant du paiement doit être strictement supérieur à zéro.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const mappedMethod = mapCategoryToMethod(selectedProvider.category, selectedProvider.id);
      const refFinal = reference.trim() || `${selectedProvider.shortCode || "PAY"}-${Date.now().toString().slice(-6)}`;

      recordPayment(invoice.id, {
        amount: parsedAmount,
        method: mappedMethod,
        reference: refFinal,
        note: note.trim() || undefined,
        providerId: selectedProvider.id,
        providerName: selectedProvider.name,
      });

      showToast({
        type: "success",
        title: "Encaissement enregistré",
        message: `Règlement de ${formatFCFA(parsedAmount)} via ${selectedProvider.name} validé avec succès.`,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erreur enregistrement encaissement :", err);
      showToast({
        type: "error",
        title: "Erreur",
        message: "Impossible d'enregistrer l'encaissement. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-900 text-lime-400 shadow-sm shrink-0">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-forest-950 dark:text-white">
                {t("inv_modal_pay_title", "Enregistrer un paiement")}
              </h2>
              <p className="text-xs text-ink-muted">
                {t("inv_invoice", "Facture")} <strong className="font-semibold text-forest-900">{invoice.number}</strong> · {invoice.customerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-sage-400 hover:text-forest-900 hover:bg-sage-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {/* Section 1: Montant à encaisser */}
          <div className="rounded-2xl border border-line bg-sage-50/60 dark:bg-forest-900/30 p-3.5 sm:p-4 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
              <label className="font-bold text-forest-950 dark:text-white text-xs">
                {t("inv_modal_pay_amount_label", "Montant à encaisser (FCFA)")} *
              </label>
              <span className="text-[11px] text-ink-muted font-medium">
                {t("inv_balance_due", "Reste à percevoir")} : <strong className="text-emerald-700 dark:text-lime-400 font-bold tabular">{formatFCFA(balanceDue)}</strong>
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Ex : 2537000"
                className="w-full rounded-xl border border-line bg-surface p-2.5 sm:p-3 text-base sm:text-lg font-extrabold text-forest-950 tabular focus:border-forest-700 focus:outline-hidden transition-all"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-sage-500">
                FCFA
              </span>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-ink-muted font-medium mr-1">Raccourcis :</span>
              <button
                type="button"
                onClick={() => setAmountStr(String(balanceDue))}
                className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-forest-900 hover:bg-lime-50 hover:border-lime-400 transition-colors active:scale-95"
              >
                Tout solder (100 %)
              </button>
              {balanceDue > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setAmountStr(String(Math.round(balanceDue / 2)))}
                    className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-forest-900 hover:bg-lime-50 hover:border-lime-400 transition-colors active:scale-95"
                  >
                    Acompte 50 % ({formatFCFA(Math.round(balanceDue / 2))})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountStr(String(Math.round(balanceDue * 0.3)))}
                    className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-forest-900 hover:bg-lime-50 hover:border-lime-400 transition-colors active:scale-95"
                  >
                    Acompte 30 %
                  </button>
                </>
              )}
            </div>

            {parsedAmount > balanceDue && (
              <p className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-medium pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Attention : Le montant saisi dépasse le solde restant dû ({formatFCFA(balanceDue)}).</span>
              </p>
            )}
          </div>

          {/* Section 2: Moyens prévus sur cette facture (si configurés) */}
          {invoiceSuggestedMethods.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-forest-950 dark:text-white text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-lime-400" />
                  <span>Moyens de paiement prévus sur cette facture</span>
                </label>
                <span className="text-[10px] text-emerald-700 dark:text-lime-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Recommandé
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {invoiceSuggestedMethods.map((prov) => {
                  const isSelected = selectedProviderId === prov.id;
                  const phoneDetail = prov.details?.phone || prov.details?.iban || prov.details?.merchant_code;

                  return (
                    <div
                      key={prov.id}
                      onClick={() => handleSelectProvider(prov)}
                      className={`cursor-pointer rounded-xl border p-2.5 flex items-center gap-3 transition-all select-none ${
                        isSelected
                          ? "border-forest-900 dark:border-lime-400 bg-forest-900/5 dark:bg-lime-400/10 ring-1 ring-forest-900/20 dark:ring-lime-400/20 shadow-xs"
                          : "border-line bg-surface hover:border-forest-700/40 hover:bg-sage-50/50"
                      }`}
                    >
                      <PaymentProviderLogo providerId={prov.id} size={32} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-forest-950 dark:text-white text-xs truncate">
                            {prov.name}
                          </span>
                        </div>
                        {phoneDetail && (
                          <p className="text-[11px] text-ink-muted truncate font-mono mt-0.5">
                            {phoneDetail}
                          </p>
                        )}
                      </div>
                      <div
                        className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "bg-forest-900 dark:bg-lime-400 text-white dark:text-forest-950"
                            : "border border-line bg-surface/80 text-transparent"
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Choix du moyen d'encaissement avec logos et catégories */}
          <div className="space-y-2.5 pt-2 border-t border-line">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="font-bold text-forest-950 dark:text-white text-xs">
                Moyen d&apos;encaissement sélectionné
              </label>

              {/* Search provider input */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sage-400" />
                <input
                  type="text"
                  placeholder="Rechercher banque, opérateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-line bg-sage-50/60 dark:bg-forest-900/40 py-1.5 pl-8 pr-2.5 text-xs text-forest-950 placeholder:text-sage-400 focus:bg-surface focus:border-forest-700 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Category tabs */}
            {!searchQuery && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                {PAYMENT_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? "bg-forest-900 text-white shadow-2xs"
                          : "border border-line bg-surface text-sage-600 hover:bg-sage-100"
                      }`}
                    >
                      {cat.id === "mobile_money" && <Smartphone className="w-3 h-3" />}
                      {cat.id === "bank_transfer" && <Landmark className="w-3 h-3" />}
                      {cat.id === "money_transfer" && <ArrowLeftRight className="w-3 h-3" />}
                      {cat.id === "crypto" && <Coins className="w-3 h-3" />}
                      {cat.id === "cash_cheque" && <Banknote className="w-3 h-3" />}
                      <span>{cat.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Provider List / Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 border border-line/70 rounded-xl p-2 bg-sage-50/30">
              {filteredProviders.length === 0 ? (
                <div className="sm:col-span-2 py-6 text-center text-ink-muted">
                  Aucun moyen de paiement trouvé pour &laquo; {searchQuery} &raquo;.
                </div>
              ) : (
                filteredProviders.map((prov) => {
                  const isSelected = selectedProviderId === prov.id;
                  return (
                    <div
                      key={prov.id}
                      onClick={() => handleSelectProvider(prov)}
                      className={`cursor-pointer rounded-xl border p-2 flex items-center gap-2.5 transition-all select-none ${
                        isSelected
                          ? "border-forest-900 dark:border-lime-400 bg-surface shadow-xs ring-1 ring-forest-900/30 dark:ring-lime-400/30"
                          : "border-line bg-surface/80 hover:bg-surface hover:border-forest-700/30"
                      }`}
                    >
                      <PaymentProviderLogo providerId={prov.id} size={28} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-forest-950 dark:text-white text-xs truncate">
                          {prov.name}
                        </p>
                        <p className="text-[10px] text-ink-muted truncate">
                          {prov.countryOrZone}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-forest-900 dark:bg-lime-400 text-white dark:text-forest-950"
                            : "border border-line text-transparent"
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 4: Référence & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-line">
            <div>
              <label className="block font-semibold text-forest-950 dark:text-white mb-1">
                {t("inv_modal_pay_ref_label", "Référence de transaction")} *
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={`Ex : ${selectedProvider.shortCode}-TRX-89412`}
                className="w-full rounded-xl border border-line bg-surface p-2.5 text-forest-950 focus:border-forest-700 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-forest-950 dark:text-white mb-1">
                Date de règlement
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface p-2.5 text-forest-950 focus:border-forest-700 focus:outline-hidden"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 5: Note ou commentaire optionnel */}
          <div>
            <label className="block font-semibold text-forest-950 dark:text-white mb-1">
              {t("inv_modal_pay_note_label", "Note ou commentaire (optionnel)")}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={`Ex : Reçu via ${selectedProvider.name} pour le solde de la facture`}
              className="w-full rounded-xl border border-line bg-surface p-2.5 text-forest-950 focus:border-forest-700 focus:outline-hidden"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="pt-3 sm:pt-4 border-t border-line flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-line px-4 py-2 font-semibold text-sage-600 hover:bg-sage-100 transition-colors cursor-pointer"
          >
            {t("action_cancel", "Annuler")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || parsedAmount <= 0}
            className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-5 py-2 font-semibold text-surface hover:bg-forest-850 shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <FileCheck2 className="w-4 h-4 text-lime-400" />
            <span>
              {isSubmitting
                ? "Enregistrement en cours..."
                : `${t("inv_modal_pay_confirm_btn", "Confirmer l'encaissement")} (${formatFCFA(parsedAmount)})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
