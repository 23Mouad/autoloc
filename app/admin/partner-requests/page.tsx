"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
  Search,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

interface PartnerRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  wilaya: string;
  fleetSize: number;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  rejectionReason?: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: { label: "En attente", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  accepted: { label: "Accepté", color: "text-green-400 bg-green-500/10 border-green-500/30" },
  rejected: { label: "Refusé", color: "text-red-400 bg-red-500/10 border-red-500/30" },
};

export default function AdminPartnerRequests() {
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ id: string; reason: string } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = filterStatus !== "all" ? `/api/partner-requests?status=${filterStatus}` : "/api/partner-requests";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error("Failed to fetch partner requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleAccept = async (id: string) => {
    setActionLoading(id + "-accept");
    try {
      const res = await fetch(`/api/partner-requests/${id}/accept`, { method: "POST" });
      if (res.ok) {
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "accepted" } : r));
      }
    } catch (err) {
      console.error("Accept failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id + "-reject");
    try {
      const res = await fetch(`/api/partner-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason?.id === id ? rejectReason.reason : undefined }),
      });
      if (res.ok) {
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
        setRejectReason(null);
      }
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.companyName.toLowerCase().includes(q) ||
      r.wilaya.toLowerCase().includes(q)
    );
  });

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Demandes de Partenariat</h1>
          <p className="text-text-muted text-sm mt-0.5">Gérez les candidatures loueurs</p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent transition-colors text-sm"
        >
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "pending", "accepted", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filterStatus === s
                ? "bg-accent text-bg-primary border-accent"
                : "bg-bg-secondary border-border text-text-secondary hover:border-accent/50"
            }`}
          >
            {s === "all" ? "Tous" : STATUS_CONFIG[s].label}
            <span className="ml-1.5 text-xs opacity-70">({counts[s]})</span>
          </button>
        ))}

        {/* Search */}
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-1.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:border-accent focus:outline-none w-52"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-secondary border border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune demande trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-secondary border border-border rounded-xl overflow-hidden"
              >
                {/* Card header */}
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Building2 size={18} className="text-accent" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-text-primary">{req.name}</p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${STATUS_CONFIG[req.status].color}`}>
                          {STATUS_CONFIG[req.status].label}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary truncate">{req.companyName} · {req.wilaya}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAccept(req.id)}
                          disabled={actionLoading === req.id + "-accept"}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {actionLoading === req.id + "-accept" ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle size={13} />
                          )}
                          Accepter
                        </button>
                        <button
                          onClick={() => setRejectReason(r => r?.id === req.id ? null : { id: req.id, reason: "" })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <XCircle size={13} />
                          Refuser
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpanded((p) => (p === req.id ? null : req.id))}
                      className="flex items-center gap-1 px-3 py-1.5 bg-bg-elevated border border-border text-text-secondary hover:text-accent rounded-lg text-xs transition-colors"
                    >
                      <Eye size={13} />
                      <ChevronDown size={12} className={`transition-transform ${expanded === req.id ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Reject reason input */}
                <AnimatePresence>
                  {rejectReason?.id === req.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-0 flex items-center gap-2 border-t border-border/50">
                        <MessageSquare size={14} className="text-text-muted shrink-0" />
                        <input
                          type="text"
                          placeholder="Motif du refus (optionnel)"
                          value={rejectReason.reason}
                          onChange={(e) => setRejectReason({ id: req.id, reason: e.target.value })}
                          className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-red-400 focus:outline-none"
                        />
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={actionLoading === req.id + "-reject"}
                          className="px-4 py-1.5 bg-red-500 text-white font-semibold rounded-lg text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === req.id + "-reject" ? "..." : "Confirmer le refus"}
                        </button>
                        <button onClick={() => setRejectReason(null)} className="text-text-muted hover:text-text-primary text-xs">Annuler</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded details */}
                <AnimatePresence>
                  {expanded === req.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-border/50 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={13} className="text-accent shrink-0" />
                            <a href={`mailto:${req.email}`} className="text-text-secondary hover:text-accent transition-colors">{req.email}</a>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={13} className="text-accent shrink-0" />
                            <a href={`tel:${req.phone}`} className="text-text-secondary hover:text-accent transition-colors">{req.phone}</a>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin size={13} className="text-accent shrink-0" />
                            <span className="text-text-secondary">{req.wilaya}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Car size={13} className="text-accent shrink-0" />
                            <span className="text-text-secondary">{req.fleetSize} véhicule(s)</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={13} className="text-accent shrink-0" />
                            <span className="text-text-muted">{new Date(req.createdAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}</span>
                          </div>
                        </div>

                        {req.message && (
                          <div className="bg-bg-elevated rounded-lg border border-border/50 p-3">
                            <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">Message</p>
                            <p className="text-sm text-text-secondary leading-relaxed">{req.message}</p>
                          </div>
                        )}

                        {req.rejectionReason && (
                          <div className="sm:col-span-2 bg-red-500/5 rounded-lg border border-red-500/20 p-3">
                            <p className="text-xs text-red-400 uppercase tracking-wider mb-1 font-medium">Motif du refus</p>
                            <p className="text-sm text-text-secondary">{req.rejectionReason}</p>
                          </div>
                        )}

                        {/* Quick actions */}
                        <div className="sm:col-span-2 flex gap-2 flex-wrap pt-2">
                          <a
                            href={`mailto:${req.email}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated border border-border text-text-secondary hover:text-accent hover:border-accent rounded-lg text-xs transition-colors"
                          >
                            <Mail size={12} />
                            Envoyer un email
                          </a>
                          <a
                            href={`tel:${req.phone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated border border-border text-text-secondary hover:text-accent hover:border-accent rounded-lg text-xs transition-colors"
                          >
                            <Phone size={12} />
                            Appeler
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
