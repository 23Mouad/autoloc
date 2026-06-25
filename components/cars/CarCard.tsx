"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Car } from "@/types/car";
import { Star } from "lucide-react";
import { useI18n } from "@/lib/I18nProvider";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group h-full flex flex-col"
    >
      <div className="bg-bg-secondary rounded-xl overflow-hidden border border-border group-hover:border-accent/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-accent/5 h-full flex flex-col">
        <div className="relative aspect-[16/10] bg-bg-elevated overflow-hidden">
          <Image src={car.images[0]} alt={car.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
          <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${car.available ? "bg-success/20 text-success border border-success/30" : "bg-danger/20 text-danger border border-danger/30"}`}>
            {car.available ? t.card_available : t.card_unavailable}
          </span>
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent/20 text-accent border border-accent/30">
            {car.category}
          </span>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-base font-semibold text-text-primary line-clamp-2 h-12 leading-6">{car.name}</h3>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Star size={12} className="text-accent fill-accent" />
              <span className="text-xs text-text-secondary">{car.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-text-secondary mb-3 flex-wrap">
            <span>⚙️ {car.transmission}</span>
            <span className="text-border">•</span>
            <span>👥 {car.seats} {t.card_seats}</span>
            <span className="text-border">•</span>
            <span>⛽ {car.fuel}</span>
          </div>
          <div className="mt-auto">
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-accent font-bold text-xl">{car.pricePerDay.toLocaleString("fr-DZ")}</span>
              <span className="text-text-muted text-xs">{t.card_per_day}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/cars/${car.id}`} className="flex-1 text-center px-4 py-2 text-sm font-medium border border-border rounded-lg text-text-secondary hover:text-accent hover:border-accent transition-colors">
                {t.card_details}
              </Link>
              <Link href={`/cars/${car.id}`} className={`flex-1 text-center px-4 py-2 text-sm font-semibold rounded-lg transition-all ${car.available ? "bg-accent text-bg-primary hover:bg-accent-light" : "bg-bg-elevated text-text-muted cursor-not-allowed"}`}>
                {t.card_book}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
