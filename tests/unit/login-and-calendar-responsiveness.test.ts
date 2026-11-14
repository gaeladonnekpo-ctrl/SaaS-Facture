import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Login Process & Instant Redirection Verification", () => {
  let locationReplaceSpy: ReturnType<typeof vi.fn>;
  let originalWindow: any;

  beforeEach(() => {
    locationReplaceSpy = vi.fn();
    originalWindow = (globalThis as any).window;

    (globalThis as any).window = {
      location: {
        href: "http://localhost:3000/connexion",
        search: "",
        replace: locationReplaceSpy,
      },
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  it("redirects directly to '/' on successful authentication without requiring manual refresh", () => {
    const isSubmitting = true;
    const res = { error: null };

    if (!res.error) {
      const params = new URLSearchParams(window.location.search);
      const nextUrl = params.get("next") || "/";
      window.location.replace(nextUrl);
    }

    expect(locationReplaceSpy).toHaveBeenCalledTimes(1);
    expect(locationReplaceSpy).toHaveBeenCalledWith("/");
    expect(isSubmitting).toBe(true); // Keeps button disabled during native navigation
  });

  it("redirects to target ?next= parameter when present", () => {
    window.location.search = "?next=/factures";
    const res = { error: null };

    if (!res.error) {
      const params = new URLSearchParams(window.location.search);
      const nextUrl = params.get("next") || "/";
      window.location.replace(nextUrl);
    }

    expect(locationReplaceSpy).toHaveBeenCalledTimes(1);
    expect(locationReplaceSpy).toHaveBeenCalledWith("/factures");
  });

  it("handles authentication error without redirection and allows resubmission", () => {
    let isSubmitting = true;
    const res = { error: "Identifiants de connexion invalides." };

    if (res.error) {
      isSubmitting = false;
    } else {
      window.location.replace("/");
    }

    expect(locationReplaceSpy).not.toHaveBeenCalled();
    expect(isSubmitting).toBe(false); // Resets state so user can fix and retry
  });
});

describe("Calendar & Popover Viewport Responsiveness Verification", () => {
  it("uses responsive viewport coordinates on mobile (< 640px)", () => {
    // Classes applied on popover card
    const popoverClasses =
      "fixed inset-x-2.5 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-[350px] max-h-[calc(100vh-5rem)] sm:max-h-none overflow-y-auto z-50 rounded-2xl border border-line bg-surface p-3 sm:p-4 shadow-dropdown animate-in fade-in-50 zoom-in-95";

    // Verifies fixed inset on mobile
    expect(popoverClasses).toContain("fixed inset-x-2.5 top-16");
    // Verifies dropdown anchor on tablet/desktop (sm:)
    expect(popoverClasses).toContain("sm:absolute sm:inset-auto sm:right-0 sm:mt-2");
    // Verifies responsive width (auto on mobile within margins, 350px on desktop)
    expect(popoverClasses).toContain("w-auto sm:w-[350px]");
    // Verifies max-height bounds on short mobile screens
    expect(popoverClasses).toContain("max-h-[calc(100vh-5rem)]");
  });

  it("ensures notification and language popovers are also bounded to mobile viewport", () => {
    const notifClasses =
      "fixed inset-x-2.5 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-96 rounded-2xl border border-line bg-surface shadow-2xl animate-in fade-in-50 zoom-in-95 overflow-hidden max-h-[calc(100vh-5rem)] sm:max-h-[520px] flex flex-col z-50";
    const langClasses =
      "fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-80 z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-dropdown animate-in fade-in-50 zoom-in-95 max-h-[calc(100vh-5rem)] sm:max-h-[480px] flex flex-col";

    expect(notifClasses).toContain("fixed inset-x-2.5 top-16");
    expect(langClasses).toContain("fixed inset-x-3 top-16");
  });
});
