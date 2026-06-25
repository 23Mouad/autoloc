import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, lastName, email, password, phone, role, wilaya, storeLocation } = body;

    if (!name || !lastName || !email || !password || !phone || !wilaya) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Check for existing verified user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.emailVerified) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // If unverified user exists, delete and re-create
    if (existing && !existing.emailVerified) {
      await User.deleteOne({ _id: existing._id });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || "customer",
      wilaya,
      storeLocation: storeLocation || undefined,
      emailVerified: false,
      isActive: true,
    });

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    await Otp.create({
      email: email.toLowerCase(),
      otp,
      expiresAt,
      verified: false,
    });

    // Send OTP email
    await sendOtpEmail(email, `${name} ${lastName}`, otp);

    return NextResponse.json(
      { message: "User created. Please verify your email.", userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
