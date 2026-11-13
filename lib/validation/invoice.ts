import { z } from "zod";

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(2, "La désignation doit contenir au moins 2 caractères."),
  quantity: z.number().positive("La quantité doit être supérieure à zéro."),
  unitPrice: z.number().int("Le prix unitaire doit être un entier en FCFA.").nonnegative("Le prix ne peut pas être négatif."),
});

export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Veuillez sélectionner un client."),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (AAAA-MM-JJ)."),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (AAAA-MM-JJ)."),
  items: z.array(invoiceItemSchema).min(1, "La facture doit comporter au moins une prestation."),
  notes: z.string().optional(),
}).refine((data) => data.dueDate >= data.issueDate, {
  message: "La date d'échéance ne peut pas être antérieure à la date d'émission.",
  path: ["dueDate"],
});

export const paymentSchema = z.object({
  amount: z.number().int("Le montant doit être un entier en FCFA.").positive("Le montant doit être supérieur à zéro."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (AAAA-MM-JJ)."),
  method: z.enum(["mobile_money", "bank_transfer", "cash", "cheque", "other"]),
  reference: z.string().min(2, "La référence de transaction est requise."),
  note: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;

