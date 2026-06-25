import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPartnerRequest extends Document {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  wilaya: string;
  fleetSize: number;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  rejectionReason?: string;
  userId?: mongoose.Types.ObjectId; // linked once accepted & account created
  createdAt: Date;
  updatedAt: Date;
}

const PartnerRequestSchema = new Schema<IPartnerRequest>(
  {
    name:            { type: String, required: true },
    email:           { type: String, required: true, lowercase: true },
    phone:           { type: String, required: true },
    companyName:     { type: String, required: true },
    wilaya:          { type: String, required: true },
    fleetSize:       { type: Number, required: true, min: 1 },
    message:         { type: String },
    status:          { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    rejectionReason: { type: String },
    userId:          { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const PartnerRequest: Model<IPartnerRequest> =
  mongoose.models.PartnerRequest || mongoose.model<IPartnerRequest>("PartnerRequest", PartnerRequestSchema);
export default PartnerRequest;
