import type { Metadata } from "next";

import { CategoriesSection } from "@/components/project/categories-section";
import { CtaSection } from "@/components/project/cta-section";
import {
  FeaturedOpportunitiesSection,
  WorthALookSection,
} from "@/components/project/featured-opportunities";
import { HeroSection } from "@/components/project/hero-section";
import { HowItWorksSection } from "@/components/project/how-it-works-section";
import { MoneyStorySection } from "@/components/project/money-story-section";
import { StartSmallSection } from "@/components/project/start-small-section";
import { TrustNoteSection } from "@/components/project/trust-note-section";
import { WhyFundItSection } from "@/components/project/why-fundit-section";
import { siteConfig } from "@/config";
import { getHomepageDiscoveryData } from "@/lib/homepage/discovery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} — One small step from you, one giant leap for an idea`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} — One small step from you, one giant leap for an idea`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — One small step from you, one giant leap for an idea`,
    description: siteConfig.description,
  },
};

export default async function HomePage() {
  const data = await getHomepageDiscoveryData();

  return (
    <>
      <HeroSection lowestMinimum={data.lowestMinimum} />
      <FeaturedOpportunitiesSection projects={data.showcase} summaries={data.summaries} />
      <StartSmallSection lowestMinimum={data.lowestMinimum} />
      {data.worthALook.length > 0 ? (
        <WorthALookSection projects={data.worthALook} summaries={data.summaries} />
      ) : null}
      <CategoriesSection categories={data.categories} />
      <HowItWorksSection />
      <WhyFundItSection />
      <MoneyStorySection />
      <TrustNoteSection />
      <CtaSection />
    </>
  );
}
