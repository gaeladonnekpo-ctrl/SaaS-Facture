import type { DisplayStatus, ISODate, PaymentMethod } from "./domain/types";

export interface MockInvoiceItem {
  id: string;
  position: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface MockPaymentRecord {
  id: string;
  date: ISODate;
  amount: number;
  method: PaymentMethod;
  reference: string;
  note?: string;
  providerId?: string;
  providerName?: string;
}

export interface MockCustomer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string; // IFU ou NINEA
  rccm?: string;
  totalInvoiced: number;
  totalPaid: number;
  balanceDue: number;
  invoicesCount: number;
  createdAt: ISODate;
}

export interface MockInvoice {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerCountry: string;
  customerTaxId?: string;
  issueDate: ISODate;
  dueDate: ISODate;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  amountPaid: number;
  displayStatus: DisplayStatus;
  paymentMethod?: PaymentMethod;
  itemsCount: number;
  items: MockInvoiceItem[];
  payments: MockPaymentRecord[];
  notes?: string;
  publicToken?: string;
  createdAt?: ISODate;
}

export interface DashboardMetrics {
  totalInvoiced: {
    amount: number;
    changePercentage: number;
    periodLabel: string;
  };
  totalCollected: {
    amount: number;
    collectionRate: number;
    periodLabel: string;
  };
  pendingAmount: {
    total: number;
    overduePart: number;
    pendingCount: number;
    overdueCount: number;
  };
  invoicesCount: {
    total: number;
    paid: number;
    sent: number;
    overdue: number;
    draft: number;
  };
}

export interface MonthlyCashflow {
  month: string;
  shortMonth: string;
  invoiced: number;
  collected: number;
}

export const MOCK_ORGANIZATION = {
  id: "org_01",
  name: "DANHOMEY Technologies SARL",
  city: "Cotonou",
  country: "Bénin",
  currency: "XOF" as const,
  ifu: "3201910845321",
  rccm: "RB/COT/21 B 28941",
  address: "Quartier Haie Vive, Rue 340",
  phone: "+229 97 00 12 34",
  email: "contact@danhomey.africa",
  bankName: "BOA Bénin",
  bankIban: "BJ061 01001 00123456789 22",
  mobileMoneyWave: "+229 97 00 12 34",
  mobileMoneyMtn: "+229 96 00 56 78",
  vatRate: 18,
  invoicePrefix: "FAC",
  paymentTermsDays: 30,
  footerNote: "Dispensé d'immatriculation au régime simplifié. Facture établie selon les normes du SYSCOHADA révisé.",
};

export const MOCK_USER = {
  id: "usr_01",
  name: "Gaël Mensah",
  role: "Directeur Général",
  email: "gael.mensah@danhomey.africa",
  avatarUrl: null,
  initials: "GM",
};

export const MOCK_METRICS: DashboardMetrics = {
  totalInvoiced: {
    amount: 18_450_000,
    changePercentage: 14.2,
    periodLabel: "vs mois dernier",
  },
  totalCollected: {
    amount: 14_200_000,
    collectionRate: 77,
    periodLabel: "Taux d'encaissement de 77 %",
  },
  pendingAmount: {
    total: 4_250_000,
    overduePart: 1_200_000,
    pendingCount: 11,
    overdueCount: 3,
  },
  invoicesCount: {
    total: 48,
    paid: 32,
    sent: 11,
    overdue: 3,
    draft: 2,
  },
};

export const MOCK_CASHFLOW: MonthlyCashflow[] = [
  { month: "Juin 2026", shortMonth: "Juin", invoiced: 8_200_000, collected: 7_800_000 },
  { month: "Juillet 2026", shortMonth: "Juil", invoiced: 11_500_000, collected: 9_900_000 },
  { month: "Août 2026", shortMonth: "Août", invoiced: 9_800_000, collected: 9_400_000 },
  { month: "Septembre 2026", shortMonth: "Sept", invoiced: 14_200_000, collected: 12_600_000 },
  { month: "Octobre 2026", shortMonth: "Oct", invoiced: 16_100_000, collected: 13_100_000 },
  { month: "Novembre 2026", shortMonth: "Nov", invoiced: 18_450_000, collected: 14_200_000 },
];

