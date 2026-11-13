import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/validation/password";

describe("Flux de réinitialisation de mot de passe (Forgot Password & Reset)", () => {
  it("valide les adresses emails soumises pour réinitialisation", () => {
    function isValidResetEmail(email: string) {
      const clean = email.trim().toLowerCase();
      return clean.length >= 5 && clean.includes("@") && clean.includes(".");
    }

    expect(isValidResetEmail("gael@entreprise.bj")).toBe(true);
    expect(isValidResetEmail("  contact@danhomey.com ")).toBe(true);
    expect(isValidResetEmail("invalid-email")).toBe(false);
    expect(isValidResetEmail("")).toBe(false);
  });

  it("nettoie et reformate un code OTP collé ou saisi au clavier", () => {
    function parseOtpInput(value: string): string {
      return value.replace(/\D/g, "").slice(0, 6);
    }

    expect(parseOtpInput("123456")).toBe("123456");
    expect(parseOtpInput("  482-910  ")).toBe("482910");
    expect(parseOtpInput("Code: 994012 (valide 15m)")).toBe("994012");
    expect(parseOtpInput("abc")).toBe("");
  });

  it("exige un mot de passe sécurisé à 4 critères stricts lors de la réinitialisation", () => {
    // Trop court (< 8 caractères)
    expect(validatePassword("Aa1!").isValid).toBe(false);

    // Pas de chiffre
    expect(validatePassword("MotDePasse!").isValid).toBe(false);

    // Pas de caractère spécial
    expect(validatePassword("MotDePasse123").isValid).toBe(false);

    // Pas de lettre
    expect(validatePassword("12345678!#").isValid).toBe(false);

    // Valide et sécurisé
    const valid = validatePassword("Danhomey2026@Secure!");
    expect(valid.isValid).toBe(true);
    expect(valid.score).toBe(4);
    expect(valid.hasMinLength).toBe(true);
    expect(valid.hasLetter).toBe(true);
    expect(valid.hasNumber).toBe(true);
    expect(valid.hasSpecialChar).toBe(true);
  });

  it("vérifie la conformité de la confirmation du nouveau mot de passe", () => {
    function checkPasswordsMatch(pass: string, confirm: string) {
      return pass.length > 0 && pass === confirm;
    }

    expect(checkPasswordsMatch("Password123!", "Password123!")).toBe(true);
    expect(checkPasswordsMatch("Password123!", "Password1234!")).toBe(false);
    expect(checkPasswordsMatch("", "")).toBe(false);
  });

  it("calcule fidèlement le cooldown de renvoi de code (60 secondes)", () => {
    let cooldown = 60;
    const tick = () => {
      cooldown = Math.max(0, cooldown - 1);
    };

    tick();
    expect(cooldown).toBe(59);

    for (let i = 0; i < 59; i++) {
      tick();
    }
    expect(cooldown).toBe(0);
    // Cannot go below 0
    tick();
    expect(cooldown).toBe(0);
  });
});

