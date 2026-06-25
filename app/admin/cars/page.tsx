"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface CarItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  pricePerDay: number;
  available: boolean;
  images: string[];
}

export default function AdminCarsPage() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/cars")
      .then((res) => res.json())
      .then((data) => {
        setCars(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = cars.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this car?")) return;
    const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCars((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Cars</h1>
        <Link
          href="/admin/cars/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-bg-primary font-semibold text-sm rounded-lg hover:bg-accent-light transition-colors"
        >
          <Plus size={16} /> Add Car
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search cars..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-secondary border border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-text-secondary text-center py-10">No cars found</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((car) => (
            <div
              key={car.id}
              className="flex items-center gap-4 bg-bg-secondary border border-border rounded-xl p-4 hover:border-accent/30 transition-colors"
            >
              <div className="w-16 h-12 rounded-lg overflow-hidden bg-bg-elevated shrink-0 relative">
                {car.images[0] && (
                  <Image src={car.images[0]} alt={car.name} fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary truncate">{car.name}</h3>
                <div className="flex items-center gap-3 text-xs text-text-secondary mt-0.5">
                  <span>{car.category}</span>
                  <span>{car.pricePerDay.toLocaleString("fr-DZ")} DZD/day</span>
                  <span className={car.available ? "text-green-400" : "text-red-400"}>
                    {car.available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/cars/${car.id}/edit`}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => handleDelete(car.id)}
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
