import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Otp from "@/models/Otp";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/email";

// POST /api/auth/verify-otp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    await dbConnect();

    const record = await Otp.findOne({ email: email.toLowerCase() });

    if (!record) {
      return NextResponse.json({ error: "No OTP found for this email" }, { status: 404 });
    }

    if (record.verified) {
      return NextResponse.json({ error: "OTP already used" }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      await Otp.deleteOne({ _id: record._id });
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    if (record.otp !== otp.trim()) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Mark OTP as used
    record.verified = true;
    await record.save();

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { emailVerified: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Send welcome email
    await sendWelcomeEmail(user.email, `${user.name} ${user.lastName}`, user.role);

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
