import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import Car from "@/models/Car";
import AuditLog from "@/models/AuditLog";
import { requireAdmin, sessionUser } from "@/lib/auth";
import { sendAccountApprovedEmail } from "@/lib/email";

// POST /api/admin/car-owners/[id]/approve
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session    = await requireAdmin();
    const admin      = sessionUser(session);
    const { id }     = await params;

    await dbConnect();

    const owner = await User.findOne({
      _id:       id,
      role:      "renter",
      deletedAt: { $exists: false },
    });

    if (!owner) {
      return NextResponse.json({ error: "Propriétaire introuvable." }, { status: 404 });
    }

    if (owner.status === "active") {
      return NextResponse.json({ error: "Compte déjà approuvé." }, { status: 409 });
    }

    // Activate the account
    owner.status = "active";
    await owner.save();

    // Create subscription (trial — 30 days from now)
    const trialStart = new Date();
    const trialEnd   = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const existingSub = await Subscription.findOne({ ownerId: owner._id });
    if (!existingSub) {
      await Subscription.create({
        ownerId:        owner._id,
        plan:           "trial",
        status:         "trial",
        trialStartDate: trialStart,
        trialEndDate:   trialEnd,
        pricePerMonth:  2000,
      });
    }

    // Restore cars that may have been hidden (idempotent)
    await Car.updateMany({ ownerId: owner._id }, { $set: { available: true } });

    // Audit log
    await AuditLog.create({
      adminId:    admin.id,
      action:     "approve_car_owner",
      targetId:   owner._id,
      targetType: "User",
      details:    { ownerEmail: owner.email, trialEnd },
    });

    // Send approval email
    await sendAccountApprovedEmail({
      to:           owner.email,
      name:         `${owner.name} ${owner.lastName}`,
      trialEndDate: trialEnd.toLocaleDateString("fr-DZ", {
        day: "2-digit", month: "long", year: "numeric",
      }),
    });

    return NextResponse.json({
      message:        "Compte approuvé. Période d'essai démarrée.",
      trialStartDate: trialStart,
      trialEndDate:   trialEnd,
    });
  } catch (error) {
    console.error("POST /api/admin/car-owners/[id]/approve error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized" || msg === "Forbidden") {
      return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
