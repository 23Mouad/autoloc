import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Car from "@/models/Car";
import Booking from "@/models/Booking";
import Subscription from "@/models/Subscription";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/dashboard
 * Full platform statistics for the admin dashboard.
 */
export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    const now     = new Date();
    const in7d    = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ── User stats ────────────────────────────────────────────────
    const [
      totalUsers,
      totalCarOwners,
      pendingVerification,
      pendingApproval,
      activeAccounts,
      suspendedAccounts,
      hiddenAccounts,
    ] = await Promise.all([
      User.countDocuments({ role: "customer",  deletedAt: { $exists: false } }),
      User.countDocuments({ role: "renter",    deletedAt: { $exists: false } }),
      User.countDocuments({ status: "pending_verification", deletedAt: { $exists: false } }),
      User.countDocuments({ status: "pending_approval",     deletedAt: { $exists: false } }),
      User.countDocuments({ status: "active",               deletedAt: { $exists: false } }),
      User.countDocuments({ status: "suspended",            deletedAt: { $exists: false } }),
      User.countDocuments({ status: "hidden",               deletedAt: { $exists: false } }),
    ]);

    // ── Subscription stats ─────────────────────────────────────────
    const [
      trialSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      expiringSoonCount,
    ] = await Promise.all([
      Subscription.countDocuments({ status: "trial" }),
      Subscription.countDocuments({ status: "active" }),
      Subscription.countDocuments({ status: "expired" }),
      Subscription.countDocuments({
        status: { $in: ["trial", "active"] },
        $or: [
          { plan: "trial",   trialEndDate:   { $gte: now, $lte: in7d } },
          { plan: "monthly", subscriptionEnd: { $gte: now, $lte: in7d } },
        ],
      }),
    ]);

    // Estimated monthly revenue
    const estimatedMonthlyRevenue = activeSubscriptions * 2000;

    // ── Platform growth ────────────────────────────────────────────
    const [newUsersLast30d, newOwnersLast30d] = await Promise.all([
      User.countDocuments({ role: "customer", createdAt: { $gte: last30d }, deletedAt: { $exists: false } }),
      User.countDocuments({ role: "renter",   createdAt: { $gte: last30d }, deletedAt: { $exists: false } }),
    ]);

    // ── Car stats ──────────────────────────────────────────────────
    const [totalCars, availableCars] = await Promise.all([
      Car.countDocuments({}),
      Car.countDocuments({ available: true }),
    ]);

    // ── Booking stats ──────────────────────────────────────────────
    const [totalBookings, pendingBookings, confirmedBookings] = await Promise.all([
      Booking.countDocuments({}),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
    ]);

    // ── Recent registrations (last 7 days, grouped by day) ─────────
    const recentRegistrations = await User.aggregate([
      {
        $match: {
          createdAt:  { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
          deletedAt:  { $exists: false },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" },
            day:   { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    return NextResponse.json({
      users: {
        total:               totalUsers,
        totalCarOwners,
        pendingVerification,
        pendingApproval,
        active:              activeAccounts,
        suspended:           suspendedAccounts,
        hidden:              hiddenAccounts,
        newLast30d:          newUsersLast30d,
        newOwnersLast30d,
      },
      subscriptions: {
        trial:               trialSubscriptions,
        active:              activeSubscriptions,
        expired:             expiredSubscriptions,
        expiringSoon:        expiringSoonCount,
        estimatedMonthlyRevenue,
      },
      cars: {
        total:               totalCars,
        available:           availableCars,
      },
      bookings: {
        total:               totalBookings,
        pending:             pendingBookings,
        confirmed:           confirmedBookings,
      },
      recentRegistrations,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized" || msg === "Forbidden") {
      return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
