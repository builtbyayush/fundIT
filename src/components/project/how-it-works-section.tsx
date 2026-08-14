import { Container, FeatureCard, SectionHeading } from "@/components/shared/section-heading";
import { FileSearch, HandCoins, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: FileSearch,
    title: "Discover Opportunities",
    description:
      "Browse curated investment projects across multiple categories, each vetted by FundIt administrators.",
  },
  {
    icon: ShieldCheck,
    title: "Review & Evaluate",
    description:
      "Access detailed project information, financials, and documentation to make informed investment decisions.",
  },
  {
    icon: HandCoins,
    title: "Invest with Confidence",
    description:
      "Participate in promising ventures through a secure, transparent investment process.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Process"
          title="How FundIt Works"
          description="A streamlined path from discovery to investment, built for modern investors."
        />

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <span
                className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <FeatureCard {...step} className="pt-8" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
