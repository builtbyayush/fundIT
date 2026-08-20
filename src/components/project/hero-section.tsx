import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { DecorativeBlob } from "@/components/shared/decorative-blob";
import { Container } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HomepageMinimum } from "@/lib/homepage/discovery";
import { formatMoneyCompact } from "@/lib/money";

interface HeroSectionProps {
  lowestMinimum?: HomepageMinimum | null;
}

export function HeroSection({ lowestMinimum = null }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <DecorativeBlob className="opacity-70" />
      <Container className="relative py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <h1 className="font-display text-3xl text-foreground sm:text-4xl lg:text-5xl">
              That&apos;s one small step from you,
              <br />
              one giant leap for an idea
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Be the change that changes healthcare
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild>
                <Link href="/projects">
                  Explore opportunities
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="#how-it-works">How it works</Link>
              </Button>
            </div>
          </div>

          <HeroCollage lowestMinimum={lowestMinimum} />
        </div>
      </Container>
    </section>
  );
}

function HeroCollage({ lowestMinimum }: { lowestMinimum: HomepageMinimum | null }) {
  const chipLabel = lowestMinimum
    ? `Starts at ${formatMoneyCompact(lowestMinimum)}`
    : "Start small";

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="relative aspect-[5/4] sm:aspect-[4/3]">
        <div className="absolute inset-y-[8%] left-[8%] right-[18%] overflow-hidden rounded-2xl bg-pastel-blue shadow-elevated">
          <Image
            src="/marketing/hero-product.jpg"
            alt="Wireless headphones on a studio backdrop"
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 480px"
            className="object-cover motion-safe-transition hover:scale-105"
          />
        </div>

        <div className="absolute -right-1 bottom-[18%] hidden w-[38%] overflow-hidden rounded-2xl border border-border/60 shadow-card sm:block">
          <div className="relative aspect-[4/3]">
            <Image
              src="/marketing/collage-lifestyle.jpg"
              alt="People collaborating around a table"
              fill
              sizes="180px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="absolute bottom-[6%] left-[4%] overflow-hidden rounded-2xl border border-border/40 shadow-soft">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24">
            <Image
              src="/marketing/collage-nutrition.jpg"
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="absolute right-[6%] top-[8%] rounded-2xl bg-pastel-peach px-3 py-2 shadow-card">
          <Badge variant="pastelMint">Ideas</Badge>
          <p className="mt-1 max-w-[8rem] text-xs leading-snug text-pastel-peach-foreground">
            Products, projects and opportunities
          </p>
        </div>

        <div className="absolute right-[12%] top-[42%] rounded-full bg-pastel-lavender px-4 py-2 shadow-soft motion-safe-float">
          <p className="text-sm font-semibold text-pastel-lavender-foreground">{chipLabel}</p>
        </div>
      </div>
    </div>
  );
}
