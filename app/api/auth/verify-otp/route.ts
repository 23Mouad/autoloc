import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Otp from "@/models/Otp";
import User from "@/models/User";
import {
  sendWelcomeEmail,
  sendAccountPendingApprovalEmail,
  sendAdminNewCarOwnerEmail,
} from "@/lib/email";

// POST /api/auth/verify-otp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email et code OTP obligatoires." },
        { status: 400 }
      );
    }

    await dbConnect();

    const record = await Otp.findOne({ email: email.toLowerCase() });

    if (!record) {
      return NextResponse.json(
        { error: "Aucun code OTP trouvé pour cet email." },
        { status: 404 }
      );
    }

    if (record.verified) {
      return NextResponse.json({ error: "Code OTP déjà utilisé." }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      await Otp.deleteOne({ _id: record._id });
      return NextResponse.json({ error: "Code OTP expiré." }, { status: 400 });
    }

    if (record.otp !== otp.trim()) {
      return NextResponse.json({ error: "Code OTP invalide." }, { status: 400 });
    }

    // Mark OTP as used
    record.verified = true;
    await record.save();

    // Determine new status based on role
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    const isCarOwner = existingUser.role === "renter";
    const newStatus  = isCarOwner ? "pending_approval" : "active";

    // Mark user as email-verified and set appropriate status
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { emailVerified: true, status: newStatus },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    if (isCarOwner) {
      // Notify the car owner that their account is under review
      await sendAccountPendingApprovalEmail({
        to:   user.email,
        name: `${user.name} ${user.lastName}`,
      });

      // Notify admin(s) about new pending car owner
      const adminEmail = process.env.SMTP_USER!;
      await sendAdminNewCarOwnerEmail({
        adminEmail,
        ownerName:  `${user.name} ${user.lastName}`,
        ownerEmail: user.email,
        ownerPhone: user.phone,
        ownerWilaya: user.wilaya,
        userId:     user._id.toString(),
      });

      return NextResponse.json({
        message:  "Email vérifié. Votre compte est en attente de validation par l'administrateur.",
        status:   "pending_approval",
        role:     user.role,
      });
    } else {
      // Regular user — welcome them immediately
      await sendWelcomeEmail(user.email, `${user.name} ${user.lastName}`, user.role);

      return NextResponse.json({
        message: "Email vérifié. Vous pouvez maintenant vous connecter.",
        status:  "active",
        role:    user.role,
      });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
