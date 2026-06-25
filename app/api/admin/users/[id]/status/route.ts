import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Car from "@/models/Car";
import AuditLog from "@/models/AuditLog";
import { requireAdmin } from "@/lib/auth";

/**
 * PATCH /api/admin/users/[id]/status
 * Body: { status: "active" | "suspended" | "hidden" }
 * Admin changes account status for any user.
 *
 * DELETE /api/admin/users/[id]/status (actually DELETE on the parent /[id] route)
 * Use PATCH with status "suspended" to soft-suspend.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin   = (session as any).user as { id: string; email: string };
    const { id }  = await params;

    await dbConnect();

    const body   = await req.json();
    const { status } = body;

    const allowed = ["active", "suspended", "hidden", "pending_approval"];
    if (!status || !allowed.includes(status)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs: ${allowed.join(", ")}` },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      _id:       id,
      role:      { $ne: "admin" }, // cannot change admin status this way
      deletedAt: { $exists: false },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    const previousStatus = user.status;
    user.status = status as typeof user.status;
    await user.save();

    // If hiding a car owner — hide their cars too
    if (user.role === "renter" && (status === "suspended" || status === "hidden")) {
      await Car.updateMany({ ownerId: user._id }, { $set: { available: false } });
    }

    // If reactivating a car owner — restore their cars
    if (user.role === "renter" && status === "active") {
      await Car.updateMany({ ownerId: user._id }, { $set: { available: true } });
    }

    // Audit log
    await AuditLog.create({
      adminId:    admin.id,
      action:     "change_user_status",
      targetId:   user._id,
      targetType: "User",
      details:    { previousStatus, newStatus: status, userEmail: user.email },
    });

    return NextResponse.json({
      message: `Statut mis à jour : ${previousStatus} → ${status}`,
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id]/status error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized" || msg === "Forbidden") {
      return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
