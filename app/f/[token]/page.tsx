"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import { getInvoiceById, MOCK_ORGANIZATION } from "@/lib/mock-data";
import { InvoiceSheet } from "@/components/invoices/invoice-sheet";
import { LanguageSelectorPopover } from "@/components/layout/language-selector-popover";
import { ThemeToggleButton } from "@/components/layout/theme-toggle-button";
import { Logo } from "@/components/ui/logo";
import { ArrowLeft, Printer, ShieldCheck } from "lucide-react";

interface PublicInvoicePageProps {
  params: Promise<{ token: string }>;
}

export default function PublicInvoicePage({ params }: PublicInvoicePageProps) {
  const { token } = use(params);
  const { invoices, organization } = useData();
  const { t } = useI18n();

  // Find invoice by ID, publicToken, or number
  const invoice =
    invoices.find((i) => i.id === token || i.publicToken === token || i.number === token) ??
    getInvoiceById(token);

  if (!invoice) {
    notFound();
  }

  const balanceDue = Math.max(0, invoice.total - invoice.amountPaid);
  const isPaid = invoice.displayStatus === "paid" || balanceDue === 0;

  return (
    <div className="min-h-screen bg-canvas text-ink py-6 sm:py-10 px-3 sm:px-6">
      {/* Top Floating Control Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface p-3.5 sm:p-4 rounded-2xl border border-line shadow-card print:hidden">
        <div className="flex items-center gap-2.5">
          <Logo variant="icon" size="sm" />
          <div>
            <span className="text-xs font-bold text-forest-950">
              DANHOMEY Facture · {t("dash_overview", "Vue publique")}
            </span>
            <p className="text-[11px] text-ink-muted">
              {t("dash_business_space", "Document officiel émis par")} {organization?.name ?? MOCK_ORGANIZATION.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelectorPopover />
          <ThemeToggleButton />
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-sage-500" />
            <span>{isPaid ? t("inv_download_receipt", "Télécharger le reçu (PDF)") : t("inv_download_invoice", "Télécharger la facture (PDF)")}</span>
          </button>
        </div>
      </div>

      {/* Main Sheet with Toolbar Toggle for Invoice vs Receipt */}
      <main className="max-w-4xl mx-auto">
        <InvoiceSheet
          invoice={invoice}
          initialMode={isPaid ? "receipt" : "invoice"}
          showToolbar={true}
        />
      </main>
    </div>
  );
}
