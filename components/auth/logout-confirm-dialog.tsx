"use client";

import React, { useEffect, useRef } from "react";
import { LogOut, X, AlertTriangle, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function LogoutConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  isLoading = false,
}: LogoutConfirmDialogProps) {
  const { language, t } = useI18n();
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button on open to prevent accidental Enter submit
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const isEn = language === "en";
  const title = isEn ? "Confirmation de déconnexion" : "Confirmation de déconnexion";
  const message = isEn ? "Are you sure you want to sign out?" : "Êtes-vous sûr de vouloir vous déconnecter ?";
  const description = isEn
    ? "You will need to sign in again with your credentials to access your billing workspace."
    : "Vous devrez vous reconnecter avec vos identifiants pour accéder de nouveau à votre espace de facturation.";
  const cancelText = t("action_cancel", isEn ? "Cancel" : "Annuler");
  const confirmText = isEn ? "Confirm sign out" : "Confirmer la déconnexion";
  const inProgressText = isEn ? "Signing out..." : "Déconnexion en cours...";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/70 p-4 backdrop-blur-xs transition-opacity animate-in fade-in-50"
    >
      {/* Backdrop click handler */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onCancel();
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border border-line bg-surface p-5 sm:p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 my-auto z-10">
        {/* Close Button (X) */}
        <button
          type="button"
          onClick={() => {
            if (!isLoading) onCancel();
          }}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-sage-400 hover:text-forest-900 hover:bg-sage-100 dark:hover:bg-forest-900/40 transition-colors disabled:opacity-40"
          aria-label={cancelText}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Header */}
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 shadow-2xs shrink-0">
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>

          <div className="min-w-0 pr-6">
            <h2
              id="logout-dialog-title"
              className="text-base sm:text-lg font-bold text-forest-950 dark:text-white"
            >
              {title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400">
              {message}
            </p>
          </div>
        </div>

        {/* Informative description */}
        <div className="mt-3.5 rounded-xl border border-line-subtle bg-sage-50/60 dark:bg-forest-900/30 p-3">
          <p
            id="logout-dialog-description"
            className="text-xs text-ink-muted leading-relaxed"
          >
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-line bg-surface hover:bg-sage-100 dark:hover:bg-forest-900/40 text-xs font-semibold text-forest-900 dark:text-sage-200 transition-colors active:scale-95 disabled:opacity-50 text-center"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-xs font-semibold text-white shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{inProgressText}</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

