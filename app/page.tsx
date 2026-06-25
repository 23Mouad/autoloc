"use client";

import HeroContent from "@/components/hero/HeroContent";
import QuickSearch from "@/components/sections/QuickSearch";
import FeaturedCars from "@/components/sections/FeaturedCars";
import HowItWorks from "@/components/sections/HowItWorks";
import WhyUs from "@/components/sections/WhyUs";
import Testimonials from "@/components/sections/Testimonials";
import CTA from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <>
      {/* Hero — Dark with car image */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background with subtle glow effects */}
        <div className="absolute inset-0 bg-bg-primary" />
        {/* Top-right subtle light glow */}
        <div
          className="absolute top-0 right-0 w-[60%] h-[60%] opacity-20"
          style={{
            background: "radial-gradient(ellipse at 80% 20%, rgba(193,233,48,0.15) 0%, transparent 60%)",
          }}
        />
        {/* Bottom-left subtle light glow */}
        <div
          className="absolute bottom-0 left-0 w-[40%] h-[50%] opacity-10"
          style={{
            background: "radial-gradient(ellipse at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 60%)",
          }}
        />
        <HeroContent />
      </section>

      {/* Quick Search */}
      <QuickSearch />

      {/* Featured Cars */}
      <FeaturedCars />

      {/* How It Works */}
      <HowItWorks />

      {/* Why Choose Us */}
      <WhyUs />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA */}
      <CTA />
    </>
  );
}
