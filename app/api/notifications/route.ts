import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { requireAuth, sessionUser } from "@/lib/auth";

/**
 * GET /api/notifications
 * Returns all notifications visible to the current user:
 *  - broadcast notifications matching their role / wilaya
 *  - individual notifications addressed to them
 * Includes an "isRead" computed field.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const user    = sessionUser(session);

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, Number(searchParams.get("page")  || "1"));
    const limit = Math.min(100, Number(searchParams.get("limit") || "30"));
    const skip  = (page - 1) * limit;

    const roleTarget = user.role === "renter" ? "car_owners" : "users";

    // Match criteria: broadcast that applies to this user OR direct notification
    const query = {
      $or: [
        // Individual notification addressed to this user
        { recipientId: user.id, targetType: "individual" },
        // Broadcast to "all"
        { recipientId: null, targetType: "all" },
        // Broadcast to their role group
        { recipientId: null, targetType: roleTarget },
        // Broadcast to their wilaya (future: add wilaya to user session if needed)
      ],
    };

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    const userId = user.id;
    const result = notifications.map((n) => ({
      id:        n._id.toString(),
      title:     n.title,
      message:   n.message,
      targetType: n.targetType,
      createdAt: n.createdAt,
      isRead:    n.readBy.some((id) => id.toString() === userId),
    }));

    return NextResponse.json({ notifications: result, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
