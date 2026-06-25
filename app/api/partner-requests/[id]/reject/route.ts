import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PartnerRequest from "@/models/PartnerRequest";
import { sendPartnerRejectedEmail } from "@/lib/email";

// GET /api/partner-requests/[id]/reject — email link action
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleReject(req, params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleReject(req, params);
}

async function handleReject(
  req: NextRequest,
  paramsPromise: Promise<{ id: string }>
) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const validToken = token === process.env.AUTH_SECRET;

    let reason: string | undefined;

    if (!validToken) {
      const { auth } = await import("@/lib/auth");
      const session = await auth();
      if (!session?.user || (session.user as Record<string, unknown>).role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Allow reason in body for admin panel
      if (req.method === "POST") {
        try {
          const body = await req.json();
          reason = body.reason;
        } catch {
          // no body
        }
      }
    }

    await dbConnect();
    const { id } = await paramsPromise;

    const request = await PartnerRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status !== "pending") {
      const msg = `This request has already been ${request.status}.`;
      if (req.method === "GET") {
        return new NextResponse(
          `<html><body style="font-family:Arial;text-align:center;padding:50px;background:#0f172a;color:#e2e8f0;"><h2>ℹ️ ${msg}</h2><a href="${process.env.NEXTAUTH_URL}/admin" style="color:#f59e0b;">Go to Admin Panel</a></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    request.status = "rejected";
    if (reason) request.rejectionReason = reason;
    await request.save();

    try {
      await sendPartnerRejectedEmail({
        to: request.email,
        name: request.name,
        companyName: request.companyName,
        reason,
      });
    } catch (e) {
      console.error("Failed to send rejection email:", e);
    }

    if (req.method === "GET") {
      return new NextResponse(
        `<html><body style="font-family:Arial;text-align:center;padding:50px;background:#0f172a;color:#e2e8f0;">
          <h1 style="color:#ef4444;">❌ Partner Request Rejected</h1>
          <p style="color:#94a3b8;">An email has been sent to <strong style="color:#e2e8f0;">${request.email}</strong></p>
          <a href="${process.env.NEXTAUTH_URL}/admin/partner-requests" style="color:#f59e0b;font-size:14px;">← Back to Admin Panel</a>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    return NextResponse.json({ message: "Partner request rejected" });
  } catch (error) {
    console.error("Reject partner request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
