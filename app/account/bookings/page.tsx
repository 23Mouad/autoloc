"use client";

import { useEffect, useState } from "react";
import { DollarSign, CalendarCheck } from "lucide-react";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("@/components/charts/BarChart"), { ssr: false });

interface BookingItem {
  id: string;
  fullName: string;
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  status: string;
  carId: { name?: string } | string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/10 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function AccountBookingsPage() {
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

  const getCarName = (carId: BookingItem["carId"]) => {
    if (typeof carId === "object" && carId?.name) return carId.name;
    return "—";
  };

  // Expense summary
  const totalSpent = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const activeCount = bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length;

  // Monthly spending data
  const monthlyMap = new Map<string, number>();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  bookings
    .filter((b) => b.status === "confirmed")
    .forEach((b) => {
      const d = new Date(b.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + b.totalPrice);
    });
  const monthlyLabels = Array.from(monthlyMap.keys());
  const monthlyValues = Array.from(monthlyMap.values());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">My Bookings</h1>

      {/* Expense Summary */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-bg-secondary border border-border rounded-xl p-4 hover:border-accent/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Total Spent</span>
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <DollarSign size={16} className="text-accent" />
                </div>
              </div>
              <p className="text-xl font-bold text-text-primary">{totalSpent.toLocaleString("fr-DZ")} DZD</p>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-4 hover:border-accent/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Active Bookings</span>
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CalendarCheck size={16} className="text-green-400" />
                </div>
              </div>
              <p className="text-xl font-bold text-text-primary">{activeCount}</p>
            </div>
          </div>

          {/* Monthly Spending Chart */}
          {monthlyLabels.length > 0 && (
            <div className="bg-bg-secondary border border-border rounded-xl p-6">
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Monthly Spending</h2>
              <BarChart labels={monthlyLabels} values={monthlyValues} suffix=" DZD" height={200} color="#c1e930" />
            </div>
          )}
        </>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-secondary border border-border animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-text-secondary text-center py-10">No bookings yet</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-bg-secondary border border-border rounded-xl p-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{getCarName(b.carId)}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{b.totalPrice.toLocaleString("fr-DZ")} DZD</p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusColors[b.status] || ""}`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
