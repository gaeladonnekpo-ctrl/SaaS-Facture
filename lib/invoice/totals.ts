/**
 * Calculs de facture. Seule source de vérité pour les montants :
 * le formulaire l'utilise pour l'affichage, le serveur pour le calcul qui fait foi.
 *
 * Le franc CFA n'a pas de centimes : tout montant est un entier.
 * Les multiplications passent par BigInt pour ne jamais dépendre de la virgule flottante.
 */

export interface LineInput {
  /** Strictement positive, trois décimales au plus. */
  quantity: number;
  /** Entier positif ou nul, en FCFA. */
  unitPrice: number;
}

export interface InvoiceTotals {
  lineTotals: number[];
  /** Total hors taxes. */
  subtotal: number;
  vatAmount: number;
  /** Total toutes taxes comprises. */
  total: number;
}

const QUANTITY_SCALE = 1000;
const RATE_SCALE = 100;

function divRoundHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator / 2n) / denominator;
}

function toSafeNumber(value: bigint): number {
  const result = Number(value);
  if (!Number.isSafeInteger(result)) {
    throw new RangeError("Montant trop grand pour être représenté exactement.");
  }
  return result;
}

function scaleExact(value: number, scale: number, label: string): bigint {
  const scaled = Math.round(value * scale);
  if (!Number.isFinite(value) || Math.abs(value * scale - scaled) > 1e-6) {
    throw new RangeError(`${label} : trop de décimales (${value}).`);
  }
  return BigInt(scaled);
}

export function computeLineTotal(quantity: number, unitPrice: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new RangeError(`Quantité invalide (${quantity}) : elle doit être supérieure à zéro.`);
  }
  if (!Number.isSafeInteger(unitPrice) || unitPrice < 0) {
    throw new RangeError(`Prix unitaire invalide (${unitPrice}) : entier positif attendu.`);
  }
  const quantityMilli = scaleExact(quantity, QUANTITY_SCALE, "Quantité");
  return toSafeNumber(divRoundHalfUp(quantityMilli * BigInt(unitPrice), BigInt(QUANTITY_SCALE)));
}

/** TVA calculée une seule fois sur le sous-total, arrondie au franc le plus proche. */
export function computeVatAmount(subtotal: number, vatRate: number): number {
  if (!Number.isSafeInteger(subtotal) || subtotal < 0) {
    throw new RangeError(`Sous-total invalide (${subtotal}).`);
  }
  if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) {
    throw new RangeError(`Taux de TVA invalide (${vatRate}) : attendu entre 0 et 100.`);
  }
  const rateHundredths = scaleExact(vatRate, RATE_SCALE, "Taux de TVA");
  return toSafeNumber(divRoundHalfUp(BigInt(subtotal) * rateHundredths, BigInt(100 * RATE_SCALE)));
}

export function computeInvoiceTotals(items: readonly LineInput[], vatRate: number): InvoiceTotals {
  const lineTotals = items.map((item) => computeLineTotal(item.quantity, item.unitPrice));
  const subtotal = toSafeNumber(lineTotals.reduce((sum, line) => sum + BigInt(line), 0n));
  const vatAmount = computeVatAmount(subtotal, vatRate);
  return { lineTotals, subtotal, vatAmount, total: toSafeNumber(BigInt(subtotal) + BigInt(vatAmount)) };
}

/** Reste à payer, jamais négatif. */
export function amountDue(total: number, amountPaid: number): number {
  return Math.max(0, total - amountPaid);
}
