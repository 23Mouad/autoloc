"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck, Search, RefreshCw, CheckCircle, XCircle,
  Mail, Phone, MapPin, Clock, ChevronDown, MessageSquare, AlertTriangle,
} from "lucide-react";

interface CarOwner {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  wilaya: string;
  status: string;
  storeLocation?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; tab: string }> = {
  pending_approval: { label: "En attente", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", tab: "pending" },
  active:           { label: "Actif",      color: "text-green-400 bg-green-500/10 border-green-500/30",   tab: "active"  },
  suspended:        { label: "Suspendu",   color: "text-red-400 bg-red-500/10 border-red-500/30",         tab: "suspended"},
  hidden:           { label: "Masqué",     color: "text-gray-400 bg-gray-500/10 border-gray-500/30",      tab: "active"  },
};

export default function AdminCarOwnersPage() {
  const [owners, setOwners]           = useState<CarOwner[]>([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState("pending");
  const [search, setSearch]           = useState("");
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [actionLoading, setAction]    = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; reason: string } | null>(null);
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOwners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?role=renter");
      const data = await res.json();
      setOwners(Array.isArray(data.users) ? data.users : []);
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOwners(); }, [fetchOwners]);

  const approve = async (id: string) => {
    setAction(id + "-approve");
    try {
      const res = await fetch(`/api/admin/car-owners/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setOwners(prev => prev.map(o => o._id === id ? { ...o, status: "active" } : o));
        showToast("Propriétaire approuvé. Email envoyé ✓");
      } else {
        showToast(data.error || "Erreur lors de l'approbation", false);
      }
    } catch { showToast("Erreur réseau", false); }
    finally { setAction(null); }
  };

  const reject = async (id: string) => {
    setAction(id + "-reject");
    try {
      const res = await fetch(`/api/admin/car-owners/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectModal?.reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setOwners(prev => prev.map(o => o._id === id ? { ...o, status: "suspended" } : o));
        setRejectModal(null);
        showToast("Compte rejeté. Email envoyé ✓");
      } else {
        showToast(data.error || "Erreur lors du rejet", false);
      }
    } catch { showToast("Erreur réseau", false); }
    finally { setAction(null); }
  };

  const suspend = async (id: string) => {
    setAction(id + "-suspend");
    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "suspended" }),
      });
      if (res.ok) {
        setOwners(prev => prev.map(o => o._id === id ? { ...o, status: "suspended" } : o));
        showToast("Compte suspendu ✓");
      }
    } catch { showToast("Erreur réseau", false); }
    finally { setAction(null); }
  };

  const reactivate = async (id: string) => {
    setAction(id + "-reactivate");
    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      if (res.ok) {
        setOwners(prev => prev.map(o => o._id === id ? { ...o, status: "active" } : o));
        showToast("Compte réactivé ✓");
      }
    } catch { showToast("Erreur réseau", false); }
    finally { setAction(null); }
  };

  const filtered = owners.filter(o => {
    const matchTab =
      tab === "pending"   ? o.status === "pending_approval" :
      tab === "active"    ? (o.status === "active" || o.status === "hidden") :
      tab === "suspended" ? o.status === "suspended" : true;
    const q = search.toLowerCase();
    const matchSearch = !q || o.name.toLowerCase().includes(q) || o.lastName.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) || o.wilaya.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const counts = {
    pending:   owners.filter(o => o.status === "pending_approval").length,
    active:    owners.filter(o => o.status === "active" || o.status === "hidden").length,
    suspended: owners.filter(o => o.status === "suspended").length,
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
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setRejectModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-bg-secondary border border-border rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <XCircle size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">Rejeter la demande</h3>
                  <p className="text-xs text-text-muted">Le propriétaire sera notifié par email</p>
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-secondary uppercase tracking-wider mb-2">Motif du refus (optionnel)</label>
                <textarea
                  rows={3}
                  value={rejectModal.reason}
                  onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  placeholder="Expliquez la raison du rejet..."
                  className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-red-400 focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => reject(rejectModal.id)}
                  disabled={actionLoading === rejectModal.id + "-reject"}
                  className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === rejectModal.id + "-reject" ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <XCircle size={15} />}
                  Confirmer le rejet
                </button>
                <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 border border-border text-text-secondary rounded-xl hover:text-text-primary transition-colors">
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Propriétaires de voitures</h1>
          <p className="text-text-muted text-sm mt-0.5">Gérez les demandes d'adhésion et les comptes loueurs</p>
        </div>
        <button onClick={fetchOwners} className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent transition-colors text-sm">
          <RefreshCw size={14} />Actualiser
        </button>
      </div>

      {/* Pending banner */}
      {counts.pending > 0 && (
        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <AlertTriangle size={18} className="text-yellow-400 shrink-0" />
          <p className="text-sm font-semibold text-yellow-400">
            {counts.pending} demande{counts.pending > 1 ? "s" : ""} en attente d'approbation
          </p>
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center gap-3">
        {([["pending", "En attente"], ["active", "Actifs"], ["suspended", "Suspendus"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              tab === key ? "bg-accent text-bg-primary border-accent" : "bg-bg-secondary border-border text-text-secondary hover:border-accent/50"
            }`}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-70">({counts[key]})</span>
          </button>
        ))}
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Nom, email, wilaya..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:border-accent focus:outline-none w-56"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-bg-secondary border border-border animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <UserCheck size={40} className="mb-3 opacity-30" />
          <p>Aucun propriétaire dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(owner => {
              const cfg = STATUS_CONFIG[owner.status];
              return (
                <motion.div key={owner._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-bg-secondary border border-border rounded-xl overflow-hidden"
                >
                  {/* Row */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      owner.status === "pending_approval" ? "bg-yellow-500/10" :
                      owner.status === "active"           ? "bg-green-500/10"  : "bg-red-500/10"
                    }`}>
                      <span className={`text-sm font-bold ${
                        owner.status === "pending_approval" ? "text-yellow-400" :
                        owner.status === "active"           ? "text-green-400"  : "text-red-400"
                      }`}>{owner.name[0]}{owner.lastName[0]}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-text-primary">{owner.name} {owner.lastName}</p>
                        {cfg && <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${cfg.color}`}>{cfg.label}</span>}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 truncate">{owner.email} · {owner.wilaya}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {owner.status === "pending_approval" && (
                        <>
                          <button onClick={() => approve(owner._id)} disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {actionLoading === owner._id + "-approve" ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={13} />}
                            Approuver
                          </button>
                          <button onClick={() => setRejectModal({ id: owner._id, reason: "" })}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <XCircle size={13} />Rejeter
                          </button>
                        </>
                      )}
                      {(owner.status === "active" || owner.status === "hidden") && (
                        <button onClick={() => suspend(owner._id)} disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {actionLoading === owner._id + "-suspend" ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <XCircle size={13} />}
                          Suspendre
                        </button>
                      )}
                      {owner.status === "suspended" && (
                        <button onClick={() => reactivate(owner._id)} disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {actionLoading === owner._id + "-reactivate" ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={13} />}
                          Réactiver
                        </button>
                      )}
                      <button onClick={() => setExpanded(p => p === owner._id ? null : owner._id)}
                        className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent transition-colors"
                      >
                        <ChevronDown size={14} className={`transition-transform ${expanded === owner._id ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded */}
                  <AnimatePresence>
                    {expanded === owner._id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="border-t border-border/50 px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-text-secondary"><Mail size={13} className="text-accent shrink-0" /><a href={`mailto:${owner.email}`} className="truncate hover:text-accent">{owner.email}</a></div>
                          <div className="flex items-center gap-2 text-text-secondary"><Phone size={13} className="text-accent shrink-0" /><span>{owner.phone}</span></div>
                          <div className="flex items-center gap-2 text-text-secondary"><MapPin size={13} className="text-accent shrink-0" /><span>{owner.wilaya}</span></div>
                          <div className="flex items-center gap-2 text-text-secondary"><Clock size={13} className="text-accent shrink-0" /><span>{new Date(owner.createdAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}</span></div>
                          {owner.storeLocation && (
                            <div className="col-span-2 flex items-center gap-2 text-text-secondary"><MessageSquare size={13} className="text-accent shrink-0" /><span>{owner.storeLocation}</span></div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
