"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Car } from "lucide-react";

interface CarItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  pricePerDay: number;
  available: boolean;
  images: string[];
  ownerId?: string;
}

export default function AccountCarsPage() {
  const { data: session } = useSession();
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = (session?.user as Record<string, unknown>)?.id as string;

  useEffect(() => {
    fetch("/api/cars")
      .then((res) => res.json())
      .then((data) => {
        // Only show cars owned by this renter
        const myCars = Array.isArray(data)
          ? data.filter((c: CarItem) => c.ownerId === userId)
          : [];
        setCars(myCars);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this car?")) return;
    const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCars((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">My Cars</h1>
        <Link
          href="/account/cars/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-bg-primary font-semibold text-sm rounded-lg hover:bg-accent-light transition-colors"
        >
          <Plus size={16} /> Add Car
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-secondary border border-border animate-pulse" />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-16">
          <Car size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary">You haven&apos;t added any cars yet</p>
          <p className="text-xs text-text-muted mt-1">Start by adding your first car to rent out</p>
          <Link
            href="/account/cars/new"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-accent text-bg-primary font-semibold text-sm rounded-lg hover:bg-accent-light transition-colors"
          >
            <Plus size={16} /> Add Your First Car
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cars.map((car) => (
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
                  href={`/account/cars/${car.id}/edit`}
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
