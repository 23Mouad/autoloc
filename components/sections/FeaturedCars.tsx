"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/I18nProvider";

interface CarData {
  id: string;
  name: string;
  category: string;
  transmission: string;
  seats: number;
  fuel: string;
  pricePerDay: number;
  images: string[];
}

export default function FeaturedCars() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [featured, setFeatured] = useState<CarData[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    fetch("/api/cars?available=true&limit=6")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFeatured(data);
      })
      .catch(() => {});
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  if (featured.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="accent-underline">{t.featured_title}</h2>
            <p className="text-text-secondary mt-4 text-sm md:text-base">{t.featured_subtitle}</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => scroll("left")} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors" aria-label="Scroll left">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll("right")} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors" aria-label="Scroll right">
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        <div ref={scrollRef} className="carousel-scroll flex gap-5 overflow-x-auto pb-4">
          {featured.map((car, i) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="shrink-0 w-[300px] md:w-[320px] h-full flex flex-col"
              onMouseEnter={() => setHoveredId(car.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={`bg-bg-secondary rounded-xl overflow-hidden border transition-all duration-300 h-full flex flex-col ${
                  hoveredId === car.id ? "border-accent -translate-y-1.5 shadow-lg shadow-accent/10" : "border-border"
                }`}
              >
                <div className="relative aspect-[16/10] bg-bg-elevated overflow-hidden">
                  <Image src={car.images[0]} alt={car.name} fill sizes="320px" className="object-cover" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent/20 text-accent border border-accent/30">
                    {car.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-base font-semibold text-text-primary mb-1 line-clamp-2 h-12 leading-6">{car.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
                    <span>⚙️ {car.transmission}</span>
                    <span>👥 {car.seats} {t.card_seats}</span>
                    <span>⛽ {car.fuel}</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-accent font-bold text-lg">{car.pricePerDay.toLocaleString("fr-DZ")}</span>
                      <span className="text-text-muted text-xs ml-1">{t.card_per_day}</span>
                    </div>
                    <Link href={`/cars/${car.id}`} className="px-4 py-1.5 text-xs font-semibold bg-accent text-bg-primary rounded-lg hover:bg-accent-light transition-colors">
                      {t.featured_book}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
