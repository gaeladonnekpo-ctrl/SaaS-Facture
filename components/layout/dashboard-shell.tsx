"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { useAuth } from "@/lib/auth/context";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSupabaseConfigured() && !isLoading && !user) {
      router.push("/connexion");
    }
  }, [user, isLoading, router]);

  if (isSupabaseConfigured() && isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-forest-900 border-t-transparent mb-3" />
        <p className="text-xs font-semibold text-forest-950 dark:text-sage-200">Chargement de votre session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-3.5 sm:space-y-6 lg:space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}

