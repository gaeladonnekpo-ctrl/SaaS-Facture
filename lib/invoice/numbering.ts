/**
 * Mise en forme du numéro de facture : FAC-2026-0001.
 * La séquence elle-même est attribuée par la base, de façon atomique, à l'émission.
 */
export function formatInvoiceNumber(prefix: string, year: number, sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new RangeError(`Séquence invalide (${sequence}).`);
  }
  if (!Number.isInteger(year) || year < 2000 || year > 9999) {
    throw new RangeError(`Année invalide (${year}).`);
  }
  const cleanPrefix = prefix.trim().toUpperCase();
  if (!/^[A-Z0-9]{1,10}$/.test(cleanPrefix)) {
    throw new RangeError(`Préfixe invalide (« ${prefix} ») : 1 à 10 lettres ou chiffres.`);
  }
  return `${cleanPrefix}-${year}-${String(sequence).padStart(4, "0")}`;
}
