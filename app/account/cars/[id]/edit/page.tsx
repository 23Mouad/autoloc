"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

export default function AccountEditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  });

  useEffect(() => {
    fetch(`/api/cars/${id}`)
      .then((res) => res.json())
      .then((car) => {
        setForm({
          name: car.name || "",
          brand: car.brand || "",
          model: car.model || "",
          year: car.year || 2024,
          category: car.category || "Economy",
          transmission: car.transmission || "Manual",
          fuel: car.fuel || "Gasoline",
          seats: car.seats || 5,
          doors: car.doors || 4,
          ac: car.ac ?? true,
          trunkLiters: car.trunkLiters || 400,
          pricePerDay: car.pricePerDay || 5000,
          pricePerWeek: car.pricePerWeek || 30000,
          available: car.available ?? true,
          description: car.description || "",
          features: Array.isArray(car.features) ? car.features.join(", ") : "",
          zone: car.location?.zone || "",
          lat: car.location?.lat || 36.9,
          lng: car.location?.lng || 7.77,
        });
        setImageUrls(Array.isArray(car.images) ? car.images : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load car");
        setLoading(false);
      });
  }, [id]);

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

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
          images: imageUrls,
          location: { zone: form.zone, lat: form.lat, lng: form.lng },
        }),
      });

      if (res.ok) {
        router.push("/account/cars");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update car");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Edit Car</h1>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" value={form.name} onChange={(v) => update("name", v)} required />
          <Field label="Brand" value={form.brand} onChange={(v) => update("brand", v)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Model" value={form.model} onChange={(v) => update("model", v)} required />
          <Field label="Year" type="number" value={String(form.year)} onChange={(v) => update("year", Number(v))} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Sel label="Category" value={form.category} onChange={(v) => update("category", v)} options={["Economy", "SUV", "Luxury", "Van", "Minibus"]} />
          <Sel label="Transmission" value={form.transmission} onChange={(v) => update("transmission", v)} options={["Manual", "Automatic"]} />
          <Sel label="Fuel" value={form.fuel} onChange={(v) => update("fuel", v)} options={["Gasoline", "Diesel", "Electric"]} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Seats" type="number" value={String(form.seats)} onChange={(v) => update("seats", Number(v))} />
          <Field label="Doors" type="number" value={String(form.doors)} onChange={(v) => update("doors", Number(v))} />
          <Field label="Trunk (L)" type="number" value={String(form.trunkLiters)} onChange={(v) => update("trunkLiters", Number(v))} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price/Day (DZD)" type="number" value={String(form.pricePerDay)} onChange={(v) => update("pricePerDay", Number(v))} required />
          <Field label="Price/Week (DZD)" type="number" value={String(form.pricePerWeek)} onChange={(v) => update("pricePerWeek", Number(v))} required />
        </div>

        <div>
          <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none resize-none h-24"
          />
        </div>

        <Field label="Features (comma-separated)" value={form.features} onChange={(v) => update("features", v)} />

        <div className="grid grid-cols-3 gap-4">
          <Field label="Zone" value={form.zone} onChange={(v) => update("zone", v)} />
          <Field label="Lat" type="number" value={String(form.lat)} onChange={(v) => update("lat", Number(v))} />
          <Field label="Lng" type="number" value={String(form.lng)} onChange={(v) => update("lng", Number(v))} />
        </div>

        {/* Image upload + preview */}
        <div>
          <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">Images</label>
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:border-accent hover:text-accent cursor-pointer transition-colors">
              <Upload size={14} />
              {uploading ? "Uploading..." : "Upload Image"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <span className="text-xs text-text-muted">{imageUrls.length} image(s)</span>
          </div>
          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-border">
                  <Image src={url} alt={`Car image ${i + 1}`} fill sizes="80px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.available} onChange={(e) => update("available", e.target.checked)} className="accent-accent" />
            <span className="text-sm text-text-secondary">Available</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.ac} onChange={(e) => update("ac", e.target.checked)} className="accent-accent" />
            <span className="text-sm text-text-secondary">A/C</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-accent text-bg-primary font-semibold rounded-xl hover:bg-accent-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
        required={required} step={type === "number" ? "any" : undefined} />
    </div>
  );
}

function Sel({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-xs text-text-secondary font-medium uppercase tracking-wider mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
