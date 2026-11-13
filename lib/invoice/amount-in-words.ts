/**
 * Montant en toutes lettres, pour la mention
 * « Arrêtée la présente facture à la somme de … ».
 * Orthographe traditionnelle : traits d'union sous cent, « et » devant un et onze.
 */

const UNITS = [
  "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
  "onze", "douze", "treize", "quatorze", "quinze", "seize",
] as const;
const TENS = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante"] as const;

const MAX = 999_999_999_999;

function unit(n: number): string {
  return UNITS[n] ?? "";
}

/** 0 à 99. `plural` : « quatre-vingts » prend son s (faux devant « mille »). */
function below100(n: number, plural: boolean): string {
  if (n < 17) return unit(n);
  if (n < 20) return `dix-${unit(n - 10)}`;
  if (n < 70) {
    const ten = TENS[Math.floor(n / 10)] ?? "";
    const rest = n % 10;
    if (rest === 0) return ten;
    return rest === 1 ? `${ten} et un` : `${ten}-${unit(rest)}`;
  }
  if (n < 80) return n === 71 ? "soixante et onze" : `soixante-${below100(n - 60, false)}`;
  if (n === 80) return plural ? "quatre-vingts" : "quatre-vingt";
  return `quatre-vingt-${below100(n - 80, false)}`;
}

/** 1 à 999. `plural` : « cents » et « vingts » prennent leur s. */
function below1000(n: number, plural: boolean): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds === 0) return below100(rest, plural);
  const head = hundreds === 1 ? "cent" : `${unit(hundreds)} cent`;
  if (rest === 0) return hundreds > 1 && plural ? `${head}s` : head;
  return `${head} ${below100(rest, plural)}`;
}

export function numberInWords(n: number): string {
  if (!Number.isSafeInteger(n) || n < 0 || n > MAX) {
    throw new RangeError(`Nombre hors limites (${n}).`);
  }
  if (n === 0) return "zéro";

  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;

  const parts: string[] = [];
  if (billions > 0) parts.push(`${below1000(billions, true)} milliard${billions > 1 ? "s" : ""}`);
  if (millions > 0) parts.push(`${below1000(millions, true)} million${millions > 1 ? "s" : ""}`);
  if (thousands > 0) parts.push(thousands === 1 ? "mille" : `${below1000(thousands, false)} mille`);
  if (rest > 0) parts.push(below1000(rest, true));
  return parts.join(" ");
}

/** 1 250 000 → « un million deux cent cinquante mille francs CFA ». */
export function amountInWords(amount: number): string {
  const words = numberInWords(amount);
  if (amount <= 1) return `${words} franc CFA`;
  // « million » et « milliard » sont des noms : « deux millions de francs ».
  return amount % 1_000_000 === 0 ? `${words} de francs CFA` : `${words} francs CFA`;
}
