"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { InvoiceSheet } from "@/components/invoices/invoice-sheet";
import { RecordPaymentModal } from "@/components/invoices/record-payment-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatFCFA } from "@/lib/format/money";
import { formatDate } from "@/lib/format/date";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import { getInvoiceById } from "@/lib/mock-data";
import type { PaymentMethod, DisplayStatus } from "@/lib/domain/types";
import {
  ArrowLeft,
  Download,
  Share2,
  CreditCard,
  Printer,
  Copy,
  MessageCircle,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  X,
  Ban,
  Files,
  Pencil,
  Trash2,
  RefreshCw,
  AlertTriangle,
  FileSpreadsheet,
  Receipt,
} from "lucide-react";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { t } = useI18n();
  const {
    isHydrated,
    invoices,
    recordPayment,
    cancelInvoice,
    duplicateInvoice,
    emitInvoice,
    setInvoiceStatus,
    deleteInvoice,
    showToast,
  } = useData();

  const invoice = invoices.find((i) => i.id === id || i.number === id) ?? getInvoiceById(id);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DisplayStatus>(invoice?.displayStatus ?? "sent");

  if (!invoice) {
    if (!isHydrated) {
      return (
        <DashboardShell>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest-800 border-t-transparent mb-3" />
            <p className="text-sm font-semibold text-forest-950">Chargement de la facture...</p>
            <p className="text-xs text-sage-500 mt-1">Récupération des données</p>
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
            La facture demandée n&apos;existe pas ou a été supprimée.
          </p>
          <Link
            href="/factures"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2 text-xs font-semibold text-surface shadow-sm hover:bg-forest-850"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la liste des factures</span>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const balanceDue = Math.max(0, invoice.total - invoice.amountPaid);

  const handleOpenPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handleCopyLink = () => {
    const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${invoice.id}` : "";
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
    }
    setCopiedLink(true);
    showToast({ type: "info", message: "Lien public de la facture copié dans le presse-papier !" });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${invoice.id}` : "";
    const text = encodeURIComponent(
      `Bonjour, voici la facture ${invoice.number} d'un montant de ${formatFCFA(invoice.total)} émise par DANHOMEY Technologies SARL. Date d'échéance : ${formatDate(invoice.dueDate)}.\nConsultez et réglez en ligne ici : ${publicUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    showToast({
      type: "info",
      title: "Partage WhatsApp",
      message: `La facture ${invoice.number} a été transmise vers WhatsApp.`,
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "Numéro facture",
      "Client",
      "Ville",
      "Pays",
      "Date d'émission",
      "Date d'échéance",
      "Description prestation",
      "Quantité",
      "Prix unitaire HT (FCFA)",
      "Total ligne HT (FCFA)",
      "Sous-total facture HT (FCFA)",
      "Taux TVA",
      "Montant TVA (FCFA)",
      "Total TTC (FCFA)",
      "Montant Encaissé (FCFA)",
      "Reste à payer (FCFA)",
      "Statut",
    ];

    const statusTranslations: Record<string, string> = {
      paid: "Payée",
      sent: "Envoyée",
      overdue: "En retard",
      draft: "Brouillon",
      cancelled: "Annulée",
    };

    const itemsToExport =
      invoice.items && invoice.items.length > 0
        ? invoice.items
        : [
            {
              id: "item_0",
              position: 1,
              description: "Prestation de services",
              quantity: 1,
              unitPrice: invoice.subtotal,
              lineTotal: invoice.subtotal,
            },
          ];

    const rows = itemsToExport.map((item) => [
      `"${invoice.number}"`,
      `"${(invoice.customerName || "").replace(/"/g, '""')}"`,
      `"${(invoice.customerCity || "").replace(/"/g, '""')}"`,
      `"${(invoice.customerCountry || "").replace(/"/g, '""')}"`,
      `"${invoice.issueDate}"`,
      `"${invoice.dueDate}"`,
      `"${(item.description || "").replace(/"/g, '""')}"`,
      item.quantity,
      Math.round(item.unitPrice),
      Math.round(item.lineTotal || item.quantity * item.unitPrice),
      Math.round(invoice.subtotal),
      `${invoice.vatRate || 18} %`,
      Math.round(invoice.vatAmount),
      Math.round(invoice.total),
      Math.round(invoice.amountPaid || 0),
      Math.round(invoice.total - (invoice.amountPaid || 0)),
      `"${statusTranslations[invoice.displayStatus] || invoice.displayStatus}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `facture_${invoice.number}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: "success",
      title: "Export CSV réussi",
      message: `La facture ${invoice.number} a été téléchargée en CSV.`,
    });
  };

  const handleDuplicate = () => {
    const duplicated = duplicateInvoice(invoice.id);
    showToast({
      type: "success",
      title: "Facture dupliquée",
      message: `Nouveau brouillon ${duplicated.number} créé à partir de ${invoice.number}.`,
    });
    router.push(`/factures/${duplicated.id}`);
  };

  const handleCancel = () => {
    if (confirm(`Confirmez-vous l'annulation de la facture ${invoice.number} ? Cette action est irréversible.`)) {
      cancelInvoice(invoice.id);
      showToast({
        type: "info",
        title: "Facture annulée",
        message: `La facture ${invoice.number} a été marquée comme annulée.`,
      });
    }
  };

  const handleEmit = () => {
    const emitted = emitInvoice(invoice.id);
    showToast({
      type: "success",
      title: "Facture émise",
      message: `La facture a été émise sous le numéro légal ${emitted.number}.`,
    });
  };

  const handleStatusConfirm = () => {
    setInvoiceStatus(invoice.id, selectedStatus);
    setIsStatusModalOpen(false);
    showToast({
      type: "success",
      title: "Statut mis à jour",
      message: `La facture ${invoice.number} est désormais marquée comme ${
        selectedStatus === "paid"
          ? "payée"
          : selectedStatus === "sent"
          ? "envoyée"
          : selectedStatus === "overdue"
          ? "en retard"
          : selectedStatus === "cancelled"
          ? "annulée"
          : "brouillon"
      }.`,
    });
  };

  const handleDeleteConfirm = () => {
    const invNumber = invoice.number;
    deleteInvoice(invoice.id);
    setIsDeleteModalOpen(false);
    showToast({
      type: "info",
      title: "Facture supprimée",
      message: `La facture ${invNumber} a été supprimée définitivement.`,
    });
    router.push("/factures");
  };

  return (
    <DashboardShell>
      {/* Top Navigation & Action Header */}
      <div className="space-y-3 pb-3 border-b border-line-subtle">
        {/* Row 1: Back button + Title & Status Badge + Quick CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/factures"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-forest-900 hover:bg-sage-100 transition-colors shadow-2xs"
              title={t("action_back", "Retour")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-forest-950 tabular whitespace-nowrap">
                  {t("inv_invoice", "Facture")} {invoice.number}
                </h1>
                <StatusBadge status={invoice.displayStatus} />
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                {t("inv_client", "Client")} : <strong className="font-semibold text-forest-950">{invoice.customerName}</strong> · {t("inv_issued_on_prefix", "Émise le")} {formatDate(invoice.issueDate)}
              </p>
            </div>
          </div>

          {/* Quick Encaisser CTA if unpaid */}
          {balanceDue > 0 && (
            <button
              type="button"
              onClick={handleOpenPayment}
              className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2 text-xs font-semibold text-surface shadow-sm hover:bg-forest-850 hover:shadow transition-all whitespace-nowrap active:scale-95 shrink-0 self-start sm:self-auto"
              title={t("inv_record_payment", "Enregistrer un paiement")}
            >
              <CreditCard className="w-4 h-4 text-lime-400 shrink-0" />
              <span>{t("action_pay", "Encaisser")} {formatFCFA(balanceDue)}</span>
            </button>
          )}
        </div>

        {/* Row 2: Action Buttons - All on the same line */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {/* Status Changer Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus(invoice.displayStatus);
              setIsStatusModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs whitespace-nowrap active:scale-95 shrink-0"
            title="Changer le statut"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sage-500 shrink-0" />
            <span>{t("inv_change_status", "Changer le statut")}</span>
          </button>

          {/* Edit Invoice Button */}
          <Link
            href={`/factures/${invoice.id}/modifier`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs whitespace-nowrap active:scale-95 shrink-0"
            title="Modifier la facture"
          >
            <Pencil className="w-3.5 h-3.5 text-sage-500 shrink-0" />
            <span>{t("action_edit", "Modifier")}</span>
          </Link>

          {/* Delete Invoice Button */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/50 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shadow-2xs whitespace-nowrap active:scale-95 shrink-0"
            title="Supprimer la facture"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{t("action_delete", "Supprimer")}</span>
          </button>

          {/* WhatsApp Share */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors whitespace-nowrap active:scale-95 shrink-0"
            title="Partager par WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>WhatsApp</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs whitespace-nowrap active:scale-95 shrink-0"
            title="Imprimer / Télécharger en PDF"
          >
            <Download className="w-3.5 h-3.5 text-sage-500 shrink-0" />
            <span>PDF</span>
          </button>

          {/* Download / View Receipt if settled or partially settled */}
          {invoice.amountPaid > 0 && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-2xs whitespace-nowrap active:scale-95 shrink-0"
              title={t("inv_download_receipt", "Télécharger le reçu (PDF)")}
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>{t("inv_mode_receipt", "Reçu (PDF)")}</span>
            </button>
          )}

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs whitespace-nowrap active:scale-95 shrink-0"
            title="Exporter cette facture au format CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-forest-700 shrink-0" />
            <span>{t("action_export_csv", "Exporter CSV")}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Invoice Document Sheet & Sidebar History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: The A4 Invoice Sheet Preview (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          <InvoiceSheet
            invoice={invoice}
            initialMode={invoice.displayStatus === "paid" ? "receipt" : "invoice"}
            showToolbar={true}
          />
        </div>

        {/* Right: Payment Timeline & Metadata (1 col) */}
        <div className="space-y-6">
          {/* Payment Status Summary Card */}
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <span className="text-[11px] font-semibold text-sage-500 uppercase tracking-wider">
              {t("inv_sidebar_payment_status", "Statut du règlement")}
            </span>

            <div className="mt-3 flex items-baseline justify-between border-b border-line-subtle pb-3">
              <span className="text-xs text-ink-muted">{t("inv_sidebar_total_invoiced", "Total facturé :")}</span>
              <span className="tabular text-sm font-bold text-forest-950">
                {formatFCFA(invoice.total)}
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between border-b border-line-subtle pb-3">
              <span className="text-xs text-emerald-800 dark:text-emerald-300">{t("inv_sidebar_amount_collected", "Montant encaissé :")}</span>
              <span className="tabular text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {formatFCFA(invoice.amountPaid)}
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between pt-1">
              <span className="text-xs font-semibold text-forest-950">{t("inv_sidebar_balance_remaining", "Reste à percevoir :")}</span>
              <span
                className={`tabular text-base font-extrabold ${
                  balanceDue > 0 ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {formatFCFA(balanceDue)}
              </span>
            </div>

            {balanceDue > 0 && (
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 py-2.5 text-xs font-semibold text-surface hover:bg-forest-850 transition-colors"
              >
                <Plus className="w-4 h-4 text-lime-400" />
                <span>{t("inv_sidebar_record_payment_btn", "Saisir un encaissement")}</span>
              </button>
            )}
          </div>

          {/* Payment History Log */}
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <h3 className="text-xs font-semibold text-sage-600 uppercase tracking-wider">
              {t("inv_sidebar_payment_history", "Historique des encaissements")}
            </h3>

            {invoice.payments.length === 0 ? (
              <div className="py-6 text-center text-xs text-ink-muted">
                <Clock className="mx-auto h-6 w-6 text-sage-300 mb-1" />
                <p>{t("inv_sidebar_no_payment_yet", "Aucun paiement enregistré pour l'instant.")}</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {invoice.payments.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-line bg-sage-50/60 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-forest-950 tabular">
                        {formatFCFA(p.amount)}
                      </span>
                      <span className="text-[11px] text-ink-muted">{formatDate(p.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sage-600 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Réf : {p.reference}</span>
                    </div>
                    {p.note && <p className="text-[11px] text-ink-muted italic">{p.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client Contact Quick Access */}
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <h3 className="text-xs font-semibold text-sage-600 uppercase tracking-wider">
              {t("inv_sidebar_customer_coords", "Coordonnées client")}
            </h3>
            <div className="mt-3 text-xs space-y-1.5 text-sage-600">
              <p className="font-bold text-forest-950">{invoice.customerName}</p>
              <p>{invoice.customerContact}</p>
              <p>{invoice.customerAddress}</p>
              <p>{invoice.customerCity}, {invoice.customerCountry}</p>
              <p className="pt-1 text-forest-900 font-medium">Email : {invoice.customerEmail}</p>
              <p className="text-forest-900 font-medium">Tél : {invoice.customerPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Harmonized Payment Recording Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={invoice}
      />

      {/* Change Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-forest-900" />
                <h2 className="text-base font-bold text-forest-950">
                  {t("inv_change_status_title", "Changer le statut")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="rounded-lg p-1 text-sage-400 hover:text-forest-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <p className="text-sage-600">
                {t("inv_modal_status_select_new", "Sélectionnez le nouveau statut pour la facture")} <strong>{invoice.number}</strong> :
              </p>

              {(
                [
                  { value: "draft", label: t("status_draft", "Brouillon"), desc: "Facture en cours de rédaction" },
                  { value: "sent", label: t("status_sent", "Envoyée"), desc: "Émise et transmise au client" },
                  { value: "paid", label: t("status_paid", "Payée"), desc: "Intégralement réglée" },
                  { value: "overdue", label: t("status_overdue", "En retard"), desc: "Date d'échéance dépassée" },
                  { value: "cancelled", label: t("status_cancelled", "Annulée"), desc: "Facture annulée" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                    selectedStatus === opt.value
                      ? "border-forest-900 dark:border-lime-500/60 bg-lime-50/50 dark:bg-forest-900/40"
                      : "border-line bg-surface hover:bg-sage-50/70"
                  }`}
                >
                  <input
                    type="radio"
                    name="invoiceStatus"
                    value={opt.value}
                    checked={selectedStatus === opt.value}
                    onChange={() => setSelectedStatus(opt.value)}
                    className="mt-0.5 text-forest-900 focus:ring-forest-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-forest-950">{opt.label}</span>
                      <StatusBadge status={opt.value} />
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-line flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-sage-600 hover:bg-sage-100"
              >
                {t("action_cancel", "Annuler")}
              </button>
              <button
                type="button"
                onClick={handleStatusConfirm}
                className="rounded-xl bg-forest-900 px-4 py-2 text-xs font-semibold text-surface hover:bg-forest-850"
              >
                {t("inv_update_status_btn", "Mettre à jour le statut")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-forest-950">
                  {t("inv_delete_modal_title", "Supprimer la facture")} {invoice.number} ?
                </h2>
                <p className="mt-1 text-xs text-sage-600 leading-relaxed">
                  Êtes-vous sûr de vouloir supprimer cette facture d&apos;un montant de{" "}
                  <strong>{formatFCFA(invoice.total)}</strong> ?
                </p>
                <p className="mt-2 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-lg border border-rose-200/60 dark:border-rose-800/60">
                  {t("inv_modal_delete_warning", "Cette action est irréversible. L'encours du client sera automatiquement réajusté.")}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-sage-600 hover:bg-sage-100"
              >
                {t("action_cancel", "Annuler")}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm"
              >
                {t("inv_modal_delete_btn", "Supprimer définitivement")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

