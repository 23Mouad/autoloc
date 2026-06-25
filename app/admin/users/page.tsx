"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  wilaya: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const changeRole = async (id: string, role: string) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/10 text-red-400 border-red-500/30",
    renter: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    customer: "bg-green-500/10 text-green-400 border-green-500/30",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Users</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-secondary border border-border animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-text-secondary text-center py-10">No users found</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-bg-secondary border border-border rounded-xl p-4 hover:border-accent/30 transition-colors"
            >
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {user.name} {user.lastName}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {user.email} · {user.phone} · {user.wilaya}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${roleColors[user.role] || ""}`}>
                  {user.role}
                </span>
                <select
                  value={user.role}
                  onChange={(e) => changeRole(user.id, e.target.value)}
                  className="bg-bg-elevated border border-border rounded-lg px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
                >
                  <option value="customer">Customer</option>
                  <option value="renter">Renter</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-red-400 hover:border-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
