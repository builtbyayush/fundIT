/**
 * Idempotent category seed.
 *
 * Usage: npm run seed:categories
 *
 * Inserts the ten initial FundIt categories if they do not already exist by slug.
 * Does not overwrite categories that administrators may have modified.
 */
import { config as loadEnv } from "dotenv";

loadEnv();

async function seedCategories() {
  const { connectToDatabase, disconnectFromDatabase } = await import("../src/lib/db");
  const { Category } = await import("../src/models/Category");
  const { categories } = await import("../src/constants/categories");

  await connectToDatabase();

  let created = 0;
  let skipped = 0;

  for (const [index, item] of categories.entries()) {
    const existing = await Category.findOne({ slug: item.slug });
    if (existing) {
      skipped += 1;
      continue;
    }

    await Category.createCategory({
      name: item.name,
      slug: item.slug,
      description: item.description,
      icon: item.icon,
      isActive: true,
      displayOrder: index + 1,
    });
    created += 1;
  }

  console.log(`Categories seed complete. Created: ${created}. Skipped: ${skipped}.`);
  await disconnectFromDatabase();
  process.exit(0);
}

seedCategories().catch((error) => {
  console.error("Failed to seed categories.");
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
