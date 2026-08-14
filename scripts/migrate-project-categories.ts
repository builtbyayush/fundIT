/**
 * Idempotent migration: Project.category → categories[] + primaryCategory.
 *
 * Usage: npm run migrate:project-categories
 *
 * - Projects already migrated (categories + primaryCategory) are skipped.
 * - Legacy `category` is copied into categories/primaryCategory, then unset.
 */
import { config as loadEnv } from "dotenv";

loadEnv();

async function migrateProjectCategories() {
  const { connectToDatabase, disconnectFromDatabase } = await import("../src/lib/db");
  const { Project } = await import("../src/models/Project");

  await connectToDatabase();

  const cursor = Project.collection.find({});
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for await (const doc of cursor) {
    const hasCategories =
      Array.isArray(doc.categories) && doc.categories.length > 0 && doc.primaryCategory;

    if (hasCategories) {
      // Clean leftover legacy field if present
      if (doc.category != null) {
        await Project.collection.updateOne(
          { _id: doc._id },
          { $unset: { category: "" } },
        );
      }
      skipped += 1;
      continue;
    }

    const legacyCategory = doc.category;
    if (!legacyCategory) {
      console.warn(
        `Skipping project ${String(doc._id)} (${doc.slug ?? "no-slug"}): no legacy category and not migrated.`,
      );
      failed += 1;
      continue;
    }

    await Project.collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          categories: [legacyCategory],
          primaryCategory: legacyCategory,
        },
        $unset: { category: "" },
      },
    );
    migrated += 1;
  }

  console.log(
    `Project category migration complete. Migrated: ${migrated}. Skipped: ${skipped}. Failed: ${failed}.`,
  );

  await disconnectFromDatabase();
  process.exit(failed > 0 ? 1 : 0);
}

migrateProjectCategories().catch((error) => {
  console.error("Failed to migrate project categories.");
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
