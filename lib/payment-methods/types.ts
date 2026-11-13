export type PaymentCategory =
  | "mobile_money"
  | "bank_transfer"
  | "money_transfer"
  | "crypto"
  | "cash_cheque";

export interface ProviderFieldConfig {
  key: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  type?: "text" | "tel" | "number";
}

export interface PaymentProvider {
  id: string;
  name: string;
  category: PaymentCategory;
  shortCode: string;
  countryOrZone: string;
  brandColor: string;
  brandTextColor: string;
  tagline: string;
  fields: ProviderFieldConfig[];
}

export interface ConfiguredPaymentMethod {
  providerId: string;
  details: Record<string, string>;
  customLabel?: string;
}

export interface PaymentTermsData {
  methods: ConfiguredPaymentMethod[];
  paymentTermsDays: number;
  customNotes?: string;
}