export const MOCK_CUSTOMERS: MockCustomer[] = [
  {
    id: "cust_01",
    name: "SOTRA CI",
    contactPerson: "M. Bakary Coulibaly",
    email: "b.coulibaly@sotra.ci",
    phone: "+225 07 08 09 10 11",
    address: "Boulevard de Marseille, Zone 3",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    taxId: "CI-ABJ-2015-B-1420",
    rccm: "CI-ABJ-03-2015-B12-0894",
    totalInvoiced: 7_650_000,
    totalPaid: 7_650_000,
    balanceDue: 0,
    invoicesCount: 4,
    createdAt: "2026-02-15",
  },
  {
    id: "cust_02",
    name: "Groupe Duval Afrique",
    contactPerson: "Mme Awa Ndiaye",
    email: "awa.ndiaye@duval-afrique.com",
    phone: "+221 33 820 40 50",
    address: "Almadies, Lot 24B",
    city: "Dakar",
    country: "Sénégal",
    taxId: "SN-DKR-2018-09142",
    rccm: "SN-DKR-2018-B-3109",
    totalInvoiced: 4_350_000,
    totalPaid: 2_900_000,
    balanceDue: 1_450_000,
    invoicesCount: 3,
    createdAt: "2026-03-10",
  },
  {
    id: "cust_03",
    name: "Bénin Télécoms Services",
    contactPerson: "M. Innocent Dossou",
    email: "i.dossou@benintelecoms.bj",
    phone: "+229 21 31 15 20",
    address: "Avenue Jean-Paul II",
    city: "Cotonou",
    country: "Bénin",
    taxId: "3201400294102",
    rccm: "RB/COT/14 B 1204",
    totalInvoiced: 6_800_000,
    totalPaid: 5_600_000,
    balanceDue: 1_200_000,
    invoicesCount: 5,
    createdAt: "2026-01-20",
  },
  {
    id: "cust_04",
    name: "Douala Port Logistics",
    contactPerson: "M. Christian Ebanda",
    email: "ebanda@doualaport-log.cm",
    phone: "+237 233 42 18 90",
    address: "Zone Portuaire Bonabéri",
    city: "Douala",
    country: "Cameroun",
    taxId: "M051912839410Z",
    rccm: "RC/DLA/2019/B/4521",
    totalInvoiced: 8_200_000,
    totalPaid: 8_200_000,
    balanceDue: 0,
    invoicesCount: 4,
    createdAt: "2026-04-05",
  },
  {
    id: "cust_05",
    name: "Sahel Agrobusiness SARL",
    contactPerson: "M. Moussa Traoré",
    email: "moussa.traore@sahelagro.bf",
    phone: "+226 25 30 45 60",
    address: "Zone Industrielle Kossodo",
    city: "Ouagadougou",
    country: "Burkina Faso",
    taxId: "00049214T",
    rccm: "BF OUA 2020 B 6102",
    totalInvoiced: 2_850_000,
    totalPaid: 1_900_000,
    balanceDue: 950_000,
    invoicesCount: 2,
    createdAt: "2026-05-18",
  },
  {
    id: "cust_06",
    name: "Togocel Partenaires",
    contactPerson: "Mme Akossiwa Lawson",
    email: "akossiwa.lawson@togocel-partenaires.tg",
    phone: "+228 22 21 00 12",
    address: "Boulevard du 13 Janvier",
    city: "Lomé",
    country: "Togo",
    taxId: "1000492810",
    rccm: "TG-LOM-2017-B-1940",
    totalInvoiced: 3_560_000,
    totalPaid: 3_560_000,
    balanceDue: 0,
    invoicesCount: 2,
    createdAt: "2026-06-01",
  },
  {
    id: "cust_07",
    name: "Nova Studio Créatif",
    contactPerson: "M. David Agossa",
    email: "david@novastudio.design",
    phone: "+229 95 40 22 11",
    address: "Cadjehoun, Carrefour des 3 Banques",
    city: "Cotonou",
    country: "Bénin",
    taxId: "3202209148523",
    rccm: "RB/COT/22 A 9041",
    totalInvoiced: 620_000,
    totalPaid: 0,
    balanceDue: 620_000,
    invoicesCount: 1,
    createdAt: "2026-11-01",
  },
];

