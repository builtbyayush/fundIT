import { Schema } from "mongoose";

import { CurrencyCode, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "@/constants/currency";

export interface IMoneyEmbed {
  amountMinor: number;
  currency: CurrencyCode;
}

export const moneyEmbedSchema = new Schema<IMoneyEmbed>(
  {
    amountMinor: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Amount must be an integer minor unit",
      },
    },
    currency: {
      type: String,
      required: true,
      enum: SUPPORTED_CURRENCIES,
      default: DEFAULT_CURRENCY,
    },
  },
  { _id: false },
);
