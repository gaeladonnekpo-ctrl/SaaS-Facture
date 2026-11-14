"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  KeyRound,
  Lock,
  Check,
  X,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggleButton } from "@/components/layout/theme-toggle-button";
import { LanguageSelectorPopover } from "@/components/layout/language-selector-popover";
import { useAuth } from "@/lib/auth/context";
import { useI18n } from "@/lib/i18n/context";
import { useData } from "@/lib/data/context";
import { validatePassword } from "@/lib/validation/password";

export default function MotDePasseOubliePage() {
  const router = useRouter();
  const { requestPasswordReset, resetPasswordWithOtp } = useAuth();
  const { t } = useI18n();
  const { showToast } = useData();

  // Step state: "request" = enter email, "reset" = OTP + new password
  const [step, setStep] = useState<"request" | "reset">("request");

  // Step 1: Email
  const [email, setEmail] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Step 2: OTP & New Password
  const [otpCode, setOtpCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Dev mode OTP indicator
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Cooldown for resending OTP
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccessMsg, setResendSuccessMsg] = useState<string | null>(null);

  // Refs for 6 OTP input boxes
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password validation analysis
  const passwordValidation = useMemo(() => validatePassword(newPassword), [newPassword]);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Handle countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP input when switching to step "reset"
  useEffect(() => {
    if (step === "reset") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // STEP 1: Handle Send Reset Code
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setRequestError("Veuillez saisir une adresse email valide.");
      return;
    }

    setIsRequesting(true);
    const res = await requestPasswordReset(cleanEmail);
    setIsRequesting(false);

    if (res.error) {
      setRequestError(res.error);
    } else {
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setResendCooldown(60);
      setStep("reset");
      showToast({
        type: "info",
        title: "Code de sécurité envoyé",
        message: `Un code à 6 chiffres a été envoyé à ${cleanEmail}`,
      });
    }
  };

  // STEP 2: Handle OTP Digit Change
  const handleOtpDigitChange = (index: number, value: string) => {
    // Paste of full 6-digit code
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

  // STEP 2: Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setResetError(null);
    setResendSuccessMsg(null);

    const res = await requestPasswordReset(email.trim());
    if (res.error) {
      setResetError(res.error);
    } else {
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setResendCooldown(60);
      setResendSuccessMsg("Un nouveau code à 6 chiffres a été envoyé à votre adresse email.");
      showToast({
        type: "info",
        title: "Nouveau code envoyé",
        message: "Veuillez vérifier votre boîte de réception.",
      });
    }
  };

  // STEP 2: Handle Reset Password Submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    const token = otpCode.join("").trim();
    if (token.length !== 6) {
      setResetError("Veuillez renseigner les 6 chiffres du code de validation.");
      return;
    }

    if (!passwordValidation.isValid) {
      setResetError(
        t(
          "auth_password_err_requirements",
          "Le mot de passe doit comporter au moins 8 caractères et combiner des lettres, des chiffres et des caractères spéciaux."
        )
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsResetting(true);
    const res = await resetPasswordWithOtp(email.trim(), token, newPassword);

    if (res.error) {
      setIsResetting(false);
      setResetError(res.error);
    } else {
      setResetSuccess(true);
      showToast({
        type: "success",
        title: "Mot de passe réinitialisé",
        message: "Votre nouveau mot de passe a été enregistré avec succès !",
      });
      // Redirect to home/dashboard after 1s with native navigation
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 1000);
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

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-md bg-surface border border-line rounded-3xl p-6 sm:p-8 shadow-xl shadow-forest-950/5 relative overflow-hidden backdrop-blur-sm">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-forest-900 via-emerald-600 to-lime-400" />

          {/* SUCCESS SCREEN */}
          {resetSuccess ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 dark:bg-lime-400/10 flex items-center justify-center text-emerald-600 dark:text-lime-400 ring-8 ring-emerald-500/5 dark:ring-lime-400/5">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-forest-950 dark:text-white tracking-tight">
                Mot de passe réinitialisé !
              </h2>
              <p className="text-sm text-ink-muted max-w-xs mx-auto leading-relaxed">
                Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers votre espace...
              </p>
              <div className="pt-4 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-forest-900 dark:text-lime-400" />
              </div>
            </div>
          ) : step === "request" ? (
            /* STEP 1: DEMANDE DE RÉINITIALISATION (EMAIL) */
            <div className="space-y-6">
              {/* Back to Login Link */}
              <Link
                href="/connexion"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-forest-950 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t("action_back", "Retour à la connexion")}</span>
              </Link>

              {/* Header Emblem */}
              <div className="text-center pt-2">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-forest-900/10 dark:bg-lime-400/10 flex items-center justify-center text-forest-900 dark:text-lime-400 ring-8 ring-forest-900/5 dark:ring-lime-400/5 shadow-inner">
                  <KeyRound className="w-8 h-8" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-forest-950 dark:text-white">
                  {t("auth_forgot_title", "Mot de passe oublié")}
                </h1>
                <p className="text-xs sm:text-sm text-ink-muted mt-2 max-w-sm mx-auto leading-relaxed">
                  {t(
                    "auth_forgot_subtitle",
                    "Entrez votre adresse email. Nous vous enverrons un code à 6 chiffres pour définir un nouveau mot de passe."
                  )}
                </p>
              </div>

              {/* Error Banner */}
              {requestError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span>{requestError}</span>
                </div>
              )}

              {/* Request Form */}
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-forest-950 dark:text-white mb-1.5">
                    {t("auth_email", "Adresse email")}
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isRequesting}
                    placeholder="votre-email@domaine.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-sage-50/70 dark:bg-forest-900/60 border border-line px-3.5 py-2.5 text-sm text-forest-950 dark:text-white placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-lime-400 transition-all disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRequesting || !email.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white dark:bg-lime-400 dark:hover:bg-lime-300 dark:text-forest-950 font-bold py-3 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isRequesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Envoi du code en cours...</span>
                    </>
                  ) : (
                    <span>{t("auth_forgot_btn_send", "Recevoir le code de réinitialisation")}</span>
                  )}
                </button>
              </form>

              {/* Bottom Notice */}
              <div className="text-center pt-2">
                <span className="text-xs text-ink-muted">
                  Vous vous souvenez de votre mot de passe ?{" "}
                  <Link
                    href="/connexion"
                    className="font-bold text-forest-900 dark:text-lime-400 hover:underline"
                  >
                    {t("auth_link_login", "Se connecter")}
                  </Link>
                </span>
              </div>
            </div>
          ) : (
            /* STEP 2: CODE OTP À 6 CHIFFRES + NOUVEAU MOT DE PASSE */
            <div className="space-y-6">
              {/* Back to Step 1 Button */}
              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setResetError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-forest-950 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t("auth_otp_link_change_email", "Modifier l'adresse email")}</span>
              </button>

              {/* Header Emblem */}
              <div className="text-center pt-2">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-forest-900/10 dark:bg-lime-400/10 flex items-center justify-center text-forest-900 dark:text-lime-400 ring-8 ring-forest-900/5 dark:ring-lime-400/5 shadow-inner">
                  <Mail className="w-8 h-8" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-forest-950 dark:text-white">
                  {t("auth_reset_title", "Réinitialisation du mot de passe")}
                </h1>
                <p className="text-xs sm:text-sm text-ink-muted mt-2 max-w-sm mx-auto leading-relaxed">
                  {t("auth_otp_step_subtitle", "Un code de validation à 6 chiffres a été envoyé à :")}{" "}
                  <strong className="text-forest-950 dark:text-white block font-semibold mt-0.5 break-all">
                    {email}
                  </strong>
                </p>
              </div>

              {/* Error & Success Banners */}
              {resetError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              {resendSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-lime-200 text-xs flex items-start gap-2.5 leading-relaxed">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-lime-400 mt-0.5" />
                  <span>{resendSuccessMsg}</span>
                </div>
              )}

              {/* Dev mode helper badge */}
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
                      }}
                      className="px-3 py-1 rounded-lg bg-forest-900 text-lime-400 hover:bg-forest-950 dark:bg-lime-400 dark:text-forest-950 font-bold text-xs transition shadow-sm shrink-0"
                    >
                      Remplir le code
                    </button>
                  </div>
                </div>
              )}

              {/* Reset Form */}
              <form onSubmit={handleResetSubmit} className="space-y-5">
                {/* 6 Digit Input Boxes */}
                <div>
                  <label className="block text-center text-xs font-semibold text-forest-950 dark:text-white mb-3">
                    {t("auth_otp_input_label", "Code de validation à 6 chiffres")}
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
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
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-2xl bg-sage-50/70 dark:bg-forest-900/60 border-2 border-line text-forest-950 dark:text-white focus:outline-none focus:border-forest-900 dark:focus:border-lime-400 focus:ring-2 focus:ring-forest-900/20 dark:focus:ring-lime-400/20 transition-all font-mono"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend Code Section */}
                <div className="text-center">
                  {resendCooldown > 0 ? (
                    <p className="text-xs text-ink-muted">
                      {t("auth_otp_resend_wait", "Renvoyer le code dans")}{" "}
                      <span className="font-bold text-forest-950 dark:text-white font-mono">
                        {resendCooldown}s
                      </span>
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

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-line w-full" />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-forest-950 dark:text-white mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                  {/* Password Strength Indicator */}
                  {newPassword.length > 0 && (
                    <div className="mt-3 p-3.5 rounded-xl bg-sage-50/60 dark:bg-forest-900/40 border border-line text-xs space-y-2.5 transition-all">
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-forest-950 dark:text-white mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl bg-sage-50/70 dark:bg-forest-900/60 border border-line pl-3.5 pr-10 py-2.5 text-sm text-forest-950 dark:text-white placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-forest-800 dark:focus:ring-lime-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-forest-950 dark:hover:text-white transition-colors"
                      aria-label="Afficher ou masquer la confirmation du mot de passe"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      <span>Les mots de passe ne correspondent pas.</span>
                    </p>
                  )}
                  {confirmPassword.length > 0 && passwordsMatch && (
                    <p className="text-[11px] text-emerald-600 dark:text-lime-400 mt-1.5 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Les mots de passe correspondent.</span>
                    </p>
                  )}
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  disabled={
                    isResetting ||
                    otpCode.join("").trim().length !== 6 ||
                    !passwordValidation.isValid ||
                    !passwordsMatch
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white dark:bg-lime-400 dark:hover:bg-lime-300 dark:text-forest-950 font-bold py-3.5 text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Réinitialisation en cours...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t("auth_reset_btn", "Réinitialiser mon mot de passe")}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-ink-muted">
        {t("auth_copyright", "© 2026 DANHOMEY Facture · Conforme UEMOA & CEMAC")}
      </footer>
    </div>
  );
}
