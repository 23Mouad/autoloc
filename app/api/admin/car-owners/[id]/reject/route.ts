import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Car from "@/models/Car";
import AuditLog from "@/models/AuditLog";
import { requireAdmin, sessionUser } from "@/lib/auth";
import { sendAccountRejectedEmail } from "@/lib/email";

// POST /api/admin/car-owners/[id]/reject
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session    = await requireAdmin();
    const admin      = sessionUser(session);
    const { id }     = await params;

    await dbConnect();

    const body   = await req.json().catch(() => ({}));
    const reason = body.reason as string | undefined;

    const owner = await User.findOne({
      _id:       id,
      role:      "renter",
      deletedAt: { $exists: false },
    });

    if (!owner) {
      return NextResponse.json({ error: "Propriétaire introuvable." }, { status: 404 });
    }

    if (owner.status === "suspended") {
      return NextResponse.json({ error: "Compte déjà rejeté/suspendu." }, { status: 409 });
    }

    // Suspend the account
    owner.status = "suspended";
    await owner.save();

    // Hide any cars (defensive — shouldn't have any yet)
    await Car.updateMany({ ownerId: owner._id }, { $set: { available: false } });

    // Audit log
    await AuditLog.create({
      adminId:    admin.id,
      action:     "reject_car_owner",
      targetId:   owner._id,
      targetType: "User",
      details:    { ownerEmail: owner.email, reason },
    });

    // Send rejection email
    await sendAccountRejectedEmail({
      to:     owner.email,
      name:   `${owner.name} ${owner.lastName}`,
      reason,
    });

    return NextResponse.json({
      message: "Compte rejeté. L'utilisateur a été notifié par email.",
    });
  } catch (error) {
    console.error("POST /api/admin/car-owners/[id]/reject error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized" || msg === "Forbidden") {
      return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
