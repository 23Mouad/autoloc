import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  targetId?: mongoose.Types.ObjectId;
  targetType?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    action:     { type: String, required: true },
    targetId:   { type: Schema.Types.ObjectId },
    targetType: { type: String },
    details:    { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

AuditLogSchema.index({ adminId: 1, createdAt: -1 });
AuditLogSchema.index({ targetId: 1 });
AuditLogSchema.index({ action: 1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLog;
