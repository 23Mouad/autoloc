import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/subscriptions
 * Query params:
 *   status   = trial | active | expired | expiring_soon
 *   page     = 1
 *   limit    = 20
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // trial | active | expired | expiring_soon
    const page  = Math.max(1, Number(searchParams.get("page")  || "1"));
    const limit = Math.min(100, Number(searchParams.get("limit") || "20"));
    const skip  = (page - 1) * limit;

    const now = new Date();
    const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filter: Record<string, any> = {};

    if (statusFilter === "expiring_soon") {
      // Subscriptions expiring in the next 7 days (trial or active)
      filter = {
        status: { $in: ["trial", "active"] },
        $or: [
          { plan: "trial",   trialEndDate:        { $gte: now, $lte: in7d } },
          { plan: "monthly", subscriptionEnd:      { $gte: now, $lte: in7d } },
        ],
      };
    } else if (statusFilter) {
      filter.status = statusFilter;
    }

    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter)
        .populate("ownerId", "name lastName email phone wilaya status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Subscription.countDocuments(filter),
    ]);

    return NextResponse.json({
      subscriptions: subscriptions.map((s) => ({ ...s, id: s._id.toString(), _id: undefined })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/subscriptions error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized" || msg === "Forbidden") {
      return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
