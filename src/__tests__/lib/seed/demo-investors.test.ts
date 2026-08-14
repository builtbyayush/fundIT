import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import {
  assertDemoSeedAllowed,
  buildDemoInvestorAvatarUrl,
  DEFAULT_DEMO_INVESTOR_PASSWORD,
  DEMO_INVESTOR_DEFINITIONS,
  formatDemoInvestorSummary,
  getDemoInvestorPassword,
  seedDemoInvestors,
} from "@/lib/seed/demo-investors";
import { normalizeEmail } from "@/lib/auth/password";

const findByEmailMock = vi.fn();
const createInvestorMock = vi.fn();

vi.mock("@/models/User", () => ({
  User: {
    findByEmail: (...args: unknown[]) => findByEmailMock(...args),
    createInvestor: (...args: unknown[]) => createInvestorMock(...args),
  },
}));

describe("demo investor seed", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    findByEmailMock.mockReset();
    createInvestorMock.mockReset();
  });

  it("defines three fictional demo investors", () => {
    expect(DEMO_INVESTOR_DEFINITIONS).toHaveLength(3);
    expect(DEMO_INVESTOR_DEFINITIONS.map((item) => item.email)).toEqual([
      "demo.investor1@fundit.local",
      "demo.investor2@fundit.local",
      "demo.investor3@fundit.local",
    ]);
  });

  it("uses the documented development password by default", () => {
    expect(getDemoInvestorPassword()).toBe(DEFAULT_DEMO_INVESTOR_PASSWORD);
    expect(DEFAULT_DEMO_INVESTOR_PASSWORD).toBe("FundIt@Demo123");
  });

  it("allows overriding the development password via env", () => {
    vi.stubEnv("DEMO_INVESTOR_PASSWORD", "OverrideDemo123");
    expect(getDemoInvestorPassword()).toBe("OverrideDemo123");
  });

  it("builds deterministic initials-based avatar URLs", () => {
    const url = buildDemoInvestorAvatarUrl(DEMO_INVESTOR_DEFINITIONS[0]);
    expect(url).toContain("ui-avatars.com/api/");
    expect(url).toContain("name=Rahul+Sharma");
    expect(url).toContain("background=0D9488");
  });

  it("blocks demo seed in production without ALLOW_DEMO_SEED", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.ALLOW_DEMO_SEED;
    expect(() => assertDemoSeedAllowed()).toThrow(/blocked in production/i);
  });

  it("allows demo seed in production when ALLOW_DEMO_SEED=true", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOW_DEMO_SEED", "true");
    expect(() => assertDemoSeedAllowed()).not.toThrow();
  });

  it("creates investors with normalized emails and investor role", async () => {
    findByEmailMock.mockResolvedValue(null);
    createInvestorMock.mockImplementation(async (input: { name: string; email: string }) => ({
      name: input.name,
      email: normalizeEmail(input.email),
      role: UserRole.INVESTOR,
      status: UserStatus.ACTIVE,
      avatar: null,
      save: vi.fn().mockResolvedValue(undefined),
    }));

    const results = await seedDemoInvestors();

    expect(results).toHaveLength(3);
    expect(results.every((item) => item.status === "created")).toBe(true);
    expect(createInvestorMock).toHaveBeenCalledTimes(3);
    expect(createInvestorMock.mock.calls[0][0].email).toBe("demo.investor1@fundit.local");
    expect(createInvestorMock.mock.calls[0][0].password).toBe(DEFAULT_DEMO_INVESTOR_PASSWORD);
  });

  it("does not create duplicate investors on repeated runs", async () => {
    findByEmailMock.mockImplementation(async (email: string) => {
      if (email === "demo.investor1@fundit.local") {
        return {
          name: "Rahul Sharma",
          email,
          role: UserRole.INVESTOR,
          status: UserStatus.ACTIVE,
        };
      }
      return null;
    });

    createInvestorMock.mockImplementation(async (input: { name: string; email: string }) => ({
      name: input.name,
      email: normalizeEmail(input.email),
      role: UserRole.INVESTOR,
      status: UserStatus.ACTIVE,
      avatar: null,
      save: vi.fn().mockResolvedValue(undefined),
    }));

    const results = await seedDemoInvestors();

    expect(createInvestorMock).toHaveBeenCalledTimes(2);
    expect(results.filter((item) => item.status === "existing")).toHaveLength(1);
    expect(results.filter((item) => item.status === "created")).toHaveLength(2);
  });

  it("prints a development summary without password hashes", () => {
    const summary = formatDemoInvestorSummary(
      [{ name: "Rahul Sharma", email: "demo.investor1@fundit.local", status: "created" }],
      DEFAULT_DEMO_INVESTOR_PASSWORD,
    );

    expect(summary).toContain("FundIt Development Investors");
    expect(summary).toContain("demo.investor1@fundit.local");
    expect(summary).toContain("FundIt@Demo123");
    expect(summary).not.toMatch(/\$2[aby]\$/);
  });
});
