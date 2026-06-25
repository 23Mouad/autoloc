"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar } from "lucide-react";
import { locations } from "@/data/locations";
import { useI18n } from "@/lib/I18nProvider";

export default function QuickSearch() {
  const router = useRouter();
  const { t } = useI18n();
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <section className="relative -mt-12 z-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-bg-secondary/90 backdrop-blur-xl rounded-2xl border border-border p-4 md:p-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="flex items-center gap-1.5 text-[11px] text-text-secondary mb-1.5 font-medium">
              <MapPin size={12} className="text-accent" />
              {t.search_location}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
            >
              <option value="">{t.search_location_all}</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] text-text-secondary mb-1.5 font-medium">
              <Calendar size={12} className="text-accent" />
              {t.search_pickup}
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] text-text-secondary mb-1.5 font-medium">
              <Calendar size={12} className="text-accent" />
              {t.search_return}
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          <div>
            <button
              onClick={handleSearch}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-accent text-bg-primary font-semibold rounded-xl hover:bg-accent-light transition-all duration-200 hover:-translate-y-0.5"
            >
              <Search size={16} />
              <span className="text-sm">{t.search_btn}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
