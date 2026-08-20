import { Compass, HandCoins, Search } from "lucide-react";

import { Container, SectionHeading } from "@/components/shared/section-heading";

const steps = [
  {
    number: "01",
    icon: Compass,
    title: "Discover",
    description: "Find ideas you find interesting across products, projects, and categories.",
  },
  {
    number: "02",
    icon: Search,
    title: "Explore",
    description: "Learn about the product, people, and opportunity before you decide.",
  },
  {
    number: "03",
    icon: HandCoins,
    title: "Back",
    description: "Participate when the opportunity is open — on terms you can review first.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          align="left"
          eyebrow="How FundIt works"
          title="Curiosity, then clarity, then action"
          description="A simple path from spotting something interesting to backing it — with no invented return promises."
        />

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.number}
                className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-card"
              >
                <p className="text-meta text-primary">{step.number}</p>
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pastel-lavender text-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
