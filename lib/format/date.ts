import type { ISODate } from "../domain/types";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
] as const;

function parse(date: ISODate): { year: number; month: number; day: number } {
  const match = ISO_DATE.exec(date);
  if (!match) throw new RangeError(`Date invalide (« ${date} ») : AAAA-MM-JJ attendu.`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new RangeError(`Date inexistante (« ${date} »).`);
  }
  return { year, month, day };
}

/** 2026-11-10 → « 10/11/2026 ». Aucune conversion de fuseau : une date reste une date. */
export function formatDate(date: ISODate): string {
  const { year, month, day } = parse(date);
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

/** 2026-11-01 → « 1er novembre 2026 ». */
export function formatDateLong(date: ISODate): string {
  const { year, month, day } = parse(date);
  return `${day === 1 ? "1er" : day} ${MONTHS[month - 1]} ${year}`;
}

/** Ajoute des jours calendaires ; sert au calcul de l'échéance. */
export function addDays(date: ISODate, days: number): ISODate {
  const { year, month, day } = parse(date);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** Jours entre deux dates (b − a) ; positif si b est après a. */
export function daysBetween(a: ISODate, b: ISODate): number {
  const start = parse(a);
  const end = parse(b);
  const ms = Date.UTC(end.year, end.month - 1, end.day) - Date.UTC(start.year, start.month - 1, start.day);
  return Math.round(ms / 86_400_000);
}
