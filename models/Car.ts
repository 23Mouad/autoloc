import mongoose, { Schema, Model } from "mongoose";

export interface ICar {
  name: string;
  brand: string;
  model: string;
  year: number;
  category: "Economy" | "SUV" | "Luxury" | "Van" | "Minibus";
  transmission: "Manual" | "Automatic";
  fuel: "Gasoline" | "Diesel" | "Electric";
  seats: number;
  doors: number;
  ac: boolean;
  trunkLiters: number;
  pricePerDay: number;
  pricePerWeek: number;
  available: boolean;
  images: string[];
  description: string;
  features: string[];
  location: {
    zone: string;
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  ownerId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CarSchema = new Schema(
  {
    name:         { type: String, required: true },
    brand:        { type: String, required: true },
    model:        { type: String, required: true },
    year:         { type: Number, required: true },
    category:     { type: String, enum: ["Economy", "SUV", "Luxury", "Van", "Minibus"], required: true },
    transmission: { type: String, enum: ["Manual", "Automatic"], required: true },
    fuel:         { type: String, enum: ["Gasoline", "Diesel", "Electric"], required: true },
    seats:        { type: Number, required: true },
    doors:        { type: Number, required: true },
    ac:           { type: Boolean, default: true },
    trunkLiters:  { type: Number, required: true },
    pricePerDay:  { type: Number, required: true },
    pricePerWeek: { type: Number, required: true },
    available:    { type: Boolean, default: true },
    images:       [{ type: String }],
    description:  { type: String, required: true },
    features:     [{ type: String }],
    location: {
      zone: { type: String, required: true },
      lat:  { type: Number, required: true },
      lng:  { type: Number, required: true },
    },
    rating:      { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    ownerId:     { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Car: Model<ICar> = mongoose.models.Car || mongoose.model<ICar>("Car", CarSchema);
export default Car;
