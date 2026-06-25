"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Megaphone, Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  image?: string;
  isGlobal: boolean;
  ownerId: { name?: string; lastName?: string } | string;
  createdAt: string;
}

export default function OwnerAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", image: "" });

  const fetchAnnouncements = () => {
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        // Only show renter's own announcements (not global ones from admin)
        const own = Array.isArray(data) ? data.filter((a: AnnouncementItem) => !a.isGlobal) : [];
        setAnnouncements(own);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setForm({ title: "", content: "", image: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, image: data.url }));
      }
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/announcements/${editingId}` : "/api/announcements";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        resetForm();
        fetchAnnouncements();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (a: AnnouncementItem) => {
    setForm({ title: a.title, content: a.content, image: a.image || "" });
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Announcements</h1>
          <p className="text-sm text-text-secondary mt-1">Manage announcements for your rental store</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-bg-primary font-semibold text-sm rounded-lg hover:bg-accent-light transition-colors"
        >
          <Plus size={16} /> New
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-bg-secondary border border-border rounded-xl p-6 relative">
          <button onClick={resetForm} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
            <X size={18} />
          </button>
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
            {editingId ? "Edit Announcement" : "New Announcement"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none resize-none h-24"
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:border-accent hover:text-accent cursor-pointer transition-colors">
                <Upload size={14} />
                {uploading ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {form.image && (
                <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-border">
                  <Image src={form.image} alt="preview" fill sizes="64px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, image: "" }))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-accent text-bg-primary font-semibold rounded-xl hover:bg-accent-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editingId ? "Save Changes" : "Create Announcement"}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-bg-secondary border border-border animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <Megaphone size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary">No announcements yet</p>
          <p className="text-xs text-text-muted mt-1">Create your first announcement to promote your rental services</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-bg-secondary border border-border rounded-xl p-5 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{a.title}</h3>
                  <p className="text-xs text-text-secondary line-clamp-2">{a.content}</p>
                  <span className="text-xs text-text-muted mt-2 inline-block">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {a.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-bg-elevated shrink-0 relative">
                    <Image src={a.image} alt={a.title} fill sizes="64px" className="object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(a)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-red-400 hover:border-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
