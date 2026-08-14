import mongoose, { type Document, type Model, Schema, type Types } from "mongoose";

import { CurrencyCode, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "@/constants/currency";
import { PaymentStatus, PAYMENT_STATUSES } from "@/constants/payment-status";

export interface IPaymentTransaction {
  investment: Types.ObjectId;
  paymentOrder: Types.ObjectId;
  provider: string;
  providerPaymentId: string;
  providerTransactionId?: string | null;
  amountMinor: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  failureCode?: string | null;
  failureMessage?: string | null;
  processedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentTransactionDocument extends IPaymentTransaction, Document {}

export type IPaymentTransactionModel = Model<IPaymentTransactionDocument>;

const paymentTransactionSchema = new Schema<
  IPaymentTransactionDocument,
  IPaymentTransactionModel
>(
  {
    investment: {
      type: Schema.Types.ObjectId,
      ref: "Investment",
      required: true,
      index: true,
    },
    paymentOrder: {
      type: Schema.Types.ObjectId,
      ref: "PaymentOrder",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    providerPaymentId: {
      type: String,
      required: true,
      trim: true,
    },
    providerTransactionId: {
      type: String,
      default: null,
      trim: true,
    },
    amountMinor: {
      type: Number,
      required: true,
      min: 1,
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
      enum: PAYMENT_STATUSES,
      required: true,
    },
    failureCode: { type: String, default: null },
    failureMessage: { type: String, default: null },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

paymentTransactionSchema.index(
  { provider: 1, providerPaymentId: 1 },
  { unique: true },
);

export const PaymentTransaction =
  (mongoose.models.PaymentTransaction as IPaymentTransactionModel | undefined) ??
  mongoose.model<IPaymentTransactionDocument, IPaymentTransactionModel>(
    "PaymentTransaction",
    paymentTransactionSchema,
  );
