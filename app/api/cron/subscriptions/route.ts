import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscription, { ISubscription } from "@/models/Subscription";
import User from "@/models/User";
import Car from "@/models/Car";
import {
  sendTrialEndingReminderEmail,
  sendTrialExpiredEmail,
  sendSubscriptionExpiredEmail,
} from "@/lib/email";

/**
 * GET /api/cron/subscriptions
 *
 * Called daily by a cron scheduler (Vercel Cron, cron-job.org, etc.)
 * Secured by CRON_SECRET environment variable.
 *
 * Logic:
 *  1. Send 7-day, 3-day, 1-day reminders for expiring trial/monthly subs
 *  2. Expire subscriptions past their end date → hide owner + cars
 */
export async function GET(req: NextRequest) {
  // Validate cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const now  = new Date();
  const results = {
    reminders7d: 0,
    reminders3d: 0,
    reminders1d: 0,
    expired:     0,
    errors:      [] as string[],
  };

  // ── Helper: get owner name ─────────────────────────────────────
  async function getOwner(ownerId: unknown) {
    return User.findById(ownerId).select("name lastName email").lean();
  }

  // ── Helper: format date ────────────────────────────────────────
  function fmtDate(d: Date) {
    return d.toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric" });
  }

  // ── 1. Active/Trial subscriptions ─────────────────────────────
  const activeSubs = await Subscription.find({
    status: { $in: ["trial", "active"] },
  }).lean();

  for (const sub of activeSubs) {
    const endDate = sub.status === "trial" ? sub.trialEndDate : sub.subscriptionEnd;
    if (!endDate) continue;

    const msLeft   = endDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

    try {
      const owner = await getOwner(sub.ownerId);
      if (!owner) continue;

      const name = `${owner.name} ${owner.lastName}`;
      const trialEndDateStr = fmtDate(endDate);

      // ── 7-day reminder ──────────────────────────────────────
      if (daysLeft <= 7 && daysLeft > 3 && !sub.reminderSent7d) {
        await sendTrialEndingReminderEmail({
          to: owner.email, name, daysLeft, trialEndDate: trialEndDateStr,
        });
        await Subscription.updateOne(
          { _id: sub._id },
          { $set: { reminderSent7d: true } }
        );
        results.reminders7d++;
      }

      // ── 3-day reminder ──────────────────────────────────────
      if (daysLeft <= 3 && daysLeft > 1 && !sub.reminderSent3d) {
        await sendTrialEndingReminderEmail({
          to: owner.email, name, daysLeft, trialEndDate: trialEndDateStr,
        });
        await Subscription.updateOne(
          { _id: sub._id },
          { $set: { reminderSent3d: true } }
        );
        results.reminders3d++;
      }

      // ── 1-day reminder ──────────────────────────────────────
      if (daysLeft <= 1 && daysLeft >= 0 && !sub.reminderSent1d) {
        await sendTrialEndingReminderEmail({
          to: owner.email, name, daysLeft: Math.max(1, daysLeft), trialEndDate: trialEndDateStr,
        });
        await Subscription.updateOne(
          { _id: sub._id },
          { $set: { reminderSent1d: true } }
        );
        results.reminders1d++;
      }

      // ── Expire ────────────────────────────────────────────────
      if (daysLeft < 0) {
        await Subscription.updateOne(
          { _id: sub._id },
          { $set: { status: "expired" } }
        );

        // Hide owner and their cars
        await User.updateOne({ _id: sub.ownerId }, { $set: { status: "hidden" } });
        await Car.updateMany({ ownerId: sub.ownerId }, { $set: { available: false } });

        // Send expiry email
        if (sub.status === "trial") {
          await sendTrialExpiredEmail({ to: owner.email, name });
        } else {
          await sendSubscriptionExpiredEmail({ to: owner.email, name });
        }

        results.expired++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`Sub ${sub._id}: ${msg}`);
    }
  }

  return NextResponse.json({
    ok: true,
    processedAt: now.toISOString(),
    ...results,
  });
}
