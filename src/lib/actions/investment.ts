"use server";

import { revalidatePath } from "next/cache";

import { UserRole } from "@/constants/roles";
import { ApiError } from "@/lib/api/errors";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { DEFAULT_CURRENCY } from "@/constants/currency";
import { parseMajorToMinor } from "@/lib/money";
import {
  opportunityInputSchema,
  createInvestmentFormSchema,
} from "@/lib/validations/investment";
import {
  cancelOpportunity,
  closeOpportunity,
  openOpportunity,
  pauseOpportunity,
  upsertOpportunityForProject,
} from "@/services/opportunity.service";
import {
  createInvestment,
  getInvestorInvestment,
} from "@/services/investment.service";
import {
  createPaymentOrderForInvestment,
  verifyAndCompleteMockPayment,
} from "@/services/payment.service";

export type ActionState = {
  error?: string;
  success?: boolean;
  investmentId?: string;
  redirectUrl?: string;
};

function toError(error: unknown): ActionState {
  if (error instanceof AuthError || error instanceof ApiError) {
    return { error: error.message };
  }
  if (error && typeof error === "object" && "issues" in error) {
    const first = (error as { issues?: Array<{ message?: string }> }).issues?.[0];
    return { error: first?.message ?? "Invalid data." };
  }
  console.error("[investmentAction]", error);
  return { error: "Something went wrong. Please try again." };
}

function parseOptionalMoney(
  major: FormDataEntryValue | null,
  currency: string,
) {
  const value = String(major ?? "").trim();
  if (!value) return null;
  return {
    amountMinor: parseMajorToMinor(value, currency as "INR"),
    currency: currency as "INR",
  };
}

export async function saveOpportunityAction(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const admin = await requireRole(UserRole.ADMIN);
    await connectToDatabase();

    const currency = String(formData.get("currency") || DEFAULT_CURRENCY);
    const input = opportunityInputSchema.parse({
      currency,
      fundingTarget: parseOptionalMoney(formData.get("fundingTargetMajor"), currency),
      minimumInvestment: parseOptionalMoney(
        formData.get("minimumInvestmentMajor"),
        currency,
      ),
      maximumInvestment: parseOptionalMoney(
        formData.get("maximumInvestmentMajor"),
        currency,
      ),
      startDate: formData.get("startDate") || null,
      endDate: formData.get("endDate") || null,
    });

    await upsertOpportunityForProject(projectId, input, admin.id);
    revalidatePath(`/admin/projects/${projectId}/investment`);
    revalidatePath(`/admin/projects/${projectId}/edit`);
    return { success: true };
  } catch (error) {
    return toError(error);
  }
}

export async function openOpportunityAction(projectId: string): Promise<ActionState> {
  try {
    const admin = await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    await openOpportunity(projectId, admin.id);
    revalidatePath(`/admin/projects/${projectId}/investment`);
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    return toError(error);
  }
}

export async function pauseOpportunityAction(projectId: string): Promise<ActionState> {
  try {
    const admin = await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    await pauseOpportunity(projectId, admin.id);
    revalidatePath(`/admin/projects/${projectId}/investment`);
    return { success: true };
  } catch (error) {
    return toError(error);
  }
}

export async function closeOpportunityAction(projectId: string): Promise<ActionState> {
  try {
    const admin = await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    await closeOpportunity(projectId, admin.id);
    revalidatePath(`/admin/projects/${projectId}/investment`);
    return { success: true };
  } catch (error) {
    return toError(error);
  }
}

export async function cancelOpportunityAction(projectId: string): Promise<ActionState> {
  try {
    const admin = await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    await cancelOpportunity(projectId, admin.id);
    revalidatePath(`/admin/projects/${projectId}/investment`);
    return { success: true };
  } catch (error) {
    return toError(error);
  }
}

export async function createInvestmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const investor = await requireRole(UserRole.INVESTOR);
    await connectToDatabase();

    const parsed = createInvestmentFormSchema.parse({
      projectId: formData.get("projectId"),
      amountMajor: formData.get("amountMajor"),
    });

    const amountMinor = parseMajorToMinor(parsed.amountMajor);
    const investment = await createInvestment({
      projectId: parsed.projectId,
      investorId: investor.id,
      amountMinor,
    });

    const payment = await createPaymentOrderForInvestment(investment._id.toString());

    revalidatePath("/investor/investments");
    revalidatePath("/investor");

    return {
      success: true,
      investmentId: investment._id.toString(),
      redirectUrl: payment.checkout.redirectUrl,
    };
  } catch (error) {
    return toError(error);
  }
}

export async function completeMockPaymentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole(UserRole.INVESTOR);
    await connectToDatabase();

    const investmentId = String(formData.get("investmentId") || "");
    const providerOrderId = String(formData.get("providerOrderId") || "");
    const outcome = String(formData.get("outcome") || "success") as "success" | "failure";

    await verifyAndCompleteMockPayment({
      investmentId,
      providerOrderId,
      outcome,
    });

    revalidatePath("/investor/investments");
    revalidatePath(`/investor/investments/${investmentId}`);
    revalidatePath("/investor");
    revalidatePath("/admin/investments");

    return {
      success: true,
      investmentId,
      redirectUrl:
        outcome === "success"
          ? `/investor/investments/${investmentId}?paid=1`
          : `/investor/investments/${investmentId}?failed=1`,
    };
  } catch (error) {
    return toError(error);
  }
}

export async function resumePaymentAction(investmentId: string): Promise<ActionState> {
  try {
    const investor = await requireRole(UserRole.INVESTOR);
    await connectToDatabase();
    await getInvestorInvestment(investmentId, investor.id);
    const payment = await createPaymentOrderForInvestment(investmentId);
    revalidatePath(`/investor/investments/${investmentId}`);
    return {
      success: true,
      investmentId,
      redirectUrl: payment.checkout.redirectUrl,
    };
  } catch (error) {
    return toError(error);
  }
}
