import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/users
 * Query: role, status, wilaya, search, page, limit
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const role   = searchParams.get("role");
    const status = searchParams.get("status");
    const wilaya = searchParams.get("wilaya");
    const search = searchParams.get("search");
    const page   = Math.max(1, Number(searchParams.get("page")  || "1"));
    const limit  = Math.min(100, Number(searchParams.get("limit") || "20"));
    const skip   = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      deletedAt: { $exists: false },
    };

    if (role)    filter.role   = role;
    if (status)  filter.status = status;
    if (wilaya)  filter.wilaya = wilaya;
    if (search) {
      filter.$or = [
        { name:     { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email:    { $regex: search, $options: "i" } },
        { phone:    { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -resetToken -resetTokenExpiry -loginAttempts -lockUntil")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({ ...u, id: u._id.toString(), _id: undefined })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized" || msg === "Forbidden") {
      return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
