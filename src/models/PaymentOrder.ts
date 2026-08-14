import mongoose, { type Document, type Model, Schema, type Types } from "mongoose";

import { CurrencyCode, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "@/constants/currency";
import { PaymentStatus, PAYMENT_STATUSES } from "@/constants/payment-status";

export interface IPaymentOrder {
  investment: Types.ObjectId;
  provider: string;
  providerOrderId: string;
  amountMinor: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentOrderDocument extends IPaymentOrder, Document {}

export type IPaymentOrderModel = Model<IPaymentOrderDocument>;

const paymentOrderSchema = new Schema<IPaymentOrderDocument, IPaymentOrderModel>(
  {
    investment: {
      type: Schema.Types.ObjectId,
      ref: "Investment",
      required: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    providerOrderId: {
      type: String,
      required: true,
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
      default: PaymentStatus.CREATED,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

paymentOrderSchema.index({ provider: 1, providerOrderId: 1 }, { unique: true });
paymentOrderSchema.index(
  { investment: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [PaymentStatus.CREATED, PaymentStatus.PENDING] },
    },
  },
);

export const PaymentOrder =
  (mongoose.models.PaymentOrder as IPaymentOrderModel | undefined) ??
  mongoose.model<IPaymentOrderDocument, IPaymentOrderModel>(
    "PaymentOrder",
    paymentOrderSchema,
  );
