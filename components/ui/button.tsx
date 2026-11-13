"use client";

import React, { forwardRef } from "react";
import { Loader2, Plus } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-subtle"
  | "lime";

export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  withLimeDot?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-forest-900 text-surface shadow-xs hover:bg-forest-850 hover:shadow active:scale-95 border border-forest-900",
  secondary:
    "bg-sage-100 text-forest-900 hover:bg-sage-200 active:scale-95 border border-line",
  outline:
    "bg-surface text-forest-900 hover:bg-sage-50 active:scale-95 border border-line shadow-2xs",
  ghost:
    "bg-transparent text-sage-600 hover:text-forest-950 hover:bg-sage-100 active:scale-95 border border-transparent",
  danger:
    "bg-rose-700 text-surface hover:bg-rose-800 active:scale-95 border border-rose-700 shadow-xs",
  "danger-subtle":
    "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 active:scale-95 border border-rose-200/80 dark:border-rose-800/60",
  lime:
    "bg-lime-400 text-forest-950 font-bold hover:bg-lime-300 active:scale-95 border border-lime-500 shadow-xs",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-2.5 text-[11px] gap-1.5 rounded-xl font-semibold",
  md: "h-9 px-3.5 text-xs gap-2 rounded-xl font-semibold",
  lg: "h-11 px-5 text-sm gap-2.5 rounded-xl font-bold",
  icon: "h-9 w-9 p-0 rounded-xl justify-center items-center shrink-0",
  "icon-sm": "h-8 w-8 p-0 rounded-lg justify-center items-center shrink-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      withLimeDot = false,
      icon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const isIconOnly = size === "icon" || size === "icon-sm";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-sans tracking-tight transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed group whitespace-nowrap ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          <>
            {withLimeDot && (
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-lime-400 text-forest-950 group-hover:scale-110 transition-transform shrink-0">
                <Plus className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            )}
            {!withLimeDot && icon && (
              <span className="shrink-0 transition-transform group-hover:scale-105">
                {icon}
              </span>
            )}
            {!isIconOnly && children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

