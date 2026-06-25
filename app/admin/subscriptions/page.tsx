"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle,
  TrendingUp, Search, Calendar,
} from "lucide-react";

interface Subscription {
  _id: string;
  ownerId: { _id: string; name: string; lastName: string; email: string; wilaya: string } | string;
  plan: string;
  status: string;
  trialEndDate?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  trial:   { label: "Essai gratuit", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  active:  { label: "Actif",         color: "text-green-400 bg-green-500/10 border-green-500/30" },
  expired: { label: "Expiré",        color: "text-red-400 bg-red-500/10 border-red-500/30" },
};

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function expiryBadge(days: number | null) {
  if (days === null) return null;
  if (days < 0)  return <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">Expiré</span>;
  if (days <= 3) return <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">{days}j restants</span>;
  if (days <= 7) return <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full">{days}j restants</span>;
  return <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full">{days}j restants</span>;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs]         = useState<Subscription[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [actionLoading, setAct] = useState<string | null>(null);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === "expiring_soon" ? "/api/admin/subscriptions?filter=expiring_soon" : "/api/admin/subscriptions";
      const res = await fetch(url);
      const data = await res.json();
      setSubs(Array.isArray(data.subscriptions) ? data.subscriptions : []);
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const renew = async (id: string) => {
    setAct(id);
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}/renew`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast("Abonnement renouvelé pour 30 jours ✓");
        await fetchSubs();
      } else {
        showToast(data.error || "Erreur lors du renouvellement", false);
      }
    } catch { showToast("Erreur réseau", false); }
    finally { setAct(null); }
  };

  const getOwner = (sub: Subscription) =>
    typeof sub.ownerId === "object" && sub.ownerId !== null ? sub.ownerId : null;

  const getEndDate = (sub: Subscription) =>
    sub.plan === "trial" ? sub.trialEndDate : sub.subscriptionEnd;

  const filtered = subs.filter(s => {
    const matchFilter =
      filter === "all"          ? true :
      filter === "trial"        ? s.status === "trial" :
      filter === "active"       ? s.status === "active" :
      filter === "expired"      ? s.status === "expired" :
      filter === "expiring_soon"? true : true;

    const owner = getOwner(s);
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (owner && (`${owner.name} ${owner.lastName}`.toLowerCase().includes(q) || owner.email.toLowerCase().includes(q)));

    return matchFilter && matchSearch;
  });

  const counts = {
    all:           subs.length,
    trial:         subs.filter(s => s.status === "trial").length,
    active:        subs.filter(s => s.status === "active").length,
    expired:       subs.filter(s => s.status === "expired").length,
    expiring_soon: subs.filter(s => {
      const d = daysUntil(getEndDate(s));
      return d !== null && d >= 0 && d <= 7;
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border text-sm font-semibold shadow-2xl ${
              toast.ok ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >{toast.msg}</motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Abonnements</h1>
          <p className="text-text-muted text-sm mt-0.5">Gérez les abonnements des propriétaires de voitures</p>
        </div>
        <button onClick={fetchSubs} className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent transition-colors text-sm">
          <RefreshCw size={14} />Actualiser
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Essais",       value: counts.trial,         icon: Clock,         color: "text-blue-400",   bg: "bg-blue-500/10"   },
          { label: "Actifs",       value: counts.active,        icon: CheckCircle,   color: "text-green-400",  bg: "bg-green-500/10"  },
          { label: "Exp. bientôt", value: counts.expiring_soon, icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Expirés",      value: counts.expired,       icon: XCircle,       color: "text-red-400",    bg: "bg-red-500/10"    },
        ].map(c => (
          <div key={c.label} className="bg-bg-secondary border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
              <c.icon size={18} className={c.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">{c.value}</p>
              <p className="text-xs text-text-muted">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          ["all",           "Tous"],
          ["trial",         "Essais"],
          ["active",        "Actifs"],
          ["expiring_soon", "Exp. bientôt"],
          ["expired",       "Expirés"],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filter === key ? "bg-accent text-bg-primary border-accent" : "bg-bg-secondary border-border text-text-secondary hover:border-accent/50"
            }`}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-70">({counts[key as keyof typeof counts] ?? subs.length})</span>
          </button>
        ))}
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Nom, email..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:border-accent focus:outline-none w-52"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-bg-secondary border border-border animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <CreditCard size={40} className="mb-3 opacity-30" />
          <p>Aucun abonnement trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(sub => {
            const owner   = getOwner(sub);
            const endDate = getEndDate(sub);
            const days    = daysUntil(endDate);
            const cfg     = STATUS_CONFIG[sub.status];
            const isExpiringSoon = days !== null && days >= 0 && days <= 7;

            return (
              <motion.div key={sub._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-bg-secondary border rounded-xl p-5 flex items-center gap-4 flex-wrap ${isExpiringSoon ? "border-orange-500/30" : "border-border"}`}
              >
                {/* Avatar */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  sub.status === "active" ? "bg-green-500/10" : sub.status === "trial" ? "bg-blue-500/10" : "bg-red-500/10"
                }`}>
                  <CreditCard size={18} className={
                    sub.status === "active" ? "text-green-400" : sub.status === "trial" ? "text-blue-400" : "text-red-400"
                  } />
                </div>

                {/* Owner info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-text-primary">
                      {owner ? `${owner.name} ${owner.lastName}` : "—"}
                    </p>
                    {cfg && <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${cfg.color}`}>{cfg.label}</span>}
                    {expiryBadge(days)}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">
                    {owner?.email} {owner?.wilaya ? `· ${owner.wilaya}` : ""}
                  </p>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
                  <Calendar size={12} />
                  {endDate ? (
                    <span>Expire le {new Date(endDate).toLocaleDateString("fr-DZ", { day: "numeric", month: "short", year: "numeric" })}</span>
                  ) : "—"}
                </div>

                {/* Renew */}
                <button
                  onClick={() => renew(sub._id)}
                  disabled={actionLoading === sub._id}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 ${
                    sub.status === "expired" || isExpiringSoon
                      ? "bg-accent text-bg-primary hover:bg-accent-light"
                      : "bg-bg-elevated border border-border text-text-secondary hover:text-accent hover:border-accent"
                  }`}
                >
                  {actionLoading === sub._id
                    ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    : <TrendingUp size={12} />
                  }
                  Renouveler 30j
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
