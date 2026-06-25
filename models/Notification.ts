import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationTarget = "all" | "users" | "car_owners" | "wilaya" | "individual";

export interface INotification extends Document {
  /** Null means it's a broadcast; populated for per-user records */
  recipientId?: mongoose.Types.ObjectId;
  targetType: NotificationTarget;
  /** Used when targetType === "wilaya" */
  targetWilaya?: string;
  title: string;
  message: string;
  /** Whether an email copy was also sent */
  sendEmail: boolean;
  /** Array of user IDs who have read this notification */
  readBy: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId:  { type: Schema.Types.ObjectId, ref: "User", default: null },
    targetType:   { type: String, enum: ["all", "users", "car_owners", "wilaya", "individual"], required: true },
    targetWilaya: { type: String },
    title:        { type: String, required: true },
    message:      { type: String, required: true },
    sendEmail:    { type: Boolean, default: false },
    readBy:       [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy:    { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ targetType: 1, targetWilaya: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
