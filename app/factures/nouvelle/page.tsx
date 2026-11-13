"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { InvoiceSheet } from "@/components/invoices/invoice-sheet";
import { PaymentMethodsSelector } from "@/components/invoices/payment-methods-selector";
import { deserializePaymentTerms, serializePaymentTerms } from "@/lib/payment-methods/serializer";
import type { PaymentTermsData } from "@/lib/payment-methods/types";
import { formatFCFA } from "@/lib/format/money";
import { amountInWords } from "@/lib/invoice/amount-in-words";
import { computeLineTotal, computeVatAmount } from "@/lib/invoice/totals";
import { getTodayISODate } from "@/lib/date-filter";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import type { MockInvoice } from "@/lib/mock-data";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  FileEdit,
  ShieldCheck,
  CreditCard,
  UserPlus,
  X,
  Layers,
  Percent,
} from "lucide-react";

interface FormItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

function NewInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerParam = searchParams.get("customer");
  const { customers, organization, createInvoice, createCustomer, showToast } = useData();
  const { t } = useI18n();

  // Active view tab: Form editor vs Live document preview
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");

  // Dates state (calculated precisely in local time without UTC offset bugs)
  const todayStr = useMemo(() => getTodayISODate(), []);
  const defaultDueStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customerParam || customers[0]?.id || ""
  );

  useEffect(() => {
    if (customerParam && customerParam !== selectedCustomerId) {
      setSelectedCustomerId(customerParam);
    }
  }, [customerParam, selectedCustomerId]);

  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDueStr);
  const [isVatExempt, setIsVatExempt] = useState(false);

  const initialTermsData = useMemo(() => deserializePaymentTerms(), []);
  const [notes, setNotes] = useState(() => serializePaymentTerms(initialTermsData));

  const handlePaymentTermsChange = (serialized: string, data: PaymentTermsData) => {
    setNotes(serialized);
    if (typeof data.paymentTermsDays === "number") {
      handleQuickDuePreset(data.paymentTermsDays);
    }
  };

  const [items, setItems] = useState<FormItem[]>([
    {
      id: "1",
      description: "Conception et développement d'application web sur mesure",
      quantity: 1,
      unitPrice: 1_500_000,
    },
    {
      id: "2",
      description: "Intégration passerelle de paiement Mobile Money locale",
      quantity: 1,
      unitPrice: 650_000,
    },
  ]);

  // Quick Customer Creation Modal State
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustContact, setNewCustContact] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("+229 ");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustCity, setNewCustCity] = useState("Cotonou");
  const [newCustCountry, setNewCustCountry] = useState("Bénin");
  const [newCustTaxId, setNewCustTaxId] = useState("");

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const effectiveVatRate = isVatExempt ? 0 : organization.vatRate ?? 18;

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
    const vat = computeVatAmount(sub, effectiveVatRate);
    return {
      lineTotals: lTotals,
      subtotal: sub,
      vatAmount: vat,
      total: sub + vat,
    };
  }, [items, effectiveVatRate]);

  // Preset services suggestions
  const suggestedServices = [
    { desc: "Prestation de conseil & Stratégie digitale", price: 500_000 },
    { desc: "Développement d'application web & mobile", price: 1_200_000 },
    { desc: "Intégration passerelle Wave & MTN Mobile Money", price: 650_000 },
    { desc: "Maintenance applicative & Hébergement cloud", price: 250_000 },
    { desc: "Audit de conformité fiscale & Sécurité", price: 400_000 },
  ];

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

  const handleAddPreset = (desc: string, price: number) => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: desc,
        quantity: 1,
        unitPrice: price,
      },
    ]);
    showToast({
      type: "info",
      message: `Prestation ajoutée : ${desc}`,
    });
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleUpdateItem = (
    id: string,
    field: "description" | "quantity" | "unitPrice",
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleQuickDuePreset = (days: number) => {
    const base = issueDate || todayStr;
    const parts = base.split("-");
    const y = parseInt(parts[0] || "2026", 10);
    const m = parseInt(parts[1] || "1", 10);
    const d = parseInt(parts[2] || "1", 10);
    const dt = new Date(y, m - 1, d + days);
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    setDueDate(`${year}-${month}-${day}`);
  };

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      showToast({ type: "error", message: "Veuillez renseigner le nom de l'entreprise." });
      return;
    }

    const created = createCustomer({
      name: newCustName.trim(),
      contactPerson: newCustContact.trim() || "Responsable",
      phone: newCustPhone.trim(),
      email: newCustEmail.trim() || "contact@client.bj",
      address: "Siège social",
      city: newCustCity.trim() || "Cotonou",
      country: newCustCountry.trim() || "Bénin",
      taxId: newCustTaxId.trim() || `IFU-${Date.now().toString().slice(-8)}`,
      rccm: `RB/COT/${new Date().getFullYear()}/B-001`,
    });

    setSelectedCustomerId(created.id);
    setIsNewCustomerModalOpen(false);
    setNewCustName("");
    setNewCustContact("");
    setNewCustPhone("+229 ");
    setNewCustEmail("");
    setNewCustTaxId("");

    showToast({
      type: "success",
      title: "Client créé",
      message: `${created.name} a été ajouté et sélectionné.`,
    });
  };

  const handleSubmit = (status: "draft" | "sent") => {
    if (!selectedCustomerId) {
      showToast({ type: "error", message: t("inv_select_customer", "Veuillez sélectionner un client.") });
      return;
    }
    const validItems = items.filter((i) => i.description.trim() !== "");
    if (validItems.length === 0) {
      showToast({ type: "error", message: "Veuillez renseigner au moins une prestation." });
      return;
    }

    const created = createInvoice({
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
      title: status === "sent" ? "Facture émise" : "Brouillon sauvegardé",
      message:
        status === "sent"
          ? `Facture ${created.number} émise avec succès !`
          : `Brouillon ${created.number} enregistré.`,
    });

    router.push(`/factures/${created.id}`);
  };

  // Construct MockInvoice for Live Preview
  const previewInvoice: MockInvoice = useMemo(() => {
    return {
      id: "PREVIEW",
      number: "FAC-2026-NOUV",
      customerId: selectedCustomerId,
      customerName: selectedCustomer?.name || "Client Destinataire",
      customerContact: selectedCustomer?.contactPerson || "Direction Financière",
      customerAddress: selectedCustomer?.address || "Avenue Jean-Paul II",
      customerCity: selectedCustomer?.city || "Cotonou",
      customerCountry: selectedCustomer?.country || "Bénin",
      customerTaxId: selectedCustomer?.taxId || "IFU-2026-375606",
      customerEmail: selectedCustomer?.email || "contact@client.bj",
      customerPhone: selectedCustomer?.phone || "+229 97 00 00 00",
      issueDate,
      dueDate,
      items: items.map((it, idx) => ({
        id: it.id,
        position: idx + 1,
        description: it.description || t("inv_sheet_table_item_desc", "Prestation de services"),
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        lineTotal: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
      subtotal,
      vatRate: effectiveVatRate,
      vatAmount,
      total,
      amountPaid: 0,
      status: "draft",
      displayStatus: "draft",
      itemsCount: items.length,
      payments: [],
      notes,
    };
  }, [
    selectedCustomerId,
    selectedCustomer,
    issueDate,
    dueDate,
    items,
    subtotal,
    effectiveVatRate,
    vatAmount,
    total,
    notes,
    t,
  ]);

  return (
    <DashboardShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-line-subtle">
        <div className="flex items-center gap-3">
          <Link
            href="/factures"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-forest-900 hover:bg-sage-100 transition-colors shadow-2xs"
            title={t("action_back", "Retour")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">{t("nav_invoices", "Factures")} /</span>
              <span className="text-xs font-semibold text-forest-900">{t("status_draft", "Nouvelle")}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">
              {t("nav_new_invoice", "Créer une facture")}
            </h1>
          </div>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Form vs Live Preview Switcher */}
          <div className="flex items-center gap-1 p-1 bg-sage-100/70 rounded-xl border border-line">
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "form"
                  ? "bg-forest-900 text-surface shadow-xs"
                  : "text-forest-900 hover:bg-surface/60"
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>{t("action_edit", "Formulaire")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "preview"
                  ? "bg-forest-900 text-surface shadow-xs"
                  : "text-forest-900 hover:bg-surface/60"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t("inv_live_preview_toggle", "Aperçu en direct")}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 sm:px-4 py-2 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs shrink-0"
          >
            <Save className="w-3.5 h-3.5 text-sage-500" />
            <span>{t("inv_save_draft", "Sauvegarder brouillon")}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("sent")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-forest-900 px-3 sm:px-4 py-2 text-xs font-semibold text-surface shadow-sm hover:bg-forest-850 transition-all active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-lime-400" />
            <span>{t("inv_send_now", "Envoyer")}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: LIVE DOCUMENT & RECEIPT PREVIEW */}
      {activeTab === "preview" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-sage-50/70 p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-forest-950 font-medium">
              <Eye className="w-4 h-4 text-forest-800" />
              <span>
                {t(
                  "inv_live_preview_toggle",
                  "Aperçu en direct : les données ci-dessous reflètent instantanément vos modifications et votre langue active."
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className="text-xs font-bold text-forest-900 underline hover:text-forest-950"
            >
              ← {t("action_edit", "Revenir au formulaire")}
            </button>
          </div>

          <InvoiceSheet invoice={previewInvoice} initialMode="invoice" showToolbar={true} />
        </div>
      ) : (
        /* Mode 2: FULL INTERACTIVE FORM */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Form Fields (2 Cols) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Section 1: Customer Selection Card */}
            <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-900/10 text-forest-900">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-forest-950">
                    {t("inv_section_recipient", "1. Destinataire de la facture")}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-forest-900 hover:text-forest-950 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5 text-forest-800" />
                  <span>{t("inv_add_client_quick", "+ Nouveau client")}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-950 mb-1.5">
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
                <div className="rounded-xl border border-line bg-sage-50/50 p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-sage-600">
                  <div className="space-y-1">
                    <p className="font-bold text-forest-950 text-sm">{selectedCustomer.name}</p>
                    <p className="font-medium text-forest-900">{selectedCustomer.contactPerson}</p>
                    <p>{selectedCustomer.address}</p>
                    <p className="font-medium text-forest-900">
                      {selectedCustomer.city}, {selectedCustomer.country}
                    </p>
                  </div>
                  <div className="sm:text-right space-y-1">
                    <p>
                      <strong className="text-forest-900">{t("inv_sheet_ifu_label", "IFU :")}</strong>{" "}
                      <span className="tabular font-semibold text-forest-950">{selectedCustomer.taxId}</span>
                    </p>
                    <p>
                      <strong className="text-forest-900">{t("inv_sheet_rccm_label", "RCCM :")}</strong>{" "}
                      <span className="tabular">{selectedCustomer.rccm}</span>
                    </p>
                    <p>
                      <strong className="text-forest-900">{t("inv_sheet_email_label", "Email :")}</strong>{" "}
                      {selectedCustomer.email}
                    </p>
                    <p>
                      <strong className="text-forest-900">{t("inv_sheet_phone_label", "Tél :")}</strong>{" "}
                      {selectedCustomer.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Line Items Card */}
            <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:p-6 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-900/10 text-forest-900">
                    <Layers className="w-4 h-4 text-forest-800 dark:text-lime-400" />
                  </div>
                  <h2 className="text-sm font-bold text-forest-950">
                    {t("inv_section_items", "2. Prestations & Produits")}
                  </h2>
                </div>
                <span className="text-xs text-ink-muted">
                  {t("inv_amounts_fcfa_no_cents", "Montants en FCFA (sans centimes)")}
                </span>
              </div>

              {/* Fast Preset Suggestions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-sage-500 uppercase tracking-wider block">
                  {t("inv_preset_services", "Prestations suggérées :")}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {suggestedServices.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPreset(preset.desc, preset.price)}
                      className="inline-flex items-center gap-1 rounded-lg border border-line bg-sage-50/60 px-2.5 py-1 text-[11px] font-medium text-forest-900 hover:bg-lime-50 hover:border-lime-300 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-forest-800" />
                      <span>{preset.desc}</span>
                      <span className="tabular text-sage-500">({formatFCFA(preset.price)})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Item Rows */}
              <div className="space-y-3 pt-2">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-line bg-sage-50/40 p-3.5 sm:p-4 space-y-3 transition-colors hover:border-forest-800/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-forest-900 text-surface text-[10px] font-bold">
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
                        <label className="block text-[11px] font-semibold text-sage-600 mb-1">
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
                        <label className="block text-[11px] font-semibold text-sage-600 mb-1">
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
                        <span className="block text-[11px] font-semibold text-sage-600 mb-1">
                          {t("inv_line_total", "Total ligne HT")}
                        </span>
                        <span className="tabular font-extrabold text-sm text-forest-950">
                          {formatFCFA(lineTotals[index] ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Line Button */}
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-forest-800/40 bg-sage-50 px-3.5 py-2.5 text-xs font-semibold text-forest-900 hover:bg-lime-50 hover:border-lime-400 transition-colors w-full justify-center"
              >
                <Plus className="w-4 h-4" />
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
                onChange={handlePaymentTermsChange}
              />
            </div>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="space-y-4 sm:space-y-6">
            {/* Dates Card */}
            <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-card space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest-800" />
                <h3 className="text-xs font-bold text-forest-950 uppercase tracking-wider">
                  {t("inv_dates_card_title", "Dates de la facture")}
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-950 mb-1">
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-forest-950">
                    {t("inv_due_date_default_label", "Date d'échéance")}
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickDuePreset(0)}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-sage-100 dark:bg-sage-900/70 text-forest-900 dark:text-forest-100 hover:bg-lime-100 dark:hover:bg-lime-950/80 dark:hover:text-lime-300"
                      title="Immédiat"
                    >
                      0j
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDuePreset(30)}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-sage-100 dark:bg-sage-900/70 text-forest-900 dark:text-forest-100 hover:bg-lime-100 dark:hover:bg-lime-950/80 dark:hover:text-lime-300"
                      title="30 jours"
                    >
                      +30j
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDuePreset(45)}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-sage-100 dark:bg-sage-900/70 text-forest-900 dark:text-forest-100 hover:bg-lime-100 dark:hover:bg-lime-950/80 dark:hover:text-lime-300"
                      title="45 jours"
                    >
                      +45j
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2 text-xs text-forest-950 focus:bg-surface focus:border-forest-700"
                />
              </div>
            </div>

            {/* VAT Tax Selector Card */}
            <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-card space-y-3">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-forest-800" />
                <h3 className="text-xs font-bold text-forest-950 uppercase tracking-wider">
                  {t("inv_vat_rate", "Régime de TVA")}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsVatExempt(false)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    !isVatExempt
                      ? "bg-forest-900 text-surface border-forest-900 shadow-xs"
                      : "bg-surface border-line text-forest-900 hover:bg-sage-50"
                  }`}
                >
                  {t("inv_tax_rate_standard", "TVA 18 %")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsVatExempt(true)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    isVatExempt
                      ? "bg-forest-900 text-surface border-forest-900 shadow-xs"
                      : "bg-surface border-line text-forest-900 hover:bg-sage-50"
                  }`}
                >
                  {t("inv_tax_rate_exempt", "Exonéré (0 %)")}
                </button>
              </div>
            </div>

            {/* Live Financial Totals Card */}
            <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-card space-y-4">
              <h3 className="text-xs font-bold text-sage-600 uppercase tracking-wider">
                {t("inv_summary_totals_title", "Récapitulatif des montants")}
              </h3>

              <dl className="tabular text-xs space-y-2.5">
                <div className="flex justify-between text-ink-muted">
                  <dt>{t("inv_subtotal_ht", "Sous-total HT :")}</dt>
                  <dd className="font-semibold text-forest-950">{formatFCFA(subtotal)}</dd>
                </div>

                <div className="flex justify-between text-ink-muted">
                  <dt>{t("inv_vat_amount", "TVA")} ({effectiveVatRate} %) :</dt>
                  <dd className="font-semibold text-forest-950">{formatFCFA(vatAmount)}</dd>
                </div>

                <div className="flex justify-between py-2.5 border-t-2 border-forest-900 text-sm font-black text-forest-950">
                  <dt>{t("inv_total_ttc", "Total TTC :")}</dt>
                  <dd className="text-lg text-forest-950 font-black">{formatFCFA(total)}</dd>
                </div>
              </dl>

              {/* Legal Amount in Words */}
              <div className="rounded-xl border border-lime-300/80 dark:border-lime-700/60 bg-lime-50/70 dark:bg-forest-900/60 p-3.5">
                <p className="text-[11px] font-bold text-forest-950 dark:text-lime-300">
                  {t("inv_amount_words_legal_label", "Montant en toutes lettres (conforme zone FCFA) :")}
                </p>
                <p className="mt-1 text-xs italic font-medium text-forest-900 dark:text-emerald-100 capitalize leading-relaxed">
                  {amountInWords(total)}.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmit("sent")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest-900 py-3 text-xs font-semibold text-surface shadow-sm hover:bg-forest-850 transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 text-lime-400" />
                  <span>{t("inv_send_now", "Envoyer la facture")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2.5 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-sage-500" />
                  <span>{t("inv_preview_receipt", "Aperçu du reçu / facture")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK NEW CUSTOMER MODAL */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-sm font-bold text-forest-950">
                {t("cust_modal_create_title", "Créer un nouveau client")}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="text-sage-400 hover:text-forest-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("cust_field_name", "Nom de l'entreprise / Raison sociale *")}
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Ex : Bénin Énergie & Télécoms SARL"
                  className="w-full rounded-xl border border-line bg-sage-50/60 p-2.5 text-xs text-forest-950 focus:bg-surface focus:border-forest-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("cust_field_contact", "Personne de contact")}
                </label>
                <input
                  type="text"
                  value={newCustContact}
                  onChange={(e) => setNewCustContact(e.target.value)}
                  placeholder="Ex : M. Aristide SOGLO"
                  className="w-full rounded-xl border border-line bg-sage-50/60 p-2.5 text-xs text-forest-950 focus:bg-surface focus:border-forest-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_phone", "Téléphone")}
                  </label>
                  <input
                    type="tel"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full rounded-xl border border-line bg-sage-50/60 p-2.5 text-xs text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_tax_id", "Numéro IFU")}
                  </label>
                  <input
                    type="text"
                    value={newCustTaxId}
                    onChange={(e) => setNewCustTaxId(e.target.value)}
                    placeholder="IFU-2026-..."
                    className="w-full rounded-xl border border-line bg-sage-50/60 p-2.5 text-xs text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_city", "Ville")}
                  </label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    className="w-full rounded-xl border border-line bg-sage-50/60 p-2.5 text-xs text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_country", "Pays")}
                  </label>
                  <input
                    type="text"
                    value={newCustCountry}
                    onChange={(e) => setNewCustCountry(e.target.value)}
                    className="w-full rounded-xl border border-line bg-sage-50/60 p-2.5 text-xs text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="rounded-xl border border-line px-3 py-2 font-semibold text-forest-900 hover:bg-sage-50"
                >
                  {t("action_cancel", "Annuler")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-forest-900 px-4 py-2 font-semibold text-surface shadow hover:bg-forest-850"
                >
                  {t("cust_btn_save", "Enregistrer le client")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <DashboardShell>
          <div className="py-20 text-center text-xs text-ink-muted">
            Chargement du formulaire de facturation...
          </div>
        </DashboardShell>
      }
    >
      <NewInvoiceForm />
    </Suspense>
  );
}
