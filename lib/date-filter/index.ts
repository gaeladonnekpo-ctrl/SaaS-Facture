import type { MockInvoice } from "@/lib/mock-data";

export type DatePresetId =
  | "all"
  | "today"
  | "this_month"
  | "last_30_days"
  | "q4_2026"
  | "year_2026"
  | "custom_date"
  | "custom_range";

export interface DatePeriodFilter {
  preset: DatePresetId | string;
  label: string;
  shortLabel: string;
  startDate?: string | null; // "YYYY-MM-DD"
  endDate?: string | null;   // "YYYY-MM-DD"
  specificDate?: string | null; // "YYYY-MM-DD" when a single calendar day is selected
}

const MONTH_NAMES_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const MONTH_SHORT_FR = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sept", "Oct", "Nov", "Déc"
];

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORT_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Retourne la date courante locale au format AAAA-MM-JJ sans dérive UTC.
 */
export function getTodayISODate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Construit un filtre de période standardisé avec libellé et bornes exactes.
 */
export function createDatePeriodFilter(
  preset: string,
  customDateStr?: string,
  language = "fr"
): DatePeriodFilter {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-11
  const d = now.getDate();

  const pad = (n: number) => String(n).padStart(2, "0");
  const toISO = (year: number, month: number, day: number) =>
    `${year}-${pad(month + 1)}-${pad(day)}`;

  const todayStr = toISO(y, m, d);

  switch (preset) {
    case "today": {
      const shortM = language === "en" ? MONTH_SHORT_EN[m] : MONTH_SHORT_FR[m];
      const label = language === "en" ? `Today (${shortM} ${d}, ${y})` : `Aujourd'hui (${d} ${shortM}. ${y})`;
      const shortLabel = language === "en" ? "Today" : "Aujourd'hui";
      return {
        preset: "today",
        label,
        shortLabel,
        startDate: todayStr,
        endDate: todayStr,
        specificDate: todayStr,
      };
    }

    case "this_month": {
      const startOfMonth = toISO(y, m, 1);
      const lastDay = new Date(y, m + 1, 0).getDate();
      const endOfMonth = toISO(y, m, lastDay);
      const mName = language === "en" ? MONTH_NAMES_EN[m] : MONTH_NAMES_FR[m];
      const shortM = language === "en" ? MONTH_SHORT_EN[m] : MONTH_SHORT_FR[m];
      return {
        preset: "this_month",
        label: `${mName} ${y}`,
        shortLabel: `${shortM}. ${y}`,
        startDate: startOfMonth,
        endDate: endOfMonth,
        specificDate: null,
      };
    }

    case "last_30_days": {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      const pastStr = toISO(past.getFullYear(), past.getMonth(), past.getDate());
      return {
        preset: "last_30_days",
        label: language === "en" ? "Last 30 days" : "30 derniers jours",
        shortLabel: language === "en" ? "30 days" : "30 jours",
        startDate: pastStr,
        endDate: todayStr,
        specificDate: null,
      };
    }

    case "q4_2026": {
      return {
        preset: "q4_2026",
        label: language === "en" ? "4th Quarter 2026" : "4ème trimestre 2026",
        shortLabel: "T4 2026",
        startDate: "2026-10-01",
        endDate: "2026-12-31",
        specificDate: null,
      };
    }

    case "year_2026": {
      return {
        preset: "year_2026",
        label: language === "en" ? `Full year ${y}` : `Année ${y} complète`,
        shortLabel: `${y}`,
        startDate: `${y}-01-01`,
        endDate: `${y}-12-31`,
        specificDate: null,
      };
    }

    case "custom_date": {
      if (!customDateStr) {
        return createDatePeriodFilter("today", undefined, language);
      }
      const parts = customDateStr.split("-");
      const cYear = parseInt(parts[0] || String(y), 10);
      const cMonth = Math.max(0, Math.min(11, parseInt(parts[1] || "1", 10) - 1));
      const cDay = parseInt(parts[2] || "1", 10);

      const sName = language === "en" ? MONTH_SHORT_EN[cMonth] : MONTH_SHORT_FR[cMonth];
      const label = language === "en" ? `${sName} ${cDay}, ${cYear}` : `${cDay} ${sName}. ${cYear}`;

      return {
        preset: "custom_date",
        label,
        shortLabel: label,
        startDate: customDateStr,
        endDate: customDateStr,
        specificDate: customDateStr,
      };
    }

    case "custom_range": {
      if (customDateStr && customDateStr.includes("..")) {
        const parts = customDateStr.split("..");
        const start = parts[0] || todayStr;
        const end = parts[1] || start;
        return createDateRangeFilter(start, end, language);
      }
      return createDateRangeFilter(customDateStr || todayStr, customDateStr || todayStr, language);
    }

    case "all":
    default:
      return {
        preset: "all",
        label: language === "en" ? "All dates" : "Toutes les dates",
        shortLabel: language === "en" ? "All dates" : "Toutes les dates",
        startDate: null,
        endDate: null,
        specificDate: null,
      };
  }
}