export const MOCK_INVOICES: MockInvoice[] = [
  {
    id: "inv_01",
    number: "FAC-2026-0048",
    customerId: "cust_01",
    customerName: "SOTRA CI",
    customerContact: "M. Bakary Coulibaly",
    customerEmail: "b.coulibaly@sotra.ci",
    customerPhone: "+225 07 08 09 10 11",
    customerAddress: "Boulevard de Marseille, Zone 3",
    customerCity: "Abidjan",
    customerCountry: "Côte d'Ivoire",
    customerTaxId: "CI-ABJ-2015-B-1420",
    issueDate: "2026-11-04",
    dueDate: "2026-11-25",
    subtotal: 2_415_254,
    vatRate: 18,
    vatAmount: 434_746,
    total: 2_850_000,
    amountPaid: 2_850_000,
    displayStatus: "paid",
    paymentMethod: "bank_transfer",
    itemsCount: 3,
    items: [
      {
        id: "item_01",
        position: 1,
        description: "Audit d'infrastructure et cartographie des flux télématiques",
        quantity: 1,
        unitPrice: 1_200_000,
        lineTotal: 1_200_000,
      },
      {
        id: "item_02",
        position: 2,
        description: "Déploiement passerelle de paiement Mobile Money & API billetterie",
        quantity: 1,
        unitPrice: 950_000,
        lineTotal: 950_000,
      },
      {
        id: "item_03",
        position: 3,
        description: "Assistance technique et support 24/7 (mois de Novembre 2026)",
        quantity: 1,
        unitPrice: 265_254,
        lineTotal: 265_254,
      },
    ],
    payments: [
      {
        id: "pay_01",
        date: "2026-11-08",
        amount: 2_850_000,
        method: "bank_transfer",
        reference: "VIR-BOA-20261108-9921",
        note: "Règlement intégral par virement bancaire",
      },
    ],
    notes: "Paiement reçu intégralement. Merci pour votre confiance.",
  },
  {
    id: "inv_02",
    number: "FAC-2026-0047",
    customerId: "cust_02",
    customerName: "Groupe Duval Afrique",
    customerContact: "Mme Awa Ndiaye",
    customerEmail: "awa.ndiaye@duval-afrique.com",
    customerPhone: "+221 33 820 40 50",
    customerAddress: "Almadies, Lot 24B",
    customerCity: "Dakar",
    customerCountry: "Sénégal",
    issueDate: "2026-11-02",
    dueDate: "2026-11-16",
    subtotal: 1_228_814,
    vatRate: 18,
    vatAmount: 221_186,
    total: 1_450_000,
    amountPaid: 0,
    displayStatus: "sent",
    paymentMethod: "mobile_money",
    itemsCount: 2,
    items: [
      {
        id: "item_04",
        position: 1,
        description: "Conception UI/UX du portail investisseurs région Ouest",
        quantity: 1,
        unitPrice: 850_000,
        lineTotal: 850_000,
      },
      {
        id: "item_05",
        position: 2,
        description: "Intégration front-end Next.js et tableaux de bord analytiques",
        quantity: 1,
        unitPrice: 378_814,
        lineTotal: 378_814,
      },
    ],
    payments: [],
    notes: "Règlement attendu avant le 16/11/2026 par virement bancaire ou Wave Business.",
  },
  {
    id: "inv_03",
    number: "FAC-2026-0046",
    customerId: "cust_03",
    customerName: "Bénin Télécoms Services",
    customerContact: "M. Innocent Dossou",
    customerEmail: "i.dossou@benintelecoms.bj",
    customerPhone: "+229 21 31 15 20",
    customerAddress: "Avenue Jean-Paul II",
    customerCity: "Cotonou",
    customerCountry: "Bénin",
    customerTaxId: "3201400294102",
    issueDate: "2026-10-15",
    dueDate: "2026-10-31",
    subtotal: 2_711_864,
    vatRate: 18,
    vatAmount: 488_136,
    total: 3_200_000,
    amountPaid: 2_000_000,
    displayStatus: "overdue",
    itemsCount: 3,
    items: [
      {
        id: "item_06",
        position: 1,
        description: "Développement module d'interconnexion USSD et SMS Gateway",
        quantity: 1,
        unitPrice: 1_800_000,
        lineTotal: 1_800_000,
      },
      {
        id: "item_07",
        position: 2,
        description: "Tests de charge et sécurisation contre les fraudes",
        quantity: 1,
        unitPrice: 600_000,
        lineTotal: 600_000,
      },
      {
        id: "item_08",
        position: 3,
        description: "Formation de l'équipe technique d'exploitation (3 jours)",
        quantity: 3,
        unitPrice: 103_955,
        lineTotal: 311_864,
      },
    ],
    payments: [
      {
        id: "pay_02",
        date: "2026-10-20",
        amount: 2_000_000,
        method: "bank_transfer",
        reference: "ACOMPTE-BTS-10-2026",
        note: "Acompte contractuel de démarrage",
      },
    ],
    notes: "Solde restant dû : 1 200 000 FCFA. Échéance dépassée depuis le 31/10/2026.",
  },
  {
    id: "inv_04",
    number: "FAC-2026-0045",
    customerId: "cust_04",
    customerName: "Douala Port Logistics",
    customerContact: "M. Christian Ebanda",
    customerEmail: "ebanda@doualaport-log.cm",
    customerPhone: "+237 233 42 18 90",
    customerAddress: "Zone Portuaire Bonabéri",
    customerCity: "Douala",
    customerCountry: "Cameroun",
    issueDate: "2026-10-28",
    dueDate: "2026-11-12",
    subtotal: 3_474_576,
    vatRate: 18,
    vatAmount: 625_424,
    total: 4_100_000,
    amountPaid: 4_100_000,
    displayStatus: "paid",
    paymentMethod: "bank_transfer",
    itemsCount: 2,
    items: [
      {
        id: "item_09",
        position: 1,
        description: "Système de traçabilité des conteneurs en temps réel (GPS + IoT)",
        quantity: 1,
        unitPrice: 2_800_000,
        lineTotal: 2_800_000,
      },
      {
        id: "item_10",
        position: 2,
        description: "Licence serveur et maintenance annuelle",
        quantity: 1,
        unitPrice: 674_576,
        lineTotal: 674_576,
      },
    ],
    payments: [
      {
        id: "pay_03",
        date: "2026-11-05",
        amount: 4_100_000,
        method: "bank_transfer",
        reference: "VIR-AFRILAND-44120",
      },
    ],
    notes: "Facture soldée intégralement. Devise équivalente en XAF (FCFA).",
  },
  {
    id: "inv_05",
    number: "FAC-2026-0044",
    customerId: "cust_05",
    customerName: "Sahel Agrobusiness SARL",
    customerContact: "M. Moussa Traoré",
    customerEmail: "moussa.traore@sahelagro.bf",
    customerPhone: "+226 25 30 45 60",
    customerAddress: "Zone Industrielle Kossodo",
    customerCity: "Ouagadougou",
    customerCountry: "Burkina Faso",
    issueDate: "2026-10-26",
    dueDate: "2026-11-15",
    subtotal: 805_085,
    vatRate: 18,
    vatAmount: 144_915,
    total: 950_000,
    amountPaid: 0,
    displayStatus: "sent",
    itemsCount: 1,
    items: [
      {
        id: "item_11",
        position: 1,
        description: "Plateforme de gestion de stocks céréaliers et coopératives paysannes",
        quantity: 1,
        unitPrice: 805_085,
        lineTotal: 805_085,
      },
    ],
    payments: [],
    notes: "Modalités : paiement sous 20 jours par virement ou Orange Money.",
  },
  {
    id: "inv_06",
    number: "FAC-2026-0043",
    customerId: "cust_06",
    customerName: "Togocel Partenaires",
    customerContact: "Mme Akossiwa Lawson",
    customerEmail: "akossiwa.lawson@togocel-partenaires.tg",
    customerPhone: "+228 22 21 00 12",
    customerAddress: "Boulevard du 13 Janvier",
    customerCity: "Lomé",
    customerCountry: "Togo",
    issueDate: "2026-10-20",
    dueDate: "2026-11-05",
    subtotal: 1_508_475,
    vatRate: 18,
    vatAmount: 271_525,
    total: 1_780_000,
    amountPaid: 1_780_000,
    displayStatus: "paid",
    paymentMethod: "bank_transfer",
    itemsCount: 2,
    items: [
      {
        id: "item_12",
        position: 1,
        description: "Mise à niveau des serveurs d'authentification OAuth2 / OpenID",
        quantity: 1,
        unitPrice: 1_100_000,
        lineTotal: 1_100_000,
      },
      {
        id: "item_13",
        position: 2,
        description: "Audit de sécurité et tests d'intrusion",
        quantity: 1,
        unitPrice: 408_475,
        lineTotal: 408_475,
      },
    ],
    payments: [
      {
        id: "pay_04",
        date: "2026-11-03",
        amount: 1_780_000,
        method: "bank_transfer",
        reference: "VIR-ECOBANK-TG-8819",
      },
    ],
    notes: "Facture réglée par virement Ecobank Togo.",
  },
  {
    id: "inv_07",
    number: "FAC-2026-0042",
    customerId: "cust_07",
    customerName: "Nova Studio Créatif",
    customerContact: "M. David Agossa",
    customerEmail: "david@novastudio.design",
    customerPhone: "+229 95 40 22 11",
    customerAddress: "Cadjehoun, Carrefour des 3 Banques",
    customerCity: "Cotonou",
    customerCountry: "Bénin",
    issueDate: "2026-11-08",
    dueDate: "2026-11-22",
    subtotal: 525_424,
    vatRate: 18,
    vatAmount: 94_576,
    total: 620_000,
    amountPaid: 0,
    displayStatus: "draft",
    itemsCount: 1,
    items: [
      {
        id: "item_14",
        position: 1,
        description: "Conseil en architecture SaaS et mise en place CI/CD",
        quantity: 1,
        unitPrice: 525_424,
        lineTotal: 525_424,
      },
    ],
    payments: [],
    notes: "Brouillon en attente de validation du devis par le client.",
  },
];

export function getInvoiceById(id: string): MockInvoice | undefined {
  return MOCK_INVOICES.find((i) => i.id === id || i.number === id);
}

export function getCustomerById(id: string): MockCustomer | undefined {
  return MOCK_CUSTOMERS.find((c) => c.id === id);
}

export function getInvoicesByCustomerId(customerId: string): MockInvoice[] {
  return MOCK_INVOICES.filter((i) => i.customerId === customerId);
}
