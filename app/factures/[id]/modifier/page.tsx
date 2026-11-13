"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { formatFCFA } from "@/lib/format/money";
import { amountInWords } from "@/lib/invoice/amount-in-words";
import { computeLineTotal, computeVatAmount } from "@/lib/invoice/totals";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import { getInvoiceById } from "@/lib/mock-data";
import type { DisplayStatus } from "@/lib/domain/types";
import { PaymentMethodsSelector } from "@/components/invoices/payment-methods-selector";
import { deserializePaymentTerms, serializePaymentTerms } from "@/lib/payment-methods/serializer";
import type { PaymentTermsData } from "@/lib/payment-methods/types";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Building2,
  Calendar,
  AlertTriangle,
  CreditCard,
} from "lucide-react";

interface FormItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { isHydrated, invoices, customers, organization, updateInvoice, showToast } = useData();
  const { t } = useI18n();

  const invoice = invoices.find((inv) => inv.id === id || inv.number === id) ?? getInvoiceById(id);

  // Form state prefilled with existing invoice data
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    invoice?.customerId ?? ""
  );
  const [issueDate, setIssueDate] = useState(invoice?.issueDate ?? "");
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? "");
  const [status, setStatus] = useState<DisplayStatus>(invoice?.displayStatus ?? "draft");
  const initialTermsData = useMemo(
    () => deserializePaymentTerms(invoice?.notes),
    [invoice?.notes]
  );
  const [notes, setNotes] = useState(
    invoice?.notes ?? (() => serializePaymentTerms(initialTermsData))
  );

  const [items, setItems] = useState<FormItem[]>(
    invoice?.items?.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })) ?? [
      {
        id: "1",
        description: "Prestation de services",
        quantity: 1,
        unitPrice: 500_000,
      },
    ]
  );

  if (!invoice) {
    if (!isHydrated) {
      return (
        <DashboardShell>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest-800 border-t-transparent mb-3" />
            <p className="text-sm font-semibold text-forest-950">Chargement de la facture...</p>
          </div>
        </DashboardShell>
      );
    }
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-line bg-surface p-8 shadow-card">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-300 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-forest-950">Facture introuvable</h2>
          <p className="text-xs text-sage-600 mt-1 max-w-md">
            Impossible de modifier une facture inexistante ou supprimée.
          </p>
          <Link
            href="/factures"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2 text-xs font-semibold text-surface shadow-sm hover:bg-forest-850"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour aux factures</span>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Dynamic totals calculations
  const { lineTotals, subtotal, vatAmount, total } = useMemo(() => {
    const lTotals = items.map((item) => {
      try {
        const qty = item.quantity > 0 ? item.quantity : 1;
        const price = item.unitPrice >= 0 ? Math.round(item.unitPrice) : 0;
        return computeLineTotal(qty, price);
      } catch {
        return 0;
      }
    });

    const sub = lTotals.reduce((sum, val) => sum + val, 0);
    const vat = computeVatAmount(sub, organization.vatRate);
    return {
      lineTotals: lTotals,
      subtotal: sub,
      vatAmount: vat,
      total: sub + vat,
    };
  }, [items, organization.vatRate]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (itemId: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const handleUpdateItem = (
    itemId: string,
    field: "description" | "quantity" | "unitPrice",
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSave = () => {
    if (!selectedCustomerId) {
      showToast({ type: "error", message: "Veuillez sélectionner un client." });
      return;
    }
    const validItems = items.filter((i) => i.description.trim() !== "");
    if (validItems.length === 0) {
      showToast({ type: "error", message: "Veuillez renseigner au moins une prestation." });
      return;
    }

    updateInvoice(invoice.id, {
      customerId: selectedCustomerId,
      issueDate,
      dueDate,
      items: validItems.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
      })),
      notes,
      status,
    });

    showToast({
      type: "success",
      title: "Modifications enregistrées",
      message: `La facture ${invoice.number} a été mise à jour avec succès.`,
    });

    router.push(`/factures/${invoice.id}`);
  };

  return (
    <DashboardShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/factures/${invoice.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-forest-900 hover:bg-sage-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">{t("nav_invoices", "Factures")} / {invoice.number} /</span>
              <span className="text-xs font-semibold text-forest-900">{t("action_edit", "Modifier")}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-forest-950 sm:text-2xl tabular">
              {t("action_edit", "Modifier la facture")} {invoice.number}
            </h1>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2">
          <Link
            href={`/factures/${invoice.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 sm:px-4 py-2 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs shrink-0"
          >
            <span>{t("action_cancel", "Annuler")}</span>
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-forest-900 px-3 sm:px-4 py-2 text-xs font-semibold text-surface shadow-sm hover:bg-forest-850 transition-all active:scale-95 shrink-0"
          >
            <Save className="w-3.5 h-3.5 text-lime-400" />
            <span>{t("inv_save_changes_btn", "Enregistrer les modifications")}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Form (2 cols) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Customer Selection Card */}
          <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-5 lg:p-6 shadow-card space-y-4">
            <h2 className="text-sm font-bold text-forest-950">
              {t("inv_section_recipient", "1. Destinataire de la facture")}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-forest-950 mb-1">
                {t("inv_select_customer", "Sélectionner un client")}
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-xs text-forest-950 focus:bg-surface focus:border-forest-700"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.city}, {c.country} ({c.contactPerson})
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="rounded-xl border border-line bg-sage-50/50 p-3.5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-sage-600">
                <div>
                  <p className="font-bold text-forest-950">{selectedCustomer.name}</p>
                  <p>{selectedCustomer.contactPerson}</p>
                  <p>{selectedCustomer.address}</p>
                  <p>{selectedCustomer.city}, {selectedCustomer.country}</p>
                </div>
                <div className="sm:text-right space-y-0.5">
                  <p>
                    <strong className="text-forest-900">{t("inv_sheet_ifu_label", "IFU :")}</strong> {selectedCustomer.taxId}
                  </p>
                  <p>{t("inv_sheet_email_label", "Email :")} {selectedCustomer.email}</p>
                  <p>{t("inv_sheet_phone_label", "Tél :")} {selectedCustomer.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Line Items Table Card */}
          <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-5 lg:p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-forest-950">
                {t("inv_section_items", "2. Prestations & Produits")}
              </h2>
              <span className="text-xs text-ink-muted">{t("inv_amounts_fcfa_no_cents", "Montants en FCFA (sans centimes)")}</span>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-line bg-sage-50/40 p-3 sm:p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-sage-400">
                      {t("inv_item_line_num", "Ligne #")}{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-sage-400 hover:text-rose-600 transition-colors p-1"
                        title={t("action_delete", "Supprimer")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder={t("inv_item_desc_placeholder", "Désignation du service ou produit...")}
                      value={item.description}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "description", e.target.value)
                      }
                      className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-forest-950 placeholder:text-sage-400 focus:border-forest-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div>
                      <label className="block text-[11px] text-sage-500 mb-1">
                        {t("inv_qty", "Quantité")}
                      </label>
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(
                            item.id,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full rounded-xl border border-line bg-surface p-2 text-xs text-forest-950 tabular"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-sage-500 mb-1">
                        {t("inv_unit_price", "Prix unitaire HT (FCFA)")}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdateItem(
                            item.id,
                            "unitPrice",
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-full rounded-xl border border-line bg-surface p-2 text-xs text-forest-950 tabular"
                      />
                    </div>

                    <div className="sm:text-right">
                      <span className="block text-[11px] text-sage-500 mb-1">
                        {t("inv_line_total", "Total ligne HT")}
                      </span>
                      <span className="tabular font-bold text-sm text-forest-950">
                        {formatFCFA(lineTotals[index] ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-forest-800/40 bg-sage-50 px-3.5 py-2 text-xs font-semibold text-forest-900 hover:bg-lime-50 transition-colors w-full justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("inv_add_line", "Ajouter une ligne de prestation")}</span>
            </button>
          </div>

          {/* Section 3: Payment Methods & Terms Card */}
          <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest-900/10 text-forest-900 dark:bg-lime-400/10 dark:text-lime-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-forest-950 dark:text-white">
                    {t("inv_section_terms", "3. Conditions & Modalités de règlement")}
                  </h2>
                  <p className="text-[11px] text-ink-muted">
                    Sélectionnez les moyens de paiement acceptés pour cette facture
                  </p>
                </div>
              </div>
            </div>

            <PaymentMethodsSelector
              initialData={initialTermsData}
              onChange={(serialized) => setNotes(serialized)}
            />
          </div>
        </div>

        {/* Sidebar Summary & Settings (1 col) */}
        <div className="space-y-4 sm:space-y-6">
          {/* Status & Dates Card */}
          <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-5 shadow-card space-y-4">
            <h3 className="text-xs font-semibold text-sage-600 uppercase tracking-wider">
              {t("action_status", "Statut")} &amp; {t("inv_dates_card_title", "Dates")}
            </h3>

            <div>
              <label className="block text-xs font-medium text-forest-950 mb-1">
                {t("action_status", "Statut de la facture")}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DisplayStatus)}
                className="w-full rounded-xl border border-line bg-sage-50/70 p-2 text-xs text-forest-950 focus:bg-surface focus:border-forest-700"
              >
                <option value="draft">{t("status_draft", "Brouillon")}</option>
                <option value="sent">{t("status_sent", "Envoyée")}</option>
                <option value="paid">{t("status_paid", "Payée")}</option>
                <option value="overdue">{t("status_overdue", "En retard")}</option>
                <option value="cancelled">{t("status_cancelled", "Annulée")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-forest-950 mb-1">
                {t("inv_issue_date", "Date d'émission")}
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-xl border border-line bg-sage-50/70 p-2 text-xs text-forest-950 focus:bg-surface focus:border-forest-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-forest-950 mb-1">
                {t("inv_due_date", "Date d'échéance")}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-line bg-sage-50/70 p-2 text-xs text-forest-950 focus:bg-surface focus:border-forest-700"
              />
            </div>
          </div>

          {/* Live Totals Card */}
          <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-5 shadow-card space-y-4">
            <h3 className="text-xs font-semibold text-sage-600 uppercase tracking-wider">
              {t("inv_summary_totals_title", "Récapitulatif des montants")}
            </h3>

            <dl className="tabular text-xs space-y-2.5">
              <div className="flex justify-between text-ink-muted">
                <dt>{t("inv_subtotal_ht", "Sous-total HT :")}</dt>
                <dd className="font-semibold text-forest-950">{formatFCFA(subtotal)}</dd>
              </div>

              <div className="flex justify-between text-ink-muted">
                <dt>{t("inv_vat_amount", "TVA")} ({organization.vatRate} %) :</dt>
                <dd className="font-semibold text-forest-950">{formatFCFA(vatAmount)}</dd>
              </div>

              <div className="flex justify-between py-2 border-t-2 border-forest-900 text-sm font-bold text-forest-950">
                <dt>{t("inv_total_ttc", "Total TTC :")}</dt>
                <dd className="text-base text-forest-950">{formatFCFA(total)}</dd>
              </div>
            </dl>

            {/* Legal Amount in Words */}
            <div className="rounded-xl border border-lime-300/80 dark:border-lime-700/60 bg-lime-50/70 dark:bg-forest-900/60 p-3">
              <p className="text-[11px] font-semibold text-forest-950 dark:text-lime-300">
                {t("inv_amount_words_legal_label", "Montant en toutes lettres :")}
              </p>
              <p className="mt-1 text-xs italic font-medium text-forest-900 dark:text-emerald-100 capitalize">
                {amountInWords(total)}.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest-900 py-3 text-xs font-semibold text-surface shadow hover:bg-forest-850 transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5 text-lime-400" />
              <span>{t("inv_save_changes_btn", "Enregistrer les modifications")}</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

