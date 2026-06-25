import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Car from "@/models/Car";
import { auth } from "@/lib/auth";

// GET /api/cars — public, list all cars with optional filters
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const available = searchParams.get("available");
    const limit = searchParams.get("limit");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (category) filter.category = category;
    if (available === "true") filter.available = true;
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    let query = Car.find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(Number(limit));

    const cars = await query.lean();

    // Map _id to id for frontend compatibility
    const mapped = cars.map((car) => ({
      ...car,
      id: car._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/cars error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/cars — create car (admin or renter only)
export async function POST(req: NextRequest) {
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
    const body = await req.json();

    const car = await Car.create({
      ...body,
      ownerId: (session.user as Record<string, unknown>).id,
    });

    return NextResponse.json(
      { message: "Car created", id: car._id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/cars error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
