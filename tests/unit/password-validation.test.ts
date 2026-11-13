import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/validation/password";

describe("Password validation rules", () => {
  it("rejects passwords shorter than 8 characters", () => {
    const res = validatePassword("Ab1!");
    expect(res.hasMinLength).toBe(false);
    expect(res.isValid).toBe(false);
  });

  it("rejects passwords without numbers", () => {
    const res = validatePassword("Password!");
    expect(res.hasNumber).toBe(false);
    expect(res.isValid).toBe(false);
  });

  it("rejects passwords without special characters", () => {
    const res = validatePassword("Password123");
    expect(res.hasSpecialChar).toBe(false);
    expect(res.isValid).toBe(false);
  });

  it("rejects passwords without letters", () => {
    const res = validatePassword("12345678!@#");
    expect(res.hasLetter).toBe(false);
    expect(res.isValid).toBe(false);
  });

  it("accepts strong passwords combining letters, digits, and special characters with >= 8 length", () => {
    const res = validatePassword("BéninFacture2026@!");
    expect(res.hasMinLength).toBe(true);
    expect(res.hasLetter).toBe(true);
    expect(res.hasNumber).toBe(true);
    expect(res.hasSpecialChar).toBe(true);
    expect(res.isValid).toBe(true);
    expect(res.score).toBe(4);
  });
});

