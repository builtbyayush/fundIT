import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lightbulb, Wallet } from "lucide-react";

import { Container } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { HomepageMinimum } from "@/lib/homepage/discovery";
import { formatMoneyCompact } from "@/lib/money";

interface StartSmallSectionProps {
  lowestMinimum?: HomepageMinimum | null;
}

export function StartSmallSection({ lowestMinimum = null }: StartSmallSectionProps) {
  return (
    <section className="py-6 sm:py-10">
      <Container>
        <div className="overflow-hidden rounded-3xl bg-pastel-mint px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-meta text-pastel-mint-foreground/80">Accessible backing</p>
              <h2 className="mt-3 font-display text-3xl text-pastel-mint-foreground sm:text-4xl">
                You don&apos;t have to start big.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-pastel-mint-foreground/80">
                Interesting ideas aren&apos;t only for people with deep pockets. Discover
                something you care about, then participate if the opportunity is open.
              </p>
              <Button className="mt-8" asChild>
                <Link href="/projects">
                  Explore opportunities
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface-elevated p-5 shadow-card">
                <Wallet className="h-6 w-6 text-primary" aria-hidden="true" />
                <p className="mt-3 text-meta text-muted-foreground">Small backing</p>
                {lowestMinimum ? (
                  <>
                    <p className="text-meta mt-3 text-muted-foreground">Starts from</p>
                    <p className="font-display text-3xl text-foreground">
                      {formatMoneyCompact(lowestMinimum)}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 font-display text-2xl text-foreground">Start small</p>
                )}
              </div>

              <div className="rounded-2xl bg-pastel-lavender p-5 shadow-card">
                <Lightbulb className="h-6 w-6 text-primary" aria-hidden="true" />
                <p className="mt-3 text-meta text-pastel-lavender-foreground/70">Big idea</p>
                <p className="mt-2 text-sm leading-relaxed text-pastel-lavender-foreground">
                  A product or project worth a closer look.
                </p>
                <div className="relative mt-4 h-20 overflow-hidden rounded-xl">
                  <Image
                    src="/marketing/collage-nutrition.jpg"
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
