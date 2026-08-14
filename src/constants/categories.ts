export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

/**
 * Initial category seed data.
 * Used by `npm run seed:categories` and as a fallback when the database is unavailable.
 * Runtime category browsing prefers the MongoDB Category collection.
 */
export const categories: Category[] = [
  {
    id: "ai-healthcare",
    name: "AI in Healthcare",
    slug: "ai-in-healthcare",
    description: "AI-driven innovations transforming healthcare delivery and diagnostics.",
    icon: "brain-circuit",
  },
  {
    id: "apps",
    name: "Apps",
    slug: "apps",
    description: "Mobile and web applications with strong investment potential.",
    icon: "smartphone",
  },
  {
    id: "software",
    name: "Software",
    slug: "software",
    description: "Enterprise and consumer software solutions.",
    icon: "code",
  },
  {
    id: "gadgets",
    name: "Gadgets",
    slug: "gadgets",
    description: "Consumer electronics and innovative hardware devices.",
    icon: "cpu",
  },
  {
    id: "equipment",
    name: "Equipment",
    slug: "equipment",
    description: "Industrial and specialized equipment investments.",
    icon: "wrench",
  },
  {
    id: "nutrition",
    name: "Nutrition",
    slug: "nutrition",
    description: "Nutritional products and wellness innovations.",
    icon: "apple",
  },
  {
    id: "formulations",
    name: "Formulations",
    slug: "formulations",
    description: "Pharmaceutical and chemical formulation projects.",
    icon: "flask-conical",
  },
  {
    id: "events-festivals",
    name: "Events & Festivals",
    slug: "events-festivals",
    description: "Event-driven ventures and festival-based opportunities.",
    icon: "calendar-days",
  },
  {
    id: "academics",
    name: "Academics",
    slug: "academics",
    description: "Academic research and educational technology ventures.",
    icon: "graduation-cap",
  },
  {
    id: "publications",
    name: "Publications",
    slug: "publications",
    description: "Publishing platforms and content-driven investments.",
    icon: "book-open",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
