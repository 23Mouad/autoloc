import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Car from "@/models/Car";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import { auth, sessionUser } from "@/lib/auth";

// GET /api/cars — public listing
// Excludes cars from hidden/suspended owners
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category  = searchParams.get("category");
    const available = searchParams.get("available");
    const limit     = searchParams.get("limit");
    const minPrice  = searchParams.get("minPrice");
    const maxPrice  = searchParams.get("maxPrice");
    const wilaya    = searchParams.get("wilaya");
    const search    = searchParams.get("search");

    // Get all ACTIVE owner IDs (hidden/suspended owners' cars must not appear publicly)
    const activeOwnerIds = await User.find({
      role:      "renter",
      status:    "active",
      deletedAt: { $exists: false },
    }).select("_id").lean();

    const ownerIdSet = activeOwnerIds.map((o) => o._id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      // Either no owner (admin-created) OR active owner
      $or: [
        { ownerId: { $exists: false } },
        { ownerId: { $in: ownerIdSet } },
      ],
    };

    if (category)          filter.category    = category;
    if (available === "true") filter.available = true;
    if (wilaya)            filter["location.zone"] = { $regex: wilaya, $options: "i" };
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$and = [
        filter.$or ? { $or: filter.$or } : {},
        {
          $or: [
            { name:        { $regex: search, $options: "i" } },
            { brand:       { $regex: search, $options: "i" } },
            { model:       { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      ];
      delete filter.$or;
    }

    let query = Car.find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(Number(limit));

    const cars = await query.lean();

    const mapped = cars.map((car) => ({
      ...car,
      id:   car._id.toString(),
      _id:  undefined,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/cars error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/cars — create car
// Gate: must be renter + account active + subscription not expired
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caller = sessionUser(session);
    const role   = caller.role;

    if (role !== "admin" && role !== "renter") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Car owner subscription check
    if (role === "renter") {
      if (caller.status !== "active") {
        return NextResponse.json(
          { error: "Votre compte doit être actif pour ajouter un véhicule." },
          { status: 403 }
        );
      }

      await dbConnect();

      const sub = await Subscription.findOne({ ownerId: caller.id });
      if (!sub || sub.status === "expired" || sub.status === "cancelled") {
        return NextResponse.json(
          { error: "Abonnement expiré. Veuillez renouveler pour ajouter des véhicules." },
          { status: 403 }
        );
      }
    } else {
      await dbConnect();
    }

    const body = await req.json();

    const {
      name, brand, model, year, category, transmission, fuel,
      seats, doors, ac, trunkLiters, pricePerDay, pricePerWeek,
      images, description, features, location,
    } = body;

    if (!name || !brand || !model || !year || !category || !transmission || !fuel ||
        !seats || !doors || !pricePerDay || !pricePerWeek || !description || !location) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    const car = await Car.create({
      name, brand, model, year, category, transmission, fuel,
      seats, doors,
      ac:          ac !== undefined ? ac : true,
      trunkLiters: trunkLiters || 0,
      pricePerDay, pricePerWeek,
      available:   true,
      images:      images || [],
      description,
      features:    features || [],
      location,
      ownerId:     role === "renter" ? caller.id : undefined,
    });

    return NextResponse.json(
      { message: "Véhicule ajouté avec succès.", id: car._id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/cars error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
