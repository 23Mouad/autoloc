"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";

export default function AdminNewCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "", brand: "", model: "", year: 2024,
    category: "Economy", transmission: "Manual", fuel: "Gasoline",
    seats: 5, doors: 4, ac: true, trunkLiters: 400,
    pricePerDay: 5000, pricePerWeek: 30000, available: true,
    description: "", features: "",
    zone: "", lat: 36.9, lng: 7.77,
    rating: 0, reviewCount: 0,
  });

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
        setImageUrls((prev) => [...prev, data.url]);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
          images: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80"],
          location: { zone: form.zone, lat: form.lat, lng: form.lng },
        }),
      });

      if (res.ok) {
        router.push("/admin/cars");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create car");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Add New Car</h1>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Name" value={form.name} onChange={(v) => update("name", v)} required />
          <InputField label="Brand" value={form.brand} onChange={(v) => update("brand", v)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Model" value={form.model} onChange={(v) => update("model", v)} required />
          <InputField label="Year" type="number" value={String(form.year)} onChange={(v) => update("year", Number(v))} required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <SelectField label="Category" value={form.category} onChange={(v) => update("category", v)} options={["Economy", "SUV", "Luxury", "Van", "Minibus"]} />
          <SelectField label="Transmission" value={form.transmission} onChange={(v) => update("transmission", v)} options={["Manual", "Automatic"]} />
          <SelectField label="Fuel" value={form.fuel} onChange={(v) => update("fuel", v)} options={["Gasoline", "Diesel", "Electric"]} />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <InputField label="Seats" type="number" value={String(form.seats)} onChange={(v) => update("seats", Number(v))} />
          <InputField label="Doors" type="number" value={String(form.doors)} onChange={(v) => update("doors", Number(v))} />
          <InputField label="Trunk (L)" type="number" value={String(form.trunkLiters)} onChange={(v) => update("trunkLiters", Number(v))} />
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.ac} onChange={(e) => update("ac", e.target.checked)} className="accent-accent" />
              <span className="text-sm text-text-secondary">A/C</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Price / Day (DZD)" type="number" value={String(form.pricePerDay)} onChange={(v) => update("pricePerDay", Number(v))} required />
          <InputField label="Price / Week (DZD)" type="number" value={String(form.pricePerWeek)} onChange={(v) => update("pricePerWeek", Number(v))} required />
        </div>

        <div>
          <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none resize-none h-24"
            required
          />
        </div>

        <InputField label="Features (comma-separated)" value={form.features} onChange={(v) => update("features", v)} />

        <div className="grid grid-cols-3 gap-4">
          <InputField label="Location Zone" value={form.zone} onChange={(v) => update("zone", v)} required />
          <InputField label="Latitude" type="number" value={String(form.lat)} onChange={(v) => update("lat", Number(v))} />
          <InputField label="Longitude" type="number" value={String(form.lng)} onChange={(v) => update("lng", Number(v))} />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">Images</label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:border-accent hover:text-accent cursor-pointer transition-colors">
              <Upload size={14} />
              {uploading ? "Uploading..." : "Upload Image"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <span className="text-xs text-text-muted">{imageUrls.length} uploaded</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.available} onChange={(e) => update("available", e.target.checked)} className="accent-accent" />
            <span className="text-sm text-text-secondary">Available for rent</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-accent text-bg-primary font-semibold rounded-xl hover:bg-accent-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Create Car
        </button>
      </form>
    </div>
  );
}

// ── Reusable input/select helpers ──

function InputField({ label, value, onChange, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
        required={required}
        step={type === "number" ? "any" : undefined}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
