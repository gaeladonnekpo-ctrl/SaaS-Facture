"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title?: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 sm:p-4 shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 backdrop-blur-md ${
              isSuccess
                ? "border-emerald-300/80 dark:border-emerald-700/60 bg-surface/98 text-forest-950 ring-1 ring-emerald-500/20 shadow-emerald-950/5"
                : isError
                ? "border-rose-300/80 dark:border-rose-700/60 bg-surface/98 text-forest-950 ring-1 ring-rose-500/20 shadow-rose-950/5"
                : "border-line bg-surface/98 text-forest-950 shadow-2xs"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />}
              {isError && <AlertCircle className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-4.5 h-4.5 text-forest-700 dark:text-forest-300" />}
            </div>

            <div className="flex-1 text-xs min-w-0">
              {toast.title && <p className="font-bold text-forest-950 mb-0.5 tracking-tight truncate">{toast.title}</p>}
              <p className="text-sage-600 leading-relaxed text-[11px] sm:text-xs">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-lg p-1 text-sage-400 hover:text-forest-950 hover:bg-sage-100 transition-colors shrink-0"
              aria-label="Fermer la notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

