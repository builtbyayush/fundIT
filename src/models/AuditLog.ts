import mongoose, { type Document, type Model, Schema } from "mongoose";

export type AuditActorType = "USER" | "SYSTEM" | "WEBHOOK";

export interface IAuditLog {
  actorType: AuditActorType;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLogDocument extends IAuditLog, Document {}

export type IAuditLogModel = Model<IAuditLogDocument>;

const auditLogSchema = new Schema<IAuditLogDocument, IAuditLogModel>(
  {
    actorType: {
      type: String,
      enum: ["USER", "SYSTEM", "WEBHOOK"],
      required: true,
    },
    actorId: { type: String, default: null },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: String, required: true, trim: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const AuditLog =
  (mongoose.models.AuditLog as IAuditLogModel | undefined) ??
  mongoose.model<IAuditLogDocument, IAuditLogModel>("AuditLog", auditLogSchema);
