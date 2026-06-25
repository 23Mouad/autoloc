/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Seed script — inserts existing cars + admin user into MongoDB
 * Run with:  npx tsx scripts/seed.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  "mongodb+srv://mouad:moodAbingo203@mouad.uxofdyj.mongodb.net/autoloc?retryWrites=true&w=majority";

// ── Schemas (inline to avoid path alias issues when running via tsx) ──

const UserSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    lastName:      { type: String, required: true },
    email:         { type: String, required: true, unique: true, lowercase: true },
    password:      { type: String, required: true },
    phone:         { type: String, required: true },
    role:          { type: String, enum: ["admin", "renter", "customer"], default: "customer" },
    wilaya:        { type: String, required: true },
    storeLocation: { type: String },
  },
  { timestamps: true }
);

const CarSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    brand:        { type: String, required: true },
    model:        { type: String, required: true },
    year:         { type: Number, required: true },
    category:     { type: String, required: true },
    transmission: { type: String, required: true },
    fuel:         { type: String, required: true },
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
    ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Car  = mongoose.models.Car  || mongoose.model("Car", CarSchema);

// ── Car data (copied from data/cars.ts) ──

const cars = [
  {
    name: "Renault Symbol 2022", brand: "Renault", model: "Symbol", year: 2022,
    category: "Economy", transmission: "Manual", fuel: "Gasoline",
    seats: 5, doors: 4, ac: true, trunkLiters: 510,
    pricePerDay: 4500, pricePerWeek: 27000, available: true,
    images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80"],
    description: "Berline compacte fiable et économique, idéale pour la ville d'Annaba et ses environs.",
    features: ["Climatisation", "Direction assistée", "Verrouillage centralisé", "Bluetooth"],
    location: { zone: "Centre-ville Annaba", lat: 36.9042, lng: 7.7668 },
    rating: 4.5, reviewCount: 38,
  },
  {
    name: "Peugeot 208 2023", brand: "Peugeot", model: "208", year: 2023,
    category: "Economy", transmission: "Automatic", fuel: "Gasoline",
    seats: 5, doors: 4, ac: true, trunkLiters: 311,
    pricePerDay: 5500, pricePerWeek: 33000, available: true,
    images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"],
    description: "Citadine moderne au design audacieux. Intérieur haut de gamme avec écran tactile.",
    features: ["GPS", "Écran tactile", "Caméra de recul", "Bluetooth", "USB"],
    location: { zone: "Aéroport Annaba-Rabah Bitat", lat: 36.8222, lng: 7.8092 },
    rating: 4.7, reviewCount: 25,
  },
  {
    name: "Dacia Logan 2021", brand: "Dacia", model: "Logan", year: 2021,
    category: "Economy", transmission: "Manual", fuel: "Diesel",
    seats: 5, doors: 4, ac: true, trunkLiters: 580,
    pricePerDay: 3500, pricePerWeek: 21000, available: true,
    images: ["https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80"],
    description: "La voiture la plus économique de notre flotte. Grand coffre et faible consommation.",
    features: ["Climatisation", "Direction assistée", "Vitres électriques"],
    location: { zone: "El Bouni", lat: 36.8979, lng: 7.7472 },
    rating: 4.2, reviewCount: 45,
  },
  {
    name: "Hyundai i10 2023", brand: "Hyundai", model: "i10", year: 2023,
    category: "Economy", transmission: "Automatic", fuel: "Gasoline",
    seats: 4, doors: 4, ac: true, trunkLiters: 252,
    pricePerDay: 4000, pricePerWeek: 24000, available: false,
    images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80"],
    description: "Micro-citadine parfaite pour naviguer dans les rues d'Annaba. Boîte automatique.",
    features: ["Climatisation", "Bluetooth", "Régulateur de vitesse"],
    location: { zone: "Gare Ferroviaire d'Annaba", lat: 36.9003, lng: 7.7599 },
    rating: 4.3, reviewCount: 19,
  },
  {
    name: "Dacia Duster 2023", brand: "Dacia", model: "Duster", year: 2023,
    category: "SUV", transmission: "Manual", fuel: "Diesel",
    seats: 5, doors: 4, ac: true, trunkLiters: 478,
    pricePerDay: 7000, pricePerWeek: 42000, available: true,
    images: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80"],
    description: "SUV robuste et polyvalent, parfait pour explorer Seraïdi et les plages d'Annaba.",
    features: ["GPS", "Bluetooth", "Barres de toit", "Mode tout-terrain"],
    location: { zone: "Seraïdi", lat: 36.9617, lng: 7.6783 },
    rating: 4.6, reviewCount: 52,
  },
  {
    name: "Hyundai Tucson 2024", brand: "Hyundai", model: "Tucson", year: 2024,
    category: "SUV", transmission: "Automatic", fuel: "Diesel",
    seats: 5, doors: 4, ac: true, trunkLiters: 620,
    pricePerDay: 9500, pricePerWeek: 57000, available: true,
    images: ["https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&q=80"],
    description: "SUV premium au design futuriste. Confort exceptionnel et motorisation puissante.",
    features: ["GPS", "Caméra 360°", "Sièges chauffants", "Toit panoramique", "Bluetooth"],
    location: { zone: "Centre-ville Annaba", lat: 36.905, lng: 7.768 },
    rating: 4.8, reviewCount: 31,
  },
  {
    name: "Kia Sportage 2023", brand: "Kia", model: "Sportage", year: 2023,
    category: "SUV", transmission: "Automatic", fuel: "Gasoline",
    seats: 5, doors: 4, ac: true, trunkLiters: 591,
    pricePerDay: 8500, pricePerWeek: 51000, available: false,
    images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80"],
    description: "SUV élégant avec intérieur spacieux et technologies de pointe.",
    features: ["GPS", "Écran tactile 12\"", "Apple CarPlay", "Android Auto", "Caméra de recul"],
    location: { zone: "Sidi Amar", lat: 36.8761, lng: 7.7281 },
    rating: 4.5, reviewCount: 22,
  },
  {
    name: "Mercedes-Benz C200 2024", brand: "Mercedes-Benz", model: "C200", year: 2024,
    category: "Luxury", transmission: "Automatic", fuel: "Gasoline",
    seats: 5, doors: 4, ac: true, trunkLiters: 455,
    pricePerDay: 15000, pricePerWeek: 90000, available: true,
    images: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80"],
    description: "L'élégance allemande à Annaba. Intérieur cuir, MBUX, conduite d'exception.",
    features: ["GPS", "Cuir", "MBUX", "Sièges chauffants", "Toit ouvrant", "Caméra 360°", "LED"],
    location: { zone: "Centre-ville Annaba", lat: 36.9035, lng: 7.7655 },
    rating: 4.9, reviewCount: 15,
  },
  {
    name: "BMW Série 3 2023", brand: "BMW", model: "Série 3", year: 2023,
    category: "Luxury", transmission: "Automatic", fuel: "Diesel",
    seats: 5, doors: 4, ac: true, trunkLiters: 480,
    pricePerDay: 14000, pricePerWeek: 84000, available: true,
    images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80"],
    description: "Berline sportive haut de gamme. Performance, luxe et technologie réunis.",
    features: ["GPS", "Cuir", "iDrive", "Sièges sport", "Harman Kardon", "LED adaptatifs"],
    location: { zone: "Aéroport Annaba-Rabah Bitat", lat: 36.823, lng: 7.81 },
    rating: 4.8, reviewCount: 12,
  },
  {
    name: "Renault Trafic 2022", brand: "Renault", model: "Trafic", year: 2022,
    category: "Van", transmission: "Manual", fuel: "Diesel",
    seats: 3, doors: 4, ac: true, trunkLiters: 1900,
    pricePerDay: 8000, pricePerWeek: 48000, available: true,
    images: ["https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800&q=80"],
    description: "Utilitaire spacieux pour vos déménagements ou transports dans la wilaya d'Annaba.",
    features: ["Climatisation", "Bluetooth", "Régulateur de vitesse", "Radar de recul"],
    location: { zone: "El Bouni", lat: 36.898, lng: 7.748 },
    rating: 4.4, reviewCount: 28,
  },
  {
    name: "Peugeot Expert 2023", brand: "Peugeot", model: "Expert", year: 2023,
    category: "Van", transmission: "Manual", fuel: "Diesel",
    seats: 3, doors: 4, ac: true, trunkLiters: 2000,
    pricePerDay: 8500, pricePerWeek: 51000, available: false,
    images: ["https://images.unsplash.com/photo-1609520505218-7421df70af90?w=800&q=80"],
    description: "Fourgon professionnel avec volume de chargement exceptionnel.",
    features: ["Climatisation", "Bluetooth", "Caméra de recul", "3 places assises"],
    location: { zone: "Sidi Amar", lat: 36.877, lng: 7.729 },
    rating: 4.3, reviewCount: 17,
  },
  {
    name: "Toyota HiAce 2022", brand: "Toyota", model: "HiAce", year: 2022,
    category: "Minibus", transmission: "Manual", fuel: "Diesel",
    seats: 12, doors: 4, ac: true, trunkLiters: 800,
    pricePerDay: 12000, pricePerWeek: 72000, available: true,
    images: ["https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80"],
    description: "Minibus 12 places parfait pour les groupes et transferts aéroport à Annaba.",
    features: ["Climatisation arrière", "Bluetooth", "Caméra de recul", "Porte coulissante"],
    location: { zone: "Gare Ferroviaire d'Annaba", lat: 36.9005, lng: 7.76 },
    rating: 4.6, reviewCount: 33,
  },
];

// ── Main seed function ──

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  // 1. Seed admin user
  const existingAdmin = await User.findOne({ email: "admin@autoloc.dz" });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await User.create({
      name: "Admin",
      lastName: "AutoLoc",
      email: "admin@autoloc.dz",
      password: hashedPassword,
      phone: "+213 000 000 000",
      role: "admin",
      wilaya: "Annaba",
    });
    console.log("👤 Admin user created (admin@autoloc.dz / admin123)");
  } else {
    console.log("👤 Admin user already exists, skipping.");
  }

  // 2. Seed cars
  const carCount = await Car.countDocuments();
  if (carCount === 0) {
    await Car.insertMany(cars);
    console.log(`🚗 Inserted ${cars.length} cars into the database.`);
  } else {
    console.log(`🚗 ${carCount} cars already in database, skipping.`);
  }

  console.log("\n✅ Seed complete!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
