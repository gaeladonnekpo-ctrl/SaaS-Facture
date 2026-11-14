"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useData } from "@/lib/data/context";
import {
  createDatePeriodFilter,
  createDateRangeFilter,
  getTodayISODate,
} from "@/lib/date-filter";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Check,
  X,
  ArrowRight,
} from "lucide-react";

const DEFAULT_MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DEFAULT_WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const MONTH_NAMES_BY_LANG: Record<string, string[]> = {
  fr: DEFAULT_MONTHS,
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
};

const WEEKDAYS_BY_LANG: Record<string, string[]> = {
  fr: DEFAULT_WEEKDAYS,
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

interface CalendarDay {
  day: number;
  month: number; // 0-11
  year: number;
  isoDate: string; // "YYYY-MM-DD"
  isCurrentMonth: boolean;
  isToday: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  isInHoverRange: boolean;
  isSingleSelected: boolean;
}

export function PeriodCalendarPopover() {
  const { language, t } = useI18n();
  const { dateFilter, setDateFilter, resetDateFilter } = useData();
  const [isOpen, setIsOpen] = useState(false);

  // Selection mode: "range" (Période personnalisée) vs "single" (Jour unique)
  const [selectionMode, setSelectionMode] = useState<"range" | "single">("range");

  // Range selection state
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Reference "Today" date based on the real client system date
  const todayRef = useMemo(() => {
    const now = new Date();
    return {
      day: now.getDate(),
      month: now.getMonth(), // 0-11
      year: now.getFullYear(),
      iso: getTodayISODate(),
    };
  }, []);

  // Calendar view year and month (defaulting to the filter's date or today)
  const [viewYear, setViewYear] = useState<number>(todayRef.year);
  const [viewMonth, setViewMonth] = useState<number>(todayRef.month);

  // Sync calendar view and local range state when dateFilter changes or popover opens
  useEffect(() => {
    if (dateFilter.preset === "custom_range" && dateFilter.startDate && dateFilter.endDate) {
      setRangeStart(dateFilter.startDate);
      setRangeEnd(dateFilter.endDate);
      setSelectionMode("range");
      const parts = dateFilter.startDate.split("-");
      if (parts.length === 3 && parts[0] && parts[1]) {
        setViewYear(parseInt(parts[0], 10));
        setViewMonth(parseInt(parts[1], 10) - 1);
      }
    } else if (dateFilter.preset === "custom_date" && dateFilter.specificDate) {
      setRangeStart(dateFilter.specificDate);
      setRangeEnd(dateFilter.specificDate);
      setSelectionMode("single");
      const parts = dateFilter.specificDate.split("-");
      if (parts.length === 3 && parts[0] && parts[1]) {
        setViewYear(parseInt(parts[0], 10));
        setViewMonth(parseInt(parts[1], 10) - 1);
      }
    } else if (dateFilter.startDate && dateFilter.endDate) {
      setRangeStart(dateFilter.startDate);
      setRangeEnd(dateFilter.endDate);
      const parts = dateFilter.startDate.split("-");
      if (parts.length === 3 && parts[0] && parts[1]) {
        setViewYear(parseInt(parts[0], 10));
        setViewMonth(parseInt(parts[1], 10) - 1);
      }
    } else {
      setRangeStart(null);
      setRangeEnd(null);
    }
  }, [dateFilter, isOpen]);

  const monthNames: string[] = (MONTH_NAMES_BY_LANG[language] ?? MONTH_NAMES_BY_LANG.fr) ?? DEFAULT_MONTHS;
  const weekdays: string[] = (WEEKDAYS_BY_LANG[language] ?? WEEKDAYS_BY_LANG.fr) ?? DEFAULT_WEEKDAYS;

  const presets = useMemo(() => [
    {
      id: "all",
      label: language === "en" ? "All dates" : "Toutes les dates",
      shortLabel: language === "en" ? "All" : "Toutes",
    },
    {
      id: "today",
      label: t("period_today", "Aujourd'hui"),
      shortLabel: t("period_today", "Aujourd'hui"),
    },
    {
      id: "this_month",
      label: t("period_this_month", "Ce mois-ci"),
      shortLabel: t("period_this_month", "Ce mois-ci"),
    },
    {
      id: "last_30_days",
      label: t("period_last_30_days", "30 derniers jours"),
      shortLabel: t("period_last_30_days_short", "30 jours"),
    },
    {
      id: "q4_2026",
      label: t("period_q4_2026", "T4 2026"),
      shortLabel: "T4 2026",
    },
    {
      id: "year_2026",
      label: t("period_year_2026", "Année 2026"),
      shortLabel: "2026",
    },
  ], [language, t]);

  // Compute pending hover range bounds
  const hoverRangeBounds = useMemo(() => {
    if (!rangeStart || rangeEnd || !hoverDate) return null;
    let min = rangeStart;
    let max = hoverDate;
    if (min > max) {
      [min, max] = [max, min];
    }
    return { min, max };
  }, [rangeStart, rangeEnd, hoverDate]);

  // Compute days matrix for viewMonth and viewYear
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const days: CalendarDay[] = [];
    const pad = (n: number) => String(n).padStart(2, "0");

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const startOffset = (firstDayOfWeek + 6) % 7; // Monday = 0

    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;

    const buildDay = (d: number, m: number, y: number, isCurrent: boolean): CalendarDay => {
      const iso = `${y}-${pad(m + 1)}-${pad(d)}`;

      const isRangeStart = rangeStart === iso;
      const isRangeEnd = rangeEnd === iso;
      const isSingleSelected =
        (selectionMode === "single" && dateFilter.specificDate === iso) ||
        (rangeStart === iso && rangeEnd === iso);

      let isInRange = false;
      if (rangeStart && rangeEnd) {
        isInRange = iso >= rangeStart && iso <= rangeEnd;
      }

      let isInHoverRange = false;
      if (hoverRangeBounds) {
        isInHoverRange = iso >= hoverRangeBounds.min && iso <= hoverRangeBounds.max;
      }

      return {
        day: d,
        month: m,
        year: y,
        isoDate: iso,
        isCurrentMonth: isCurrent,
        isToday: iso === todayRef.iso,
        isRangeStart,
        isRangeEnd,
        isInRange,
        isInHoverRange,
        isSingleSelected,
      };
    };

    // Prev month trailing days
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push(buildDay(daysInPrevMonth - i, prevMonth, prevYear, false));
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(buildDay(d, viewMonth, viewYear, true));
    }

    // Next month leading days (fill 35 or 42 grid)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    let nextDay = 1;

    while (days.length < totalSlots) {
      days.push(buildDay(nextDay, nextMonth, nextYear, false));
      nextDay++;
    }

    return days;
  }, [viewYear, viewMonth, rangeStart, rangeEnd, hoverRangeBounds, selectionMode, dateFilter, todayRef]);

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Jump to today
  const handleJumpToday = () => {
    setViewYear(todayRef.year);
    setViewMonth(todayRef.month);
    const filter = createDatePeriodFilter("today", undefined, language);
    setDateFilter(filter);
    setIsOpen(false);
  };

  // Select a preset
  const handleSelectPreset = (presetId: string) => {
    if (presetId === "all") {
      resetDateFilter();
    } else {
      const filter = createDatePeriodFilter(presetId, undefined, language);
      setDateFilter(filter);
    }
    setIsOpen(false);
  };

  // Calendar Day Click Handler (Range vs Single day)
  const handleSelectDay = (cell: CalendarDay) => {
    if (selectionMode === "single") {
      // Single day mode: immediate selection
      const filter = createDatePeriodFilter("custom_date", cell.isoDate, language);
      setDateFilter(filter);
      setRangeStart(cell.isoDate);
      setRangeEnd(cell.isoDate);
      setViewMonth(cell.month);
      setViewYear(cell.year);
      setIsOpen(false);
      return;
    }

    // Range mode: 2 clicks (Start -> End)
    if (!rangeStart || (rangeStart && rangeEnd)) {
      // Click 1: set Start Date, clear End Date
      setRangeStart(cell.isoDate);
      setRangeEnd(null);
      setHoverDate(null);
    } else {
      // Click 2: set End Date and apply the range immediately
      let start = rangeStart;
      let end = cell.isoDate;
      if (start > end) {
        [start, end] = [end, start];
      }

      setRangeStart(start);
      setRangeEnd(end);
      setHoverDate(null);

      const rangeFilter = createDateRangeFilter(start, end, language);
      setDateFilter(rangeFilter);

      // Auto close after brief feedback
      setTimeout(() => {
        setIsOpen(false);
      }, 250);
    }
  };

  // Direct manual range apply from inputs
  const handleApplyCustomInputs = () => {
    if (!rangeStart) return;
    const end = rangeEnd || rangeStart;
    const filter = createDateRangeFilter(rangeStart, end, language);
    setDateFilter(filter);
    setIsOpen(false);
  };

  const isFilterActive = dateFilter.preset !== "all";

  // Friendly status helper for range selection
  const rangeHelperMessage = useMemo(() => {
    if (selectionMode === "single") {
      return "Cliquez sur une date pour filtrer ce jour uniquement";
    }
    if (!rangeStart) {
      return "Étape 1/2 : Cliquez sur la date de début de la période";
    }
    if (rangeStart && !rangeEnd) {
      return `Étape 2/2 : Cliquez sur la date de fin (Début : ${rangeStart})`;
    }
    return `Période sélectionnée : du ${rangeStart} au ${rangeEnd}`;
  }, [selectionMode, rangeStart, rangeEnd]);

  return (
    <div className="relative shrink-0">
      {/* Trigger Button in Header */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-9 items-center gap-1.5 rounded-xl border px-2 sm:px-3 text-xs font-medium transition-all focus:outline-hidden shadow-2xs shrink-0 ${
            isFilterActive
              ? "border-emerald-600/60 dark:border-emerald-500/60 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-semibold"
              : "border-line bg-surface text-forest-900 hover:bg-sage-50"
          }`}
          title={t("period_filter_title", "Filtrer la période")}
          aria-expanded={isOpen}
        >
          <CalendarIcon
            className={`w-3.5 h-3.5 shrink-0 ${
              isFilterActive ? "text-emerald-700 dark:text-emerald-400" : "text-sage-500"
            }`}
          />
          <span className="hidden 2xl:inline whitespace-nowrap">{dateFilter.label}</span>
          <span className="hidden sm:inline 2xl:hidden text-xs font-semibold whitespace-nowrap">
            {dateFilter.shortLabel}
          </span>
          {isFilterActive && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
              title="Filtre temporel actif"
            />
          )}
          <ChevronDown
            className={`w-3 h-3 text-sage-400 shrink-0 hidden sm:inline transition-transform duration-200 ${
              isOpen ? "rotate-180 text-forest-900" : ""
            }`}
          />
        </button>

        {/* Quick Clear Button beside trigger when filter is active */}
        {isFilterActive && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resetDateFilter();
            }}
            className="ml-1 flex h-6 w-6 items-center justify-center rounded-lg text-sage-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Réinitialiser le filtre de date (afficher tout)"
            aria-label="Réinitialiser le filtre de date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Popover */}
      {isOpen && (
        <>
          {/* Backdrop click handler */}
          <div
            className="fixed inset-0 z-40 bg-forest-950/20 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Calendar Card - Responsive Viewport Positioning */}
          <div className="fixed inset-x-2.5 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-[350px] max-h-[calc(100vh-5rem)] sm:max-h-none overflow-y-auto z-50 rounded-2xl border border-line bg-surface p-3 sm:p-4 shadow-dropdown animate-in fade-in-50 zoom-in-95">
            {/* Quick Presets Pills */}
            <div className="mb-2.5 border-b border-line pb-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-sage-400 uppercase tracking-wider">
                  {t("period_quick_presets", "Périodes rapides")}
                </span>
                {isFilterActive ? (
                  <button
                    type="button"
                    onClick={() => {
                      resetDateFilter();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Tout afficher</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleJumpToday}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t("period_today", "Aujourd'hui")}</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {presets.map((p) => {
                  const isPresetActive = dateFilter.preset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-colors flex items-center gap-1 ${
                        isPresetActive
                          ? "bg-forest-900 text-surface font-semibold shadow-2xs"
                          : "bg-sage-50 text-forest-900 hover:bg-sage-100 dark:bg-forest-900/40 dark:text-sage-200"
                      }`}
                    >
                      {isPresetActive && <Check className="w-3 h-3 text-lime-400" />}
                      <span>{p.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selection Mode Toggle (Période / Jour unique) */}
            <div className="mb-2 flex items-center justify-between bg-sage-50 dark:bg-forest-900/30 p-1 rounded-xl border border-line-subtle text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectionMode("range");
                  setRangeEnd(null);
                }}
                className={`flex-1 py-1 px-2 rounded-lg text-center font-semibold transition-all ${
                  selectionMode === "range"
                    ? "bg-surface text-forest-950 shadow-2xs border border-line"
                    : "text-sage-500 hover:text-forest-900"
                }`}
              >
                📅 Période (Plage)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionMode("single");
                  setRangeEnd(null);
                }}
                className={`flex-1 py-1 px-2 rounded-lg text-center font-semibold transition-all ${
                  selectionMode === "single"
                    ? "bg-surface text-forest-950 shadow-2xs border border-line"
                    : "text-sage-500 hover:text-forest-900"
                }`}
              >
                📌 Jour unique
              </button>
            </div>

            {/* Instruction helper banner */}
            <div className="mb-2 px-2 py-1 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-200 text-center font-medium truncate">
              {rangeHelperMessage}
            </div>

            {/* Month & Year Navigation Header */}
            <div className="flex items-center justify-between px-1 mb-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-sage-500 hover:bg-sage-100 hover:text-forest-900 transition-colors active:scale-95"
                title={t("period_prev_month", "Mois précédent")}
                aria-label={t("period_prev_month", "Mois précédent")}
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
              </button>

              <div className="text-center">
                <span className="text-xs sm:text-sm font-bold text-forest-950">
                  {monthNames[viewMonth] ?? ""} {viewYear}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-sage-500 hover:bg-sage-100 hover:text-forest-900 transition-colors active:scale-95"
                title={t("period_next_month", "Mois suivant")}
                aria-label={t("period_next_month", "Mois suivant")}
              >
                <ChevronRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {weekdays.map((wd) => (
                <div
                  key={wd}
                  className="py-1 text-[10px] font-semibold text-sage-400 uppercase tracking-tight"
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Grid (7 columns) */}
            <div
              className="grid grid-cols-7 gap-y-1 text-center"
              onMouseLeave={() => setHoverDate(null)}
            >
              {calendarDays.map((cell, idx) => {
                // Determine CSS classes for range styling
                let cellClass = "";
                let wrapperClass = "p-0.5";

                if (cell.isSingleSelected) {
                  cellClass = "bg-forest-900 text-lime-300 font-bold shadow-xs scale-105 ring-2 ring-lime-400/50 rounded-full";
                } else if (cell.isRangeStart) {
                  cellClass = "bg-forest-900 text-lime-300 font-bold shadow-xs rounded-full";
                  wrapperClass = "bg-emerald-100 dark:bg-emerald-950/70 rounded-l-full";
                } else if (cell.isRangeEnd) {
                  cellClass = "bg-forest-900 text-lime-300 font-bold shadow-xs rounded-full";
                  wrapperClass = "bg-emerald-100 dark:bg-emerald-950/70 rounded-r-full";
                } else if (cell.isInRange) {
                  cellClass = "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 font-semibold rounded-none";
                  wrapperClass = "bg-emerald-100 dark:bg-emerald-950/70";
                } else if (cell.isInHoverRange) {
                  cellClass = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 rounded-none";
                  wrapperClass = "bg-emerald-50 dark:bg-emerald-950/40";
                } else if (cell.isCurrentMonth) {
                  cellClass = "text-forest-950 font-semibold hover:bg-sage-100 active:scale-95 rounded-full";
                } else {
                  cellClass = "text-sage-300 font-normal hover:bg-sage-50 rounded-full";
                }

                if (cell.isToday && !cell.isSingleSelected && !cell.isRangeStart && !cell.isRangeEnd) {
                  cellClass += " border border-forest-800 text-forest-950 font-bold";
                }

                return (
                  <div key={`${cell.year}-${cell.month}-${cell.day}-${idx}`} className={wrapperClass}>
                    <button
                      type="button"
                      onClick={() => handleSelectDay(cell)}
                      onMouseEnter={() => {
                        if (rangeStart && !rangeEnd && selectionMode === "range") {
                          setHoverDate(cell.isoDate);
                        }
                      }}
                      className={`relative mx-auto flex h-7.5 w-7.5 sm:h-8 sm:w-8 items-center justify-center text-[11px] sm:text-xs transition-all ${cellClass}`}
                    >
                      <span>{cell.day}</span>
                      {cell.isToday && !cell.isSingleSelected && !cell.isRangeStart && !cell.isRangeEnd && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-forest-900" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Direct date inputs & apply bar */}
            {selectionMode === "range" && (
              <div className="mt-2.5 pt-2 border-t border-line space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="min-w-0">
                    <label className="block text-[10px] font-semibold text-sage-500 uppercase mb-0.5">Du</label>
                    <input
                      type="date"
                      value={rangeStart || ""}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="w-full min-w-0 rounded-lg border border-line bg-surface p-1.5 text-xs text-forest-950 font-medium focus:outline-none focus:ring-1 focus:ring-forest-800"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-[10px] font-semibold text-sage-500 uppercase mb-0.5">Au</label>
                    <input
                      type="date"
                      value={rangeEnd || rangeStart || ""}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className="w-full min-w-0 rounded-lg border border-line bg-surface p-1.5 text-xs text-forest-950 font-medium focus:outline-none focus:ring-1 focus:ring-forest-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-ink-muted truncate font-medium max-w-[160px] sm:max-w-[200px]">
                    {dateFilter.label}
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyCustomInputs}
                    disabled={!rangeStart}
                    className="inline-flex items-center gap-1 rounded-lg bg-forest-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-forest-850 active:scale-95 disabled:opacity-50 transition-all shrink-0"
                  >
                    <span>Appliquer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Single mode footer */}
            {selectionMode === "single" && (
              <div className="mt-2.5 pt-2 border-t border-line flex items-center justify-between text-[11px] text-ink-muted px-1">
                <span className="truncate mr-1">{t("period_selected_date", "Sélection :")}</span>
                <span className="font-semibold text-forest-950 bg-sage-50 dark:bg-forest-900/60 px-2 py-0.5 rounded-md border border-line truncate max-w-[170px]">
                  {dateFilter.label}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
