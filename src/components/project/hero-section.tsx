import Link from "next/link";
import { ArrowRight, Search, Shield, TrendingUp } from "lucide-react";

import { Container } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/30">
      <Container className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-accent">
            Investment discovery
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Discover curated investment opportunities across sectors. Explore project details,
            review investment terms when available, and track your commitments — without
            invented return promises.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/projects">
                Explore Opportunities
                <ArrowRight className="ml-1" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#how-it-works">How It Works</Link>
            </Button>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Search,
                label: "Discover",
                desc: "Browse published opportunities by category",
              },
              {
                icon: Shield,
                label: "Review",
                desc: "Read project details and investment terms",
              },
              {
                icon: TrendingUp,
                label: "Commit",
                desc: "Invest when an opportunity is open",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-lg border bg-card p-4 shadow-sm">
                <Icon className="mx-auto mb-2 h-6 w-6 text-primary" aria-hidden="true" />
                <p className="font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
