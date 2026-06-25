import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import mongoose from "mongoose";
import { requireAuth, sessionUser } from "@/lib/auth";

// PATCH /api/notifications/[id]/read — mark a single notification as read
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const user    = sessionUser(session);
    const { id }  = await params;

    await dbConnect();

    const userId = new mongoose.Types.ObjectId(user.id);

    const result = await Notification.updateOne(
      { _id: id },
      { $addToSet: { readBy: userId } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Notification introuvable." }, { status: 404 });
    }

    return NextResponse.json({ message: "Notification marquée comme lue." });
  } catch (error) {
    console.error("PATCH /api/notifications/[id]/read error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
