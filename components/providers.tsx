"use client";

import React from "react";
import { ThemeProvider } from "@/lib/theme/context";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth/context";
import { DataProvider, useData } from "@/lib/data/context";
import { ToastContainer } from "@/components/ui/toast";

function ToastWrapper() {
  const { toasts, dismissToast } = useData();
  return <ToastContainer toasts={toasts} onDismiss={dismissToast} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <DataProvider>
            {children}
            <ToastWrapper />
          </DataProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}


