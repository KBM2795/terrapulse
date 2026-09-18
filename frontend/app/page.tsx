import React from "react";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { BentoGrid } from "@/components/landing/bento-grid";
import { InteractivePreview } from "@/components/landing/interactive-preview";
import { FounderQuote } from "@/components/landing/founder-quote";
import { RootedValues } from "@/components/landing/rooted-values";
import { SitesPreview } from "@/components/landing/sites-preview";
import { ReviewerTour } from "@/components/landing/reviewer-tour";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F9FAF5] text-[#111827] dark:bg-[#161A12] dark:text-[#F3F5EC] flex flex-col selection:bg-[#EBF1B1] selection:text-[#3D422E] transition-colors duration-200">
      {/* Floating Capsule Navbar */}
      <Navbar />

      {/* Main Content Flow */}
      <main className="flex-1">
        {/* 1. Hero Section with Green Roots Style Display Card */}
        <HeroSection />

        {/* 2. Bento Grid strictly matching the reference layout */}
        <BentoGrid />

        {/* 3. Interactive Environmental Health Index (EHI) Simulator */}
        <InteractivePreview />

        {/* 4. Founder Quote & Vision Section */}
        <FounderQuote />

        {/* 5. "Rooted in Precision & Ecology" 2x2 Values Section */}
        <RootedValues />

        {/* 6. Active Monitoring Sites Across the Globe */}
        <SitesPreview />

        {/* 7. Evaluator & Reviewer 1-Click Tour */}
        <ReviewerTour />
      </main>

      {/* Dark Forest Footer */}
      <Footer />
    </div>
  );
}
