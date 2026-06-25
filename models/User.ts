import mongoose, { Schema, Document, Model } from "mongoose";

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
  isActive: boolean;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
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
    isActive:         { type: Boolean, default: true },
    resetToken:       { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
