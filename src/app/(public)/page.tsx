import { CategoriesSection } from "@/components/project/categories-section";
import { CtaSection } from "@/components/project/cta-section";
import { FeaturedOpportunitiesSection } from "@/components/project/featured-opportunities";
import { HeroSection } from "@/components/project/hero-section";
import { HowItWorksSection } from "@/components/project/how-it-works-section";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedOpportunitiesSection />
      <CategoriesSection />
      <HowItWorksSection />
      <CtaSection />
    </>
  );
}
