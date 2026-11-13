import { describe, expect, it } from "vitest";
import { addDays, daysBetween, formatDate, formatDateLong } from "../../lib/format/date";
import { formatCompact, formatFCFA, formatNumber, parseAmount } from "../../lib/format/money";
import { formatInvoiceNumber } from "../../lib/invoice/numbering";

const NBSP = " ";

describe("formatFCFA", () => {
  it("groupe par milliers avec des espaces insécables", () => {
    expect(formatFCFA(1_250_000)).toBe(`1${NBSP}250${NBSP}000${NBSP}FCFA`);
    expect(formatFCFA(0)).toBe(`0${NBSP}FCFA`);
    expect(formatFCFA(999)).toBe(`999${NBSP}FCFA`);
    expect(formatFCFA(1000)).toBe(`1${NBSP}000${NBSP}FCFA`);
    expect(formatFCFA(-45_000)).toBe(`-45${NBSP}000${NBSP}FCFA`);
  });
  it("refuse un montant non entier", () => {
    expect(() => formatNumber(10.5)).toThrow();
  });
});

describe("formatCompact", () => {
  it("abrège les grands montants", () => {
    expect(formatCompact(9500)).toBe(`9${NBSP}500`);
    expect(formatCompact(45_000)).toBe(`45${NBSP}k`);
    expect(formatCompact(1_250_000)).toBe(`1,25${NBSP}M`);
    expect(formatCompact(2_000_000_000)).toBe(`2${NBSP}Md`);
  });
});

describe("parseAmount", () => {
  it("lit les saisies courantes", () => {
    expect(parseAmount("1 250 000")).toBe(1_250_000);
    expect(parseAmount(`1${NBSP}250${NBSP}000 FCFA`)).toBe(1_250_000);
    expect(parseAmount("1.250.000")).toBe(1_250_000);
    expect(parseAmount("45000 F")).toBe(45_000);
    expect(parseAmount("0")).toBe(0);
  });
  it("renvoie null si la saisie est illisible", () => {
    expect(parseAmount("")).toBe(null);
    expect(parseAmount("abc")).toBe(null);
    expect(parseAmount("-500")).toBe(null);
  });
});

describe("dates", () => {
  it("formate en jj/mm/aaaa", () => {
    expect(formatDate("2026-11-10")).toBe("10/11/2026");
    expect(formatDate("2026-01-05")).toBe("05/01/2026");
  });
  it("formate en toutes lettres", () => {
    expect(formatDateLong("2026-11-10")).toBe("10 novembre 2026");
    expect(formatDateLong("2026-08-01")).toBe("1er août 2026");
  });
  it("calcule une échéance en passant les fins de mois et d'année", () => {
    expect(addDays("2026-11-10", 30)).toBe("2026-12-10");
    expect(addDays("2026-12-15", 30)).toBe("2027-01-14");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("compte les jours entre deux dates", () => {
    expect(daysBetween("2026-11-10", "2026-11-25")).toBe(15);
    expect(daysBetween("2026-11-25", "2026-11-10")).toBe(-15);
  });
  it("refuse une date mal formée ou inexistante", () => {
    expect(() => formatDate("10/11/2026")).toThrow();
    expect(() => formatDate("2026-02-30")).toThrow();
  });
});

describe("formatInvoiceNumber", () => {
  it("produit FAC-2026-0001", () => {
    expect(formatInvoiceNumber("FAC", 2026, 1)).toBe("FAC-2026-0001");
    expect(formatInvoiceNumber("fac", 2026, 58)).toBe("FAC-2026-0058");
    expect(formatInvoiceNumber("FAC", 2026, 12_345)).toBe("FAC-2026-12345");
  });
  it("refuse une séquence ou un préfixe invalide", () => {
    expect(() => formatInvoiceNumber("FAC", 2026, 0)).toThrow();
    expect(() => formatInvoiceNumber("", 2026, 1)).toThrow();
    expect(() => formatInvoiceNumber("FA C", 2026, 1)).toThrow();
  });
});
