"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Send, Users, UserCheck, MapPin, User, Mail, CheckCircle, Loader2 } from "lucide-react";

const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaia", "Biskra", "Béchar",
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
  "Constantine", "Médéa", "Mostaganem", "M'sila", "Mascara", "Ouargla", "Oran",
  "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf",
  "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla",
  "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane",
];

const TARGET_OPTIONS = [
  { value: "all",       label: "Tous les utilisateurs",   icon: Users,     desc: "Clients + Propriétaires" },
  { value: "users",     label: "Clients uniquement",       icon: User,      desc: "Utilisateurs role customer" },
  { value: "car_owners",label: "Propriétaires uniquement", icon: UserCheck, desc: "Utilisateurs role renter" },
  { value: "wilaya",    label: "Par Wilaya",               icon: MapPin,    desc: "Ciblez une wilaya spécifique" },
];

interface SentNotif {
  id: string;
  title: string;
  message: string;
  targetType: string;
  targetWilaya?: string;
  sentAt: string;
  count: number;
}

export default function AdminNotificationsPage() {
  const [title, setTitle]           = useState("");
  const [message, setMessage]       = useState("");
  const [targetType, setTargetType] = useState("all");
  const [wilaya, setWilaya]         = useState("");
  const [sendEmail, setSendEmail]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [sent, setSent]             = useState<SentNotif[]>([]);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState("");

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError("Le titre et le message sont obligatoires.");
      return;
    }
    if (targetType === "wilaya" && !wilaya) {
      setError("Veuillez sélectionner une wilaya.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       title.trim(),
          message:     message.trim(),
          targetType,
          targetWilaya: targetType === "wilaya" ? wilaya : undefined,
          sendEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(prev => [{
          id:          Date.now().toString(),
          title:       title.trim(),
          message:     message.trim(),
          targetType,
          targetWilaya: targetType === "wilaya" ? wilaya : undefined,
          sentAt:      new Date().toISOString(),
          count:       data.count || 0,
        }, ...prev]);
        setTitle("");
        setMessage("");
        setTargetType("all");
        setWilaya("");
        setSendEmail(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(data.error || "Erreur lors de l'envoi.");
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  const targetLabel: Record<string, string> = {
    all:        "Tous",
    users:      "Clients",
    car_owners: "Propriétaires",
    wilaya:     "Wilaya",
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
        <p className="text-text-muted text-sm mt-0.5">Diffusez des messages à vos utilisateurs</p>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
          >
            <CheckCircle size={18} className="text-green-400 shrink-0" />
            <p className="text-sm font-semibold text-green-400">Notification envoyée avec succès !</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose card */}
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Bell size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="font-semibold text-text-primary">Nouvelle notification</h2>
            <p className="text-xs text-text-muted">Remplissez le formulaire ci-dessous</p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-2">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Maintenance programmée ce soir..."
            className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-2">Message *</label>
          <textarea
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Rédigez votre message ici..."
            className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none resize-none"
          />
          <p className="text-xs text-text-muted mt-1 text-right">{message.length} caractères</p>
        </div>

        {/* Target */}
        <div>
          <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-3">Audience cible *</label>
          <div className="grid grid-cols-2 gap-3">
            {TARGET_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setTargetType(opt.value); setWilaya(""); }}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                  targetType === opt.value
                    ? "border-accent bg-accent/5"
                    : "border-border bg-bg-elevated hover:border-accent/40"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${targetType === opt.value ? "bg-accent/20" : "bg-bg-secondary"}`}>
                  <opt.icon size={15} className={targetType === opt.value ? "text-accent" : "text-text-muted"} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${targetType === opt.value ? "text-accent" : "text-text-primary"}`}>{opt.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Wilaya selector */}
          <AnimatePresence>
            {targetType === "wilaya" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-3">
                  <select
                    value={wilaya}
                    onChange={e => setWilaya(e.target.value)}
                    className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none"
                  >
                    <option value="">— Sélectionnez une wilaya —</option>
                    {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Email toggle */}
        <div className="flex items-center justify-between p-4 bg-bg-elevated border border-border rounded-xl">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-text-muted" />
            <div>
              <p className="text-sm font-medium text-text-primary">Envoyer aussi par email</p>
              <p className="text-xs text-text-muted">En plus de la notification in-app</p>
            </div>
          </div>
          <button
            onClick={() => setSendEmail(!sendEmail)}
            className={`relative w-12 h-6 rounded-full transition-colors ${sendEmail ? "bg-accent" : "bg-border"}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${sendEmail ? "left-7" : "left-1"}`} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">{error}</div>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={loading || !title.trim() || !message.trim()}
          className="w-full py-3.5 bg-accent text-bg-primary font-bold rounded-xl hover:bg-accent-light transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {loading ? "Envoi en cours..." : "Envoyer la notification"}
        </button>
      </div>

      {/* Sent history */}
      {sent.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Notifications envoyées cette session</h2>
          <div className="space-y-3">
            {sent.map(n => (
              <div key={n.id} className="bg-bg-secondary border border-border rounded-xl p-4 flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle size={16} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-text-primary">{n.title}</p>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border border-accent/30 text-accent bg-accent/5">
                      {targetLabel[n.targetType]}{n.targetWilaya ? ` · ${n.targetWilaya}` : ""}
                    </span>
                    {n.count > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border border-border text-text-muted">
                        {n.count} destinataire{n.count > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-text-muted mt-1">{new Date(n.sentAt).toLocaleTimeString("fr-DZ")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
