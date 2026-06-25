"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import {
  Star,
  ChevronLeft,
  Fuel,
  Users,
  Cog,
  DoorOpen,
  Snowflake,
  Package,
  Gauge,
  MapPin,
} from "lucide-react";
import { useI18n } from "@/lib/I18nProvider";

interface CarData {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuel: string;
  seats: number;
  doors: number;
  ac: boolean;
  trunkLiters: number;
  pricePerDay: number;
  pricePerWeek: number;
  available: boolean;
  images: string[];
  description: string;
  features: string[];
  location: { zone: string; lat: number; lng: number };
  rating: number;
  reviewCount: number;
}

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [car, setCar] = useState<CarData | null>(null);
  const [similarCars, setSimilarCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    async function fetchCar() {
      try {
        const res = await fetch(`/api/cars/${id}`);
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setCar(data);

        // Fetch similar cars
        const allRes = await fetch(`/api/cars?category=${data.category}`);
        if (allRes.ok) {
          const allCars = await allRes.json();
          setSimilarCars(allCars.filter((c: CarData) => c.id !== data.id).slice(0, 3));
        }
      } catch {
        // failed
      } finally {
        setLoading(false);
      }
    }
    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!car) return notFound();

  const specs = [
    { icon: Cog, label: t.filter_transmission, value: car.transmission },
    { icon: Fuel, label: "Fuel", value: car.fuel },
    { icon: Users, label: t.card_seats, value: `${car.seats}` },
    { icon: DoorOpen, label: "Doors", value: `${car.doors}` },
    { icon: Snowflake, label: "AC", value: car.ac ? "✓" : "✗" },
    { icon: Package, label: "Trunk", value: `${car.trunkLiters} L` },
    { icon: Gauge, label: "Km", value: "∞" },
    { icon: MapPin, label: "Zone", value: car.location.zone },
  ];

  const handleBooking = () => {
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Back */}
        <Link
          href="/cars"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          {t.detail_back}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left — Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-[16/10] bg-bg-secondary rounded-xl overflow-hidden border border-border relative">
              <Image
                src={car.images[0]}
                alt={car.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 mt-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 aspect-[16/10] bg-bg-secondary rounded-lg border border-border overflow-hidden relative"
                >
                  <Image
                    src={car.images[0]}
                    alt={`${car.name} view ${i}`}
                    fill
                    sizes="200px"
                    className="object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent/20 text-accent border border-accent/30 mb-2">
                  {car.category}
                </span>
                <h1 className="text-2xl md:text-3xl">{car.name}</h1>
              </div>
              <span
                className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                  car.available
                    ? "bg-success/20 text-success border border-success/30"
                    : "bg-danger/20 text-danger border border-danger/30"
                }`}
              >
                {car.available ? t.card_available : t.card_unavailable}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(car.rating)
                        ? "text-accent fill-accent"
                        : "text-border"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-text-secondary">
                {car.rating} ({car.reviewCount})
              </span>
            </div>

            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              {car.description}
            </p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-center gap-2.5 p-3 bg-bg-elevated rounded-lg border border-border"
                >
                  <spec.icon size={16} className="text-accent shrink-0" />
                  <div>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider">
                      {spec.label}
                    </p>
                    <p className="text-sm text-text-primary font-medium">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="mb-6">
              <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-2">
                {t.detail_features}
              </p>
              <div className="flex flex-wrap gap-2">
                {car.features.map((f) => (
                  <span
                    key={f}
                    className="px-3 py-1 text-xs rounded-full bg-bg-elevated border border-border text-text-secondary"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="bg-bg-elevated rounded-xl p-5 border border-border mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider">{t.detail_per_day}</p>
                  <p className="text-accent text-2xl font-bold">
                    {car.pricePerDay.toLocaleString("fr-DZ")}{" "}
                    <span className="text-sm font-normal text-text-muted">{t.currency}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-text-muted text-xs uppercase tracking-wider">{t.detail_per_week}</p>
                  <p className="text-text-primary text-xl font-bold">
                    {car.pricePerWeek.toLocaleString("fr-DZ")}{" "}
                    <span className="text-sm font-normal text-text-muted">{t.currency}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Book CTA */}
            <button
              onClick={handleBooking}
              disabled={!car.available}
              className={`w-full py-3.5 rounded-lg text-base font-semibold transition-all duration-200 ${
                car.available
                  ? "bg-accent text-bg-primary hover:bg-accent-light hover:-translate-y-0.5 shadow-lg shadow-accent/20"
                  : "bg-bg-elevated text-text-muted cursor-not-allowed"
              }`}
            >
              {car.available ? t.detail_book_btn : t.detail_unavailable}
            </button>

            {bookingSuccess && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-success text-sm text-center mt-3"
              >
                ✓ {t.detail_booking_sent}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Similar Cars */}
        {similarCars.length > 0 && (
          <div className="mt-16 md:mt-24">
            <h2 className="accent-underline mb-8">{t.detail_similar}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {similarCars.map((sc) => (
                <Link
                  key={sc.id}
                  href={`/cars/${sc.id}`}
                  className="bg-bg-secondary rounded-xl border border-border p-4 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="aspect-[16/10] bg-bg-elevated rounded-lg mb-3 overflow-hidden relative">
                    <Image
                      src={sc.images[0]}
                      alt={sc.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">
                    {sc.name}
                  </h3>
                  <p className="text-accent font-bold text-sm">
                    {sc.pricePerDay.toLocaleString("fr-DZ")} {t.currency}
                    <span className="text-text-muted font-normal"> {t.map_per_day}</span>
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
