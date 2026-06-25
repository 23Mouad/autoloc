import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import { sendContactEmail, sendContactAutoReply } from "@/lib/email";

// POST /api/contact — submit contact form
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, subject, message } = body;

    if (!fullName || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await dbConnect();

    // Save to database
    await ContactMessage.create({ fullName, email, phone, subject, message });

    // Send email to admin
    await sendContactEmail({ fullName, email, phone, subject, message });

    // Auto-reply to sender
    await sendContactAutoReply({ to: email, fullName, subject });

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/contact — admin only: get all messages
export async function GET() {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();

    if (!session?.user || (session.user as Record<string, unknown>).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    const mapped = messages.map((m) => ({
      ...m,
      id: m._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/contact error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
