"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MessageSquare, Clock, Eye, EyeOff, Search, RefreshCw } from "lucide-react";

interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q)
    );
  });

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Messages de Contact</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {unread > 0 ? `${unread} message(s) non lu(s)` : "Tous les messages"}
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent transition-colors text-sm"
        >
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 pr-4 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:border-accent focus:outline-none w-full"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-bg-secondary border border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun message trouvé</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-bg-secondary border rounded-xl overflow-hidden transition-colors ${
                  !msg.read ? "border-accent/30" : "border-border"
                }`}
              >
                <div
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-bg-elevated/50"
                  onClick={() => setExpanded((p) => (p === msg.id ? null : msg.id))}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${!msg.read ? "bg-accent" : "bg-transparent"}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-text-primary text-sm">{msg.fullName}</p>
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-bg-elevated border border-border text-text-secondary rounded-full">{msg.subject}</span>
                      </div>
                      <p className="text-xs text-text-muted truncate">{msg.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-text-muted hidden sm:block">
                      {new Date(msg.createdAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "short" })}
                    </span>
                    {expanded === msg.id ? <EyeOff size={14} className="text-text-muted" /> : <Eye size={14} className="text-text-muted" />}
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === msg.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={13} className="text-accent" />
                            <a href={`mailto:${msg.email}`} className="text-text-secondary hover:text-accent transition-colors">{msg.email}</a>
                          </div>
                          {msg.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={13} className="text-accent" />
                              <a href={`tel:${msg.phone}`} className="text-text-secondary hover:text-accent transition-colors">{msg.phone}</a>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={13} className="text-accent" />
                            <span className="text-text-muted">{new Date(msg.createdAt).toLocaleString("fr-DZ")}</span>
                          </div>
                        </div>
                        <div className="bg-bg-elevated rounded-lg border border-border/50 p-4">
                          <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">Message</p>
                          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-bg-primary font-semibold rounded-lg text-xs hover:bg-accent-light transition-colors"
                          >
                            <Mail size={12} />
                            Répondre par email
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
