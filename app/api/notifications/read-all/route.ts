import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import mongoose from "mongoose";
import { requireAuth, sessionUser } from "@/lib/auth";

// PATCH /api/notifications/read-all — mark all visible notifications as read
export async function PATCH() {
  try {
    const session = await requireAuth();
    const user    = sessionUser(session);

    await dbConnect();

    const userId      = new mongoose.Types.ObjectId(user.id);
    const roleTarget  = user.role === "renter" ? "car_owners" : "users";

    // Find all notification IDs applicable to this user that they haven't read yet
    const query = {
      readBy: { $ne: userId },
      $or: [
        { recipientId: user.id, targetType: "individual" },
        { recipientId: null, targetType: "all" },
        { recipientId: null, targetType: roleTarget },
      ],
    };

    const result = await Notification.updateMany(
      query,
      { $addToSet: { readBy: userId } }
    );

    return NextResponse.json({
      message:  "Toutes les notifications marquées comme lues.",
      modified: result.modifiedCount,
    });
  } catch (error) {
    console.error("PATCH /api/notifications/read-all error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
