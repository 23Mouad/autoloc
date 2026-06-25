import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import { requireAdmin, sessionUser } from "@/lib/auth";
import { sendAdminAnnouncementEmail } from "@/lib/email";

/**
 * POST /api/admin/notifications
 * Body: { title, message, targetType, targetWilaya?, recipientIds?, sendEmail }
 *
 * targetType:
 *   "all"        — all users and car owners
 *   "users"      — only customers
 *   "car_owners" — only renters (car owners)
 *   "wilaya"     — users in a specific wilaya (requires targetWilaya)
 *   "individual" — specific users (requires recipientIds[])
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const admin   = sessionUser(session);

    const body = await req.json();
    const { title, message, targetType, targetWilaya, recipientIds, sendEmail } = body;

    if (!title || !message || !targetType) {
      return NextResponse.json(
        { error: "title, message et targetType sont obligatoires." },
        { status: 400 }
      );
    }

    const validTargets = ["all", "users", "car_owners", "wilaya", "individual"];
    if (!validTargets.includes(targetType)) {
      return NextResponse.json({ error: "targetType invalide." }, { status: 400 });
    }

    if (targetType === "wilaya" && !targetWilaya) {
      return NextResponse.json({ error: "targetWilaya est obligatoire pour ce type." }, { status: 400 });
    }

    if (targetType === "individual" && (!Array.isArray(recipientIds) || recipientIds.length === 0)) {
      return NextResponse.json({ error: "recipientIds[] est obligatoire pour ce type." }, { status: 400 });
    }

    await dbConnect();

    // ── Build notification records ─────────────────────────────────
    if (targetType === "individual") {
      // One record per recipient
      const docs = (recipientIds as string[]).map((id: string) => ({
        recipientId: id,
        targetType,
        title,
        message,
        sendEmail:   !!sendEmail,
        readBy:      [],
        createdBy:   admin.id,
      }));
      await Notification.insertMany(docs);

      if (sendEmail) {
        const users = await User.find({ _id: { $in: recipientIds }, deletedAt: { $exists: false } })
          .select("name lastName email")
          .lean();
        for (const u of users) {
          await sendAdminAnnouncementEmail({
            to:            u.email,
            recipientName: `${u.name} ${u.lastName}`,
            title,
            message,
          }).catch((e) => console.error("Email error:", e));
        }
      }
    } else {
      // Single broadcast record
      await Notification.create({
        recipientId:  undefined,
        targetType,
        targetWilaya: targetWilaya || undefined,
        title,
        message,
        sendEmail:    !!sendEmail,
        readBy:       [],
        createdBy:    admin.id,
      });

      if (sendEmail) {
        // Build user filter based on targetType
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: Record<string, any> = { deletedAt: { $exists: false } };
        if (targetType === "users")      filter.role   = "customer";
        if (targetType === "car_owners") filter.role   = "renter";
        if (targetType === "wilaya")     filter.wilaya = targetWilaya;

        const users = await User.find(filter).select("name lastName email").lean();
        for (const u of users) {
          await sendAdminAnnouncementEmail({
            to:            u.email,
            recipientName: `${u.name} ${u.lastName}`,
            title,
            message,
          }).catch((e) => console.error("Email error:", e));
        }
      }
    }

    // Audit log
    await AuditLog.create({
      adminId:  admin.id,
      action:   "send_notification",
      details:  { targetType, targetWilaya, recipientIds, title, sendEmail },
    });

    return NextResponse.json({ message: "Notification envoyée avec succès." }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/notifications error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg === "Unauthorized" || msg === "Forbidden") {
      return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
