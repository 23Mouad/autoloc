"use client";

import { useEffect, useState } from "react";
import { Users, Phone, Mail, Calendar } from "lucide-react";

interface RenterBooking {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  status: string;
  carId: { name?: string } | string;
  userId: { name?: string; lastName?: string; email?: string; phone?: string } | string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/10 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function ActiveRentersPage() {
  const [bookings, setBookings] = useState<RenterBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending">("all");

  useEffect(() => {
    fetch("/api/bookings?ownerId=me")
      .then((res) => res.json())
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getCarName = (carId: RenterBooking["carId"]) => {
    if (typeof carId === "object" && carId?.name) return carId.name;
    return "—";
  };

  const getRenterInfo = (b: RenterBooking) => {
    if (typeof b.userId === "object" && b.userId) {
      return {
        name: `${b.userId.name || ""} ${b.userId.lastName || ""}`.trim() || b.fullName,
        email: b.userId.email || b.email,
        phone: b.userId.phone || b.phone,
      };
    }
    return { name: b.fullName, email: b.email, phone: b.phone };
  };

  const filtered = bookings.filter((b) => {
    if (filter === "all") return b.status !== "cancelled";
    return b.status === filter;
  });

  const now = new Date();

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Active Renters</h1>
          <p className="text-sm text-text-secondary mt-1">People currently using your cars</p>
        </div>
        <div className="flex gap-2">
          {(["all", "confirmed", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors capitalize ${
                filter === f
                  ? "bg-accent/10 text-accent border-accent/30"
                  : "bg-bg-secondary text-text-secondary border-border hover:border-accent/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-bg-secondary border border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary">No active renters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const renter = getRenterInfo(b);
            const isActive = new Date(b.pickupDate) <= now && new Date(b.returnDate) >= now && b.status === "confirmed";
            return (
              <div
                key={b.id}
                className={`bg-bg-secondary border rounded-xl p-5 transition-colors ${
                  isActive ? "border-accent/30" : "border-border hover:border-accent/20"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-accent font-bold text-sm">
                          {renter.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">{renter.name}</h3>
                        <p className="text-xs text-accent font-medium">{getCarName(b.carId)}</p>
                      </div>
                      {isActive && (
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/30 rounded-full">
                          Currently Active
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Mail size={12} className="text-text-muted" /> {renter.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-text-muted" /> {renter.phone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-text-muted" />
                        {new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-bold text-text-primary">
                      {b.totalPrice.toLocaleString("fr-DZ")} DZD
                    </span>
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusColors[b.status] || ""}`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
