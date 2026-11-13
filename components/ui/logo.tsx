"use client";

import React from "react";
import Image from "next/image";
import { useOptionalTheme } from "@/lib/theme/context";

export interface LogoProps {
  /**
   * - 'icon': Only the official cowrie squircle emblem
   * - 'full': Emblem + DANHOMEY wordmark with golden sawtooth wave + Facture
   * - 'full-image': Official full horizontal brand asset extracted from PDF
   * - 'text': Only DANHOMEY wordmark with golden sawtooth wave + Facture
   */
  variant?: "icon" | "full" | "full-image" | "text";
  /**
   * Pre-set size or pixel number
   * 'xs' = 20px, 'sm' = 28px, 'md' = 36px, 'lg' = 44px, 'xl' = 56px
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  /** Force theme mode or auto-adapt to dark/light */
  themeMode?: "auto" | "light" | "dark";
  /** Show the FCFA currency badge */
  withBadge?: boolean;
  /** Custom badge text (defaults to "FCFA") */
  badgeText?: string;
  /** Show the subtitle "Facturation UEMOA & CEMAC" */
  withTagline?: boolean;
  /** Custom tagline */
  tagline?: string;
  className?: string;
  priority?: boolean;
}

const DEFAULT_SIZE = { iconSize: 36, textClass: "text-[15px]", gapClass: "gap-2.5" };

const SIZE_MAP: Record<"xs" | "sm" | "md" | "lg" | "xl", { iconSize: number; textClass: string; gapClass: string }> = {
  xs: { iconSize: 22, textClass: "text-xs", gapClass: "gap-1.5" },
  sm: { iconSize: 28, textClass: "text-sm", gapClass: "gap-2" },
  md: { iconSize: 36, textClass: "text-[15px]", gapClass: "gap-2.5" },
  lg: { iconSize: 44, textClass: "text-lg", gapClass: "gap-3" },
  xl: { iconSize: 56, textClass: "text-xl", gapClass: "gap-3.5" },
};

