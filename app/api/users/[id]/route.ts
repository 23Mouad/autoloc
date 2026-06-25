import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Car from "@/models/Car";
import AuditLog from "@/models/AuditLog";
import { auth, sessionUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/users/[id] — view profile (self or admin)
export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caller = sessionUser(session);
    const { id } = await params;

    // Only self or admin may view
    if (caller.id !== id && caller.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const user = await User.findOne({ _id: id, deletedAt: { $exists: false } })
      .select("-password -resetToken -resetTokenExpiry -loginAttempts -lockUntil")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    return NextResponse.json({ ...user, id: user._id.toString(), _id: undefined });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/users/[id] — update profile (self) or admin update
export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caller = sessionUser(session);
    const { id } = await params;

    const isSelf  = caller.id === id;
    const isAdmin = caller.role === "admin";

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const user = await User.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    const body = await req.json();

    // Fields any authenticated user can update on their own profile
    if (isSelf) {
      const { name, lastName, phone, wilaya, storeLocation, currentPassword, newPassword } = body;

      if (name)          user.name          = name;
      if (lastName)      user.lastName      = lastName;
      if (phone)         user.phone         = phone;
      if (wilaya)        user.wilaya        = wilaya;
      if (storeLocation !== undefined) user.storeLocation = storeLocation;

      // Password change
      if (newPassword) {
        if (!currentPassword) {
          return NextResponse.json({ error: "Mot de passe actuel requis." }, { status: 400 });
        }
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
          return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
        }
        if (newPassword.length < 8) {
          return NextResponse.json({ error: "Nouveau mot de passe trop court (min. 8 caractères)." }, { status: 400 });
        }
        user.password = await bcrypt.hash(newPassword, 12);
      }
    }

    await user.save();

    return NextResponse.json({ message: "Profil mis à jour avec succès." });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/users/[id] — admin hard delete OR self soft-delete
export async function DELETE(
  _req: NextRequest,
  { params }: Params
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caller = sessionUser(session);
    const { id } = await params;

    const isSelf  = caller.id === id;
    const isAdmin = caller.role === "admin";

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const user = await User.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    if (isAdmin && !isSelf) {
      // Admin hard-deletes (or soft, depending on policy) — we soft-delete
      user.deletedAt = new Date();
      user.status    = "suspended";
      await user.save();

      // Hide their cars if car owner
      if (user.role === "renter") {
        await Car.updateMany({ ownerId: user._id }, { $set: { available: false } });
      }

      await AuditLog.create({
        adminId:    caller.id,
        action:     "delete_user",
        targetId:   user._id,
        targetType: "User",
        details:    { email: user.email, role: user.role },
      });

      return NextResponse.json({ message: "Utilisateur supprimé (soft delete)." });
    }

    // Self soft-delete (deactivate)
    user.deletedAt = new Date();
    user.status    = "suspended";
    await user.save();

    return NextResponse.json({ message: "Compte désactivé." });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
