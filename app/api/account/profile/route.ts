import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import { requireAuth, sessionUser } from "@/lib/auth";

// GET /api/account/profile — authenticated user's own full profile
export async function GET() {
  try {
    const session = await requireAuth();
    const caller  = sessionUser(session);

    await dbConnect();

    const user = await User.findOne({ _id: caller.id, deletedAt: { $exists: false } })
      .select("-password -resetToken -resetTokenExpiry -loginAttempts -lockUntil")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
    }

    // For car owners, include subscription info
    let subscription = null;
    if (user.role === "renter") {
      subscription = await Subscription.findOne({ ownerId: user._id }).lean();
    }

    return NextResponse.json({
      ...user,
      id:           user._id.toString(),
      _id:          undefined,
      subscription: subscription
        ? {
            id:                subscription._id.toString(),
            plan:              subscription.plan,
            status:            subscription.status,
            trialStartDate:    subscription.trialStartDate,
            trialEndDate:      subscription.trialEndDate,
            subscriptionStart: subscription.subscriptionStart,
            subscriptionEnd:   subscription.subscriptionEnd,
            pricePerMonth:     subscription.pricePerMonth,
          }
        : null,
    });
  } catch (error) {
    console.error("GET /api/account/profile error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/account/profile — update own profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const caller  = sessionUser(session);

    await dbConnect();

    const user = await User.findOne({ _id: caller.id, deletedAt: { $exists: false } });
    if (!user) {
      return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
    }

    const body = await req.json();
    const { name, lastName, phone, wilaya, storeLocation, currentPassword, newPassword } = body;

    if (name)          user.name          = name;
    if (lastName)      user.lastName      = lastName;
    if (phone)         user.phone         = phone;
    if (wilaya)        user.wilaya        = wilaya;
    if (storeLocation !== undefined) user.storeLocation = storeLocation;

    // Password change flow
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Mot de passe actuel requis." }, { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "Nouveau mot de passe trop court (min. 8 caractères)." },
          { status: 400 }
        );
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    return NextResponse.json({ message: "Profil mis à jour avec succès." });
  } catch (error) {
    console.error("PATCH /api/account/profile error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
