"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, RefreshCw, CheckCircle, XCircle, Trash2,
  ChevronDown, Mail, Phone, MapPin, Clock, Shield, Filter,
} from "lucide-react";

interface UserItem {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "renter" | "customer";
  wilaya: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:               { label: "Actif",        color: "text-green-400 bg-green-500/10 border-green-500/30" },
  suspended:            { label: "Suspendu",      color: "text-red-400 bg-red-500/10 border-red-500/30" },
  hidden:               { label: "Masqué",        color: "text-gray-400 bg-gray-500/10 border-gray-500/30" },
  pending_approval:     { label: "En attente",    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  pending_verification: { label: "Non vérifié",   color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
};

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  admin:    { label: "Admin",         color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  renter:   { label: "Propriétaire",  color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  customer: { label: "Client",        color: "text-green-400 bg-green-500/10 border-green-500/30" },
};

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<UserItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatus]   = useState("all");
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [actionLoading, setAction]  = useState<string | null>(null);
  const [deleteConfirm, setDel]     = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "all")   params.set("role",   roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search)                 params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [roleFilter, statusFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const changeStatus = async (id: string, newStatus: "active" | "suspended" | "hidden") => {
    setAction(id + "-status");
    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === id ? { ...u, status: newStatus } : u));
        showToast(newStatus === "active" ? "Compte activé ✓" : newStatus === "suspended" ? "Compte suspendu ✓" : "Compte masqué ✓");
      } else {
        const d = await res.json();
        showToast(d.error || "Erreur", false);
      }
    } catch { showToast("Erreur réseau", false); }
    finally { setAction(null); }
  };

  const deleteUser = async (id: string) => {
    setAction(id + "-delete");
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== id));
        showToast("Utilisateur supprimé ✓");
      } else {
        showToast("Erreur lors de la suppression", false);
      }
    } catch { showToast("Erreur réseau", false); }
    finally { setAction(null); setDel(null); }
  };

  const counts = {
    all:      users.length,
    customer: users.filter(u => u.role === "customer").length,
    renter:   users.filter(u => u.role === "renter").length,
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border text-sm font-semibold shadow-2xl ${
              toast.ok
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10   border-red-500/30   text-red-400"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Gestion des utilisateurs</h1>
          <p className="text-text-muted text-sm mt-0.5">{users.length} utilisateur{users.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent transition-colors text-sm"
        >
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Role tabs */}
        <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-lg p-1">
          {(["all", "customer", "renter"] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                roleFilter === r ? "bg-accent text-bg-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {r === "all" ? `Tous (${counts.all})` : r === "customer" ? `Clients (${counts.customer})` : `Proprio. (${counts.renter})`}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-lg p-1">
          {["all", "active", "suspended", "pending_approval"].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                statusFilter === s ? "bg-accent text-bg-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {s === "all" ? "Tous statuts" : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Nom, email, wilaya..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:border-accent focus:outline-none w-60"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-bg-secondary border border-border animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <Filter size={40} className="mb-3 opacity-30" />
          <p>Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {users.map(user => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-secondary border border-border rounded-xl overflow-hidden hover:border-border/80 transition-colors"
              >
                {/* Row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-accent">{user.name[0]}{user.lastName[0]}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-text-primary">{user.name} {user.lastName}</p>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${ROLE_CONFIG[user.role]?.color || ""}`}>
                        {ROLE_CONFIG[user.role]?.label || user.role}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${STATUS_CONFIG[user.status]?.color || ""}`}>
                        {STATUS_CONFIG[user.status]?.label || user.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 truncate">{user.email} · {user.wilaya}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {user.role !== "admin" && (
                      <>
                        {user.status !== "active" && (
                          <button
                            onClick={() => changeStatus(user._id, "active")}
                            disabled={actionLoading === user._id + "-status"}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user._id + "-status" ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={12} />}
                            Activer
                          </button>
                        )}
                        {user.status !== "suspended" && (
                          <button
                            onClick={() => changeStatus(user._id, "suspended")}
                            disabled={actionLoading === user._id + "-status"}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user._id + "-status" ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <XCircle size={12} />}
                            Suspendre
                          </button>
                        )}
                      </>
                    )}

                    {/* Delete confirm */}
                    {deleteConfirm === user._id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => deleteUser(user._id)}
                          disabled={actionLoading === user._id + "-delete"}
                          className="px-3 py-1.5 bg-red-500 text-white font-semibold rounded-lg text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          Confirmer
                        </button>
                        <button onClick={() => setDel(null)} className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary">
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDel(user._id)}
                        className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-text-muted hover:text-red-400 hover:border-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => setExpanded(p => p === user._id ? null : user._id)}
                      className="w-8 h-8 flex items-center justify-center border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent transition-colors"
                    >
                      <ChevronDown size={14} className={`transition-transform ${expanded === user._id ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {expanded === user._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/50 px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Mail size={13} className="text-accent shrink-0" />
                          <a href={`mailto:${user.email}`} className="truncate hover:text-accent transition-colors">{user.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Phone size={13} className="text-accent shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <MapPin size={13} className="text-accent shrink-0" />
                          <span>{user.wilaya}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Clock size={13} className="text-accent shrink-0" />
                          <span>{new Date(user.createdAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Shield size={13} className="text-accent shrink-0" />
                          <span>{user.emailVerified ? "Email vérifié" : "Email non vérifié"}</span>
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
