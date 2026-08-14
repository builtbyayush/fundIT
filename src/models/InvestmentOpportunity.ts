import mongoose, { type Document, type Model, Schema, type Types } from "mongoose";

import { CurrencyCode, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "@/constants/currency";
import {
  OpportunityStatus,
  OPPORTUNITY_STATUSES,
} from "@/constants/opportunity-status";
import { moneyEmbedSchema, type IMoneyEmbed } from "@/models/shared/money";

export interface IInvestmentOpportunity {
  project: Types.ObjectId;
  status: OpportunityStatus;
  currency: CurrencyCode;
  fundingTarget?: IMoneyEmbed | null;
  minimumInvestment?: IMoneyEmbed | null;
  maximumInvestment?: IMoneyEmbed | null;
  startDate?: Date | null;
  endDate?: Date | null;
  termsVersion: number;
  committedAmountMinor: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvestmentOpportunityDocument
  extends IInvestmentOpportunity,
    Document {}

export type IInvestmentOpportunityModel = Model<IInvestmentOpportunityDocument>;

const investmentOpportunitySchema = new Schema<
  IInvestmentOpportunityDocument,
  IInvestmentOpportunityModel
>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: OPPORTUNITY_STATUSES,
        message: "Invalid opportunity status",
      },
      required: true,
      default: OpportunityStatus.DRAFT,
      index: true,
    },
    currency: {
      type: String,
      enum: SUPPORTED_CURRENCIES,
      required: true,
      default: DEFAULT_CURRENCY,
    },
    fundingTarget: { type: moneyEmbedSchema, default: null },
    minimumInvestment: { type: moneyEmbedSchema, default: null },
    maximumInvestment: { type: moneyEmbedSchema, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    termsVersion: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "termsVersion must be an integer",
      },
    },
    committedAmountMinor: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "committedAmountMinor must be an integer",
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

investmentOpportunitySchema.index({ status: 1, endDate: 1 });

export const InvestmentOpportunity =
  (mongoose.models.InvestmentOpportunity as IInvestmentOpportunityModel | undefined) ??
  mongoose.model<IInvestmentOpportunityDocument, IInvestmentOpportunityModel>(
    "InvestmentOpportunity",
    investmentOpportunitySchema,
  );
