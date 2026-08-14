import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import { normalizeEmail } from "@/lib/auth/password";
import { User } from "@/models/User";

/** Development-only password shared by all demo investor accounts. */
export const DEFAULT_DEMO_INVESTOR_PASSWORD = "FundIt@Demo123";

export interface DemoInvestorDefinition {
  name: string;
  email: string;
  avatarBackground: string;
}

export const DEMO_INVESTOR_DEFINITIONS: readonly DemoInvestorDefinition[] = [
  {
    name: "Rahul Sharma",
    email: "demo.investor1@fundit.local",
    avatarBackground: "0D9488",
  },
  {
    name: "Priya Mehta",
    email: "demo.investor2@fundit.local",
    avatarBackground: "7C3AED",
  },
  {
    name: "Arjun Kapoor",
    email: "demo.investor3@fundit.local",
    avatarBackground: "2563EB",
  },
] as const;

export type DemoInvestorSeedResult = {
  name: string;
  email: string;
  status: "created" | "existing";
};

export function getDemoInvestorPassword(): string {
  return process.env.DEMO_INVESTOR_PASSWORD?.trim() || DEFAULT_DEMO_INVESTOR_PASSWORD;
}

/**
 * Deterministic initials-based placeholder avatar (ui-avatars.com).
 * Does not use real photographs.
 */
export function buildDemoInvestorAvatarUrl(definition: DemoInvestorDefinition): string {
  const params = new URLSearchParams({
    name: definition.name,
    background: definition.avatarBackground,
    color: "ffffff",
    size: "128",
    bold: "true",
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

export function assertDemoSeedAllowed(): void {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error(
      "Demo seed is blocked in production. Set ALLOW_DEMO_SEED=true to run manually.",
    );
  }
}

export async function seedDemoInvestors(): Promise<DemoInvestorSeedResult[]> {
  const password = getDemoInvestorPassword();

  if (password.length < 8) {
    throw new Error("DEMO_INVESTOR_PASSWORD must be at least 8 characters.");
  }

  const results: DemoInvestorSeedResult[] = [];

  for (const definition of DEMO_INVESTOR_DEFINITIONS) {
    const normalizedEmail = normalizeEmail(definition.email);
    const existing = await User.findByEmail(normalizedEmail);

    if (existing) {
      if (existing.role !== UserRole.INVESTOR) {
        throw new Error(
          `Cannot seed demo investor ${normalizedEmail}: account exists with role ${existing.role}.`,
        );
      }

      results.push({
        name: existing.name,
        email: existing.email,
        status: "existing",
      });
      continue;
    }

    const user = await User.createInvestor({
      name: definition.name,
      email: normalizedEmail,
      password,
    });

    user.avatar = buildDemoInvestorAvatarUrl(definition);
    await user.save();

    if (user.role !== UserRole.INVESTOR || user.status !== UserStatus.ACTIVE) {
      throw new Error(`Demo investor ${normalizedEmail} was created with unexpected role/status.`);
    }

    results.push({
      name: user.name,
      email: user.email,
      status: "created",
    });
  }

  return results;
}

export function formatDemoInvestorSummary(
  results: DemoInvestorSeedResult[],
  password: string,
): string {
  const lines = [
    "FundIt Development Investors",
    "────────────────────────────────────",
    "",
    "Created / Existing:",
    "",
  ];

  results.forEach((result, index) => {
    lines.push(`${index + 1}. ${result.name}`);
    lines.push(`   Email: ${result.email}`);
    lines.push(`   Status: ${result.status === "created" ? "Created" : "Already exists"}`);
    lines.push("");
  });

  lines.push(`Password (development only): ${password}`);
  lines.push("");
  lines.push("All accounts:");
  lines.push("Role: INVESTOR");
  lines.push("Status: ACTIVE");
  lines.push("");
  lines.push("⚠  Fictional development credentials — never use in production.");

  return lines.join("\n");
}
