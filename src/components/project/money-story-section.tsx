import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

export function MoneyStorySection() {
  return (
    <section className="py-6 sm:py-10">
      <Container>
        <div className="grid overflow-hidden rounded-3xl bg-pastel-peach lg:grid-cols-2">
          <div className="relative min-h-64 lg:min-h-[22rem]">
            <Image
              src="/marketing/money-editorial.jpg"
              alt="Hands holding a fan of banknotes"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14">
            <h2 className="font-display text-3xl text-pastel-peach-foreground sm:text-4xl">
              Your money can be part of an idea&apos;s journey.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-pastel-peach-foreground/80">
              FundIt is about participating in work you find interesting — not about chasing a
              promised outcome.
            </p>
            <Button className="mt-8 self-start" asChild>
              <Link href="/projects">
                Explore FundIt
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
