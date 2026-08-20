import { z } from "zod";

import { CurrencyCode, SUPPORTED_CURRENCIES } from "@/constants/currency";
import {
  OpportunityStatus,
  OPPORTUNITY_STATUSES,
} from "@/constants/opportunity-status";

const currencySchema = z.enum(
  SUPPORTED_CURRENCIES as [CurrencyCode, ...CurrencyCode[]],
);

const moneySchema = z.object({
  amountMinor: z.number().int().positive("Amount must be a positive integer"),
  currency: currencySchema,
});

const optionalMoneySchema = moneySchema.nullable().optional();

export const opportunityInputSchema = z
  .object({
    currency: currencySchema.default(CurrencyCode.INR),
    fundingTarget: optionalMoneySchema,
    minimumInvestment: optionalMoneySchema,
    maximumInvestment: optionalMoneySchema,
    startDate: z.coerce.date().nullable().optional(),
    endDate: z.coerce.date().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fundingTarget && data.fundingTarget.currency !== data.currency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Funding target currency must match opportunity currency",
        path: ["fundingTarget", "currency"],
      });
    }
    if (data.minimumInvestment && data.minimumInvestment.currency !== data.currency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum investment currency must match opportunity currency",
        path: ["minimumInvestment", "currency"],
      });
    }
    if (data.maximumInvestment && data.maximumInvestment.currency !== data.currency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum investment currency must match opportunity currency",
        path: ["maximumInvestment", "currency"],
      });
    }
    if (
      data.minimumInvestment &&
      data.maximumInvestment &&
      data.minimumInvestment.amountMinor > data.maximumInvestment.amountMinor
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum investment cannot exceed maximum investment",
        path: ["minimumInvestment"],
      });
    }
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be before end date",
        path: ["endDate"],
      });
    }
  });

export type OpportunityInput = z.infer<typeof opportunityInputSchema>;

export const opportunityStatusSchema = z.enum(
  OPPORTUNITY_STATUSES as [OpportunityStatus, ...OpportunityStatus[]],
);

export const createInvestmentSchema = z.object({
  projectId: z.string().min(1),
  amountMinor: z.number().int().positive("Amount must be a positive integer"),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;

export const createInvestmentFormSchema = z.object({
  projectId: z.string().min(1),
  amountMajor: z.string().min(1, "Amount is required"),
});

export const investorInvestmentStatusFilterSchema = z.enum([
  "all",
  "confirmed",
  "pending",
  "failed",
]);

export type InvestorInvestmentStatusFilter = z.infer<
  typeof investorInvestmentStatusFilterSchema
>;

export const investorInvestmentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  status: investorInvestmentStatusFilterSchema.catch("all").default("all"),
  search: z.string().trim().optional().default(""),
});

export type InvestorInvestmentListQuery = z.infer<
  typeof investorInvestmentListQuerySchema
>;

export const adminInvestmentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().default(""),
  status: z.string().trim().optional().default(""),
  paymentStatus: z.string().trim().optional().default(""),
});
