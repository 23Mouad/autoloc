import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { sendOtpEmail } from "@/lib/email";
import { authRateLimit, getIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 10 registrations per 15 min per IP
    const ip = getIp(req);
    const rl = authRateLimit(ip);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = await req.json();
    const { name, lastName, email, password, phone, role, wilaya, storeLocation } = body;

    if (!name || !lastName || !email || !password || !phone || !wilaya) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    // Validate role — only customer and renter are allowed through registration
    const allowedRoles = ["customer", "renter"];
    const resolvedRole = allowedRoles.includes(role) ? role : "customer";

    await dbConnect();

    // Check for existing verified user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.emailVerified) {
      return NextResponse.json({ error: "Email déjà utilisé." }, { status: 409 });
    }

    // If unverified user exists, delete and re-create (clean re-registration)
    if (existing && !existing.emailVerified) {
      await User.deleteOne({ _id: existing._id });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      lastName,
      email:         email.toLowerCase(),
      password:      hashedPassword,
      phone,
      role:          resolvedRole,
      wilaya,
      storeLocation: storeLocation || undefined,
      emailVerified: false,
      // Both roles start at pending_verification until OTP confirmed
      status:        "pending_verification",
    });

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.deleteMany({ email: email.toLowerCase() });
    await Otp.create({
      email:     email.toLowerCase(),
      otp,
      expiresAt,
      verified:  false,
    });

    await sendOtpEmail(email, `${name} ${lastName}`, otp);

    return NextResponse.json(
      {
        message: "Compte créé. Vérifiez votre email.",
        userId:  user._id.toString(),
        role:    resolvedRole,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
