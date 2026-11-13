"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import {
  Headphones,
  MessageSquare,
  PhoneCall,
  Mail,
  Send,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function SupportPage() {
  const { user, organization, showToast } = useData();
  const { t } = useI18n();

  const faqItems = [
    {
      question: t("sup_faq_q1", "Comment est calculée la TVA à 18 % dans l'application ?"),
      answer: t(
        "sup_faq_a1",
        "La TVA est automatiquement calculée au taux réglementaire de 18 % sur le sous-total hors taxes (HT) conformément au code général des impôts des pays de l'UEMOA (Bénin, Côte d'Ivoire, Sénégal, Togo, Burkina Faso, Mali, Niger). Tous les montants sont strictement arrondis au franc CFA entier sans centimes."
      ),
    },
    {
      question: t("sup_faq_q2", "Comment partager une facture directement par WhatsApp ?"),
      answer: t(
        "sup_faq_a2",
        "Depuis la liste des factures, cliquez sur la facture désirée pour ouvrir sa fiche détaillée. Cliquez ensuite sur le bouton vert 'WhatsApp' : un message personnalisé est automatiquement préparé avec le numéro de facture, le montant en FCFA et le lien public sécurisé pour votre client."
      ),
    },
    {
      question: t("sup_faq_q3", "Comment modifier les informations de mon entreprise (IFU, RCCM) ?"),
      answer: t(
        "sup_faq_a3",
        "Dans le menu principal, cliquez sur 'Paramètres'. Dans le premier onglet 'Entreprise & Coordonnées', vous pouvez mettre à jour votre raison sociale, numéro IFU, RCCM, adresse et téléphone. Cliquez sur 'Enregistrer les coordonnées' : les modifications sont immédiatement appliquées à vos futures factures."
      ),
    },
    {
      question: t("sup_faq_q4", "Quels modes de règlement Mobile Money sont pris en charge ?"),
      answer: t(
        "sup_faq_a4",
        "DANHOMEY Facture intègre Wave Business, MTN Mobile Money, Moov Money, Orange Money, ainsi que les virements bancaires (RIB/IBAN), chèques et règlements en espèces. Vous pouvez enregistrer des paiements partiels ou complets en quelques clics."
      ),
    },
    {
      question: t("sup_faq_q5", "Nos factures sont-elles conformes aux normes OHADA ?"),
      answer: t(
        "sup_faq_a5",
        "Oui. Les mentions obligatoires du SYSCOHADA révisé (IFU, RCCM, conversion automatique du montant en toutes lettres, dates d'émission et d'échéance, détails des lignes) sont générées et validées sur chaque document."
      ),
    },
  ];

  // Contact form state
  const [category, setCategory] = useState("billing_vat");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactName, setContactName] = useState(user.name);
  const [contactEmail, setContactEmail] = useState(user.email);
  const [contactPhone, setContactPhone] = useState(organization.phone);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(generatedId);
    setIsSubmitted(true);

    showToast({
      type: "success",
      title: "Demande d'assistance envoyée !",
      message: `Votre ticket ${generatedId} a été enregistré. Notre équipe vous répondra sous 15 minutes.`,
    });
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setSubject("");
    setMessage("");
  };

  return (
    <DashboardShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Link href="/" className="hover:text-forest-900">
              {t("nav_dashboard", "Tableau de bord")}
            </Link>
            <span>/</span>
            <span className="font-semibold text-forest-950">{t("nav_support", "Support client")}</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">
            {t("sup_title", "Support client & Assistance")}
          </h1>
          <p className="text-xs text-ink-muted sm:text-sm mt-0.5">
            {t("sup_team_description", "Une équipe dédiée basée à Cotonou et Abidjan pour vous accompagner dans votre facturation.")}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-forest-50 border border-forest-200/70 px-3.5 py-2 text-xs font-semibold text-forest-900">
          <Clock className="w-4 h-4 text-forest-700 shrink-0" />
          <span>{t("sup_working_hours", "Support actif : Lun - Ven, 08h00 - 18h30 (GMT+1)")}</span>
        </div>
      </div>

      {/* 3 Quick Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* WhatsApp Card */}
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-card hover:border-emerald-300 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
                {t("sup_card_whatsapp_badge", "Recommandé")}
              </span>
            </div>
            <h2 className="mt-3 text-sm font-bold text-forest-950">
              {t("sup_card_whatsapp_title", "WhatsApp Direct")}
            </h2>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              {t("sup_card_whatsapp_desc", "Assistance instantanée avec un conseiller dédié pour vos questions urgentes.")}
            </p>
            <p className="mt-2 text-xs font-bold text-forest-900 tabular">
              +229 97 00 12 34
            </p>
          </div>
          <a
            href="https://wa.me/22997001234?text=Bonjour%20l%27%C3%A9quipe%20DANHOMEY%2C%20j%27ai%20besoin%20d%27assistance%20sur%20mon%20compte"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 active:scale-[0.99] transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t("sup_card_whatsapp_btn", "Discuter sur WhatsApp")}</span>
          </a>
        </div>

        {/* Phone Call Card */}
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-card hover:border-forest-300 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-forest-200">
                <PhoneCall className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center rounded-full bg-sage-100 dark:bg-sage-900/60 px-2 py-0.5 text-[10px] font-semibold text-sage-700 dark:text-sage-300">
                {t("sup_card_phone_badge", "Lignes directes")}
              </span>
            </div>
            <h2 className="mt-3 text-sm font-bold text-forest-950">
              {t("sup_card_phone_title", "Assistance Téléphonique")}
            </h2>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              {t("sup_card_phone_desc", "Joignez notre service client par téléphone au Bénin et en Côte d'Ivoire.")}
            </p>
            <div className="mt-2 space-y-0.5 text-xs font-medium text-forest-900 tabular">
              <p>Bénin : <strong className="font-bold">+229 97 00 12 34</strong></p>
              <p>Côte d&apos;Ivoire : <strong className="font-bold">+225 07 08 09 10 11</strong></p>
            </div>
          </div>
          <a
            href="tel:+22997001234"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-sage-50 px-3.5 py-2 text-xs font-semibold text-forest-900 hover:bg-sage-100 active:scale-[0.99] transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-forest-700" />
            <span>{t("sup_card_phone_btn", "Appeler le support")}</span>
          </a>
        </div>

        {/* Email Card */}
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-card hover:border-forest-300 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                <Mail className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center rounded-full bg-sky-100 dark:bg-sky-950/70 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:text-sky-300 border border-sky-300/60 dark:border-sky-700/60">
                {t("sup_card_email_badge", "Sous 2h ouvrées")}
              </span>
            </div>
            <h2 className="mt-3 text-sm font-bold text-forest-950">
              {t("sup_card_email_title", "E-mail & Billetterie")}
            </h2>
            <p className="mt-1 text-xs text-ink-muted leading-relaxed">
              {t("sup_card_email_desc", "Pour l'envoi de pièces jointes, avis fiscaux ou questions comptables complexes.")}
            </p>
            <p className="mt-2 text-xs font-bold text-forest-900 truncate">
              support@danhomey.africa
            </p>
          </div>
          <a
            href="mailto:support@danhomey.africa?subject=Demande%20d%27assistance%20DANHOMEY%20Facture"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-sage-50 px-3.5 py-2 text-xs font-semibold text-forest-900 hover:bg-sage-100 active:scale-[0.99] transition-all"
          >
            <Mail className="w-3.5 h-3.5 text-forest-700" />
            <span>{t("sup_card_email_btn", "Écrire un e-mail")}</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Support Ticket Form (Left) & FAQ (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Support Ticket Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-card space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-forest-800" />
                <h2 className="text-sm font-bold text-forest-950">
                  {t("sup_form_heading", "Formulaire de demande d'assistance")}
                </h2>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                {t("sup_form_subheading", "Remplissez ce formulaire pour créer un ticket. Notre équipe technique prendra en charge votre demande immédiatement.")}
              </p>
            </div>

            {isSubmitted ? (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/40 p-5 text-center space-y-3 animate-in fade-in-50">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                    {t("sup_ticket_success_title", "Demande transmise avec succès !")}
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                    Référence :{" "}
                    <span className="font-mono font-bold text-emerald-950 dark:text-emerald-200 bg-emerald-200/70 dark:bg-emerald-900/70 px-2 py-0.5 rounded-md">
                      {ticketId}
                    </span>
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2">
                    {t("sup_ticket_success_desc", "Un accusé de réception a été envoyé. Un conseiller vous répondra dans un délai maximum de 15 minutes.")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2 text-xs font-semibold text-surface shadow hover:bg-forest-850 transition-colors"
                >
                  <span>{t("sup_ticket_send_another", "Envoyer un autre message")}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-forest-950 mb-1">
                      {t("sup_form_name_label", "Votre nom et prénom")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-forest-950 mb-1">
                      {t("sup_form_org_label", "Organisation")}
                    </label>
                    <input
                      type="text"
                      defaultValue={organization.name}
                      readOnly
                      className="w-full rounded-xl border border-line bg-sage-100/70 p-2.5 text-sage-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-forest-950 mb-1">
                      {t("sup_form_email_label", "Adresse e-mail de réponse")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-forest-950 mb-1">
                      {t("sup_form_phone_label", "Numéro WhatsApp / Téléphone")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+229 97 00 12 34"
                      className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 tabular focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-forest-950 mb-1">
                      {t("sup_form_cat_label", "Catégorie de la demande")}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                    >
                      <option value="billing_vat">{t("sup_cat_vat", "Facturation & Calcul de TVA (18 %)")}</option>
                      <option value="momo_payment">{t("sup_cat_momo", "Mobile Money & Paiements en ligne")}</option>
                      <option value="settings_ifu">{t("sup_cat_ifu", "Paramétrage fiscal (IFU / RCCM)")}</option>
                      <option value="legal_ohada">{t("sup_cat_export", "Export comptable & Rapports PDF/CSV")}</option>
                      <option value="other">{t("sup_cat_other", "Autre question générale")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-forest-950 mb-1">
                      {t("sup_form_subject_label", "Objet de votre demande")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={t("sup_form_subject_placeholder", "Ex : Question sur l'attestation fiscale ou paiement Wave")}
                      className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("sup_form_msg_label", "Message détaillé")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("sup_form_msg_placeholder", "Décrivez votre besoin avec précision...")}
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700 focus:outline-hidden transition-all text-xs"
                  />
                </div>

                <div className="pt-2 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-ink-muted">
                    {t("sup_ticket_success_desc", "Réponse garantie sous 15 minutes pendant les heures ouvrées.")}
                  </span>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-2.5 text-xs font-semibold text-surface shadow hover:bg-forest-850 active:scale-[0.98] transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-lime-400" />
                    <span>{t("sup_btn_send_ticket", "Envoyer la demande")}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Accordion (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-forest-800" />
              <h2 className="text-sm font-bold text-forest-950">
                {t("sup_faq_heading", "Questions fréquentes (FAQ)")}
              </h2>
            </div>
            <p className="text-xs text-ink-muted">
              {t("sup_faq_subheading", "Réponses rapides aux interrogations courantes sur la facturation FCFA.")}
            </p>

            <div className="space-y-2.5">
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-line bg-sage-50/50 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 p-3 text-left text-xs font-semibold text-forest-950 hover:bg-sage-100/60 transition-colors"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-sage-500 shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-forest-900" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 pt-1 text-xs text-ink-muted leading-relaxed border-t border-line-subtle bg-surface/70">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal Compliance Box */}
          <div className="rounded-2xl border border-lime-300/60 bg-gradient-to-br from-lime-50/80 to-sage-100/70 p-4 sm:p-5 shadow-card">
            <div className="flex items-center gap-2 text-xs font-bold text-forest-950">
              <ShieldCheck className="w-4.5 h-4.5 text-forest-800" />
              <span>Conformité fiscale &amp; Légale certifiée</span>
            </div>
            <p className="mt-1.5 text-xs text-forest-900 leading-relaxed">
              DANHOMEY Facture est conçu pour respecter à la lettre les dispositions fiscales de l&apos;UEMOA et les règles de tenue comptable du SYSCOHADA révisé.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-forest-900">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-600" />
              <span>Bénin (DGI / e-MECeF) • Côte d&apos;Ivoire (DGI) • Sénégal (DGID)</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

