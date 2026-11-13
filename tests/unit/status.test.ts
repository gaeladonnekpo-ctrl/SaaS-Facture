import { describe, expect, it } from "vitest";
import { deriveDisplayStatus, isEditable, statusAfterPayments, todayInTimeZone } from "../../lib/invoice/status";

const base = { total: 100_000, amountPaid: 0 };

describe("deriveDisplayStatus", () => {
  it("n'est pas en retard le jour de l'échéance", () => {
    expect(deriveDisplayStatus({ ...base, status: "sent", dueDate: "2026-11-10" }, "2026-11-10")).toBe("sent");
  });
  it("est en retard le lendemain de l'échéance", () => {
    expect(deriveDisplayStatus({ ...base, status: "sent", dueDate: "2026-11-10" }, "2026-11-11")).toBe("overdue");
  });
  it("reste en retard après un paiement partiel", () => {
    expect(
      deriveDisplayStatus({ status: "sent", dueDate: "2026-10-01", total: 100_000, amountPaid: 40_000 }, "2026-11-10"),
    ).toBe("overdue");
  });
  it("ne marque jamais en retard un brouillon, une facture payée ou annulée", () => {
    for (const status of ["draft", "paid", "cancelled"] as const) {
      expect(deriveDisplayStatus({ ...base, status, dueDate: "2020-01-01" }, "2026-11-10")).toBe(status);
    }
  });
  it("ne marque pas en retard une facture à zéro franc", () => {
    expect(deriveDisplayStatus({ status: "sent", dueDate: "2020-01-01", total: 0, amountPaid: 0 }, "2026-11-10")).toBe("sent");
  });
});

describe("statusAfterPayments", () => {
  it("passe à payée quand la somme atteint le total", () => {
    expect(statusAfterPayments(100_000, 99_999)).toBe("sent");
    expect(statusAfterPayments(100_000, 100_000)).toBe("paid");
    expect(statusAfterPayments(100_000, 100_500)).toBe("paid");
  });
});

describe("todayInTimeZone", () => {
  it("donne la date locale, pas la date UTC", () => {
    // 23 h 30 UTC le 9 novembre = 0 h 30 le 10 novembre à Porto-Novo (UTC+1).
    const now = new Date("2026-11-09T23:30:00Z");
    expect(todayInTimeZone("Africa/Porto-Novo", now)).toBe("2026-11-10");
    expect(todayInTimeZone("Africa/Dakar", now)).toBe("2026-11-09");
  });
});

describe("isEditable", () => {
  it("n'autorise la modification que des brouillons", () => {
    expect(isEditable("draft")).toBe(true);
    expect(isEditable("sent")).toBe(false);
    expect(isEditable("paid")).toBe(false);
    expect(isEditable("cancelled")).toBe(false);
  });
});
