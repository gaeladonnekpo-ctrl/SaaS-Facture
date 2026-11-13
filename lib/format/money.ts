const NBSP = " ";

/** 1250000 → « 1 250 000 » avec espaces insécables. Sans Intl : même rendu partout. */
export function formatNumber(amount: number): string {
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError(`Montant non entier (${amount}).`);
  }
  const digits = String(Math.abs(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return amount < 0 ? `-${digits}` : digits;
}

/** 1250000 → « 1 250 000 FCFA ». */
export function formatFCFA(amount: number): string {
  return `${formatNumber(amount)}${NBSP}FCFA`;
}

/** Version courte pour les cartes et les axes : 1 250 000 → « 1,25 M ». */
export function formatCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const short = (value: number) => String(Math.round(value * 100) / 100).replace(".", ",");
  if (abs >= 1_000_000_000) return `${sign}${short(abs / 1_000_000_000)}${NBSP}Md`;
  if (abs >= 1_000_000) return `${sign}${short(abs / 1_000_000)}${NBSP}M`;
  if (abs >= 10_000) return `${sign}${short(abs / 1000)}${NBSP}k`;
  return formatNumber(amount);
}

/** Saisie utilisateur (« 1 250 000 », « 1.250.000 F ») → entier, ou null si illisible. */
export function parseAmount(input: string): number | null {
  const digits = input.replace(/[\s  .,]|FCFA|F$/gi, "");
  if (!/^\d+$/.test(digits)) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) ? value : null;
}
