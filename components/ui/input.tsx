"use client";

import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      icon,
      rightElement,
      error,
      label,
      hint,
      className = "",
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-forest-950 tracking-tight"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-sage-400">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full rounded-xl border bg-sage-50/70 py-2 text-xs text-forest-950 placeholder:text-sage-400 transition-all duration-150 focus:border-forest-700 focus:bg-surface focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
              icon ? "pl-9" : "pl-3"
            } ${rightElement ? "pr-10" : "pr-3"} ${
              error
                ? "border-rose-300 dark:border-rose-700/60 bg-rose-50/40 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 focus:border-rose-600 focus:ring-1 focus:ring-rose-500"
                : "border-line"
            } ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-2.5 flex items-center">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 animate-in fade-in-50">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-[11px] text-ink-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

