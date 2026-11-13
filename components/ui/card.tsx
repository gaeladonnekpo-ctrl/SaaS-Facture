"use client";

import React, { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl border border-line bg-surface shadow-card ${
          hoverable
            ? "transition-all duration-200 hover:border-forest-700/30 hover:shadow-md group"
            : ""
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({
  className = "",
  children,
  bordered = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { bordered?: boolean }) {
  return (
    <div
      className={`p-3.5 sm:p-5 lg:p-6 ${
        bordered ? "border-b border-line" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-sm sm:text-base lg:text-lg font-bold text-forest-950 tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`mt-0.5 text-xs text-ink-muted ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-3.5 sm:p-5 lg:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-3.5 sm:p-5 lg:p-6 border-t border-line-subtle bg-sage-50/40 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

