"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Car, CalendarCheck, DollarSign, TrendingUp, Clock,
  AlertTriangle, CheckCircle, XCircle, UserCheck, CreditCard,
  BarChart2, ArrowUpRight, Bell, Shield, Activity, MapPin,
} from "lucide-react";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("@/components/charts/BarChart"), { ssr: false });

interface DashboardData {
  users: {
    totalCustomers: number; totalCarOwners: number; total: number;
    pendingVerification: number; pendingApproval: number;
    active: number; suspended: number; hidden: number;
    newCustomersLast30d: number; newOwnersLast30d: number; newUsersLast7d: number;
  };
  subscriptions: {
    trial: number; active: number; expired: number; expiringSoon: number; estimatedMRR: number;
    trend: Array<{ _id: { year: number; month: number }; count: number }>;
  };
  cars: { total: number; available: number; unavailable: number; byWilaya: Array<{ _id: string; count: number }> };
  bookings: {
    total: number; pending: number; confirmed: number; cancelled: number;
    last30d: number; last7d: number;
    trend: Array<{ _id: { year: number; month: number; status: string }; count: number; revenue: number }>;
  };
  revenue: { total: number; last30d: number };
  usersByWilaya: Array<{ _id: string; count: number }>;
  topOwners: Array<{ _id: string; ownerName: string; ownerEmail: string; bookings: number; revenue: number }>;
  recentUsers: Array<{ _id: string; name: string; lastName: string; email: string; role: string; status: string; wilaya: string; createdAt: string }>;
  pendingOwners: Array<{ _id: string; name: string; lastName: string; email: string; phone: string; wilaya: string; createdAt: string }>;
  registrationTrend?: Array<{ _id: { year: number; month: number; day: number }; count: number }>;
  generatedAt: string;
}

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

const statusColors: Record<string, string> = {
  active:              "bg-green-500/10 text-green-400 border-green-500/30",
  pending_approval:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  pending_verification:"bg-blue-500/10  text-blue-400  border-blue-500/30",
  suspended:           "bg-red-500/10   text-red-400   border-red-500/30",
  hidden:              "bg-gray-500/10  text-gray-400  border-gray-500/30",
};
const roleColors: Record<string, string> = {
  customer: "text-green-400",
  renter:   "text-blue-400",
  admin:    "text-purple-400",
};

