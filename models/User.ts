import mongoose, { Schema, Document, Model } from "mongoose";

export type UserStatus =
  | "pending_verification"
  | "pending_approval"
  | "active"
  | "suspended"
  | "hidden";

export interface IUser extends Document {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "renter" | "customer";
  wilaya: string;
  storeLocation?: string;
  emailVerified: boolean;
  status: UserStatus;
  /** Soft-delete timestamp */
  deletedAt?: Date;
  /** Brute-force protection */
  loginAttempts: number;
  lockUntil?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:             { type: String, required: true },
    lastName:         { type: String, required: true },
    email:            { type: String, required: true, unique: true, lowercase: true },
    password:         { type: String, required: true },
    phone:            { type: String, required: true },
    role:             { type: String, enum: ["admin", "renter", "customer"], default: "customer" },
    wilaya:           { type: String, required: true },
    storeLocation:    { type: String },
    emailVerified:    { type: Boolean, default: false },
    status:           {
      type: String,
      enum: ["pending_verification", "pending_approval", "active", "suspended", "hidden"],
      default: "pending_verification",
    },
    deletedAt:        { type: Date },
    loginAttempts:    { type: Number, default: 0 },
    lockUntil:        { type: Date },
    resetToken:       { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

// Index for soft-delete filtering
UserSchema.index({ deletedAt: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ wilaya: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
