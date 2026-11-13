"use client";

import React from "react";
import type { DisplayStatus } from "@/lib/domain/types";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationDictionary } from "@/lib/i18n/translations";
import { Check, Send, AlertTriangle, FileText, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: DisplayStatus;
  className?: string;
  showIcon?: boolean;
}

interface StatusConfig {
  key: keyof TranslationDictionary;
  defaultLabel: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const STATUS_CONFIGS: Record<DisplayStatus, StatusConfig> = {
  paid: {
    key: "status_paid",
    defaultLabel: "Payée",
    bgClass: "bg-emerald-50/90 dark:bg-emerald-950/70",
    textClass: "text-emerald-800 dark:text-emerald-300",
    borderClass: "border-emerald-200/80 dark:border-emerald-700/60",
    dotClass: "bg-emerald-500",
    Icon: Check,
  },
  sent: {
    key: "status_sent",
    defaultLabel: "Envoyée",
    bgClass: "bg-amber-50/90 dark:bg-amber-950/70",
    textClass: "text-amber-800 dark:text-amber-300",
    borderClass: "border-amber-200/80 dark:border-amber-700/60",
    dotClass: "bg-amber-500",
    Icon: Send,
  },
  overdue: {
    key: "status_overdue",
    defaultLabel: "En retard",
    bgClass: "bg-rose-50/90 dark:bg-rose-950/70",
    textClass: "text-rose-800 dark:text-rose-300",
    borderClass: "border-rose-200/80 dark:border-rose-700/60",
    dotClass: "bg-rose-500 animate-pulse",
    Icon: AlertTriangle,
  },
  draft: {
    key: "status_draft",
    defaultLabel: "Brouillon",
    bgClass: "bg-stone-100/90 dark:bg-stone-800/60",
    textClass: "text-stone-700 dark:text-stone-300",
    borderClass: "border-stone-200/80 dark:border-stone-700/60",
    dotClass: "bg-stone-400",
    Icon: FileText,
  },
  cancelled: {
    key: "status_cancelled",
    defaultLabel: "Annulée",
    bgClass: "bg-stone-100 dark:bg-stone-800/60",
    textClass: "text-stone-600 dark:text-stone-400",
    borderClass: "border-stone-200 dark:border-stone-700/60",
    dotClass: "bg-stone-400",
    Icon: XCircle,
  },
};

export function StatusBadge({ status, className = "", showIcon = true }: StatusBadgeProps) {
  const { t } = useI18n();
  const config = STATUS_CONFIGS[status] ?? STATUS_CONFIGS.draft;
  const Icon = config.Icon;
  const localizedLabel = t(config.key, config.defaultLabel);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
      {showIcon && <Icon className="w-3 h-3 stroke-[2.2]" aria-hidden="true" />}
      <span>{localizedLabel}</span>
    </span>
  );
}
