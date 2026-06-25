import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import Car from "@/models/Car";
import AuditLog from "@/models/AuditLog";
import { requireAdmin, sessionUser } from "@/lib/auth";
import { sendSubscriptionRenewedEmail } from "@/lib/email";

// POST /api/admin/subscriptions/[id]/renew
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const admin   = sessionUser(session);

    await dbConnect();

    const sub = await Subscription.findById(params.id).populate<{
      ownerId: { _id: unknown; name: string; lastName: string; email: string };
    }>("ownerId", "name lastName email");

    if (!sub) {
      return NextResponse.json({ error: "Abonnement introuvable." }, { status: 404 });
    }

    const now = new Date();
    const nextEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Update subscription
    sub.plan             = "monthly";
    sub.status           = "active";
    sub.subscriptionStart = now;
    sub.subscriptionEnd   = nextEnd;
    // Reset reminder flags
    sub.reminderSent7d   = false;
    sub.reminderSent3d   = false;
    sub.reminderSent1d   = false;
    await sub.save();

    // Restore car owner visibility
    const ownerId = sub.ownerId._id;
    await User.updateOne({ _id: ownerId }, { $set: { status: "active" } });
    await Car.updateMany({ ownerId }, { $set: { available: true } });

    // Audit log
    await AuditLog.create({
      adminId:    admin.id,
      action:     "renew_subscription",
      targetId:   sub._id,
      targetType: "Subscription",
      details:    {
        ownerId:    ownerId?.toString(),
        ownerEmail: sub.ownerId.email,
        nextEnd,
      },
    });

    // Notify owner
    await sendSubscriptionRenewedEmail({
      to:              sub.ownerId.email,
      name:            `${sub.ownerId.name} ${sub.ownerId.lastName}`,
      nextRenewalDate: nextEnd.toLocaleDateString("fr-DZ", {
        day: "2-digit", month: "long", year: "numeric",
      }),
    });

    return NextResponse.json({
      message:          "Abonnement renouvelé. Visibilité restaurée.",
      subscriptionStart: now,
      subscriptionEnd:   nextEnd,
    });
  } catch (error) {
    console.error("POST /api/admin/subscriptions/[id]/renew error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized" || msg === "Forbidden") {
      return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
