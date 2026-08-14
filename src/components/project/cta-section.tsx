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
    <section className="py-20 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 text-center sm:px-16">
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to discover your next opportunity?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              {isLoggedIn
                ? `Browse curated projects on ${siteConfig.name} and follow opportunities that match your interests. FundIt does not guarantee investment returns.`
                : `Create a ${siteConfig.name} investor account to explore curated projects and follow opportunities that match your interests. FundIt does not guarantee investment returns.`}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isLoggedIn ? (
                <>
                  <Button variant="secondary" size="lg" asChild>
                    <Link href="/projects">
                      Explore Opportunities
                      <ArrowRight className="ml-1" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                    asChild
                  >
                    <Link
                      href={
                        isAdmin
                          ? "/admin"
                          : isInvestor
                            ? "/investor/investments"
                            : "/investor"
                      }
                    >
                      {isAdmin
                        ? "Go to dashboard"
                        : isInvestor
                          ? "My investments"
                          : "Go to dashboard"}
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" size="lg" asChild>
                    <Link href="/signup">
                      Create Investor Account
                      <ArrowRight className="ml-1" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                    asChild
                  >
                    <Link href="/projects">Explore Opportunities</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