export function Logo({
  variant = "full",
  size = "md",
  themeMode = "auto",
  withBadge = false,
  badgeText = "FCFA",
  withTagline = false,
  tagline = "Facturation UEMOA & CEMAC",
  className = "",
  priority = false,
}: LogoProps) {
  const sizeConfig =
    typeof size === "number"
      ? {
          iconSize: size,
          textClass: size < 30 ? "text-xs" : size < 45 ? "text-base" : "text-xl",
          gapClass: "gap-2",
        }
      : SIZE_MAP[size] || DEFAULT_SIZE;

  const { iconSize, textClass, gapClass } = sizeConfig;
  const themeContext = useOptionalTheme();
  const isExplicitDark = themeMode === "dark";
  const isExplicitLight = themeMode === "light";
  const activeIsDark = isExplicitDark || (themeMode === "auto" && themeContext?.theme === "dark");

  // Icon emblem component supporting auto dark/light switching
  const renderIcon = () => {
    if (isExplicitLight) {
      return (
        <div
          className="relative shrink-0 overflow-hidden rounded-xl shadow-2xs"
          style={{ width: iconSize, height: iconSize }}
        >
          <Image
            src="/logo-icon-light.png"
            alt="DANHOMEY Facture"
            width={iconSize * 2}
            height={iconSize * 2}
            className="w-full h-full object-contain"
            priority={priority}
          />
        </div>
      );
    }

    if (isExplicitDark) {
      return (
        <div
          className="relative shrink-0 overflow-hidden rounded-xl shadow-2xs"
          style={{ width: iconSize, height: iconSize }}
        >
          <Image
            src="/logo-icon-dark.png"
            alt="DANHOMEY Facture"
            width={iconSize * 2}
            height={iconSize * 2}
            className="w-full h-full object-contain"
            priority={priority}
          />
        </div>
      );
    }

    // Auto mode: strict adherence to html.dark with reactive state check
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-xl shadow-2xs"
        style={{ width: iconSize, height: iconSize }}
      >
        <Image
          src="/logo-icon-light.png"
          alt="DANHOMEY Facture"
          width={iconSize * 2}
          height={iconSize * 2}
          className={`w-full h-full object-contain [html.dark_&]:hidden ${activeIsDark ? "hidden" : "block"}`}
          priority={priority}
        />
        <Image
          src="/logo-icon-dark.png"
          alt="DANHOMEY Facture"
          width={iconSize * 2}
          height={iconSize * 2}
          className={`w-full h-full object-contain hidden [html.dark_&]:block ${activeIsDark ? "!block" : ""}`}
          priority={priority}
        />
      </div>
    );
  };

  if (variant === "icon") {
    return <div className={`inline-flex items-center ${className}`}>{renderIcon()}</div>;
  }

  if (variant === "full-image") {
    const height =
      typeof size === "number"
        ? size
        : size === "xl"
        ? 52
        : size === "lg"
        ? 42
        : size === "sm"
        ? 28
        : size === "xs"
        ? 22
        : 36;
    const width = Math.round(height * (1225 / 288));

    if (isExplicitLight) {
      return (
        <div className={`relative shrink-0 ${className}`} style={{ width, height }}>
          <Image
            src="/logo-full-light.png"
            alt="DANHOMEY Facture"
            width={1225}
            height={288}
            className="w-full h-full object-contain"
            priority={priority}
          />
        </div>
      );
    }
    if (isExplicitDark) {
      return (
        <div className={`relative shrink-0 ${className}`} style={{ width, height }}>
          <Image
            src="/logo-full-dark.png"
            alt="DANHOMEY Facture"
            width={1225}
            height={288}
            className="w-full h-full object-contain"
            priority={priority}
          />
        </div>
      );
    }

    return (
      <div className={`relative shrink-0 ${className}`} style={{ width, height }}>
        <Image
          src="/logo-full-light.png"
          alt="DANHOMEY Facture"
          width={1225}
          height={288}
          className={`w-full h-full object-contain [html.dark_&]:hidden ${activeIsDark ? "hidden" : "block"}`}
          priority={priority}
        />
        <Image
          src="/logo-full-dark.png"
          alt="DANHOMEY Facture"
          width={1225}
          height={288}
          className={`w-full h-full object-contain hidden [html.dark_&]:block ${activeIsDark ? "!block" : ""}`}
          priority={priority}
        />
      </div>
    );
  }

  // Golden sawtooth / zigzag wave component faithful to brand guide
  const renderSawtooth = () => (
    <svg
      viewBox="0 0 100 8"
      className="w-full h-[5px] text-amber-500 fill-none stroke-current shrink-0"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points="0,4 4,1 8,7 12,1 16,7 20,1 24,7 28,1 32,7 36,1 40,7 44,1 48,7 52,1 56,7 60,1 64,7 68,1 72,7 76,1 80,7 84,1 88,7 92,1 96,7 100,4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className={`inline-flex items-center ${gapClass} ${className} min-w-0 select-none`}>
      {variant !== "text" && renderIcon()}

      <div className="flex flex-col min-w-0 leading-tight">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          {/* Brand Wordmark with Golden Sawtooth underline on DANHOMEY */}
          <div className="inline-flex flex-col">
            <div className="flex items-baseline">
              <span
                className={`font-black tracking-tight ${
                  isExplicitLight
                    ? "text-[#0f241b]"
                    : isExplicitDark
                    ? "text-white"
                    : "text-[#0f241b] [html.dark_&]:text-white"
                } ${textClass}`}
              >
                DANHOMEY
              </span>
              <span
                className={`ml-1 font-normal tracking-tight ${
                  isExplicitLight
                    ? "text-[#0f241b]/90"
                    : isExplicitDark
                    ? "text-white/90"
                    : "text-[#0f241b]/90 [html.dark_&]:text-white/90"
                } ${textClass}`}
              >
                Facture
              </span>
            </div>

            {/* Golden Zigzag Wave Line */}
            <div className="w-[82px] sm:w-[92px] -mt-0.5">{renderSawtooth()}</div>
          </div>

          {/* High-Contrast FCFA Badge */}
          {withBadge && (
            <span
              className="inline-flex items-center rounded-full bg-lime-400 dark:bg-lime-400 px-2 py-0.5 text-[9px] font-black text-forest-950 dark:text-forest-950 uppercase tracking-wider shrink-0 shadow-2xs ml-0.5"
              title="Devise légale : Franc CFA (SYSCOHADA)"
            >
              {badgeText}
            </span>
          )}
        </div>

        {/* Tagline */}
        {withTagline && (
          <span className="text-[10px] sm:text-[11px] text-ink-muted whitespace-nowrap mt-0.5">
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
