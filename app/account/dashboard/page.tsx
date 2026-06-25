"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Car, CalendarCheck, DollarSign, TrendingUp, Users } from "lucide-react";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("@/components/charts/BarChart"), { ssr: false });

interface MonthlyItem {
  label: string;
  revenue: number;
  count: number;
}

interface ActiveRenter {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  status: string;
  carId: { name?: string } | string;
}

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ totalCars: 0, activeBookings: 0, totalRevenue: 0 });
  const [monthly, setMonthly] = useState<MonthlyItem[]>([]);
  const [activeRenters, setActiveRenters] = useState<ActiveRenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [carsRes, bookingsRes, statsRes] = await Promise.all([
          fetch("/api/cars"),
          fetch("/api/bookings?ownerId=me"),
          fetch("/api/stats"),
        ]);

        const cars = await carsRes.json();
        const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
        const statsData = statsRes.ok ? await statsRes.json() : { monthly: [], totalRevenue: 0 };

        const userId = (session?.user as Record<string, unknown>)?.id as string;
        const myCars = Array.isArray(cars) ? cars.filter((c: Record<string, unknown>) => c.ownerId === userId) : [];
        const active = Array.isArray(bookings)
          ? bookings.filter((b: Record<string, unknown>) => b.status === "confirmed" || b.status === "pending")
          : [];

        const confirmedRevenue = Array.isArray(bookings)
          ? bookings
              .filter((b: Record<string, unknown>) => b.status === "confirmed")
              .reduce((sum: number, b: Record<string, unknown>) => sum + ((b.totalPrice as number) || 0), 0)
          : 0;

        setStats({
          totalCars: myCars.length,
          activeBookings: active.length,
          totalRevenue: confirmedRevenue,
        });

        setMonthly(statsData.monthly || []);
        setActiveRenters(active.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session) fetchData();
  }, [session]);

  const cards = [
    { label: "My Cars", value: stats.totalCars, icon: Car, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Active Bookings", value: stats.activeBookings, icon: CalendarCheck, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Total Revenue", value: stats.totalRevenue.toLocaleString("fr-DZ") + " DZD", icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-green-500/10 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  const getCarName = (carId: ActiveRenter["carId"]) => {
    if (typeof carId === "object" && carId?.name) return carId.name;
    return "—";
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-text-primary">Owner Dashboard</h1>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-bg-secondary border border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-bg-secondary border border-border rounded-xl p-5 hover:border-accent/30 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-secondary uppercase tracking-wider font-medium">{card.label}</span>
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon size={18} className={card.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-primary">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-bg-secondary border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-accent" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Monthly Revenue</h2>
            </div>
            {monthly.length > 0 ? (
              <BarChart
                labels={monthly.map((m) => m.label)}
                values={monthly.map((m) => m.revenue)}
                suffix=" DZD"
                height={240}
              />
            ) : (
              <div className="flex items-center justify-center h-60 text-text-muted text-sm">
                No revenue data yet
              </div>
            )}
          </div>

          {/* Active Renters */}
          <div className="bg-bg-secondary border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-accent" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Who&apos;s Renting</h2>
            </div>
            {activeRenters.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">No active rentals</p>
            ) : (
              <div className="space-y-3">
                {activeRenters.map((r) => (
                  <div key={r.id} className="py-2 border-b border-border/50 last:border-0">
                    <p className="text-sm font-medium text-text-primary">{r.fullName}</p>
                    <p className="text-xs text-text-muted">{getCarName(r.carId)}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-text-secondary">
                        {new Date(r.pickupDate).toLocaleDateString()} → {new Date(r.returnDate).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${statusColors[r.status] || ""}`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
