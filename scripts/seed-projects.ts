/**
 * Idempotent project seed for development.
 *
 * Usage: npm run seed:projects
 *
 * Requires seeded categories and at least one admin user.
 * Creates fictional sample opportunities and refreshes legacy seed content/media by slug.
 */
import { config as loadEnv } from "dotenv";

loadEnv();

import {
  demoProjectMedia,
  shouldRefreshSeededProject,
  type DemoMediaTheme,
} from "../src/lib/seed/project-media";

type SampleProject = {
  title: string;
  slug: string;
  categorySlugs: string[];
  primaryCategorySlug: string;
  status: "PUBLISHED" | "DRAFT" | "UNPUBLISHED" | "ARCHIVED";
  shortDescription: string;
  description: string;
  tags: string[];
  highlights: string[];
  location: { city?: string; state?: string; country?: string };
  website?: string;
  mediaTheme: DemoMediaTheme;
};

const SAMPLE_PROJECTS: SampleProject[] = [
  {
    title: "CareVision AI",
    slug: "medsense-clinical-assistant",
    categorySlugs: ["ai-in-healthcare", "software"],
    primaryCategorySlug: "ai-in-healthcare",
    status: "PUBLISHED",
    shortDescription:
      "An AI-assisted healthcare platform designed to help clinical teams organize patient information and surface relevant insights faster.",
    description:
      "CareVision AI is a fictional clinical intelligence platform built for care teams who need clearer visibility across patient records, care pathways, and operational handoffs. The product concept combines structured documentation, contextual alerts, and workflow-aware dashboards to reduce administrative friction without replacing clinical judgment.\n\nThis opportunity is presented as illustrative marketplace content for the FundIt platform.",
    tags: ["AI", "Healthcare", "Clinical Ops", "SaaS"],
    highlights: [
      "Structured clinical documentation with smart prompts",
      "Context-aware insight panels for care teams",
      "Integration-ready architecture for hospital systems",
      "Role-based workspaces for physicians and coordinators",
    ],
    location: { city: "Bengaluru", state: "Karnataka", country: "India" },
    website: "https://example.com/carevision",
    mediaTheme: "ai-health",
  },
  {
    title: "Orbit Task Workspace",
    slug: "orbit-task-workspace",
    categorySlugs: ["software", "apps"],
    primaryCategorySlug: "software",
    status: "PUBLISHED",
    shortDescription:
      "A collaborative workspace for distributed product teams managing complex delivery pipelines.",
    description:
      "Orbit Task Workspace is a fictional SaaS product concept for modern product organizations balancing roadmaps, async updates, and delivery accountability. Teams use Orbit to align milestones, track blockers, and maintain a shared source of truth across functions.\n\nThis listing represents a sample software opportunity on FundIt.",
    tags: ["SaaS", "Productivity", "B2B", "Collaboration"],
    highlights: [
      "Unified roadmap and delivery views",
      "Async status updates with team digests",
      "Automation rules for recurring workflows",
      "Role-based workspaces for cross-functional teams",
    ],
    location: { city: "Pune", state: "Maharashtra", country: "India" },
    website: "https://example.com/orbit",
    mediaTheme: "software",
  },
  {
    title: "SenseBand",
    slug: "pulseband-health-tracker",
    categorySlugs: ["gadgets", "ai-in-healthcare"],
    primaryCategorySlug: "gadgets",
    status: "DRAFT",
    shortDescription:
      "A connected wellness device designed to provide users with useful activity and recovery insights.",
    description:
      "SenseBand is a fictional wearable concept focused on recovery, activity balance, and daily wellness trends. The companion experience translates sensor data into practical insights users can act on between workouts and rest periods.\n\nThis draft project supports admin review workflows in development environments.",
    tags: ["Hardware", "Wellness", "Consumer", "Wearables"],
    highlights: [
      "Continuous recovery and activity scoring",
      "Low-power sensor architecture",
      "Companion mobile experience",
      "Privacy-first data controls",
    ],
    location: { city: "Hyderabad", state: "Telangana", country: "India" },
    mediaTheme: "gadgets",
  },
  {
    title: "NutriTrack",
    slug: "greenleaf-daily-nutrition",
    categorySlugs: ["nutrition", "software", "ai-in-healthcare"],
    primaryCategorySlug: "nutrition",
    status: "PUBLISHED",
    shortDescription:
      "A personalized nutrition platform combining dietary planning, food insights, and intelligent recommendations.",
    description:
      "NutriTrack is a fictional nutrition intelligence platform that helps people plan meals, understand macro balance, and build sustainable eating habits. The product concept blends diet planning tools, ingredient insights, and adaptive recommendations tailored to individual goals.\n\nThis opportunity is illustrative content for the FundIt investor experience.",
    tags: ["Nutrition", "Consumer", "Wellness", "Personalization"],
    highlights: [
      "Adaptive meal planning with dietary preferences",
      "Ingredient and macro transparency",
      "Weekly nutrition insights and progress views",
      "Mobile-first planning experience",
    ],
    location: { city: "Mumbai", state: "Maharashtra", country: "India" },
    website: "https://example.com/nutritrack",
    mediaTheme: "nutrition",
  },
  {
    title: "ScholarLink",
    slug: "campusforge-research-hub",
    categorySlugs: ["academics", "software"],
    primaryCategorySlug: "academics",
    status: "UNPUBLISHED",
    shortDescription:
      "An academic collaboration platform connecting research labs, mentors, and industry partners.",
    description:
      "ScholarLink is a fictional education technology platform designed to help research teams coordinate projects, share findings, and connect with mentors. The concept supports grant preparation, milestone tracking, and structured collaboration across institutions.\n\nThis unpublished project supports admin publishing workflows.",
    tags: ["Education", "Research", "Collaboration", "Platform"],
    highlights: [
      "Lab and project collaboration spaces",
      "Mentor matching and advisory workflows",
      "Grant-ready project templates",
      "Structured milestone tracking",
    ],
    location: { city: "Delhi", country: "India" },
    mediaTheme: "academics",
  },
  {
    title: "FieldKit",
    slug: "fieldkit-survey-app",
    categorySlugs: ["apps", "software"],
    primaryCategorySlug: "apps",
    status: "PUBLISHED",
    shortDescription:
      "A mobile survey and field data collection app for research and market teams.",
    description:
      "FieldKit is a fictional mobile research platform built for teams capturing structured data in the field. The product emphasizes offline reliability, validation at the point of capture, and clean handoff into analytics workflows.\n\nThis listing demonstrates a mobile-first opportunity on FundIt.",
    tags: ["Mobile", "Research", "Data", "Field Ops"],
    highlights: [
      "Offline-first survey capture",
      "Built-in quality validation rules",
      "Team dashboards for live progress",
      "Export-ready structured datasets",
    ],
    location: { city: "Chennai", state: "Tamil Nadu", country: "India" },
    mediaTheme: "apps",
  },
  {
    title: "LabCore Instruments",
    slug: "novaprint-fabrication-kit",
    categorySlugs: ["equipment", "ai-in-healthcare"],
    primaryCategorySlug: "equipment",
    status: "ARCHIVED",
    shortDescription:
      "Precision laboratory equipment designed for modern diagnostic and research environments.",
    description:
      "LabCore Instruments is a fictional equipment venture focused on compact, reliable lab systems for diagnostic and research teams. The product line concept emphasizes calibration accuracy, modular upgrades, and service-friendly design.\n\nThis archived listing supports admin lifecycle testing.",
    tags: ["Hardware", "Equipment", "Diagnostics", "Research"],
    highlights: [
      "Modular instrument architecture",
      "Calibration-aware operation workflows",
      "Compact footprint for modern labs",
      "Service-friendly component design",
    ],
    location: { city: "Ahmedabad", state: "Gujarat", country: "India" },
    mediaTheme: "equipment",
  },
  {
    title: "FormuLab Pro",
    slug: "formulab-pro",
    categorySlugs: ["formulations", "equipment"],
    primaryCategorySlug: "formulations",
    status: "PUBLISHED",
    shortDescription:
      "A formulation development platform for teams designing and testing new product compositions.",
    description:
      "FormuLab Pro is a fictional formulation lab platform that helps R&D teams document experiments, compare batches, and track ingredient interactions. The concept supports structured experimentation and reproducibility across product development cycles.\n\nThis opportunity showcases a formulations category listing on FundIt.",
    tags: ["Formulations", "R&D", "Lab Tech", "Quality"],
    highlights: [
      "Structured experiment and batch tracking",
      "Ingredient interaction documentation",
      "Versioned formulation histories",
      "Collaboration tools for lab teams",
    ],
    location: { city: "Hyderabad", state: "Telangana", country: "India" },
    website: "https://example.com/formulab",
    mediaTheme: "formulations",
  },
  {
    title: "FestConnect",
    slug: "festconnect",
    categorySlugs: ["events-festivals", "apps"],
    primaryCategorySlug: "events-festivals",
    status: "PUBLISHED",
    shortDescription:
      "An event operations platform for festivals, venues, and experience-led brands.",
    description:
      "FestConnect is a fictional event technology platform built to coordinate schedules, vendor workflows, and attendee experiences for large-scale festivals. Organizers gain a central command view while teams manage tasks across locations and time zones.\n\nThis listing represents an events and festivals opportunity on FundIt.",
    tags: ["Events", "Festivals", "Operations", "Mobile"],
    highlights: [
      "Centralized event command dashboard",
      "Vendor and schedule coordination tools",
      "Attendee communication workflows",
      "Real-time operational status views",
    ],
    location: { city: "Goa", country: "India" },
    website: "https://example.com/festconnect",
    mediaTheme: "events",
  },
  {
    title: "PageForge",
    slug: "pageforge",
    categorySlugs: ["publications", "software"],
    primaryCategorySlug: "publications",
    status: "PUBLISHED",
    shortDescription:
      "A digital publishing platform for independent creators, editorial teams, and niche media brands.",
    description:
      "PageForge is a fictional publishing platform concept that helps editorial teams launch subscription products, manage contributors, and distribute premium content across channels. The product focuses on creator-friendly tooling and audience growth workflows.\n\nThis opportunity illustrates a publications category listing on FundIt.",
    tags: ["Publishing", "Media", "Subscriptions", "Creator Tools"],
    highlights: [
      "Editorial workflow and contributor management",
      "Subscription and paywall tooling",
      "Audience analytics for niche media",
      "Multi-format content distribution",
    ],
    location: { city: "Kolkata", state: "West Bengal", country: "India" },
    website: "https://example.com/pageforge",
    mediaTheme: "publications",
  },
  {
    title: "SenseBand Go",
    slug: "senseband-go",
    categorySlugs: ["gadgets", "ai-in-healthcare"],
    primaryCategorySlug: "gadgets",
    status: "PUBLISHED",
    shortDescription:
      "A consumer wellness wearable focused on daily activity, sleep rhythm, and recovery awareness.",
    description:
      "SenseBand Go is a fictional connected wellness device designed for people who want practical health insights without complex dashboards. The product pairs a lightweight wearable with a focused mobile experience highlighting trends that matter day to day.\n\nThis published listing complements the SenseBand draft concept for discovery testing.",
    tags: ["Wearables", "Wellness", "Consumer", "Health"],
    highlights: [
      "Daily activity and recovery summaries",
      "Sleep rhythm trend tracking",
      "Lightweight, all-day wearable design",
      "Simple, action-oriented mobile insights",
    ],
    location: { city: "Bengaluru", state: "Karnataka", country: "India" },
    mediaTheme: "gadgets",
  },
];

