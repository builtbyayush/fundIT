import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { siteConfig } from "@/config";
import { UserRole } from "@/constants/roles";

export async function CtaSection() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const isInvestor = session?.user?.role === UserRole.INVESTOR;
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center sm:px-16">
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="font-display text-3xl text-primary-foreground sm:text-4xl">
              Find something worth backing.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary-foreground/85">
              Explore projects, discover new ideas, and see what&apos;s happening on{" "}
              {siteConfig.name}.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/projects">
                  Explore opportunities
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              {isLoggedIn ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link
                    href={isAdmin ? "/admin" : isInvestor ? "/investor/investments" : "/investor"}
                  >
                    {isAdmin ? "Go to dashboard" : isInvestor ? "My investments" : "Go to dashboard"}
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="/signup">Join FundIt</Link>
                </Button>
              )}
            </div>
            <p className="mt-6 text-sm text-primary-foreground/70">
              FundIt does not guarantee investment returns.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
