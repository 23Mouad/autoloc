import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PartnerRequest from "@/models/PartnerRequest";
import {
  sendPartnerRequestReceived,
  sendAdminPartnerRequestEmail,
} from "@/lib/email";

// POST /api/partner-requests — submit a partner application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, companyName, wilaya, fleetSize, message } = body;

    if (!name || !email || !phone || !companyName || !wilaya || !fleetSize) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await dbConnect();

    // Check for existing pending request from same email
    const existing = await PartnerRequest.findOne({
      email: email.toLowerCase(),
      status: "pending",
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending partner request" },
        { status: 409 }
      );
    }

    const request = await PartnerRequest.create({
      name,
      email: email.toLowerCase(),
      phone,
      companyName,
      wilaya,
      fleetSize: Number(fleetSize),
      message,
    });

    const requestId = request._id.toString();
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Email to applicant
    try {
      await sendPartnerRequestReceived({
        to: email,
        name,
        companyName,
        requestId,
      });
    } catch (e) {
      console.error("Partner request email to applicant failed:", e);
    }

    // Email to admin with action buttons
    try {
      await sendAdminPartnerRequestEmail({
        name,
        email,
        phone,
        companyName,
        wilaya,
        fleetSize: Number(fleetSize),
        message,
        requestId,
        acceptUrl: `${baseUrl}/api/partner-requests/${requestId}/accept?token=${process.env.AUTH_SECRET}`,
        rejectUrl: `${baseUrl}/api/partner-requests/${requestId}/reject?token=${process.env.AUTH_SECRET}`,
      });
    } catch (e) {
      console.error("Partner request email to admin failed:", e);
    }

    return NextResponse.json(
      { message: "Partner request submitted successfully", requestId },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/partner-requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/partner-requests — admin only: list all requests
export async function GET(req: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();

    if (!session?.user || (session.user as Record<string, unknown>).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter = status ? { status } : {};
    const requests = await PartnerRequest.find(filter).sort({ createdAt: -1 }).lean();

    const mapped = requests.map((r) => ({
      ...r,
      id: r._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/partner-requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
