import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin, sessionUser } from "@/lib/auth";

// GET /api/admin/car-owners?status=pending_approval&wilaya=Annaba&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    void session; // admin confirmed

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status  = searchParams.get("status");   // e.g. pending_approval | active | suspended
    const wilaya  = searchParams.get("wilaya");
    const search  = searchParams.get("search");
    const page    = Math.max(1, Number(searchParams.get("page")  || "1"));
    const limit   = Math.min(100, Number(searchParams.get("limit") || "20"));
    const skip    = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      role:      "renter",
      deletedAt: { $exists: false },
    };

    if (status)          filter.status = status;
    if (wilaya)          filter.wilaya = wilaya;
    if (search) {
      filter.$or = [
        { name:     { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email:    { $regex: search, $options: "i" } },
        { phone:    { $regex: search, $options: "i" } },
      ];
    }

    const [owners, total] = await Promise.all([
      User.find(filter)
        .select("-password -resetToken -resetTokenExpiry -loginAttempts -lockUntil")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      owners: owners.map((o) => ({ ...o, id: o._id.toString(), _id: undefined })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/car-owners error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized" || msg === "Forbidden") {
      return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
