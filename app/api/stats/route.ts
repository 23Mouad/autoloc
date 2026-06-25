import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

// GET /api/stats — monthly revenue aggregation
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const role = (session.user as Record<string, unknown>).role;
    const userId = (session.user as Record<string, unknown>).id as string;

    // Build match filter based on role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let matchFilter: Record<string, any> = { status: "confirmed" };

    if (role === "renter") {
      // Get car IDs owned by this renter
      const ownerCars = await Car.find({ ownerId: userId }).select("_id").lean();
      const carIds = ownerCars.map((c) => c._id);
      matchFilter.carId = { $in: carIds };
    } else if (role === "customer") {
      matchFilter.userId = new mongoose.Types.ObjectId(userId);
    }
    // admin sees all

    // Monthly aggregation for last 12 months
    const monthlyData = await Booking.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    // Format for chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formatted = monthlyData.map((d) => ({
      label: `${monthNames[d._id.month - 1]} ${d._id.year}`,
      revenue: d.revenue,
      count: d.count,
    }));

    // Summary stats
    const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
    const totalBookings = monthlyData.reduce((sum, d) => sum + d.count, 0);

    return NextResponse.json({
      monthly: formatted,
      totalRevenue,
      totalBookings,
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