function StatCard({
  label, value, sub, icon: Icon, color, bg, trend, href,
}: {
  label: string; value: string | number; sub?: string;
  icon: any; color: string; bg: string;
  trend?: number; href?: string;
}) {
  const inner = (
    <div className={`bg-bg-secondary border border-border rounded-xl p-5 hover:border-accent/30 transition-all group ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wider font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
          <Icon size={20} className={color} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
          <TrendingUp size={11} className={trend < 0 ? "rotate-180" : ""} />
          <span>{trend >= 0 ? "+" : ""}{trend} ce mois</span>
          {href && <ArrowUpRight size={11} className="ml-auto text-text-muted group-hover:text-accent transition-colors" />}
        </div>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString("fr-DZ", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }));
  }, []);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Build booking revenue chart data (last 12 months)
  const bookingChartData = (() => {
    if (!data) return { labels: [], revenues: [], counts: [] };
    const map: Record<string, { revenue: number; count: number }> = {};
    data.bookings.trend.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!map[key]) map[key] = { revenue: 0, count: 0 };
      if (item._id.status === "confirmed") {
        map[key].revenue += item.revenue;
        map[key].count   += item.count;
      }
    });
    const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
    return {
      labels:   sorted.map(([k]) => { const [, m] = k.split("-"); return MONTH_NAMES[parseInt(m) - 1]; }),
      revenues: sorted.map(([, v]) => v.revenue),
      counts:   sorted.map(([, v]) => v.count),
    };
  })();

  // Registration chart (last 30d)
  const regChart = (() => {
    if (!data) return { labels: [], values: [] };
    const map: Record<string, number> = {};
    data.registrationTrend?.forEach((r: { _id: { year: number; month: number; day: number }; count: number }) => {
      const key = `${r._id.day}/${r._id.month}`;
      map[key] = (map[key] || 0) + r.count;
    });
    const entries = Object.entries(map).slice(-14);
    return { labels: entries.map(([k]) => k), values: entries.map(([, v]) => v) };
  })();

  if (loading) return (
    <div className="space-y-8">
      <div className="h-8 w-48 bg-bg-secondary rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(8)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-bg-secondary border border-border animate-pulse" />)}
      </div>
    </div>
  );

  if (!data) return <div className="text-text-muted text-center py-20">Erreur de chargement</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tableau de bord</h1>
          <p className="text-text-muted text-sm mt-0.5">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted bg-bg-secondary border border-border rounded-lg px-3 py-1.5">
          <Activity size={12} className="text-green-400" />
          Données en temps réel
        </div>
      </div>

      {/* Alert banner — pending approvals */}
      {data.users.pendingApproval > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
        >
          <AlertTriangle size={18} className="text-yellow-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-yellow-400">
              {data.users.pendingApproval} propriétaire{data.users.pendingApproval > 1 ? "s" : ""} en attente d'approbation
            </p>
            <p className="text-xs text-text-muted">Validez ou refusez leurs comptes pour qu'ils puissent lister leurs voitures.</p>
          </div>
          <Link
            href="/admin/car-owners"
            className="shrink-0 px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg text-xs hover:bg-yellow-400 transition-colors"
          >
            Voir les demandes
          </Link>
        </motion.div>
      )}

      {/* Expiring soon alert */}
      {data.subscriptions.expiringSoon > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl"
        >
          <CreditCard size={18} className="text-orange-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-400">
              {data.subscriptions.expiringSoon} abonnement{data.subscriptions.expiringSoon > 1 ? "s" : ""} expirant dans 7 jours
            </p>
            <p className="text-xs text-text-muted">Renouvelez-les avant expiration pour éviter la suspension automatique.</p>
          </div>
          <Link
            href="/admin/subscriptions"
            className="shrink-0 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg text-xs hover:bg-orange-400 transition-colors"
          >
            Gérer
          </Link>
        </motion.div>
      )}

      {/* ── Row 1: User Stats ── */}
      <div>
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
          <Users size={13} /> Utilisateurs
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Clients"           value={data.users.totalCustomers}    trend={data.users.newCustomersLast30d} icon={Users}     color="text-purple-400" bg="bg-purple-500/10" href="/admin/users" />
          <StatCard label="Propriétaires"     value={data.users.totalCarOwners}    trend={data.users.newOwnersLast30d}   icon={UserCheck} color="text-blue-400"   bg="bg-blue-500/10"   href="/admin/car-owners" />
          <StatCard label="En attente"         value={data.users.pendingApproval}   icon={Clock}       color="text-yellow-400" bg="bg-yellow-500/10" href="/admin/car-owners" />
          <StatCard label="Actifs"             value={data.users.active}            icon={CheckCircle} color="text-green-400"  bg="bg-green-500/10"  />
          <StatCard label="Suspendus"          value={data.users.suspended}         icon={XCircle}     color="text-red-400"    bg="bg-red-500/10"    href="/admin/users" />
          <StatCard label="Nouveaux (7j)"      value={data.users.newUsersLast7d}    icon={ArrowUpRight} color="text-accent"    bg="bg-accent/10"     />
        </div>
      </div>

      {/* ── Row 2: Revenue & Bookings ── */}
      <div>
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
          <DollarSign size={13} /> Revenus & Réservations
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Revenu Total"       value={`${data.revenue.total.toLocaleString("fr-DZ")} DZD`}   icon={DollarSign}   color="text-accent"       bg="bg-accent/10"       />
          <StatCard label="Revenu (30j)"        value={`${data.revenue.last30d.toLocaleString("fr-DZ")} DZD`} icon={TrendingUp}   color="text-green-400"    bg="bg-green-500/10"    />
          <StatCard label="MRR Abonnements"     value={`${data.subscriptions.estimatedMRR.toLocaleString("fr-DZ")} DZD`} icon={CreditCard} color="text-blue-400" bg="bg-blue-500/10" />
          <StatCard label="Réservations"        value={data.bookings.total}           trend={data.bookings.last30d} icon={CalendarCheck} color="text-teal-400"  bg="bg-teal-500/10"   href="/admin/bookings" />
          <StatCard label="En attente"           value={data.bookings.pending}         icon={Clock}        color="text-yellow-400"   bg="bg-yellow-500/10"   href="/admin/bookings" />
          <StatCard label="Confirmées"           value={data.bookings.confirmed}       icon={CheckCircle}  color="text-green-400"    bg="bg-green-500/10"    />
        </div>
      </div>

      {/* ── Row 3: Cars & Subscriptions ── */}
      <div>
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
          <Car size={13} /> Véhicules & Abonnements
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Voitures total"     value={data.cars.total}                    icon={Car}        color="text-blue-400"   bg="bg-blue-500/10"   href="/admin/cars" />
          <StatCard label="Disponibles"        value={data.cars.available}                icon={CheckCircle} color="text-green-400" bg="bg-green-500/10"  />
          <StatCard label="Non disponibles"    value={data.cars.unavailable}              icon={XCircle}    color="text-red-400"    bg="bg-red-500/10"    />
          <StatCard label="Abonnements actifs" value={data.subscriptions.active}          icon={Shield}     color="text-green-400"  bg="bg-green-500/10"  href="/admin/subscriptions" />
          <StatCard label="Essais gratuits"    value={data.subscriptions.trial}           icon={CreditCard} color="text-blue-400"   bg="bg-blue-500/10"   href="/admin/subscriptions" />
          <StatCard label="Expirés"            value={data.subscriptions.expired}        icon={AlertTriangle} color="text-red-400" bg="bg-red-500/10"    href="/admin/subscriptions" />
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-bg-secondary border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-accent" />
              <h2 className="text-sm font-semibold text-text-primary">Revenus confirmés (6 mois)</h2>
            </div>
            <span className="text-xs text-text-muted">DZD</span>
          </div>
          {bookingChartData.revenues.length > 0 ? (
            <BarChart labels={bookingChartData.labels} values={bookingChartData.revenues} suffix=" DZD" height={220} />
          ) : (
            <div className="flex items-center justify-center h-56 text-text-muted text-sm">Aucune donnée</div>
          )}
        </div>

        {/* Top Owners */}
        <div className="bg-bg-secondary border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <UserCheck size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">Top propriétaires</h2>
          </div>
          {data.topOwners.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {data.topOwners.map((owner, idx) => (
                <div key={owner._id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{owner.ownerName || "—"}</p>
                    <p className="text-xs text-text-muted">{owner.bookings} réservations</p>
                  </div>
                  <span className="text-xs font-semibold text-accent shrink-0">
                    {owner.revenue.toLocaleString("fr-DZ")} DZD
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2 charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations trend */}
        <div className="bg-bg-secondary border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">Inscriptions (30 derniers jours)</h2>
          </div>
          {regChart.values.length > 0 ? (
            <BarChart labels={regChart.labels} values={regChart.values} suffix=" users" height={180} />
          ) : (
            <div className="flex items-center justify-center h-44 text-text-muted text-sm">Aucune donnée</div>
          )}
        </div>

        {/* Users by Wilaya */}
        <div className="bg-bg-secondary border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">Utilisateurs par Wilaya</h2>
          </div>
          <div className="space-y-2">
            {data.usersByWilaya.slice(0, 7).map(w => {
              const max = data.usersByWilaya[0]?.count || 1;
              const pct = Math.round((w.count / max) * 100);
              return (
                <div key={w._id} className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary w-28 truncate shrink-0">{w._id || "—"}</span>
                  <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-muted w-6 text-right shrink-0">{w.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom row: Recent Users + Pending Owners ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent registrations */}
        <div className="bg-bg-secondary border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              <h2 className="text-sm font-semibold text-text-primary">Dernières inscriptions</h2>
            </div>
            <Link href="/admin/users" className="text-xs text-accent hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {data.recentUsers.map(u => (
              <div key={u._id} className="flex items-center gap-3 py-1">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-accent">{u.name[0]}{u.lastName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{u.name} {u.lastName}</p>
                  <p className="text-xs text-text-muted truncate">{u.email} · {u.wilaya}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] font-bold uppercase ${roleColors[u.role] || "text-text-muted"}`}>{u.role}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${statusColors[u.status] || ""}`}>{u.status.replace("_", " ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-bg-secondary border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-400" />
              <h2 className="text-sm font-semibold text-text-primary">Approbations en attente</h2>
            </div>
            <Link href="/admin/car-owners" className="text-xs text-accent hover:underline">Gérer</Link>
          </div>
          {data.pendingOwners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-text-muted">
              <CheckCircle size={32} className="mb-2 text-green-400 opacity-50" />
              <p className="text-sm">Aucune demande en attente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.pendingOwners.map(o => (
                <div key={o._id} className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-yellow-400">{o.name[0]}{o.lastName[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{o.name} {o.lastName}</p>
                    <p className="text-xs text-text-muted truncate">{o.email} · {o.wilaya}</p>
                  </div>
                  <Link
                    href="/admin/car-owners"
                    className="shrink-0 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg text-xs font-semibold hover:bg-yellow-500/20 transition-colors"
                  >
                    Traiter
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Notifications quick send ── */}
      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Bell size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Envoyer une notification</h2>
              <p className="text-xs text-text-muted">Diffusez un message à tous les utilisateurs ou un segment ciblé</p>
            </div>
          </div>
          <Link
            href="/admin/notifications"
            className="px-5 py-2.5 bg-accent text-bg-primary font-semibold rounded-xl text-sm hover:bg-accent-light transition-all hover:-translate-y-0.5"
          >
            Rédiger
          </Link>
        </div>
      </div>
    </div>
  );
}
