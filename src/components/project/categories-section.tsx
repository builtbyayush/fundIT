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
import type { HomepageCategory } from "@/lib/homepage/discovery";
import {
  CATEGORY_PASTEL_CLASSES,
  pastelForCategorySlug,
} from "@/lib/project/category-pastel";
import { cn } from "@/lib/utils";

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

interface CategoriesSectionProps {
  categories: HomepageCategory[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section id="categories" className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          align="left"
          eyebrow="Browse"
          title="Find a world that interests you"
          description="Ten places to start — from gadgets and apps to nutrition, events, and research."
        />

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] ?? Folder;
            const pastel = pastelForCategorySlug(category.slug);
            const pastelClass = CATEGORY_PASTEL_CLASSES[pastel];

            return (
              <Link
                key={category.id}
                href={`/projects?category=${category.slug}`}
                className={cn(
                  "motion-safe-hover-lift group flex min-h-28 flex-col justify-between rounded-2xl p-5 shadow-soft",
                  pastelClass.surface,
                )}
                aria-label={`Browse ${category.name} category`}
              >
                <Icon
                  className="h-7 w-7 motion-safe-transition group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-sm font-semibold">{category.name}</h3>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
