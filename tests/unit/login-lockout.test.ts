import { describe, it, expect } from "vitest";

describe("Logique de sécurité et protection anti-brute force", () => {
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_SECONDS = 60;

  function calculateLockoutState(
    currentAttempts: number,
    lastLockedUntil: number | null,
    now: number
  ) {
    // If currently locked
    if (lastLockedUntil && lastLockedUntil > now) {
      const remainingSeconds = Math.max(0, Math.ceil((lastLockedUntil - now) / 1000));
      return {
        isLocked: true,
        remainingSeconds,
        attempts: currentAttempts,
      };
    }

    // Normal attempt
    const newAttempts = currentAttempts + 1;
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockedUntil = now + LOCKOUT_SECONDS * 1000;
      return {
        isLocked: true,
        remainingSeconds: LOCKOUT_SECONDS,
        attempts: newAttempts,
        lockedUntil,
      };
    }

    return {
      isLocked: false,
      remainingSeconds: 0,
      attempts: newAttempts,
      remainingAttempts: MAX_ATTEMPTS - newAttempts,
    };
  }

  function formatCountdown(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  it("autorise les tentatives 1 et 2 avec avertissement avant blocage", () => {
    const now = 1000000;
    const attempt1 = calculateLockoutState(0, null, now);
    expect(attempt1.isLocked).toBe(false);
    expect(attempt1.attempts).toBe(1);
    expect(attempt1.remainingAttempts).toBe(2);

    const attempt2 = calculateLockoutState(1, null, now);
    expect(attempt2.isLocked).toBe(false);
    expect(attempt2.attempts).toBe(2);
    expect(attempt2.remainingAttempts).toBe(1);
  });

  it("déclenche le verrouillage de 60 secondes exactement à la 3ème tentative", () => {
    const now = 1000000;
    const attempt3 = calculateLockoutState(2, null, now);
    expect(attempt3.isLocked).toBe(true);
    expect(attempt3.remainingSeconds).toBe(60);
    expect(attempt3.attempts).toBe(3);
    expect(attempt3.lockedUntil).toBe(now + 60000);
  });

  it("calcule fidèlement le compte à rebours restant pendant le verrouillage", () => {
    const startTime = 1000000;
    const lockedUntil = startTime + 60000;

    // 25 secondes plus tard (35s restantes)
    const midState = calculateLockoutState(3, lockedUntil, startTime + 25000);
    expect(midState.isLocked).toBe(true);
    expect(midState.remainingSeconds).toBe(35);
    expect(formatCountdown(midState.remainingSeconds)).toBe("00:35");

    // 59 secondes plus tard (1s restante)
    const almostDone = calculateLockoutState(3, lockedUntil, startTime + 59000);
    expect(almostDone.isLocked).toBe(true);
    expect(almostDone.remainingSeconds).toBe(1);
    expect(formatCountdown(almostDone.remainingSeconds)).toBe("00:01");
  });

  function checkIsLocked(lockedUntil: number | null, now: number) {
    if (!lockedUntil) return false;
    return lockedUntil > now;
  }

  it("déverrouille automatiquement dès que le temps de 60s est écoulé", () => {
    const startTime = 1000000;
    const lockedUntil = startTime + 60000;

    // Pendant le verrouillage (30s)
    expect(checkIsLocked(lockedUntil, startTime + 30000)).toBe(true);

    // 60 secondes ou plus tard
    expect(checkIsLocked(lockedUntil, startTime + 60001)).toBe(false);
  });

  it("formate correctement les minutes et secondes du compte à rebours", () => {
    expect(formatCountdown(60)).toBe("01:00");
    expect(formatCountdown(59)).toBe("00:59");
    expect(formatCountdown(9)).toBe("00:09");
    expect(formatCountdown(0)).toBe("00:00");
  });
});
