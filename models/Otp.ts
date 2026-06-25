import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
}

const OtpSchema = new Schema<IOtp>({
  email:     { type: String, required: true, index: true },
  otp:       { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified:  { type: Boolean, default: false },
}, { timestamps: true });

// Auto-delete expired OTPs (TTL index)
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
export default Otp;
