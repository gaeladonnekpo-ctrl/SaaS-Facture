"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useI18n } from "@/lib/i18n/context";
import { useData } from "@/lib/data/context";
import { Logo } from "@/components/ui/logo";
import { ThemeToggleButton } from "@/components/layout/theme-toggle-button";
import { LanguageSelectorPopover } from "@/components/layout/language-selector-popover";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Info,
  Lock,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from "lucide-react";

const MAX_FAILED_ATTEMPTS = 3;
const TIER_1_LOCKOUT_SECONDS = 60; // 60s (temps raisonnable et sécurisé conforme OWASP)
const TIER_2_LOCKOUT_SECONDS = 120; // 120s en cas de récidive
const STORAGE_KEY = "danhomey_login_security";

interface SecurityState {
  attempts: number;
  lockedUntil: number;
  totalDuration: number;
  tier: number;
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, user, isLoading: isAuthLoading } = useAuth();
  const { t } = useI18n();
  const { showToast } = useData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  // Security / Anti-Brute-Force Rate Limiting State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [totalLockoutSeconds, setTotalLockoutSeconds] = useState(TIER_1_LOCKOUT_SECONDS);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [lockoutTier, setLockoutTier] = useState(1);
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);

  // If already logged in, redirect to dashboard or requested page
  useEffect(() => {
    if (user && !isAuthLoading && !isSubmitting) {
      const params = new URLSearchParams(window.location.search);
      const nextUrl = params.get("next") || "/dashboard";
      window.location.replace(nextUrl);
    }
  }, [user, isAuthLoading, isSubmitting]);

  // Restore lockout state from localStorage on mount (survives F5 / page reload)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: SecurityState = JSON.parse(stored);
        if (data.lockedUntil && data.lockedUntil > Date.now()) {
          const rem = Math.max(0, Math.ceil((data.lockedUntil - Date.now()) / 1000));
          setFailedAttempts(data.attempts || MAX_FAILED_ATTEMPTS);
          setLockedUntil(data.lockedUntil);
          setTotalLockoutSeconds(data.totalDuration || TIER_1_LOCKOUT_SECONDS);
          setRemainingSeconds(rem);
          setLockoutTier(data.tier || 1);
        } else if (data.attempts) {
          setFailedAttempts(data.attempts);
          setLockoutTier(data.tier || 1);
        }
      }
    } catch {}
  }, []);

  // Live countdown ticker effect
  useEffect(() => {
    if (!lockedUntil) return;

    const tick = () => {
      const now = Date.now();
      const rem = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
      setRemainingSeconds(rem);

      if (rem <= 0) {
        // Cooldown finished: re-enable login
        setLockedUntil(null);
        setRemainingSeconds(0);
        setUnlockMessage(
          "Délai de sécurité écoulé. Vous pouvez à nouveau tenter de vous connecter."
        );
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const data: SecurityState = JSON.parse(stored);
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ ...data, lockedUntil: 0, attempts: 0 })
            );
          }
        } catch {}
        setFailedAttempts(0);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = Boolean(lockedUntil && lockedUntil > Date.now() && remainingSeconds > 0);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setErrorMsg(null);
    setGoogleNotice(null);
    setUnlockMessage(null);

    if (!email.trim() || !password) {
      setErrorMsg(t("auth_err_fields", "Veuillez renseigner tous les champs obligatoires."));
      return;
    }

    setIsSubmitting(true);
    const res = await signIn(email, password);

    if (res.error) {
      setIsSubmitting(false);
      const errLower = res.error.toLowerCase();
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        // Trigger 60s security lockout
        const duration = lockoutTier === 1 ? TIER_1_LOCKOUT_SECONDS : TIER_2_LOCKOUT_SECONDS;
        const until = Date.now() + duration * 1000;
        setLockedUntil(until);
        setTotalLockoutSeconds(duration);
        setRemainingSeconds(duration);
        setLockoutTier((prev) => prev + 1);

        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              attempts: newAttempts,
              lockedUntil: until,
              totalDuration: duration,
              tier: lockoutTier + 1,
            })
          );
        } catch {}

        setErrorMsg(null);
      } else {
        // Attempt 1 or 2
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              attempts: newAttempts,
              lockedUntil: 0,
              totalDuration: TIER_1_LOCKOUT_SECONDS,
              tier: lockoutTier,
            })
          );
        } catch {}

        if (errLower.includes("email not confirmed")) {
          setErrorMsg(
            "Votre adresse email n'a pas encore été validée. Veuillez saisir le code de validation reçu lors de votre inscription."
          );
        } else if (newAttempts === 2) {
          setErrorMsg(
            "Identifiants de connexion incorrects (Tentative 2 sur 3). Attention : une 3ème tentative infructueuse suspendra temporairement les connexions pendant 60 secondes pour des raisons de sécurité."
          );
        } else {
          setErrorMsg(
            "Identifiants de connexion invalides (Tentative 1 sur 3). Si vous n'avez pas encore de compte, veuillez vous inscrire."
          );
        }
      }
    } else {
      // Login successful! Clean up security state
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      setFailedAttempts(0);
      setLockedUntil(null);

      showToast({
        type: "success",
        title: t("auth_login_title", "Connexion"),
        message: `${t("nav_home", "Accueil")} · DANHOMEY Facture`,
      });

      // Target redirection (e.g. ?next=/factures or default to "/dashboard")
      const params = new URLSearchParams(window.location.search);
      const nextUrl = params.get("next") || "/dashboard";

      // Native browser document replacement: ensures newly written cookies are immediately sent in HTTP headers,
      // completely bypassing Next.js client router cache race condition for instant 1-click access.
      window.location.replace(nextUrl);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLocked) return;
    setErrorMsg(null);
    setGoogleNotice(null);
    setIsGoogleSubmitting(true);

    const res = await signInWithGoogle();
    setIsGoogleSubmitting(false);

    if (res?.error) {
      setGoogleNotice(
        t(
          "auth_google_notice",
          "La connexion Google nécessite la configuration OAuth dans Supabase. Veuillez utiliser votre email et mot de passe."
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header with Language & Theme Controls */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo variant="full-image" size={32} priority />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelectorPopover />
          <ThemeToggleButton />
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto">
        <div className="bg-surface border border-line rounded-3xl p-6 sm:p-10 shadow-card">
          {/* Official Full Logo inside Card */}
          <div className="flex justify-center mb-6">
            <Logo variant="full-image" size={42} priority />
          </div>

          {/* Header Title */}
          <div className="mb-6 text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-forest-950 dark:text-white">
              {t("auth_login_title", "Connexion")}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1.5">
              {t("auth_login_subtitle", "Accédez à votre espace de gestion et facturation FCFA.")}
            </p>
          </div>

          {/* Social Sign In Row */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSubmitting || isLocked}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-950 text-white dark:bg-forest-800 dark:hover:bg-forest-700 font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{t("auth_btn_google_login", "Continuer avec Google")}</span>
            </button>
          </div>

          {/* Google notice banner if clicked without provider configured */}
          {googleNotice && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 leading-relaxed">
              <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>{googleNotice}</span>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-line w-full" />
            <span className="bg-surface px-3 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              {t("auth_or_divider", "OU")}
            </span>
          </div>

          {/* SECURITY LOCKOUT BANNER (Live Countdown & Progress Bar) */}
          {isLocked && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-900 dark:text-amber-200 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-forest-950 dark:text-white">
                      Connexion suspendue
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
                      3 tentatives échouées
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    Pour protéger votre compte contre les tentatives de forçage, veuillez patienter avant de réessayer.
                  </p>

                  {/* Live Countdown Clock Badge */}
                  <div className="mt-3 flex items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-line shadow-inner">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                      <span className="text-xs font-semibold text-forest-950 dark:text-white">
                        Nouvelle tentative dans :
                      </span>
                    </div>
                    <span className="font-mono text-lg font-black text-forest-950 dark:text-lime-400 tracking-wider">
                      {formatCountdown(remainingSeconds)}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-line rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className="bg-amber-500 dark:bg-lime-400 h-full transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${(remainingSeconds / totalLockoutSeconds) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unlock Notification Banner */}
          {unlockMessage && !isLocked && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-lime-200 text-xs flex items-start gap-2.5 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-lime-400 mt-0.5" />
              <span>{unlockMessage}</span>
            </div>
          )}

          {/* Normal Error Message (Attempts 1 & 2) */}
          {errorMsg && !isLocked && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-forest-950 dark:text-white mb-1.5">
                {t("auth_email", "Adresse email")}
              </label>
              <input
                type="email"
                required
                disabled={isLocked || isSubmitting}
                placeholder="votre-email@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-sage-50/70 dark:bg-forest-900/60 border border-line px-3.5 py-2.5 text-sm text-forest-950 dark:text-white placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-lime-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-forest-950 dark:text-white">
                  {t("auth_password", "Mot de passe")}
                </label>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-xs font-semibold text-forest-900 dark:text-lime-400 hover:underline transition-colors"
                >
                  {t("auth_forgot_password", "Mot de passe oublié ?")}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLocked || isSubmitting}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-sage-50/70 dark:bg-forest-900/60 border border-line pl-3.5 pr-10 py-2.5 text-sm text-forest-950 dark:text-white placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-lime-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-forest-950 dark:hover:text-white transition-colors disabled:opacity-40"
                  aria-label="Afficher ou masquer le mot de passe"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bottom Actions Row with Perfect Dark & Light Contrasts */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isSubmitting || isLocked}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white dark:bg-lime-400 dark:hover:bg-lime-300 dark:text-forest-950 font-bold px-7 py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLocked ? (
                  <>
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Bloqué temporairement ({remainingSeconds}s)</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("auth_btn_login", "Se connecter")}...</span>
                  </>
                ) : (
                  <span>{t("auth_btn_login", "Se connecter")}</span>
                )}
              </button>

              <div className="text-xs text-ink-muted text-center sm:text-right">
                {t("auth_no_account", "Vous n'avez pas de compte ?")}{" "}
                <Link
                  href="/inscription"
                  className="font-bold text-forest-900 dark:text-lime-400 hover:underline"
                >
                  {t("auth_link_signup", "S'inscrire")}
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Professional Footer without Supabase mention */}
      <footer className="text-center py-4 text-xs text-ink-muted">
        {t("auth_copyright", "© 2026 DANHOMEY Facture · Conforme UEMOA & CEMAC")}
      </footer>
    </div>
  );
}
