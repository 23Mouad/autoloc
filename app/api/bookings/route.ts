import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import {
  sendBookingConfirmationEmail,
  sendAdminNewBookingEmail,
} from "@/lib/email";

// GET /api/bookings — admin sees all, renter sees bookings on their cars, users see their own
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const role = (session.user as Record<string, unknown>).role;
    const userId = (session.user as Record<string, unknown>).id as string;

    const { searchParams } = new URL(req.url);
    const filterOwner = searchParams.get("ownerId");

    let bookings;
    if (role === "admin") {
      bookings = await Booking.find().populate("carId").populate("userId", "name lastName email phone").sort({ createdAt: -1 }).lean();
    } else if (role === "renter") {
      if (filterOwner === "me") {
        const ownerCars = await Car.find({ ownerId: userId }).select("_id").lean();
        const carIds = ownerCars.map((c) => c._id);
        bookings = await Booking.find({ carId: { $in: carIds } })
          .populate("carId")
          .populate("userId", "name lastName email phone")
          .sort({ createdAt: -1 })
          .lean();
      } else {
        const ownerCars = await Car.find({ ownerId: userId }).select("_id").lean();
        const carIds = ownerCars.map((c) => c._id);
        bookings = await Booking.find({
          $or: [{ userId }, { carId: { $in: carIds } }],
        })
          .populate("carId")
          .populate("userId", "name lastName email phone")
          .sort({ createdAt: -1 })
          .lean();
      }
    } else {
      bookings = await Booking.find({ userId }).populate("carId").sort({ createdAt: -1 }).lean();
    }

    const mapped = bookings.map((b) => ({
      ...b,
      id: b._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/bookings — create a booking
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { carId, fullName, email, phone, pickupLocation, pickupDate, returnDate, totalPrice } = body;

    if (!carId || !fullName || !email || !phone || !pickupLocation || !pickupDate || !returnDate || !totalPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Optionally attach userId if logged in
    const session = await auth();
    const userId = session?.user
      ? ((session.user as Record<string, unknown>).id as string)
      : undefined;

    const booking = await Booking.create({
      carId,
      userId,
      fullName,
      email,
      phone,
      pickupLocation,
      pickupDate: new Date(pickupDate),
      returnDate: new Date(returnDate),
      totalPrice,
      status: "pending",
    });

    // Fetch car name for emails
    const car = await Car.findById(carId).lean();
    const carName = (car as unknown as { name?: string })?.name || "Véhicule";
    const pickupStr = new Date(pickupDate).toLocaleDateString("fr-DZ");
    const returnStr = new Date(returnDate).toLocaleDateString("fr-DZ");

    // Send confirmation email to customer
    try {
      await sendBookingConfirmationEmail({
        to: email,
        fullName,
        carName,
        pickupDate: pickupStr,
        returnDate: returnStr,
        pickupLocation,
        totalPrice,
        bookingId: booking._id.toString(),
      });
    } catch (emailErr) {
      console.error("Failed to send booking confirmation email:", emailErr);
    }

    // Send alert to admin
    try {
      const adminUser = await User.findOne({ role: "admin" }).lean();
      const adminEmail = (adminUser as unknown as { email?: string })?.email || process.env.SMTP_USER!;
      await sendAdminNewBookingEmail({
        adminEmail,
        fullName,
        email,
        phone,
        carName,
        pickupDate: pickupStr,
        returnDate: returnStr,
        totalPrice,
        bookingId: booking._id.toString(),
      });
    } catch (emailErr) {
      console.error("Failed to send admin booking alert:", emailErr);
    }

    return NextResponse.json(
      { message: "Booking created", id: booking._id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
