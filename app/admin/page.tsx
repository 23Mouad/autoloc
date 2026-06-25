"use client";

import { useEffect, useState } from "react";
import { Car, CalendarCheck, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("@/components/charts/BarChart"), { ssr: false });

interface Stats {
  totalCars: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
}

interface MonthlyItem {
  label: string;
  revenue: number;
  count: number;
}

interface BookingItem {
  id: string;
  fullName: string;
  email: string;
  totalPrice: number;
  status: string;
  pickupDate: string;
  returnDate: string;
  carId: { name?: string } | string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalCars: 0, totalBookings: 0, totalUsers: 0, totalRevenue: 0 });
  const [monthly, setMonthly] = useState<MonthlyItem[]>([]);
  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString("fr-DZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
  }, []);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [carsRes, bookingsRes, usersRes, statsRes] = await Promise.all([
          fetch("/api/cars"),
          fetch("/api/bookings"),
          fetch("/api/users"),
          fetch("/api/stats"),
        ]);

        const cars = await carsRes.json();
        const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
        const users = usersRes.ok ? await usersRes.json() : [];
        const statsData = statsRes.ok ? await statsRes.json() : { monthly: [], totalRevenue: 0 };

        const revenue = Array.isArray(bookings)
          ? bookings
              .filter((b: Record<string, unknown>) => b.status === "confirmed")
              .reduce((sum: number, b: Record<string, unknown>) => sum + ((b.totalPrice as number) || 0), 0)
          : 0;

        setStats({
          totalCars: Array.isArray(cars) ? cars.length : 0,
          totalBookings: Array.isArray(bookings) ? bookings.length : 0,
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalRevenue: revenue,
        });

        setMonthly(statsData.monthly || []);
        setRecentBookings(Array.isArray(bookings) ? bookings.slice(0, 5) : []);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  const cards = [
    { label: "Total Cars", value: stats.totalCars, icon: Car, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Bookings", value: stats.totalBookings, icon: CalendarCheck, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Revenue (DZD)", value: stats.totalRevenue.toLocaleString("fr-DZ"), icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-green-500/10 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  const getCarName = (carId: BookingItem["carId"]) => {
    if (typeof carId === "object" && carId?.name) return carId.name;
    return "—";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <span className="text-xs text-text-muted">
          {dateStr}
        </span>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-bg-secondary border border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-bg-secondary border border-border rounded-xl p-5 hover:border-accent/30 transition-all group"
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

      {/* Charts & Recent Bookings */}
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

          {/* Recent Bookings */}
          <div className="bg-bg-secondary border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-accent" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Recent Bookings</h2>
            </div>
            {recentBookings.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{b.fullName}</p>
                      <p className="text-xs text-text-muted truncate">{getCarName(b.carId)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-semibold text-text-primary">
                        {b.totalPrice.toLocaleString("fr-DZ")} DZD
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${statusColors[b.status] || ""}`}
                      >
                        {b.status}
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
