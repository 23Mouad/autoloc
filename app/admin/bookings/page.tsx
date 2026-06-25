"use client";

import { useEffect, useState } from "react";

interface BookingItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  carId: { name?: string } | string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/10 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: status as BookingItem["status"] } : b))
      );
    }
  };

  const getCarName = (carId: BookingItem["carId"]) => {
    if (typeof carId === "object" && carId?.name) return carId.name;
    return "—";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Bookings</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-bg-secondary border border-border animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-text-secondary text-center py-10">No bookings yet</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-bg-secondary border border-border rounded-xl p-5 hover:border-accent/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{b.fullName}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {getCarName(b.carId)} · {b.email} · {b.phone}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()} · {b.totalPrice.toLocaleString("fr-DZ")} DZD
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusColors[b.status]}`}>
                    {b.status}
                  </span>
                  {b.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(b.id, "confirmed")}
                        className="px-3 py-1 text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, "cancelled")}
                        className="px-3 py-1 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
