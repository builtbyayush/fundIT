import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IWebhookEvent {
  provider: string;
  eventId: string;
  eventType: string;
  status: "PROCESSED" | "IGNORED" | "FAILED";
  processedAt: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWebhookEventDocument extends IWebhookEvent, Document {}

export type IWebhookEventModel = Model<IWebhookEventDocument>;

const webhookEventSchema = new Schema<IWebhookEventDocument, IWebhookEventModel>(
  {
    provider: { type: String, required: true, trim: true },
    eventId: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PROCESSED", "IGNORED", "FAILED"],
      required: true,
      default: "PROCESSED",
    },
    processedAt: { type: Date, required: true, default: () => new Date() },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

export const WebhookEvent =
  (mongoose.models.WebhookEvent as IWebhookEventModel | undefined) ??
  mongoose.model<IWebhookEventDocument, IWebhookEventModel>(
    "WebhookEvent",
    webhookEventSchema,
  );
