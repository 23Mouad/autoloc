/**
 * Admin Seeder Script
 * Run: node scripts/seed-admin.mjs
 *
 * Creates (or updates) the admin account in MongoDB.
 */

import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

// ── Config ─────────────────────────────────────────────────────────
const MONGODB_URI =
  "mongodb+srv://mouad:moodAbingo203@mouad.uxofdyj.mongodb.net/autoloc?retryWrites=true&w=majority";

const ADMIN = {
  name:          "Admin",
  lastName:      "Autoloc",
  email:         "admin@autoloc.dz",
  password:      "Admin@2025",   // ← change after first login
  phone:         "0550000000",
  role:          "admin",
  wilaya:        "Annaba",
  emailVerified: true,
  status:        "active",
  loginAttempts: 0,
  createdAt:     new Date(),
  updatedAt:     new Date(),
};
// ───────────────────────────────────────────────────────────────────

const client = new MongoClient(MONGODB_URI);

async function main() {
  await client.connect();
  console.log("✅ Connected to MongoDB");

  const db   = client.db();
  const users = db.collection("users");

  // Check if admin already exists
  const existing = await users.findOne({ email: ADMIN.email });
  if (existing) {
    console.log(`⚠️  Admin already exists (${ADMIN.email}). Updating password & status…`);
    await users.updateOne(
      { email: ADMIN.email },
      {
        $set: {
          password:      await bcrypt.hash(ADMIN.password, 12),
          role:          "admin",
          status:        "active",
          emailVerified: true,
          loginAttempts: 0,
          updatedAt:     new Date(),
        },
        $unset: { lockUntil: "", deletedAt: "" },
      }
    );
    console.log("✅ Admin account updated.");
  } else {
    const hashed = await bcrypt.hash(ADMIN.password, 12);
    await users.insertOne({ ...ADMIN, password: hashed });
    console.log("✅ Admin account created.");
  }

  console.log("\n──────────────────────────────────────");
  console.log("  Admin Credentials");
  console.log("──────────────────────────────────────");
  console.log(`  Email   : ${ADMIN.email}`);
  console.log(`  Password: ${ADMIN.password}`);
  console.log("──────────────────────────────────────");
  console.log("  ⚠️  Change your password after first login!");
  console.log("");
}

main()
  .catch(console.error)
  .finally(() => client.close());
