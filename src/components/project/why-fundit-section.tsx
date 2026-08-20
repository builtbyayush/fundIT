import { Container, SectionHeading } from "@/components/shared/section-heading";

const principles = [
  {
    title: "Accessible",
    description: "Start with what makes sense for you. Big ideas can begin with small backing.",
    pastel: "bg-pastel-peach text-pastel-peach-foreground",
  },
  {
    title: "Discoverable",
    description: "Find projects across categories — from apps and gadgets to nutrition and research.",
    pastel: "bg-pastel-blue text-pastel-blue-foreground",
  },
  {
    title: "Transparent",
    description: "Read the project story and available terms before you participate.",
    pastel: "bg-pastel-lavender text-pastel-lavender-foreground",
  },
  {
    title: "Human",
    description: "Back ideas you actually care about, not a ticker you don't recognize.",
    pastel: "bg-pastel-yellow text-pastel-yellow-foreground",
  },
] as const;

export function WhyFundItSection() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          align="left"
          eyebrow="Why FundIt"
          title="Ideas deserve a chance"
          description="FundIt is a place to discover products and opportunities — and to participate when you're ready."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {principles.map((principle) => (
            <article
              key={principle.title}
              className={`rounded-2xl p-6 shadow-soft ${principle.pastel}`}
            >
              <h3 className="text-lg font-semibold">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-80">{principle.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
