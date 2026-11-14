"use client";

import React from "react";
import { LandingPage } from "@/components/landing/landing-page";
import { useAuth } from "@/lib/auth/context";

export default function RootHomePage() {
  const { user, isLoading } = useAuth();

  return <LandingPage user={user} isLoading={isLoading} />;
}
