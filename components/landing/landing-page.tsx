"use client";

import React from "react";
import "@/styles/landing.css";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingProblems } from "./landing-problems";
import { LandingFeatures } from "./landing-features";
import { LandingHowItWorks } from "./landing-how-it-works";
import { LandingTestimonials } from "./landing-testimonials";
import { LandingPricing } from "./landing-pricing";
import { LandingFAQ } from "./landing-faq";
import { LandingFinalCTA } from "./landing-final-cta";
import { LandingFooter } from "./landing-footer";
import type { User } from "@supabase/supabase-js";

interface LandingPageProps {
  user?: User | null;
  isLoading?: boolean;
}

export function LandingPage({ user, isLoading = false }: LandingPageProps) {
  return (
    <div className="landing-page min-h-screen flex flex-col selection:bg-lime-300 selection:text-forest-950">
      {/* 1. Navigation Header */}
      <LandingHeader user={user} />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        {/* 2. Hero Section with Mockup & Floating Card */}
        <LandingHero user={user} />

        {/* 3. Problem Section ("Pourquoi nous") */}
        <LandingProblems />

        {/* 4. Features Section ("Fonctionnalités") */}
        <LandingFeatures />

        {/* 5. How It Works Section ("Comment ça marche ?") */}
        <LandingHowItWorks />

        {/* 6. Testimonials Section ("Témoignages") */}
        <LandingTestimonials />

        {/* 7. Pricing Section ("Tarifs") */}
        <LandingPricing />

        {/* 8. FAQ Section */}
        <LandingFAQ />

        {/* 9. Final CTA Banner */}
        <LandingFinalCTA user={user} />
      </main>

      {/* 10. Footer */}
      <LandingFooter />
    </div>
  );
}
