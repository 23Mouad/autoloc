import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import { auth } from "@/lib/auth";
import { sendBookingStatusEmail } from "@/lib/email";

// PUT /api/bookings/[id] — update booking status (admin or renter)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await req.json();

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    ).populate("carId");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Send status update email to customer
    if (body.status === "confirmed" || body.status === "cancelled") {
      try {
        const carName = (booking.carId as unknown as { name?: string })?.name || "Véhicule";
        await sendBookingStatusEmail({
          to: booking.email,
          fullName: booking.fullName,
          carName,
          status: body.status as "confirmed" | "cancelled",
          bookingId: booking._id.toString(),
        });
      } catch (emailErr) {
        console.error("Failed to send booking status email:", emailErr);
      }
    }

    return NextResponse.json({ message: "Booking updated", status: booking.status });
  } catch (error) {
    console.error("PUT /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/bookings/[id] — admin only
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as Record<string, unknown>).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const deleted = await Booking.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Booking deleted" });
  } catch (error) {
    console.error("DELETE /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/bookings/[id] — get single booking
export async function GET(
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
    const booking = await Booking.findById(id).populate("carId").lean();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ ...booking, id: String(booking._id), _id: undefined });
  } catch (error) {
    console.error("GET /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
