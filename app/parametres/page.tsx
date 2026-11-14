"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth/context";
import { LogoutConfirmDialog } from "@/components/auth/logout-confirm-dialog";
import { useData } from "@/lib/data/context";
import { useTheme } from "@/lib/theme/context";
import { useI18n } from "@/lib/i18n/context";
import {
  Building2,
  Receipt,
  User,
  Save,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Percent,
  Smartphone,
  Landmark,
  FileCheck,
  Info,
  Sun,
  Moon,
  Globe,
  Sliders,
  LogOut,
} from "lucide-react";

type SettingsTab = "company" | "invoicing" | "account";

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { organization, updateOrganization, user, updateUser, showToast } = useData();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, currentLanguage, languages, t } = useI18n();
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const [savedTab, setSavedTab] = useState<SettingsTab | null>(null);

  // State for logout confirmation dialog
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      window.location.replace("/connexion");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // Controlled form states
  const [companyForm, setCompanyForm] = useState({
    name: organization.name,
    country: organization.country,
    currency: organization.currency,
    ifu: organization.ifu,
    rccm: organization.rccm,
    phone: organization.phone,
    email: organization.email,
    address: organization.address,
    city: organization.city,
  });

  const [invoicingForm, setInvoicingForm] = useState({
    invoicePrefix: organization.invoicePrefix,
    vatRate: organization.vatRate,
    paymentTermsDays: organization.paymentTermsDays,
    bankName: organization.bankName,
    bankIban: organization.bankIban,
    mobileMoneyWave: organization.mobileMoneyWave,
    mobileMoneyMtn: organization.mobileMoneyMtn,
    footerNote: organization.footerNote,
  });

  const [userForm, setUserForm] = useState({
    name: user.name,
    role: user.role,
    email: user.email,
  });

  // Keep forms in sync whenever context hydrates or updates
  useEffect(() => {
    setCompanyForm({
      name: organization.name,
      country: organization.country,
      currency: organization.currency,
      ifu: organization.ifu,
      rccm: organization.rccm,
      phone: organization.phone,
      email: organization.email,
      address: organization.address,
      city: organization.city,
    });
    setInvoicingForm({
      invoicePrefix: organization.invoicePrefix,
      vatRate: organization.vatRate,
      paymentTermsDays: organization.paymentTermsDays,
      bankName: organization.bankName,
      bankIban: organization.bankIban,
      mobileMoneyWave: organization.mobileMoneyWave,
      mobileMoneyMtn: organization.mobileMoneyMtn,
      footerNote: organization.footerNote,
    });
  }, [organization]);

  useEffect(() => {
    setUserForm({
      name: user.name,
      role: user.role,
      email: user.email,
    });
  }, [user]);

  // Tab 1 Submit
  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization(companyForm);
    setSavedTab("company");
    showToast({
      type: "success",
      title: "Entreprise enregistrée",
      message: "Les coordonnées et identifiants fiscaux de l'entreprise ont été sauvegardés.",
    });
    setTimeout(() => setSavedTab(null), 3000);
  };

  // Tab 2 Submit
  const handleInvoicingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization({
      ...invoicingForm,
      vatRate: Number(invoicingForm.vatRate) || 0,
      paymentTermsDays: Number(invoicingForm.paymentTermsDays) || 0,
    });
    setSavedTab("invoicing");
    showToast({
      type: "success",
      title: "Fiscalité & Facturation",
      message: "Le taux de TVA et les conditions de paiement ont été mis à jour avec succès.",
    });
    setTimeout(() => setSavedTab(null), 3000);
  };

  // Tab 3 Submit
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(userForm);
    setSavedTab("account");
    showToast({
      type: "success",
      title: "Profil utilisateur",
      message: "Vos informations de compte et profil ont été enregistrées avec succès.",
    });
    setTimeout(() => setSavedTab(null), 3000);
  };

  return (
    <DashboardShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Link href="/" className="hover:text-forest-900">
              Tableau de bord
            </Link>
            <span>/</span>
            <span className="font-semibold text-forest-950">Paramètres</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">
            Configuration de votre espace
          </h1>
          <p className="text-xs text-ink-muted sm:text-sm mt-0.5">
            Gérez vos informations d&apos;entreprise, paramètres de facturation fiscale et compte.
          </p>
        </div>

        {savedTab && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-in fade-in-50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t("set_success_saved", "Modifications enregistrées avec succès !")}</span>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center gap-2 border-b border-line pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "company"
              ? "bg-forest-900 text-surface shadow-2xs"
              : "text-sage-600 hover:bg-sage-100 hover:text-forest-900"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t("set_tab_company", "Entreprise & Coordonnées")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("invoicing")}
          className={`flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "invoicing"
              ? "bg-forest-900 text-surface shadow-2xs"
              : "text-sage-600 hover:bg-sage-100 hover:text-forest-900"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{t("set_tab_invoicing", "Facturation & Fiscalité FCFA")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "account"
              ? "bg-forest-900 text-surface shadow-2xs"
              : "text-sage-600 hover:bg-sage-100 hover:text-forest-900"
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t("set_tab_account", "Profil & Compte")}</span>
        </button>
      </div>

      {/* Tab 1: Company Profile Form */}
      {activeTab === "company" && (
        <form onSubmit={handleCompanySubmit} className="space-y-4 sm:space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-5 lg:p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-forest-950">
                  {t("set_company_identity", "Identité de l'organisation")}
                </h2>
                <p className="text-xs text-ink-muted">
                  {t("set_company_identity_desc", "Ces informations figureront sur l'en-tête de toutes vos factures et devis légaux.")}
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-forest-50 px-2.5 py-0.5 text-[11px] font-semibold text-forest-900 border border-forest-200">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
                {t("set_uemoa_badge", "Conforme UEMOA")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_company_name", "Raison sociale / Nom commercial")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  placeholder="Ex : DANHOMEY Technologies SARL"
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_country", "Pays d'immatriculation")}
                </label>
                <select
                  value={companyForm.country}
                  onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })}
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                >
                  <option value="Bénin">Bénin (XOF - FCFA)</option>
                  <option value="Côte d'Ivoire">Côte d&apos;Ivoire (XOF - FCFA)</option>
                  <option value="Sénégal">Sénégal (XOF - FCFA)</option>
                  <option value="Togo">Togo (XOF - FCFA)</option>
                  <option value="Burkina Faso">Burkina Faso (XOF - FCFA)</option>
                  <option value="Mali">Mali (XOF - FCFA)</option>
                  <option value="Niger">Niger (XOF - FCFA)</option>
                  <option value="Cameroun">Cameroun (XAF - FCFA)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_ifu", "Numéro IFU (Identifiant Fiscal Unique)")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.ifu}
                  onChange={(e) => setCompanyForm({ ...companyForm, ifu: e.target.value })}
                  placeholder="Ex : 3201910845321"
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 tabular focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_rccm", "Numéro RCCM")}
                </label>
                <input
                  type="text"
                  value={companyForm.rccm}
                  onChange={(e) => setCompanyForm({ ...companyForm, rccm: e.target.value })}
                  placeholder="Ex : RB/COT/21 B 28941"
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_phone", "Téléphone professionnel")}
                </label>
                <input
                  type="text"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  placeholder="+229 97 00 12 34"
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 tabular focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_email", "E-mail de facturation")}
                </label>
                <input
                  type="email"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  placeholder="contact@danhomey.africa"
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_city", "Ville du siège")}
                </label>
                <input
                  type="text"
                  value={companyForm.city}
                  onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                  placeholder="Cotonou"
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_address", "Adresse géographique détaillée")}
                </label>
                <input
                  type="text"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  placeholder="Quartier Haie Vive, Rue 340"
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <Info className="w-3.5 h-3.5 text-forest-800 shrink-0" />
                <span>{t("set_info_immediate_save", "Les modifications sont enregistrées immédiatement et appliquées à vos futures factures.")}</span>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-xs font-semibold text-surface shadow hover:bg-forest-850 active:scale-[0.98] transition-all"
              >
                <Save className="w-3.5 h-3.5 text-lime-400" />
                <span>{t("set_btn_save_company", "Enregistrer les coordonnées")}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Invoicing & FCFA Tax Settings */}
      {activeTab === "invoicing" && (
        <form onSubmit={handleInvoicingSubmit} className="space-y-4 sm:space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-5 lg:p-6 shadow-card space-y-4">
            <div>
              <h2 className="text-sm font-bold text-forest-950">
                {t("set_rules_tax_title", "Règles de facturation & Fiscalité UEMOA / CEMAC")}
              </h2>
              <p className="text-xs text-ink-muted">
                {t("set_rules_tax_desc", "Configurez le taux de TVA, vos délais de paiement et vos coordonnées bancaires pour les virements et Mobile Money.")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_prefix", "Préfixe de numérotation légale")}
                </label>
                <input
                  type="text"
                  value={invoicingForm.invoicePrefix}
                  onChange={(e) => setInvoicingForm({ ...invoicingForm, invoicePrefix: e.target.value })}
                  placeholder="FAC"
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 font-bold focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all uppercase"
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  Exemple : {invoicingForm.invoicePrefix || "FAC"}-2026-0001
                </p>
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_vat_rate", "Taux de TVA standard UEMOA (%)")}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={invoicingForm.vatRate}
                  onChange={(e) => setInvoicingForm({ ...invoicingForm, vatRate: Number(e.target.value) })}
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 font-bold tabular focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  18 % au Bénin, Côte d&apos;Ivoire, Sénégal, Togo, Burkina, Mali, Niger.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_payment_terms", "Délai de paiement par défaut (jours)")}
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={invoicingForm.paymentTermsDays}
                  onChange={(e) => setInvoicingForm({ ...invoicingForm, paymentTermsDays: Number(e.target.value) })}
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 tabular focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  {invoicingForm.paymentTermsDays} jours
                </p>
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_currency", "Devise d'émission")}
                </label>
                <input
                  type="text"
                  value="FCFA (Franc CFA - SYSCOHADA)"
                  disabled
                  className="w-full rounded-xl border border-line bg-sage-100/70 p-2.5 text-sage-600 cursor-not-allowed font-medium"
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  SYSCOHADA UEMOA / CEMAC.
                </p>
              </div>

              {/* Coordonnées bancaires & Mobile Money */}
              <div className="sm:col-span-2 pt-2 border-t border-line-subtle">
                <h3 className="text-xs font-bold text-forest-950 mb-3 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-forest-800" />
                  <span>{t("set_bank_momo_title", "Coordonnées bancaires & Mobile Money (affichées sur la facture)")}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-forest-950 mb-1">
                      {t("set_field_bank_name", "Nom de la banque")}
                    </label>
                    <input
                      type="text"
                      value={invoicingForm.bankName}
                      onChange={(e) => setInvoicingForm({ ...invoicingForm, bankName: e.target.value })}
                      placeholder="BOA Bénin, Ecobank, SG..."
                      className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-forest-950 mb-1">
                      {t("set_field_iban", "Numéro RIB / IBAN")}
                    </label>
                    <input
                      type="text"
                      value={invoicingForm.bankIban}
                      onChange={(e) => setInvoicingForm({ ...invoicingForm, bankIban: e.target.value })}
                      placeholder="BJ061 01001 00123456789 22"
                      className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 font-mono focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-forest-950 mb-1 flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-sky-600" />
                      <span>{t("set_field_wave", "Numéro Wave Business")}</span>
                    </label>
                    <input
                      type="text"
                      value={invoicingForm.mobileMoneyWave}
                      onChange={(e) => setInvoicingForm({ ...invoicingForm, mobileMoneyWave: e.target.value })}
                      placeholder="+229 97 00 12 34"
                      className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 tabular focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-forest-950 mb-1 flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-amber-600" />
                      <span>{t("set_field_mtn", "Numéro MTN MoMo")}</span>
                    </label>
                    <input
                      type="text"
                      value={invoicingForm.mobileMoneyMtn}
                      onChange={(e) => setInvoicingForm({ ...invoicingForm, mobileMoneyMtn: e.target.value })}
                      placeholder="+229 96 00 56 78"
                      className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 tabular focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-line-subtle">
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("set_field_footer", "Mentions légales obligatoires de bas de page (SYSCOHADA)")}
                </label>
                <textarea
                  rows={3}
                  value={invoicingForm.footerNote}
                  onChange={(e) => setInvoicingForm({ ...invoicingForm, footerNote: e.target.value })}
                  placeholder="Dispensé d'immatriculation au régime simplifié. Facture établie selon les normes du SYSCOHADA révisé."
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <FileCheck className="w-3.5 h-3.5 text-forest-800 shrink-0" />
                <span>{t("set_info_fcfa_rounding", "Tous les montants sont calculés en FCFA entier sans décimales.")}</span>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-xs font-semibold text-surface shadow hover:bg-forest-850 active:scale-[0.98] transition-all"
              >
                <Save className="w-3.5 h-3.5 text-lime-400" />
                <span>{t("set_btn_save_tax", "Enregistrer la configuration fiscale")}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: User Account Profile & Display/Language Preferences */}
      {activeTab === "account" && (
        <div className="space-y-4 sm:space-y-6">
          <form onSubmit={handleUserSubmit} className="space-y-4 sm:space-y-6">
            <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-5 lg:p-6 shadow-card space-y-4">
              <div>
                <h2 className="text-sm font-bold text-forest-950">
                  {t("set_account_title", "Profil & Compte")}
                </h2>
                <p className="text-xs text-ink-muted">
                  {t("set_account_desc", "Modifiez votre nom, rôle et adresse e-mail. Ces informations s'affichent dans la barre latérale.")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("set_field_user_name", "Nom et prénom")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Ex : Gaël Mensah"
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("set_field_user_role", "Rôle / Fonction")}
                  </label>
                  <input
                    type="text"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    placeholder="Ex : Directeur Général"
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("set_field_user_email", "Adresse e-mail de connexion")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="gael.mensah@danhomey.africa"
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-800 text-[10px] font-bold text-lime-300">
                    {user.initials}
                  </div>
                  <span>{t("set_info_local_storage", "Les informations de profil sont enregistrées localement sur votre appareil.")}</span>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-xs font-semibold text-surface shadow hover:bg-forest-850 active:scale-[0.98] transition-all"
                >
                  <Save className="w-3.5 h-3.5 text-lime-400" />
                  <span>{t("set_btn_save_profile", "Enregistrer mon profil")}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Dedicated Card for Display & Language Preferences */}
          <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-5 lg:p-6 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-line">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-forest-800 dark:text-lime-400" />
                  <h2 className="text-sm font-bold text-forest-950">
                    {t("set_pref_display_title", "Préférences d'affichage & Langue")}
                  </h2>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  {t("set_pref_display_desc", "Personnalisez le thème visuel (clair / sombre) et la langue de l'interface parmi 12 langues prises en charge.")}
                </p>
              </div>
            </div>

            {/* 1. Theme Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-forest-950">
                {t("set_theme_visual", "Thème visuel")}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Light Mode Card */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme("light");
                    showToast({ type: "success", message: "Mode clair activé" });
                  }}
                  className={`flex items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
                    theme === "light"
                      ? "border-forest-700 bg-forest-50/70 dark:bg-forest-900/30 ring-2 ring-forest-600/30 shadow-xs"
                      : "border-line bg-surface hover:bg-sage-50/60 hover:border-sage-300"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      theme === "light"
                        ? "bg-amber-100 text-amber-600 border-amber-300"
                        : "bg-sage-100 text-sage-600 border-line"
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-forest-950">
                        {t("theme_light", "Mode Clair")}
                      </span>
                      {theme === "light" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-forest-900 px-2 py-0.5 text-[10px] font-bold text-lime-300">
                          <CheckCircle2 className="w-3 h-3 text-lime-400" />
                          {language === "en" ? "Active" : "Actif"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-muted mt-1 leading-snug">
                      {language === "en" ? "Clean light palette optimized for day-time clarity." : "Arrière-plan clair optimisé pour le travail de jour et la lecture sur écran classique."}
                    </p>
                  </div>
                </button>

                {/* Dark Mode Card */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme("dark");
                    showToast({ type: "success", message: language === "en" ? "Dark mode enabled" : "Mode sombre activé" });
                  }}
                  className={`flex items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
                    theme === "dark"
                      ? "border-forest-500 bg-forest-900/50 ring-2 ring-forest-500/40 shadow-xs"
                      : "border-line bg-surface hover:bg-sage-50/60 hover:border-sage-300"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      theme === "dark"
                        ? "bg-forest-800 text-lime-300 border-forest-600"
                        : "bg-sage-100 text-sage-600 border-line"
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-forest-950">
                        {t("theme_dark", "Mode Sombre")}
                      </span>
                      {theme === "dark" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-lime-400 px-2 py-0.5 text-[10px] font-bold text-forest-950">
                          <CheckCircle2 className="w-3 h-3 text-forest-950" />
                          {language === "en" ? "Active" : "Actif"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-muted mt-1 leading-snug">
                      {language === "en" ? "Deep dark palette for restful eye comfort at night." : "Palette sombre haute élégance, reposante pour les yeux lors des sessions nocturnes."}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Multilingual Selection */}
            <div className="space-y-3 pt-4 border-t border-line">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-forest-950">
                    {t("set_lang_available", "Langue de l'interface (12 langues disponibles)")}
                  </label>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {language === "en" ? "Select your workspace language among official and African local languages." : "Sélectionnez votre langue de travail parmi les langues officielles et locales des pays UEMOA & CEMAC."}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-forest-50 dark:bg-forest-900/40 border border-forest-200 dark:border-forest-700 px-2.5 py-0.5 text-[11px] font-bold text-forest-900 dark:text-lime-300">
                  <Globe className="w-3 h-3" />
                  {language === "en" ? "12 languages" : "12 langues"}
                </span>
              </div>

              {/* Language Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {languages.map((lang) => {
                  const isCurrent = lang.code === language;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        showToast({
                          type: "success",
                          message: `Langue changée : ${lang.name} (${lang.nativeName})`,
                        });
                      }}
                      className={`flex items-center justify-between gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                        isCurrent
                          ? "border-forest-700 bg-forest-50/70 dark:bg-forest-900/40 ring-2 ring-forest-600/30"
                          : "border-line bg-surface hover:bg-sage-50/60 hover:border-sage-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0" role="img" aria-label={lang.country}>
                          {lang.flag}
                        </span>
                        <div className="min-w-0 truncate">
                          <p className="text-xs font-semibold text-forest-950 truncate">
                            {lang.nativeName}
                          </p>
                          <p className="text-[10px] text-ink-muted truncate">
                            {lang.name} {lang.country ? `• ${lang.country}` : ""}
                          </p>
                        </div>
                      </div>

                      {isCurrent ? (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-900 text-lime-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-sage-400 uppercase">
                          {lang.code}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Session & Déconnexion */}
            <div className="space-y-3 pt-4 border-t border-line">
              <label className="block text-xs font-bold text-forest-950 dark:text-white">
                {language === "en" ? "User Session" : "Session utilisateur"}
              </label>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0">
                    <LogOut className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-forest-950 dark:text-white">
                      {language === "en" ? "Sign out of your account" : "Déconnexion de votre compte"}
                    </h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      {language === "en" ? "Active session:" : "Session active :"} <strong className="font-semibold text-forest-900 dark:text-sage-200">{user.email || user.name}</strong> ({user.role})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === "en" ? "Log out" : "Se déconnecter"}</span>
                </button>
              </div>
            </div>

            {/* Note persistence */}
            <div className="rounded-xl border border-line-subtle bg-sage-50/50 dark:bg-forest-950/40 p-3 text-[11px] text-ink-muted flex items-start gap-2">
              <Info className="w-4 h-4 text-forest-800 dark:text-lime-400 shrink-0 mt-0.5" />
              <span>
                {t("set_info_persistence_desc", "Vos préférences de mode d'affichage et de langue sont enregistrées dans votre navigateur (localStorage) et seront conservées lors de vos prochaines visites.")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </DashboardShell>
  );
}