function projectMediaPayload(theme: DemoMediaTheme) {
  const media = demoProjectMedia(theme);
  return {
    coverImage: media.coverImage,
    thumbnail: media.thumbnail,
    gallery: media.gallery,
  };
}

async function seedProjects() {
  const { connectToDatabase, disconnectFromDatabase } = await import("../src/lib/db");
  const { Category } = await import("../src/models/Category");
  const { Project } = await import("../src/models/Project");
  const { User } = await import("../src/models/User");
  const { UserRole } = await import("../src/constants/roles");
  const { ProjectStatus } = await import("../src/constants/project-status");

  await connectToDatabase();

  const admin = await User.findOne({ role: UserRole.ADMIN });
  if (!admin) {
    console.error("No admin user found. Run npm run seed:admin first.");
    await disconnectFromDatabase();
    process.exit(1);
  }

  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    console.error("No categories found. Run npm run seed:categories first.");
    await disconnectFromDatabase();
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const sample of SAMPLE_PROJECTS) {
    const categoryDocs = [];
    for (const slug of sample.categorySlugs) {
      const category = await Category.findOne({ slug });
      if (!category) {
        console.warn(`Skipping ${sample.slug}: category ${slug} not found.`);
        categoryDocs.length = 0;
        break;
      }
      categoryDocs.push(category);
    }

    if (categoryDocs.length === 0) {
      skipped += 1;
      continue;
    }

    const primary =
      categoryDocs.find((category) => category.slug === sample.primaryCategorySlug) ??
      categoryDocs[0];

    const status = ProjectStatus[sample.status];
    const media = projectMediaPayload(sample.mediaTheme);
    const payload = {
      title: sample.title,
      shortDescription: sample.shortDescription,
      description: sample.description,
      categories: categoryDocs.map((category) => category._id),
      primaryCategory: primary._id,
      status,
      tags: sample.tags,
      highlights: sample.highlights,
      location: sample.location,
      website: sample.website ?? null,
      ...media,
      video: null,
      publishedAt: status === ProjectStatus.PUBLISHED ? new Date() : null,
    };

    const existing = await Project.findOne({ slug: sample.slug });
    if (existing) {
      if (shouldRefreshSeededProject(existing)) {
        existing.set(payload);
        await existing.save();
        updated += 1;
      } else {
        skipped += 1;
      }
      continue;
    }

    await Project.create({
      slug: sample.slug,
      ...payload,
      createdBy: admin._id,
    });
    created += 1;
  }

  console.log(
    `Projects seed complete. Created: ${created}. Updated: ${updated}. Skipped: ${skipped}.`,
  );
  console.log("Note: Sample projects are fictional marketplace content for development.");
  await disconnectFromDatabase();
  process.exit(0);
}

seedProjects().catch((error) => {
  console.error("Failed to seed projects.");
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
