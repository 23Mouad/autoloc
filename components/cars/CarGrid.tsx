"use client";

import { useMemo, useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import CarCard from "./CarCard";
import { Car } from "@/types/car";

export default function CarGrid() {
  const { filters } = useStore();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cars")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCars(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...cars];

    // Category
    if (filters.category.length > 0) {
      result = result.filter((c) => filters.category.includes(c.category));
    }

    // Price range
    result = result.filter(
      (c) => c.pricePerDay >= filters.priceRange[0] && c.pricePerDay <= filters.priceRange[1]
    );

    // Transmission
    if (filters.transmission !== "All") {
      result = result.filter((c) => c.transmission === filters.transmission);
    }

    // Seats
    if (filters.minSeats > 0) {
      result = result.filter((c) => c.seats >= filters.minSeats);
    }

    // Available only
    if (filters.availableOnly) {
      result = result.filter((c) => c.available);
    }

    // Sort
    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price-desc":
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "newest":
        result.sort((a, b) => b.year - a.year);
        break;
      case "popular":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return result;
  }, [filters, cars]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-72 rounded-xl bg-bg-secondary border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-text-secondary text-lg mb-2">Aucun véhicule trouvé</p>
        <p className="text-text-muted text-sm">Essayez de modifier vos filtres</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {filtered.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}
