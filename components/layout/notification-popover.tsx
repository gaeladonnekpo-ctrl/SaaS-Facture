"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatFCFA } from "@/lib/format/money";
import { useI18n } from "@/lib/i18n/context";
import { useData, type AppNotification } from "@/lib/data/context";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Users,
  Smartphone,
  Building,
  Check,
  X,
  ArrowRight,
} from "lucide-react";

export function NotificationPopover() {
  const { t } = useI18n();
  const {
    notifications,
    unreadNotificationsCount,
    markAllNotificationsAsRead,
    toggleNotificationRead,
    dismissNotification,
    showToast,
  } = useData();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = unreadNotificationsCount;

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    showToast({
      type: "info",
      title: "Notifications",
      message: "Toutes les notifications ont été marquées comme lues.",
    });
  };

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNotificationRead(id);
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dismissNotification(id);
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "payment":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60">
            <Smartphone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
        );
      case "overdue":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            <AlertTriangle className="w-4 h-4 text-rose-700 dark:text-rose-400" />
          </div>
        );
      case "invoice":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-forest-100 dark:bg-forest-950/70 text-forest-800 dark:text-forest-300 border border-forest-200 dark:border-forest-700/60">
            <Receipt className="w-4 h-4 text-forest-700 dark:text-forest-400" />
          </div>
        );
      case "tax":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60">
            <Receipt className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
        );
      case "customer":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-forest-900 border border-line">
            <Users className="w-4 h-4 text-forest-800" />
          </div>
        );
    }
  };

  return (
    <div className="relative shrink-0">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-sage-600 hover:text-forest-900 hover:bg-sage-50 transition-colors shrink-0 shadow-2xs focus:outline-hidden active:scale-95"
        aria-label={`Notifications (${unreadCount} non lues)`}
        title="Centre de notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-500 ring-2 ring-surface" />
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-line bg-surface shadow-2xl animate-in fade-in-50 zoom-in-95 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-surface">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-forest-950">{t("notif_title", "Notifications")}</h3>
                {unreadCount > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-lime-100 dark:bg-lime-950/80 px-2 py-0.5 text-[10px] font-bold text-forest-950 dark:text-lime-300 border border-lime-300/80 dark:border-lime-500/50">
                    {unreadCount} {t("notif_unread", "non lue(s)")}
                  </span>
                ) : (
                  <span className="text-[11px] text-ink-muted">{t("notif_all_read", "Toutes lues")}</span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-semibold text-forest-900 hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>{t("notif_mark_all_read", "Tout marquer comme lu")}</span>
                </button>
              )}
            </div>

            {/* Notification Items List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-line-subtle">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-ink-muted">
                  <Bell className="mx-auto h-8 w-8 text-sage-300 mb-2" />
                  <p className="text-xs font-semibold text-forest-950">{t("notif_empty_title", "Aucune notification")}</p>
                  <p className="text-[11px] text-sage-500 mt-0.5">{t("notif_empty_desc", "Vous êtes parfaitement à jour !")}</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.isRead) {
                        toggleNotificationRead(notif.id);
                      }
                    }}
                    className={`p-3.5 transition-colors relative flex items-start gap-3 cursor-pointer ${
                      notif.isRead ? "bg-surface hover:bg-sage-50/60" : "bg-lime-50/30 hover:bg-lime-50/60"
                    }`}
                  >
                    {getIcon(notif.type)}

                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-forest-950 truncate">{notif.title}</span>
                        <span className="text-[10px] text-ink-muted whitespace-nowrap">{notif.time}</span>
                      </div>

                      <p className="mt-0.5 text-[11px] text-sage-600 leading-snug">
                        {notif.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        {notif.linkHref ? (
                          <Link
                            href={notif.linkHref}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 font-semibold text-forest-900 text-[11px] hover:underline"
                          >
                            <span>{notif.linkText || "Consulter"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <div />
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleToggleRead(notif.id, e)}
                            className="text-[10px] text-sage-400 hover:text-forest-900 p-1"
                            title={notif.isRead ? "Marquer comme non lu" : "Marquer comme lu"}
                          >
                            <span
                              className={`inline-block h-2 w-2 rounded-full ${
                                notif.isRead ? "bg-sage-300" : "bg-lime-500 ring-2 ring-lime-200"
                              }`}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDismiss(notif.id, e)}
                            className="text-sage-400 hover:text-rose-600 p-1 rounded-md"
                            title="Supprimer la notification"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-line px-4 py-2.5 bg-sage-50/50 flex items-center justify-between text-[11px] text-ink-muted">
              <span className="flex items-center gap-1">
                <Bell className="w-3 h-3 text-forest-800 dark:text-lime-400" />
                <span>Alertes de facturation en direct</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-semibold text-forest-950 hover:underline"
              >
                Fermer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

