import { describe, expect, it } from "vitest";

import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import { OpportunityStatus } from "@/constants/opportunity-status";
import { getInvestmentCtaState } from "@/lib/project/investment-cta";
import type { SessionUser } from "@/types";

const slug = "solar-lanterns";

function user(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: "user-1",
    name: "Ada",
    email: "ada@example.com",
    role: UserRole.INVESTOR,
    status: UserStatus.ACTIVE,
    ...overrides,
  };
}

describe("getInvestmentCtaState", () => {
  it("sends guests to login with a safe invest callback", () => {
    expect(
      getInvestmentCtaState({
        investable: true,
        status: OpportunityStatus.OPEN,
        slug,
        user: null,
      }),
    ).toEqual({
      kind: "link",
      href: `/login?callbackUrl=${encodeURIComponent("/projects/solar-lanterns/invest")}`,
      label: "Back this idea",
    });
  });

  it("sends active investors to the invest path", () => {
    expect(
      getInvestmentCtaState({
        investable: true,
        status: OpportunityStatus.OPEN,
        slug,
        user: user(),
      }),
    ).toEqual({
      kind: "link",
      href: "/projects/solar-lanterns/invest",
      label: "Back this idea",
    });
  });

  it("disables the CTA for the wrong role or an inactive account", () => {
    expect(
      getInvestmentCtaState({
        investable: true,
        status: OpportunityStatus.OPEN,
        slug,
        user: user({ role: UserRole.ADMIN }),
      }),
    ).toEqual({ kind: "disabled", label: "Investor account required" });

    expect(
      getInvestmentCtaState({
        investable: true,
        status: OpportunityStatus.OPEN,
        slug,
        user: user({ status: UserStatus.INACTIVE }),
      }),
    ).toEqual({ kind: "disabled", label: "Account not active" });
  });

  it("labels a closed opportunity", () => {
    expect(
      getInvestmentCtaState({
        investable: false,
        status: OpportunityStatus.CLOSED,
        slug,
        user: null,
      }),
    ).toEqual({ kind: "disabled", label: "Opportunity closed" });
  });

  it("labels missing or other opportunities as not open", () => {
    expect(
      getInvestmentCtaState({
        investable: false,
        status: OpportunityStatus.PAUSED,
        slug,
        user: null,
      }),
    ).toEqual({ kind: "disabled", label: "Not open for participation" });

    expect(
      getInvestmentCtaState({
        investable: false,
        status: null,
        slug,
        user: null,
      }),
    ).toEqual({ kind: "disabled", label: "Not open for participation" });
  });
});
