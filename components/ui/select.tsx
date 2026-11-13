"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className = "", children, id, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-forest-950 tracking-tight"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none rounded-xl border bg-sage-50/70 py-2 pl-3 pr-9 text-xs text-forest-950 transition-all duration-150 focus:border-forest-700 focus:bg-surface focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? "border-rose-300 dark:border-rose-700/60 bg-rose-50/40 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 focus:border-rose-600"
                : "border-line"
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
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

Select.displayName = "Select";

