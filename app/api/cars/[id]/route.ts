import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Car from "@/models/Car";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import { auth, sessionUser, AuthUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/** Helper — verify caller can edit/delete a car */
async function assertOwnerOrAdmin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  car: any
): Promise<AuthUser> {
  if (!session?.user) throw new Error("Unauthorized");
  const caller = sessionUser(session);

  if (caller.role === "admin") return caller; // admin can always edit

  if (caller.role !== "renter") throw new Error("Forbidden");
  if (car?.ownerId?.toString() !== caller.id) throw new Error("Forbidden");

  // Car owner: must have active status and valid subscription
  if (caller.status !== "active") throw new Error("account_inactive");

  const sub = await Subscription.findOne({ ownerId: caller.id });
  if (!sub || sub.status === "expired" || sub.status === "cancelled") {
    throw new Error("subscription_required");
  }

  return caller;
}

// GET /api/cars/[id] — public
export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  try {
    await dbConnect();
    const { id } = await params;
    const car = await Car.findById(id).lean();
    if (!car) {
      return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });
    }

    // Check owner visibility for public requests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const carDoc = car as any;
    if (carDoc.ownerId) {
      const owner = await User.findOne({ _id: carDoc.ownerId }).select("status deletedAt").lean();
      if (!owner || (owner as any).deletedAt || (owner as any).status !== "active") {
        return NextResponse.json({ error: "Véhicule non disponible." }, { status: 404 });
      }
    }

    return NextResponse.json({ ...car, id: (car as any)._id.toString(), _id: undefined });
  } catch (error) {
    console.error("GET /api/cars/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/cars/[id] — update car (owner or admin)
export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  try {
    const session = await auth();
    await dbConnect();
    const { id } = await params;

    const car = await Car.findById(id);
    if (!car) {
      return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });
    }

    try {
      await assertOwnerOrAdmin(session, car);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Forbidden";
      if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
      return NextResponse.json({ error: msg }, { status: 403 });
    }

    const body = await req.json();
    // Prevent overwriting ownerId or _id
    delete body.ownerId;
    delete body._id;

    Object.assign(car, body);
    await car.save();

    return NextResponse.json({ message: "Véhicule mis à jour." });
  } catch (error) {
    console.error("PUT /api/cars/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/cars/[id] — partial update (same rules as PUT)
export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  return PUT(req, { params });
}

// DELETE /api/cars/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: Params
) {
  try {
    const session = await auth();
    await dbConnect();
    const { id } = await params;

    const car = await Car.findById(id);
    if (!car) {
      return NextResponse.json({ error: "Véhicule introuvable." }, { status: 404 });
    }

    try {
      await assertOwnerOrAdmin(session, car);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Forbidden";
      if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
      return NextResponse.json({ error: msg }, { status: 403 });
    }

    await Car.findByIdAndDelete(id);
    return NextResponse.json({ message: "Véhicule supprimé." });
  } catch (error) {
    console.error("DELETE /api/cars/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
