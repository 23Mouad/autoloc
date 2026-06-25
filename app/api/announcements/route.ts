import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Announcement from "@/models/Announcement";
import { auth } from "@/lib/auth";

// GET /api/announcements — admin sees all, renter sees own+global, customer sees global
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const role = (session.user as Record<string, unknown>).role;
    const userId = (session.user as Record<string, unknown>).id as string;

    let announcements;
    if (role === "admin") {
      announcements = await Announcement.find()
        .populate("ownerId", "name lastName")
        .sort({ createdAt: -1 })
        .lean();
    } else if (role === "renter") {
      announcements = await Announcement.find({
        $or: [{ ownerId: userId }, { isGlobal: true }],
      })
        .populate("ownerId", "name lastName")
        .sort({ createdAt: -1 })
        .lean();
    } else {
      announcements = await Announcement.find({ isGlobal: true })
        .populate("ownerId", "name lastName")
        .sort({ createdAt: -1 })
        .lean();
    }

    const mapped = announcements.map((a) => ({
      ...a,
      id: a._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/announcements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/announcements — admin or renter
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>).role;
    if (role !== "admin" && role !== "renter") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { title, content, image } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const announcement = await Announcement.create({
      title,
      content,
      image: image || undefined,
      ownerId: (session.user as Record<string, unknown>).id,
      isGlobal: role === "admin" ? (body.isGlobal ?? true) : false,
    });

    return NextResponse.json(
      { message: "Announcement created", id: announcement._id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
