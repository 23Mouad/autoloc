import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Car from "@/models/Car";
import { requireAuth, sessionUser } from "@/lib/auth";

/**
 * POST /api/account/deactivate
 * Allows an authenticated user to soft-delete their own account.
 * - Sets deletedAt + status = "suspended"
 * - If car owner, hides their cars
 */
export async function POST() {
  try {
    const session = await requireAuth();
    const caller  = sessionUser(session);

    await dbConnect();

    const user = await User.findOne({ _id: caller.id, deletedAt: { $exists: false } });
    if (!user) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    }

    user.deletedAt = new Date();
    user.status    = "suspended";
    await user.save();

    // Hide car owner's listings
    if (user.role === "renter") {
      await Car.updateMany({ ownerId: user._id }, { $set: { available: false } });
    }

    return NextResponse.json({
      message: "Votre compte a été désactivé. Toutes vos données ont été conservées.",
    });
  } catch (error) {
    console.error("POST /api/account/deactivate error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
