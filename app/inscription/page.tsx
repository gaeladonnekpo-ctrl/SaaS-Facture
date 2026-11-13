"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useI18n } from "@/lib/i18n/context";
import { useData } from "@/lib/data/context";
import { Logo } from "@/components/ui/logo";
import { ThemeToggleButton } from "@/components/layout/theme-toggle-button";
import { LanguageSelectorPopover } from "@/components/layout/language-selector-popover";
import { validatePassword } from "@/lib/validation/password";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Info,
  Check,
  X,
  Mail,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  KeyRound,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, verifyOtp, resendOtp, signInWithGoogle, user, isLoading: isAuthLoading } = useAuth();
  const { t } = useI18n();
  const { showToast } = useData();

  // Wizard step: "form" for initial details, "otp" for 6-digit code validation
  const [step, setStep] = useState<"form" | "otp">("form");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP fields
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  // Refs for 6 digit OTP input fields
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Real-time password validation
  const passwordValidation = validatePassword(password);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user && !isAuthLoading && step === "form") {
      router.push("/");
    }
  }, [user, isAuthLoading, router, step]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle Initial Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setGoogleNotice(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg(t("auth_err_fields", "Veuillez renseigner tous les champs obligatoires."));
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg(t("auth_err_fields", "Veuillez renseigner tous les champs obligatoires."));
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg(t("auth_err_fields", "Veuillez renseigner tous les champs obligatoires."));
      return;
    }

    // Strict password requirements
    if (!passwordValidation.isValid) {
      setErrorMsg(
        t(
          "auth_password_err_requirements",
          "Le mot de passe doit comporter au moins 8 caractères et combiner des lettres, des chiffres et des caractères spéciaux."
        )
      );
      return;
    }

    setIsSubmitting(true);
    const res = await signUp({
      email,
      password,
      firstName,
      lastName,
      companyName,
    });
    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
      return;
    }

    if (res.requiresOtp) {
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setStep("otp");
      setResendCooldown(60);
      setOtpError(null);
      setOtpSuccessMsg(null);
      showToast({
        type: "info",
        title: t("auth_otp_step_title", "Vérifiez votre adresse email"),
        message: `Un code à 6 chiffres a été envoyé à ${email}.`,
      });
      // Focus first OTP input on next tick
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } else {
      // Direct session granted
      showToast({
        type: "success",
        title: t("auth_signup_title", "Créer un compte"),
        message: `${t("nav_home", "Accueil")} · ${companyName}`,
      });
      router.push("/");
    }
  };

  // Handle 6-Digit OTP Verification
  const handleVerifyOtp = async (codeToVerify?: string) => {
    setOtpError(null);
    setOtpSuccessMsg(null);

    const fullCode = codeToVerify || otpCode.join("").trim();
    if (fullCode.length !== 6) {
      setOtpError(t("auth_otp_err_invalid", "Veuillez renseigner les 6 chiffres du code."));
      return;
    }

    setIsOtpSubmitting(true);
    const res = await verifyOtp(email, fullCode);
    setIsOtpSubmitting(false);

    if (res.error) {
      setOtpError(
        t("auth_otp_err_invalid", "Code de validation incorrect ou expiré. Veuillez réessayer.")
      );
    } else {
      showToast({
        type: "success",
        title: t("auth_otp_step_title", "Vérification réussie"),
        message: t("auth_otp_success", "Votre compte a été vérifié avec succès ! Bienvenue."),
      });
      router.push("/");
    }
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index: number, value: string) => {
    // If pasting a full 6-digit code
    if (value.length > 1) {
      const cleaned = value.replace(/\D/g, "").slice(0, 6);
      if (cleaned.length > 0) {
        const next = [...otpCode];
        for (let i = 0; i < cleaned.length; i++) {
          next[i] = cleaned[i] ?? "";
        }
        setOtpCode(next);
        const focusIndex = Math.min(cleaned.length, 5);
        otpInputRefs.current[focusIndex]?.focus();
        if (cleaned.length === 6) {
          handleVerifyOtp(cleaned);
        }
        return;
      }
    }

    // Single digit input
    const char = value.slice(-1).replace(/\D/g, "");
    const next = [...otpCode];
    next[index] = char;
    setOtpCode(next);

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if 6th digit entered
    if (char && index === 5) {
      const full = next.join("");
      if (full.length === 6) {
        handleVerifyOtp(full);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP Resend
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpError(null);
    setOtpSuccessMsg(null);

    const res = await resendOtp(email);
    if (res.error) {
      setOtpError(res.error);
    } else {
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setResendCooldown(60);
      setOtpSuccessMsg("Un nouveau code à 6 chiffres a été envoyé.");
      showToast({
        type: "info",
        title: "Code renvoyé",
        message: `Un nouveau code de validation a été envoyé à ${email}.`,
      });
    }
  };

  // Handle Google OAuth
  const handleGoogleSignUp = async () => {
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

      {/* Main Container */}
      <main className="max-w-lg w-full mx-auto my-auto">
        <div className="bg-surface border border-line rounded-3xl p-6 sm:p-10 shadow-card">
          {/* STEP 1: Registration Form */}
          {step === "form" && (
            <>
              {/* Official Full Logo inside Card */}
              <div className="flex justify-center mb-6">
                <Logo variant="full-image" size={42} priority />
              </div>

              {/* Header Title */}
              <div className="mb-6 text-center">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-forest-950 dark:text-white">
                  {t("auth_signup_title", "Créer un compte")}
                </h1>
                <p className="text-xs sm:text-sm text-ink-muted mt-1.5">
                  {t("auth_signup_subtitle", "Gérez votre facturation FCFA conforme SYSCOHADA.")}
                </p>
              </div>

              {/* Social Sign Up Row */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isGoogleSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-950 text-white dark:bg-forest-800 dark:hover:bg-forest-700 font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
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
                  <span>{t("auth_btn_google_signup", "S'inscrire avec Google")}</span>
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

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Last Name & First Name (Two Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-forest-950 dark:text-white mb-1.5">
                      {t("auth_last_name", "Nom de famille")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Agossa"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-xl bg-sage-50/70 dark:bg-forest-900/60 border border-line px-3.5 py-2.5 text-sm text-forest-950 dark:text-white placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-lime-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-forest-950 dark:text-white mb-1.5">
                      {t("auth_first_name", "Prénom")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Marc"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-xl bg-sage-50/70 dark:bg-forest-900/60 border border-line px-3.5 py-2.5 text-sm text-forest-950 dark:text-white placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-lime-400 transition-all"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-forest-950 dark:text-white mb-1.5">
                    {t("auth_company_name", "Nom de l'entreprise")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("auth_company_placeholder", "Ex. DANHOMEY Technologies SARL")}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-xl bg-sage-50/70 dark:bg-forest-900/60 border border-line px-3.5 py-2.5 text-sm text-forest-950 dark:text-white placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-lime-400 transition-all"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-forest-950 dark:text-white mb-1.5">
                    {t("auth_email", "Adresse email")}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="marc@entreprise.bj"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-sage-50/70 dark:bg-forest-900/60 border border-line px-3.5 py-2.5 text-sm text-forest-950 dark:text-white placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-lime-400 transition-all"
                  />
                </div>

                {/* Password with Strength Indicator */}
                <div>
                  <label className="block text-xs font-semibold text-forest-950 dark:text-white mb-1.5">
                    {t("auth_password", "Mot de passe")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl bg-sage-50/70 dark:bg-forest-900/60 border border-line pl-3.5 pr-10 py-2.5 text-sm text-forest-950 dark:text-white placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-lime-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-forest-950 dark:hover:text-white transition-colors"
                      aria-label="Afficher ou masquer le mot de passe"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Security Rules & Strength Meter */}
                  {password.length > 0 && (
                    <div className="mt-3 p-3.5 rounded-xl bg-sage-50/60 dark:bg-forest-900/40 border border-line text-xs space-y-2.5 transition-all">
                      {/* Strength meter bar */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink-muted font-medium">
                          {t("auth_password_strength_label", "Sécurité du mot de passe :")}
                        </span>
                        <span
                          className={`font-bold ${
                            passwordValidation.score <= 2
                              ? "text-rose-600 dark:text-rose-400"
                              : passwordValidation.score === 3
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-lime-400"
                          }`}
                        >
                          {passwordValidation.score <= 2
                            ? t("auth_password_strength_weak", "Faible")
                            : passwordValidation.score === 3
                            ? t("auth_password_strength_medium", "Moyen")
                            : t("auth_password_strength_strong", "Sécurisé")}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        <div
                          className={`rounded-full transition-all ${
                            passwordValidation.score >= 1
                              ? passwordValidation.score <= 2
                                ? "bg-rose-500"
                                : passwordValidation.score === 3
                                ? "bg-amber-500"
                                : "bg-emerald-500 dark:bg-lime-400"
                              : "bg-line"
                          }`}
                        />
                        <div
                          className={`rounded-full transition-all ${
                            passwordValidation.score >= 2
                              ? passwordValidation.score === 2
                                ? "bg-rose-500"
                                : passwordValidation.score === 3
                                ? "bg-amber-500"
                                : "bg-emerald-500 dark:bg-lime-400"
                              : "bg-line"
                          }`}
                        />
                        <div
                          className={`rounded-full transition-all ${
                            passwordValidation.score >= 3
                              ? passwordValidation.score === 3
                                ? "bg-amber-500"
                                : "bg-emerald-500 dark:bg-lime-400"
                              : "bg-line"
                          }`}
                        />
                        <div
                          className={`rounded-full transition-all ${
                            passwordValidation.score === 4
                              ? "bg-emerald-500 dark:bg-lime-400"
                              : "bg-line"
                          }`}
                        />
                      </div>

                      {/* 4 Security Requirements Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                        <div
                          className={`flex items-center gap-1.5 transition-colors ${
                            passwordValidation.hasMinLength
                              ? "text-emerald-700 dark:text-lime-300 font-semibold"
                              : "text-ink-muted"
                          }`}
                        >
                          {passwordValidation.hasMinLength ? (
                            <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-lime-400" />
                          ) : (
                            <X className="w-3.5 h-3.5 shrink-0 opacity-40" />
                          )}
                          <span>{t("auth_password_rule_length", "8 caractères minimum")}</span>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 transition-colors ${
                            passwordValidation.hasLetter
                              ? "text-emerald-700 dark:text-lime-300 font-semibold"
                              : "text-ink-muted"
                          }`}
                        >
                          {passwordValidation.hasLetter ? (
                            <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-lime-400" />
                          ) : (
                            <X className="w-3.5 h-3.5 shrink-0 opacity-40" />
                          )}
                          <span>{t("auth_password_rule_letter", "Au moins une lettre")}</span>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 transition-colors ${
                            passwordValidation.hasNumber
                              ? "text-emerald-700 dark:text-lime-300 font-semibold"
                              : "text-ink-muted"
                          }`}
                        >
                          {passwordValidation.hasNumber ? (
                            <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-lime-400" />
                          ) : (
                            <X className="w-3.5 h-3.5 shrink-0 opacity-40" />
                          )}
                          <span>{t("auth_password_rule_number", "Au moins un chiffre (0-9)")}</span>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 transition-colors ${
                            passwordValidation.hasSpecialChar
                              ? "text-emerald-700 dark:text-lime-300 font-semibold"
                              : "text-ink-muted"
                          }`}
                        >
                          {passwordValidation.hasSpecialChar ? (
                            <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-lime-400" />
                          ) : (
                            <X className="w-3.5 h-3.5 shrink-0 opacity-40" />
                          )}
                          <span>{t("auth_password_rule_special", "Caractère spécial (@, #, $, %...)")}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions Row */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || (password.length > 0 && !passwordValidation.isValid)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white dark:bg-lime-400 dark:hover:bg-lime-300 dark:text-forest-950 font-bold px-7 py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t("auth_btn_signup", "Créer mon compte")}...</span>
                      </>
                    ) : (
                      <span>{t("auth_btn_signup", "Créer mon compte")}</span>
                    )}
                  </button>

                  <div className="text-xs text-ink-muted text-center sm:text-right">
                    {t("auth_have_account", "Vous avez déjà un compte ?")}{" "}
                    <Link
                      href="/connexion"
                      className="font-bold text-forest-900 dark:text-lime-400 hover:underline"
                    >
                      {t("auth_link_login", "Se connecter")}
                    </Link>
                  </div>
                </div>
              </form>
            </>
          )}

          {/* STEP 2: 6-Digit OTP Email Verification */}
          {step === "otp" && (
            <div className="space-y-6">
              {/* Back button */}
              <button
                type="button"
                onClick={() => setStep("form")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-forest-950 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t("auth_otp_link_change_email", "Modifier l'adresse email")}</span>
              </button>

              {/* Security Mail Emblem */}
              <div className="text-center pt-2">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-forest-900/10 dark:bg-lime-400/10 flex items-center justify-center text-forest-900 dark:text-lime-400 ring-8 ring-forest-900/5 dark:ring-lime-400/5 shadow-inner">
                  <Mail className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-forest-950 dark:text-white">
                  {t("auth_otp_step_title", "Vérifiez votre adresse email")}
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted mt-2 max-w-sm mx-auto leading-relaxed">
                  {t("auth_otp_step_subtitle", "Un code de validation à 6 chiffres a été envoyé à :")}{" "}
                  <strong className="text-forest-950 dark:text-white block font-semibold mt-0.5 break-all">
                    {email}
                  </strong>
                </p>
              </div>

              {/* Error & Success Banners */}
              {otpError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-lime-200 text-xs flex items-start gap-2.5 leading-relaxed">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-lime-400 mt-0.5" />
                  <span>{otpSuccessMsg}</span>
                </div>
              )}

              {/* Dev / Test helper badge */}
              {devOtp && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>
                        Mode test : code reçu :{" "}
                        <strong className="font-mono text-sm tracking-widest text-forest-950 dark:text-lime-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                          {devOtp}
                        </strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = devOtp.split("").slice(0, 6);
                        setOtpCode(digits);
                        handleVerifyOtp(devOtp);
                      }}
                      className="px-3 py-1 rounded-lg bg-forest-900 text-lime-400 hover:bg-forest-950 dark:bg-lime-400 dark:text-forest-950 font-bold text-xs transition shadow-sm shrink-0"
                    >
                      Remplir & valider
                    </button>
                  </div>
                </div>
              )}

              {/* 6 Digit Input Boxes */}
              <div>
                <label className="block text-center text-xs font-semibold text-forest-950 dark:text-white mb-3">
                  {t("auth_otp_input_label", "Code de validation à 6 chiffres")}
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={idx === 0 ? 6 : 1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl bg-sage-50/70 dark:bg-forest-900/60 border-2 border-line text-forest-950 dark:text-white focus:outline-none focus:border-forest-900 dark:focus:border-lime-400 focus:ring-2 focus:ring-forest-900/20 dark:focus:ring-lime-400/20 transition-all font-mono"
                    />
                  ))}
                </div>
              </div>

              {/* Submit OTP Button */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isOtpSubmitting || otpCode.join("").trim().length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white dark:bg-lime-400 dark:hover:bg-lime-300 dark:text-forest-950 font-bold py-3.5 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isOtpSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("auth_otp_btn_verify", "Vérifier le code et activer mon compte")}...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t("auth_otp_btn_verify", "Vérifier le code et activer mon compte")}</span>
                  </>
                )}
              </button>

              {/* Resend Code Section */}
              <div className="text-center pt-2">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-ink-muted">
                    {t("auth_otp_resend_wait", "Renvoyer le code dans")} <span className="font-bold text-forest-950 dark:text-white font-mono">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-900 dark:text-lime-400 hover:underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t("auth_otp_btn_resend", "Renvoyer un nouveau code")}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Professional Footer without Supabase mention */}
      <footer className="text-center py-4 text-xs text-ink-muted">
        {t("auth_copyright", "© 2026 DANHOMEY Facture · Conforme UEMOA & CEMAC")}
      </footer>
    </div>
  );
}
