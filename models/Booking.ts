import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  carId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  pickupLocation: string;
  pickupDate: Date;
  returnDate: Date;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    carId:          { type: Schema.Types.ObjectId, ref: "Car", required: true },
    userId:         { type: Schema.Types.ObjectId, ref: "User" },
    fullName:       { type: String, required: true },
    email:          { type: String, required: true },
    phone:          { type: String, required: true },
    pickupLocation: { type: String, required: true },
    pickupDate:     { type: Date, required: true },
    returnDate:     { type: Date, required: true },
    totalPrice:     { type: Number, required: true },
    status:         { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
export default Booking;
