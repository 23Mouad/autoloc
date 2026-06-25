import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import { auth } from "@/lib/auth";

// PUT /api/announcements/[id] — edit own announcement
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const role = (session.user as Record<string, unknown>).role;

    if (role !== "admin" && announcement.ownerId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (body.title) announcement.title = body.title;
    if (body.content) announcement.content = body.content;
    if (body.image !== undefined) announcement.image = body.image;
    if (role === "admin" && body.isGlobal !== undefined) announcement.isGlobal = body.isGlobal;

    await announcement.save();

    return NextResponse.json({ message: "Announcement updated" });
  } catch (error) {
    console.error("PUT /api/announcements/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/announcements/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const role = (session.user as Record<string, unknown>).role;

    if (role !== "admin" && announcement.ownerId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Announcement.findByIdAndDelete(id);
    return NextResponse.json({ message: "Announcement deleted" });
  } catch (error) {
    console.error("DELETE /api/announcements/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
