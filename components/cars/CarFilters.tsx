"use client";

import { useStore } from "@/store/useStore";
import { SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/lib/I18nProvider";

const categories = ["Economy", "SUV", "Luxury", "Van", "Minibus"];
const transmissions = ["All", "Manual", "Automatic"];
const seatOptions = [0, 2, 4, 5, 7];

export default function CarFilters({ onClose }: { onClose?: () => void }) {
  const { t } = useI18n();
  const {
    filters,
    toggleCategory,
    setPriceRange,
    setTransmission,
    setMinSeats,
    setAvailableOnly,
    setSortBy,
    resetFilters,
  } = useStore();

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-text-primary font-semibold">
          <SlidersHorizontal size={16} />
          <span>{t.cars_filters_btn}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="text-xs text-text-muted hover:text-accent transition-colors"
          >
            {t.filter_reset}
          </button>
          {onClose && (
            <button onClick={onClose} className="md:hidden text-text-secondary" aria-label={t.map_close}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="mb-5">
        <label className="text-xs text-text-secondary font-medium uppercase tracking-wider block mb-2.5">
          {t.filter_category}
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                filters.category.includes(cat)
                  ? "bg-accent/20 text-accent border-accent/50"
                  : "border-border text-text-secondary hover:border-accent/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <label className="text-xs text-text-secondary font-medium uppercase tracking-wider block mb-2.5">
          {t.filter_price} ({t.currency})
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={2000}
            max={15000}
            step={500}
            value={filters.priceRange[0]}
            onChange={(e) =>
              setPriceRange([Number(e.target.value), filters.priceRange[1]])
            }
            className="flex-1 accent-accent"
            aria-label="Min price"
          />
          <input
            type="range"
            min={2000}
            max={15000}
            step={500}
            value={filters.priceRange[1]}
            onChange={(e) =>
              setPriceRange([filters.priceRange[0], Number(e.target.value)])
            }
            className="flex-1 accent-accent"
            aria-label="Max price"
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>{filters.priceRange[0].toLocaleString("fr-DZ")} {t.currency}</span>
          <span>{filters.priceRange[1].toLocaleString("fr-DZ")} {t.currency}</span>
        </div>
      </div>

      {/* Transmission */}
      <div className="mb-5">
        <label className="text-xs text-text-secondary font-medium uppercase tracking-wider block mb-2.5">
          {t.filter_transmission}
        </label>
        <div className="flex gap-2">
          {transmissions.map((tr) => (
            <button
              key={tr}
              onClick={() => setTransmission(tr)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                filters.transmission === tr
                  ? "bg-accent/20 text-accent border-accent/50"
                  : "border-border text-text-secondary hover:border-accent/30"
              }`}
            >
              {tr === "All" ? t.filter_all : tr}
            </button>
          ))}
        </div>
      </div>

      {/* Seats */}
      <div className="mb-5">
        <label className="text-xs text-text-secondary font-medium uppercase tracking-wider block mb-2.5">
          {t.filter_seats}
        </label>
        <div className="flex gap-2">
          {seatOptions.map((s) => (
            <button
              key={s}
              onClick={() => setMinSeats(s)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                filters.minSeats === s
                  ? "bg-accent/20 text-accent border-accent/50"
                  : "border-border text-text-secondary hover:border-accent/30"
              }`}
            >
              {s === 0 ? t.filter_all : `${s}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Available Only */}
      <div className="mb-5">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-bg-elevated accent-accent"
          />
          <span className="text-sm text-text-secondary">{t.filter_available_only}</span>
        </label>
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs text-text-secondary font-medium uppercase tracking-wider block mb-2.5">
          {t.filter_sort}
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof filters.sortBy)}
          className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          aria-label={t.filter_sort}
        >
          <option value="popular">{t.sort_popular}</option>
          <option value="price-asc">{t.sort_price_asc}</option>
          <option value="price-desc">{t.sort_price_desc}</option>
          <option value="newest">{t.sort_newest}</option>
        </select>
      </div>
    </div>
  );
}
