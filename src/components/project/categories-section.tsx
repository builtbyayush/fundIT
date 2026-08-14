import Link from "next/link";
import {
  Apple,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Code,
  Cpu,
  FlaskConical,
  Folder,
  GraduationCap,
  Smartphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Container, SectionHeading } from "@/components/shared/section-heading";
import { categories as seedCategories } from "@/constants/categories";
import { connectToDatabase } from "@/lib/db";
import { listActiveCategories, serializeCategory } from "@/services/category.service";

const iconMap: Record<string, LucideIcon> = {
  "brain-circuit": BrainCircuit,
  smartphone: Smartphone,
  code: Code,
  cpu: Cpu,
  wrench: Wrench,
  apple: Apple,
  "flask-conical": FlaskConical,
  "calendar-days": CalendarDays,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  folder: Folder,
};

export async function CategoriesSection() {
  let categories = seedCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
  }));

  try {
    await connectToDatabase();
    const dbCategories = await listActiveCategories();
    if (dbCategories.length > 0) {
      categories = dbCategories.map(serializeCategory).map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
      }));
    }
  } catch {
    // Fall back to static seed configuration when DB is unavailable.
  }

  return (
    <section id="categories" className="border-y bg-muted/20 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Categories"
          title="Browse by Category"
          description="Explore investment opportunities across diverse sectors and industries."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] ?? Folder;
            return (
              <Link
                key={category.id}
                href={`/projects?category=${category.slug}`}
                className="group flex flex-col items-center rounded-xl border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md"
                aria-label={`Browse ${category.name} category`}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary/20">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {category.description}
                </p>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
