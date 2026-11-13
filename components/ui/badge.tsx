"use client";

import React from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "lime"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  dotColor?: string;
}

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-sage-100 dark:bg-sage-900/50 text-forest-900 dark:text-forest-100 border-line",
  primary: "bg-forest-900 dark:bg-forest-800 text-surface border-forest-800 dark:border-forest-700",
  lime: "bg-lime-100 dark:bg-lime-950/80 text-forest-950 dark:text-lime-300 border-lime-300/80 dark:border-lime-500/50 font-bold",
  success: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-700/60",
  warning: "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-700/60",
  danger: "bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-700/60",
  neutral: "bg-sage-50 dark:bg-sage-900/40 text-sage-600 dark:text-sage-300 border-line-subtle",
};

export function Badge({
  variant = "default",
  dot = false,
  dotColor,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap shrink-0 transition-colors ${BADGE_VARIANTS[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotColor ??
            (variant === "success"
              ? "bg-emerald-500"
              : variant === "warning"
              ? "bg-amber-500"
              : variant === "danger"
              ? "bg-rose-500"
              : variant === "lime"
              ? "bg-lime-500"
              : "bg-forest-700")
          }`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

