import type { Metadata } from "next";

import {
  ContactSection,
  FloatingWhatsapp,
  HeroSection,
  PricingSection,
  ServicesSection,
  SiteHeader,
} from "@/components";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="px-6 py-14 sm:px-10 lg:px-16">
        <HeroSection />
        <ServicesSection />
        <PricingSection />
        <ContactSection />
      </main>

      <FloatingWhatsapp />
    </>
  );
}
