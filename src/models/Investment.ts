import mongoose, { type Document, type Model, Schema, type Types } from "mongoose";

import { CurrencyCode, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "@/constants/currency";
import {
  InvestmentStatus,
  INVESTMENT_STATUSES,
} from "@/constants/investment-status";
import { PaymentStatus, PAYMENT_STATUSES } from "@/constants/payment-status";

export interface IInvestment {
  investmentNumber: string;
  investor: Types.ObjectId;
  opportunity: Types.ObjectId;
  project: Types.ObjectId;
  amountMinor: number;
  currency: CurrencyCode;
  status: InvestmentStatus;
  paymentStatus: PaymentStatus;
  paymentOrder?: Types.ObjectId | null;
  paymentTransaction?: Types.ObjectId | null;
  termsVersion: number;
  initiatedAt: Date;
  confirmedAt?: Date | null;
  cancelledAt?: Date | null;
  failedAt?: Date | null;
  refundedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvestmentDocument extends IInvestment, Document {}

export type IInvestmentModel = Model<IInvestmentDocument>;

const investmentSchema = new Schema<IInvestmentDocument, IInvestmentModel>(
  {
    investmentNumber: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
    },
    investor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    opportunity: {
      type: Schema.Types.ObjectId,
      ref: "InvestmentOpportunity",
      required: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    amountMinor: {
      type: Number,
      required: true,
      min: [1, "Investment amount must be positive"],
      validate: {
        validator: Number.isInteger,
        message: "Amount must be an integer minor unit",
      },
    },
    currency: {
      type: String,
      enum: SUPPORTED_CURRENCIES,
      required: true,
      default: DEFAULT_CURRENCY,
    },
    status: {
      type: String,
      enum: {
        values: INVESTMENT_STATUSES,
        message: "Invalid investment status",
      },
      required: true,
      default: InvestmentStatus.INITIATED,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: PAYMENT_STATUSES,
        message: "Invalid payment status",
      },
      required: true,
      default: PaymentStatus.NOT_STARTED,
    },
    paymentOrder: {
      type: Schema.Types.ObjectId,
      ref: "PaymentOrder",
      default: null,
    },
    paymentTransaction: {
      type: Schema.Types.ObjectId,
      ref: "PaymentTransaction",
      default: null,
    },
    termsVersion: {
      type: Number,
      required: true,
      min: 1,
    },
    initiatedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    confirmedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

investmentSchema.index({ investor: 1, createdAt: -1 });
investmentSchema.index({ status: 1, createdAt: -1 });

export const Investment =
  (mongoose.models.Investment as IInvestmentModel | undefined) ??
  mongoose.model<IInvestmentDocument, IInvestmentModel>("Investment", investmentSchema);
