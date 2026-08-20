import { investorGreeting } from "@/lib/investor/greeting";

export function InvestorHero({ name }: { name: string }) {
  const greeting = investorGreeting(name);

  return (
    <header className="max-w-2xl space-y-3">
      <p className="text-meta text-primary">My FundIt</p>
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">{greeting.title}</h1>
      <p className="text-lg leading-relaxed text-muted-foreground">{greeting.subtitle}</p>
    </header>
  );
}
