"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Save, DollarSign, CalendarCheck, TrendingUp } from "lucide-react";

export default function AccountProfilePage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const user = session?.user as Record<string, unknown> | undefined;
  const fullName = (user?.name as string) || "";
  const nameParts = fullName.split(" ");

  const [form, setForm] = useState({
    name: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
    email: (user?.email as string) || "",
  });

  const [spending, setSpending] = useState({ total: 0, count: 0, active: 0 });
  const [loadingSpending, setLoadingSpending] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const total = data
            .filter((b: Record<string, unknown>) => b.status === "confirmed")
            .reduce((sum: number, b: Record<string, unknown>) => sum + ((b.totalPrice as number) || 0), 0);
          const active = data.filter(
            (b: Record<string, unknown>) => b.status === "confirmed" || b.status === "pending"
          ).length;
          setSpending({ total, count: data.length, active });
        }
        setLoadingSpending(false);
      })
      .catch(() => setLoadingSpending(false));
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const userId = user?.id as string;
      await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const spendingCards = [
    { label: "Total Spent", value: spending.total.toLocaleString("fr-DZ") + " DZD", icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
    { label: "Total Rentals", value: spending.count, icon: CalendarCheck, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Active", value: spending.active, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-text-primary">Profile</h1>

      {/* Spending Summary */}
      {!loadingSpending && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {spendingCards.map((card) => (
            <div
              key={card.label}
              className="bg-bg-secondary border border-border rounded-xl p-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon size={16} className={card.color} />
                </div>
              </div>
              <p className="text-xl font-bold text-text-primary">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {success && (
        <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">First Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            disabled
            className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-muted cursor-not-allowed"
          />
        </div>

        <div className="bg-bg-secondary border border-border rounded-xl p-4">
          <p className="text-xs text-text-secondary uppercase tracking-wider font-medium mb-2">Account Info</p>
          <div className="space-y-1 text-sm text-text-secondary">
            <p>Role: <span className="text-text-primary font-medium capitalize">{(user?.role as string) || "customer"}</span></p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-accent text-bg-primary font-semibold rounded-xl hover:bg-accent-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