/**
 * Construit un filtre de plage temporelle personnalisée (Date Début -> Date Fin).
 */
export function createDateRangeFilter(
  startDateStr: string,
  endDateStr: string,
  language = "fr"
): DatePeriodFilter {
  let start = startDateStr || getTodayISODate();
  let end = endDateStr || startDateStr || getTodayISODate();

  // Inverser si nécessaire pour garantir start <= end
  if (start > end) {
    const temp = start;
    start = end;
    end = temp;
  }

  // Si même jour, basculer vers custom_date
  if (start === end) {
    return createDatePeriodFilter("custom_date", start, language);
  }

  const sParts = start.split("-");
  const sYear = parseInt(sParts[0] || "2026", 10);
  const sMonth = Math.max(0, Math.min(11, parseInt(sParts[1] || "1", 10) - 1));
  const sDay = parseInt(sParts[2] || "1", 10);
  const sShort = language === "en" ? MONTH_SHORT_EN[sMonth] : MONTH_SHORT_FR[sMonth];

  const eParts = end.split("-");
  const eYear = parseInt(eParts[0] || "2026", 10);
  const eMonth = Math.max(0, Math.min(11, parseInt(eParts[1] || "1", 10) - 1));
  const eDay = parseInt(eParts[2] || "1", 10);
  const eShort = language === "en" ? MONTH_SHORT_EN[eMonth] : MONTH_SHORT_FR[eMonth];

  let label: string;
  let shortLabel: string;

  if (sYear === eYear) {
    if (sMonth === eMonth) {
      label = language === "en"
        ? `${sShort} ${sDay} – ${eDay}, ${sYear}`
        : `Du ${sDay} au ${eDay} ${sShort}. ${sYear}`;
      shortLabel = language === "en"
        ? `${sShort} ${sDay}–${eDay}`
        : `${sDay}–${eDay} ${sShort}.`;
    } else {
      label = language === "en"
        ? `${sShort} ${sDay} – ${eShort} ${eDay}, ${sYear}`
        : `Du ${sDay} ${sShort}. au ${eDay} ${eShort}. ${sYear}`;
      shortLabel = language === "en"
        ? `${sShort} ${sDay} – ${eShort} ${eDay}`
        : `${sDay} ${sShort}. – ${eDay} ${eShort}.`;
    }
  } else {
    label = language === "en"
      ? `${sShort} ${sDay}, ${sYear} – ${eShort} ${eDay}, ${eYear}`
      : `Du ${sDay} ${sShort}. ${sYear} au ${eDay} ${eShort}. ${eYear}`;
    shortLabel = `${sDay}/${sMonth + 1} - ${eDay}/${eMonth + 1}`;
  }

  return {
    preset: "custom_range",
    label,
    shortLabel,
    startDate: start,
    endDate: end,
    specificDate: null,
  };
}

/**
 * Détermine si une facture correspond au filtre temporel actif.
 * Vérifie rigoureusement la date d'émission / création de la facture et JAMAIS la date d'échéance.
 */
export function isInvoiceMatchingDateFilter(
  invoice: Pick<MockInvoice, "issueDate"> & { createdAt?: string },
  filter: DatePeriodFilter
): boolean {
  // Filtre inactif / Réinitialisé : toutes les factures sont visibles
  if (
    filter.preset === "all" ||
    (!filter.startDate && !filter.endDate && !filter.specificDate)
  ) {
    return true;
  }

  // Date de référence de la facture (Date d'émission légale ou date de création)
  const invoiceDate = (invoice.issueDate || invoice.createdAt || "").slice(0, 10);
  if (!invoiceDate) return false;

  // 1. Sélection d'une date précise (ex : 8 novembre 2026)
  if (filter.specificDate) {
    return invoiceDate === filter.specificDate;
  }

  // 2. Sélection d'une période (bornes startDate et endDate)
  if (filter.startDate && invoiceDate < filter.startDate) {
    return false;
  }
  if (filter.endDate && invoiceDate > filter.endDate) {
    return false;
  }

  return true;
}

