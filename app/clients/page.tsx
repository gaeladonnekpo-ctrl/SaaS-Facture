"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { formatFCFA } from "@/lib/format/money";
import { useData } from "@/lib/data/context";
import { useI18n } from "@/lib/i18n/context";
import type { MockCustomer } from "@/lib/mock-data";
import type { CreateCustomerInput } from "@/lib/data/context";
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  ArrowRight,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  MapPin,
  FileText,
  Download,
} from "lucide-react";

export default function CustomersPage() {
  const { customers, createCustomer, updateCustomer, deleteCustomer, showToast } = useData();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<MockCustomer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<MockCustomer | null>(null);

  // Form state for creating / editing
  const [formData, setFormData] = useState<CreateCustomerInput>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "Cotonou",
    country: "Bénin",
    taxId: "",
    rccm: "",
  });

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const totalInvoiced = customers.reduce((s, c) => s + c.totalInvoiced, 0);
  const totalBalanceDue = customers.reduce((s, c) => s + c.balanceDue, 0);

  const handleOpenCreateModal = () => {
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "Cotonou",
      country: "Bénin",
      taxId: `IFU-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      rccm: `RB/COT/26-B-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (customer: MockCustomer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      contactPerson: customer.contactPerson,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      taxId: customer.taxId,
      rccm: customer.rccm ?? "",
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast({ type: "error", message: "Veuillez renseigner le nom de l'entreprise." });
      return;
    }

    const created = createCustomer(formData);
    setIsCreateModalOpen(false);
    showToast({
      type: "success",
      title: "Client enregistré",
      message: `${created.name} a été ajouté avec succès à votre répertoire clients.`,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!formData.name.trim()) {
      showToast({ type: "error", message: "Veuillez renseigner le nom de l'entreprise." });
      return;
    }

    updateCustomer(editingCustomer.id, formData);
    const updatedName = formData.name;
    setEditingCustomer(null);
    showToast({
      type: "success",
      title: "Client mis à jour",
      message: `Les informations de ${updatedName} ont été enregistrées avec succès.`,
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingCustomer) return;
    const deletedName = deletingCustomer.name;
    deleteCustomer(deletingCustomer.id);
    setDeletingCustomer(null);
    showToast({
      type: "info",
      title: "Client supprimé",
      message: `${deletedName} a été retiré de votre répertoire clients.`,
    });
  };

  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      showToast({ type: "info", message: "Aucun client à exporter." });
      return;
    }

    const headers = [
      "ID Client",
      "Nom Entreprise",
      "Personne de contact",
      "Email",
      "Téléphone",
      "Ville",
      "Pays",
      "Adresse",
      "IFU",
      "RCCM",
      "Total Facturé (FCFA)",
      "Reste Dû (FCFA)",
      "Nombre de factures",
    ];

    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${(c.contactPerson || "").replace(/"/g, '""')}"`,
      c.email || "",
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.city || "").replace(/"/g, '""')}"`,
      `"${(c.country || "").replace(/"/g, '""')}"`,
      `"${(c.address || "").replace(/"/g, '""')}"`,
      c.taxId || "",
      c.rccm || "",
      c.totalInvoiced || 0,
      c.balanceDue || 0,
      c.invoicesCount || 0,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `DANHOMEY_Clients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: "success",
      message: `${filteredCustomers.length} client(s) exporté(s) en CSV avec succès.`,
    });
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
            <span className="font-semibold text-forest-950">{t("nav_customers", "Clients")}</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">
            {t("cust_title", "Répertoire des clients")}
          </h1>
          <p className="text-xs text-ink-muted sm:text-sm mt-0.5">
            {t("cust_subtitle", "Suivi des comptes clients, coordonnées de facturation et encours financiers.")}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-forest-900 hover:bg-sage-50 transition-colors shadow-2xs"
            title="Exporter la liste des clients au format CSV (Excel)"
          >
            <Download className="w-3.5 h-3.5 text-sage-600" />
            <span>{t("action_export_csv", "Exporter CSV")}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2 text-xs font-semibold text-surface shadow-sm hover:bg-forest-850 hover:shadow transition-all group active:scale-95"
          >
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-lime-400 text-forest-950 group-hover:rotate-90 transition-transform">
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>{t("cust_new", "Nouveau client")}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-4 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-sage-500 uppercase tracking-wider">
            {t("cust_total_active", "Total clients actifs")}
          </span>
          <p className="tabular mt-1 text-lg sm:text-xl font-bold text-forest-950">
            {customers.length} {t("cust_count_companies", "entreprises")}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-4 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-sage-500 uppercase tracking-wider">
            {t("cust_total_invoiced", "Volume total facturé")}
          </span>
          <p className="tabular mt-1 text-lg sm:text-xl font-bold text-forest-950 truncate">
            {formatFCFA(totalInvoiced)}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-200/80 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/40 p-3.5 sm:p-4 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
            {t("cust_balance_due", "Encours total à recouvrer")}
          </span>
          <p className="tabular mt-1 text-lg sm:text-xl font-bold text-rose-900 dark:text-rose-100 truncate">
            {formatFCFA(totalBalanceDue)}
          </p>
        </div>
      </div>

      {/* Main Customers List Card */}
      <div className="rounded-2xl border border-line bg-surface shadow-card overflow-hidden">
        {/* Search Bar */}
        <div className="p-3.5 sm:p-5 border-b border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sage-400" />
            <input
              type="text"
              placeholder={t("action_search", "Rechercher entreprise, contact, ville, tél...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-line bg-sage-50/70 py-1.5 pl-8 pr-3 text-xs text-forest-950 placeholder:text-sage-400 focus:border-forest-700 focus:bg-surface focus:outline-hidden transition-all"
            />
          </div>
          <span className="text-xs text-ink-muted">
            {filteredCustomers.length} {t("cust_count_referenced", "clients référencés")}
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line bg-sage-50/50 text-sage-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3">{t("cust_name", "Entreprise")}</th>
                <th className="px-4 py-3">{t("cust_contact", "Contact")}</th>
                <th className="px-4 py-3">{t("cust_city", "Coordonnées")}</th>
                <th className="px-4 py-3 text-right">{t("cust_total_invoiced", "Total facturé")}</th>
                <th className="px-4 py-3 text-right">{t("cust_balance_due", "Reste dû")}</th>
                <th className="px-4 py-3 text-center">{t("nav_invoices", "Factures")}</th>
                <th className="px-4 py-3 text-right">{t("table_th_actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    <Users className="mx-auto h-8 w-8 text-sage-300 mb-2" />
                    <p className="font-medium text-forest-950 dark:text-white">{t("table_empty_title", "Aucun client trouvé")}</p>
                    <p className="text-xs text-sage-500 mt-0.5 mb-3">
                      {customers.length === 0
                        ? "Votre répertoire client est vide. Ajoutez votre premier client pour commencer à facturer !"
                        : t("table_empty_desc", "Ajustez votre recherche ou ajoutez un nouveau client.")}
                    </p>
                    {customers.length === 0 && (
                      <button
                        type="button"
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-950 transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter un client</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-sage-50/60 transition-colors group"
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Link
                        href={`/clients/${customer.id}`}
                        className="flex items-center gap-2.5 font-semibold text-forest-950 hover:text-forest-700 transition-colors"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-100 dark:bg-sage-900/60 text-forest-800 dark:text-forest-100 border border-line-subtle font-bold text-xs group-hover:bg-lime-100 dark:group-hover:bg-lime-950/80 group-hover:text-forest-950 dark:group-hover:text-lime-300 transition-colors">
                          {customer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="underline-offset-2 group-hover:underline">
                            {customer.name}
                          </span>
                          <p className="text-[10px] text-ink-muted">IFU : {customer.taxId}</p>
                        </div>
                      </Link>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-medium text-forest-900">{customer.contactPerson}</p>
                      <p className="text-[11px] text-ink-muted">
                        {customer.city}, {customer.country}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 text-sage-600 whitespace-nowrap">
                      <p className="flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3 text-sage-400" />
                        <span>{customer.email}</span>
                      </p>
                      <p className="flex items-center gap-1 text-[11px] text-ink-muted mt-0.5">
                        <Phone className="w-3 h-3 text-sage-400" />
                        <span>{customer.phone}</span>
                      </p>
                    </td>

                    <td className="px-4 py-3.5 text-right tabular font-bold text-forest-950 whitespace-nowrap">
                      {formatFCFA(customer.totalInvoiced)}
                    </td>

                    <td className="px-4 py-3.5 text-right tabular whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          customer.balanceDue > 0 ? "text-rose-700" : "text-emerald-700"
                        }`}
                      >
                        {formatFCFA(customer.balanceDue)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-medium text-forest-900 tabular">
                        {customer.invoicesCount}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(customer)}
                          className="rounded-lg p-1.5 text-sage-500 hover:text-forest-900 hover:bg-sage-100 transition-colors"
                          title="Modifier le client"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCustomer(customer)}
                          className="rounded-lg p-1.5 text-sage-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 transition-colors"
                          title="Supprimer le client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/clients/${customer.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-forest-900 hover:bg-sage-100 transition-colors ml-1"
                        >
                          <span>Fiche</span>
                          <ArrowRight className="w-3 h-3 text-sage-400" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-line-subtle">
          {filteredCustomers.length === 0 ? (
            <div className="py-10 px-4 text-center text-ink-muted">
              <Users className="mx-auto h-8 w-8 text-sage-300 mb-2" />
              <p className="font-medium text-forest-950">Aucun client trouvé</p>
              <p className="text-xs text-sage-500 mt-0.5">Modifiez vos filtres de recherche.</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4 hover:bg-sage-50/60 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/clients/${customer.id}`}
                      className="text-sm font-bold text-forest-950 hover:underline"
                    >
                      {customer.name}
                    </Link>
                    <p className="text-xs text-sage-600">{customer.contactPerson}</p>
                    <p className="text-xs text-ink-muted">
                      {customer.city}, {customer.country}
                    </p>
                    <div className="mt-1 space-y-0.5 text-[11px] text-sage-600">
                      <p>{customer.email}</p>
                      <p>{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-sage-500 uppercase">Reste dû</span>
                    <p
                      className={`text-xs font-bold tabular ${
                        customer.balanceDue > 0 ? "text-rose-700" : "text-emerald-700"
                      }`}
                    >
                      {formatFCFA(customer.balanceDue)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(customer)}
                      className="rounded-lg border border-line bg-surface p-1.5 text-sage-600 hover:text-forest-900"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingCustomer(customer)}
                      className="rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/60 p-1.5 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Link
                    href={`/clients/${customer.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-forest-900 hover:underline"
                  >
                    <span>Voir la fiche</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-forest-900" />
                <h2 className="text-base font-bold text-forest-950">
                  {t("cust_modal_create_title", "Créer un nouveau client")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1 text-sage-400 hover:text-forest-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("cust_field_name", "Nom de l'entreprise / Raison sociale")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Bénin Énergie & Solutions SARL"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_contact", "Personne de contact")}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Marc Dossou"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_tax_id", "Numéro IFU (Identifiant Fiscal)")}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : IFU-2026-391829"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_email", "Adresse e-mail")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@entreprise.bj"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_phone", "Numéro de téléphone")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+229 97 00 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("cust_field_address", "Adresse physique / Siège social")}
                </label>
                <input
                  type="text"
                  placeholder="Ex : Boulevard de la Marina, Immeuble Horizon"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_city", "Ville")}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_country", "Pays")}
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface p-2.5 text-forest-950"
                  >
                    <option value="Bénin">Bénin</option>
                    <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Togo">Togo</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Mali">Mali</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="Niger">Niger</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-line px-4 py-2 font-semibold text-sage-600 hover:bg-sage-100"
                >
                  {t("action_cancel", "Annuler")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-forest-900 px-4 py-2 font-semibold text-surface hover:bg-forest-850 shadow-sm"
                >
                  {t("cust_btn_save", "Enregistrer le client")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-forest-900" />
                <h2 className="text-base font-bold text-forest-950">
                  {t("cust_modal_edit_title", "Modifier le client")} {editingCustomer.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="rounded-lg p-1 text-sage-400 hover:text-forest-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("cust_field_name", "Nom de l'entreprise / Raison sociale")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_contact", "Personne de contact")}
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_tax_id", "Numéro IFU")}
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_email", "Adresse e-mail")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_phone", "Numéro de téléphone")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-forest-950 mb-1">
                  {t("cust_field_address", "Adresse physique / Siège social")}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_city", "Ville")}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-line bg-sage-50/70 p-2.5 text-forest-950 focus:bg-surface focus:border-forest-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-forest-950 mb-1">
                    {t("cust_field_country", "Pays")}
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full rounded-xl border border-line bg-surface p-2.5 text-forest-950"
                  >
                    <option value="Bénin">Bénin</option>
                    <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Togo">Togo</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Mali">Mali</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="Niger">Niger</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="rounded-xl border border-line px-4 py-2 font-semibold text-sage-600 hover:bg-sage-100"
                >
                  {t("action_cancel", "Annuler")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-forest-900 px-4 py-2 font-semibold text-surface hover:bg-forest-850 shadow-sm"
                >
                  {t("cust_btn_save_changes", "Enregistrer les modifications")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-forest-950">
                  {t("cust_modal_delete_title", "Supprimer le client ?")} {deletingCustomer.name}
                </h2>
                <p className="mt-1 text-xs text-sage-600 leading-relaxed">
                  {t("cust_modal_delete_desc", "Confirmez-vous la suppression de ce client de votre répertoire ?")}
                </p>
                {deletingCustomer.balanceDue > 0 && (
                  <p className="mt-2 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-lg border border-rose-200/60 dark:border-rose-800/60 font-medium">
                    {t("cust_modal_delete_balance_warn", "Ce client présente encore un solde dû de")}{" "}
                    <strong>{formatFCFA(deletingCustomer.balanceDue)}</strong>.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-sage-600 hover:bg-sage-100"
              >
                {t("action_cancel", "Annuler")}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm"
              >
                {t("cust_btn_delete_confirm", "Supprimer le client")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
