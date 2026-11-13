"use client";

import React from "react";
import { formatNumber } from "@/lib/format/money";

export type MoneyDisplaySize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type MoneyDisplayVariant =
  | "default"
  | "emerald"
  | "amber"
  | "rose"
  | "muted";

export interface MoneyDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  amount: number;
  size?: MoneyDisplaySize;
  variant?: MoneyDisplayVariant;
  prefix?: string;
  currencyClassName?: string;
}

const SIZE_CLASSES: Record<MoneyDisplaySize, { amount: string; currency: string }> = {
  xs: { amount: "text-xs font-semibold", currency: "text-[10px] font-bold" },
  sm: { amount: "text-sm font-bold", currency: "text-[11px] font-bold" },
  md: { amount: "text-base font-bold", currency: "text-xs font-bold" },
  lg: { amount: "text-lg sm:text-xl font-extrabold", currency: "text-xs sm:text-sm font-bold" },
  xl: { amount: "text-xl sm:text-2xl font-extrabold tracking-tight", currency: "text-xs sm:text-sm font-bold" },
  "2xl": { amount: "text-2xl sm:text-3xl font-extrabold tracking-tight", currency: "text-sm sm:text-base font-bold" },
};

const VARIANT_CLASSES: Record<MoneyDisplayVariant, { amount: string; currency: string }> = {
  default: { amount: "text-forest-950", currency: "text-sage-600" },
  emerald: { amount: "text-emerald-700", currency: "text-emerald-700" },
  amber: { amount: "text-amber-800", currency: "text-amber-800" },
  rose: { amount: "text-rose-700", currency: "text-rose-600" },
  muted: { amount: "text-sage-600", currency: "text-sage-400" },
};

export function MoneyDisplay({
  amount,
  size = "md",
  variant = "default",
  prefix,
  className = "",
  currencyClassName = "",
  ...props
}: MoneyDisplayProps) {
  const sizeConfig = SIZE_CLASSES[size];
  const variantConfig = VARIANT_CLASSES[variant];

  return (
    <div
      className={`inline-flex items-baseline gap-1.5 flex-nowrap min-w-0 ${className}`}
      {...props}
    >
      {prefix && (
        <span className={`tabular ${sizeConfig.amount} ${variantConfig.amount}`}>
          {prefix}
        </span>
      )}
      <span
        className={`tabular truncate ${sizeConfig.amount} ${variantConfig.amount}`}
      >
        {formatNumber(amount)}
      </span>
      <span
        className={`shrink-0 whitespace-nowrap ${sizeConfig.currency} ${variantConfig.currency} ${currencyClassName}`}
      >
        FCFA
      </span>
    </div>
  );
}

