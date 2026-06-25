import mongoose, { Schema, Document, Model } from "mongoose";

export type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled";

export interface ISubscription extends Document {
  ownerId: mongoose.Types.ObjectId;
  plan: "trial" | "monthly";
  status: SubscriptionStatus;
  trialStartDate: Date;
  trialEndDate: Date;
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  pricePerMonth: number;
  /** Reminder flags to avoid duplicate emails */
  reminderSent7d: boolean;
  reminderSent3d: boolean;
  reminderSent1d: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    ownerId:         { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    plan:            { type: String, enum: ["trial", "monthly"], default: "trial" },
    status:          { type: String, enum: ["trial", "active", "expired", "cancelled"], default: "trial" },
    trialStartDate:  { type: Date, required: true },
    trialEndDate:    { type: Date, required: true },
    subscriptionStart: { type: Date },
    subscriptionEnd:   { type: Date },
    pricePerMonth:   { type: Number, default: 2000 },
    reminderSent7d:  { type: Boolean, default: false },
    reminderSent3d:  { type: Boolean, default: false },
    reminderSent1d:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ trialEndDate: 1 });
SubscriptionSchema.index({ subscriptionEnd: 1 });

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
export default Subscription;
