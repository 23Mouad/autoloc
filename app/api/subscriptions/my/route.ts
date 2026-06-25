import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import { requireCarOwner, sessionUser } from "@/lib/auth";

// GET /api/subscriptions/my — car owner views own subscription
export async function GET() {
  try {
    const session = await requireCarOwner();
    const user    = sessionUser(session);

    await dbConnect();

    const sub = await Subscription.findOne({ ownerId: user.id }).lean();

    if (!sub) {
      return NextResponse.json({ error: "Aucun abonnement trouvé." }, { status: 404 });
    }

    const now = new Date();

    // Calculate days remaining
    let expiresAt: Date | null = null;
    if (sub.status === "trial") {
      expiresAt = sub.trialEndDate;
    } else if (sub.status === "active" && sub.subscriptionEnd) {
      expiresAt = sub.subscriptionEnd;
    }

    const daysRemaining = expiresAt
      ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    return NextResponse.json({
      id:               sub._id.toString(),
      plan:             sub.plan,
      status:           sub.status,
      trialStartDate:   sub.trialStartDate,
      trialEndDate:     sub.trialEndDate,
      subscriptionStart: sub.subscriptionStart,
      subscriptionEnd:   sub.subscriptionEnd,
      pricePerMonth:    sub.pricePerMonth,
      daysRemaining,
      expiresAt,
    });
  } catch (error) {
    console.error("GET /api/subscriptions/my error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized" || msg === "Forbidden") {
      return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
