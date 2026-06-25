import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Car from "@/models/Car";
import Booking from "@/models/Booking";
import Subscription from "@/models/Subscription";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    const now      = new Date();
    const in7d     = new Date(now.getTime() + 7  * 24 * 60 * 60 * 1000);
    const last7d   = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
    const last30d  = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last365d = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // ── User stats ────────────────────────────────────────────────────
    const [
      totalCustomers, totalCarOwners,
      pendingVerification, pendingApproval,
      activeAccounts, suspendedAccounts, hiddenAccounts,
      newCustomersLast30d, newOwnersLast30d,
      newUsersLast7d,
    ] = await Promise.all([
      User.countDocuments({ role: "customer",              deletedAt: { $exists: false } }),
      User.countDocuments({ role: "renter",                deletedAt: { $exists: false } }),
      User.countDocuments({ status: "pending_verification",deletedAt: { $exists: false } }),
      User.countDocuments({ status: "pending_approval",    deletedAt: { $exists: false } }),
      User.countDocuments({ status: "active",              deletedAt: { $exists: false } }),
      User.countDocuments({ status: "suspended",           deletedAt: { $exists: false } }),
      User.countDocuments({ status: "hidden",              deletedAt: { $exists: false } }),
      User.countDocuments({ role: "customer", createdAt: { $gte: last30d }, deletedAt: { $exists: false } }),
      User.countDocuments({ role: "renter",   createdAt: { $gte: last30d }, deletedAt: { $exists: false } }),
      User.countDocuments({                   createdAt: { $gte: last7d  }, deletedAt: { $exists: false } }),
    ]);

    // ── Registration trend (last 30 days, grouped by day) ─────────────
    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: last30d }, deletedAt: { $exists: false } } },
      {
        $group: {
          _id: {
            year:  { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day:   { $dayOfMonth: "$createdAt" },
            role:  "$role",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // ── Users by Wilaya ───────────────────────────────────────────────
    const usersByWilaya = await User.aggregate([
      { $match: { deletedAt: { $exists: false } } },
      { $group: { _id: "$wilaya", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // ── Subscription stats ────────────────────────────────────────────
    const [
      trialSubs, activeSubs, expiredSubs, expiringSoon,
    ] = await Promise.all([
      Subscription.countDocuments({ status: "trial" }),
      Subscription.countDocuments({ status: "active" }),
      Subscription.countDocuments({ status: "expired" }),
      Subscription.countDocuments({
        status: { $in: ["trial", "active"] },
        $or: [
          { plan: "trial",   trialEndDate:    { $gte: now, $lte: in7d } },
          { plan: "monthly", subscriptionEnd: { $gte: now, $lte: in7d } },
        ],
      }),
    ]);

    const estimatedMRR = activeSubs * 2000; // 2000 DZD per active sub

    // Subscriptions created per month (last 12 months)
    const subscriptionTrend = await Subscription.aggregate([
      { $match: { createdAt: { $gte: last365d } } },
      {
        $group: {
          _id: {
            year:  { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // ── Car stats ─────────────────────────────────────────────────────
    const [totalCars, availableCars, unavailableCars] = await Promise.all([
      Car.countDocuments({}),
      Car.countDocuments({ available: true }),
      Car.countDocuments({ available: false }),
    ]);

    // Cars by wilaya
    const carsByWilaya = await Car.aggregate([
      { $group: { _id: "$wilaya", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // ── Booking stats ─────────────────────────────────────────────────
    const [
      totalBookings, pendingBookings, confirmedBookings, cancelledBookings,
      bookingsLast30d, bookingsLast7d,
    ] = await Promise.all([
      Booking.countDocuments({}),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.countDocuments({ createdAt: { $gte: last30d } }),
      Booking.countDocuments({ createdAt: { $gte: last7d } }),
    ]);

    // Total revenue from confirmed bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total ?? 0;

    // Revenue last 30 days
    const revenueAgg30d = await Booking.aggregate([
      { $match: { status: "confirmed", createdAt: { $gte: last30d } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const revenueLast30d = revenueAgg30d[0]?.total ?? 0;

    // Monthly booking trend (last 12 months)
    const bookingTrend = await Booking.aggregate([
      { $match: { createdAt: { $gte: last365d } } },
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status",
          },
          count:   { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // ── Top Car Owners (by bookings) ──────────────────────────────────
    const topOwners = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $lookup: {
          from: "cars", localField: "carId", foreignField: "_id", as: "car",
        },
      },
      { $unwind: { path: "$car", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users", localField: "car.ownerId", foreignField: "_id", as: "owner",
        },
      },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$owner._id",
          ownerName:  { $first: { $concat: ["$owner.name", " ", "$owner.lastName"] } },
          ownerEmail: { $first: "$owner.email" },
          bookings:   { $sum: 1 },
          revenue:    { $sum: "$totalPrice" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // ── Recent activity (last 10 registrations) ───────────────────────
    const recentUsers = await User.find({ deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name lastName email role status wilaya createdAt");

    // ── Pending approvals detail ───────────────────────────────────────
    const pendingOwners = await User.find({
      role: "renter",
      status: "pending_approval",
      deletedAt: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name lastName email phone wilaya createdAt");

    return NextResponse.json({
      generatedAt: now.toISOString(),
      users: {
        totalCustomers,
        totalCarOwners,
        total: totalCustomers + totalCarOwners,
        pendingVerification,
        pendingApproval,
        active: activeAccounts,
        suspended: suspendedAccounts,
        hidden: hiddenAccounts,
        newCustomersLast30d,
        newOwnersLast30d,
        newUsersLast7d,
      },
      subscriptions: {
        trial: trialSubs,
        active: activeSubs,
        expired: expiredSubs,
        expiringSoon,
        estimatedMRR,
        trend: subscriptionTrend,
      },
      cars: {
        total: totalCars,
        available: availableCars,
        unavailable: unavailableCars,
        byWilaya: carsByWilaya,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        last30d: bookingsLast30d,
        last7d: bookingsLast7d,
        trend: bookingTrend,
      },
      revenue: {
        total: totalRevenue,
        last30d: revenueLast30d,
      },
      registrationTrend,
      usersByWilaya,
      topOwners,
      recentUsers,
      pendingOwners,
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
