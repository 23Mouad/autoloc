"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Car } from "@/types/car";
import { X, Star, MapPin, ChevronRight, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/I18nProvider";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const MarkerDyn = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const PopupDyn = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const FlyToComponent = dynamic(
  () => import("react-leaflet").then((mod) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { useMap } = mod as any;
    function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
      const map = useMap();
      useEffect(() => {
        if (center) map.flyTo(center, zoom, { duration: 1.5 });
      }, [center, zoom, map]);
      return null;
    }
    return { default: FlyTo };
  }),
  { ssr: false }
);

const categories = ["All", "Economy", "SUV", "Luxury", "Van", "Minibus"];

function getCategoryColor(category: string) {
  switch (category) {
    case "Luxury": return "#C9A84C";
    case "SUV": return "#4488cc";
    case "Van": return "#8855cc";
    case "Minibus": return "#cc7744";
    default: return "#f0ede8";
  }
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function MapPage() {
  const { t } = useI18n();
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([36.9, 7.7667]);
  const [mapZoom, setMapZoom] = useState(13);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Ensure client-side rendering
  useState(() => {
    setIsClient(true);
  });

  // Fetch cars from API
  useEffect(() => {
    fetch("/api/cars")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCars(data);
      })
      .catch(() => {});
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search using Nominatim
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&countrycodes=dz&accept-language=fr`
        );
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMapCenter([lat, lng]);
    setMapZoom(15);
    setSearchQuery(result.display_name.split(",")[0]);
    setShowResults(false);
  };

  const filteredCars = useMemo(() => {
    let result = cars.filter((c) => c.available || !availableOnly);
    if (categoryFilter !== "All") {
      result = result.filter((c) => c.category === categoryFilter);
    }
    return result;
  }, [categoryFilter, availableOnly, cars]);

  const handleMarkerClick = useCallback((car: Car) => {
    setSelectedCar(car);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 md:pt-20 flex flex-col">
      {/* Filter bar */}
      <div className="bg-bg-secondary border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div ref={searchRef} className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
              placeholder="Search a location..."
              className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-8 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            {searching && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent animate-spin" />
            )}

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-1 left-0 right-0 bg-bg-secondary border border-border rounded-xl shadow-lg z-[2000] overflow-hidden max-h-64 overflow-y-auto"
                >
                  {searchResults.map((result, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectResult(result)}
                      className="w-full text-left px-4 py-3 text-sm flex items-start gap-2 hover:bg-bg-elevated transition-colors border-b border-border/50 last:border-0"
                    >
                      <MapPin size={14} className="text-accent shrink-0 mt-0.5" />
                      <span className="text-text-primary line-clamp-2">{result.display_name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* No results */}
            {showResults && searchResults.length === 0 && searchQuery.trim().length >= 2 && !searching && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-bg-secondary border border-border rounded-xl shadow-lg z-[2000] px-4 py-3">
                <p className="text-sm text-text-muted text-center">No locations found</p>
              </div>
            )}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-secondary font-medium uppercase tracking-wider mr-1">
              <MapPin size={12} className="inline mr-1" />
              {t.map_filter}
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  categoryFilter === cat
                    ? "bg-accent/20 text-accent border-accent/50"
                    : "border-border text-text-secondary hover:border-accent/30"
                }`}
              >
                {cat === "All" ? t.map_all : cat}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 ml-auto cursor-pointer">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-3.5 h-3.5 accent-accent"
            />
            <span className="text-xs text-text-secondary">{t.map_available_only}</span>
          </label>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "calc(100vh - 120px)", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToComponent center={mapCenter} zoom={mapZoom} />
          {filteredCars.map((car) => (
            <MarkerDyn
              key={car.id}
              position={[car.location.lat, car.location.lng]}
              eventHandlers={{ click: () => handleMarkerClick(car) }}
            >
              <PopupDyn>
                <div className="text-center min-w-[180px]">
                  <p className="font-semibold text-sm mb-1">{car.name}</p>
                  <p className="text-xs mb-1" style={{ color: getCategoryColor(car.category) }}>
                    {car.category}
                  </p>
                  <p className="font-bold text-sm">{car.pricePerDay.toLocaleString("fr-DZ")} DZD/jour</p>
                  <Link
                    href={`/cars/${car.id}`}
                    className="inline-block mt-2 text-xs px-3 py-1 bg-accent text-black rounded font-semibold"
                  >
                    {t.map_view_details}
                  </Link>
                </div>
              </PopupDyn>
            </MarkerDyn>
          ))}
        </MapContainer>

        {/* Sidebar */}
        <AnimatePresence>
          {selectedCar && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute top-0 right-0 h-full w-80 bg-bg-secondary border-l border-border z-[1000] overflow-y-auto"
            >
              <div className="p-5">
                <button
                  onClick={() => setSelectedCar(null)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent mb-4"
                  aria-label={t.map_close}
                >
                  <X size={16} />
                </button>

                <div className="aspect-[16/10] bg-bg-elevated rounded-lg mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-bg-elevated to-bg-primary flex items-center justify-center">
                    <svg width="50" height="50" viewBox="0 0 28 28" fill="none" className="text-border">
                      <path d="M4 18C4 18 6 12 14 12C22 12 24 18 24 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="9" cy="20" r="2" stroke="currentColor" strokeWidth="1"/>
                      <circle cx="19" cy="20" r="2" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                  </div>
                </div>

                <span className="inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent/20 text-accent border border-accent/30 mb-2">
                  {selectedCar.category}
                </span>

                <h3 className="text-lg font-semibold text-text-primary mb-1" style={{ fontStyle: "normal" }}>
                  {selectedCar.name}
                </h3>

                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < Math.round(selectedCar.rating) ? "text-accent fill-accent" : "text-border"} />
                  ))}
                  <span className="text-xs text-text-secondary ml-1">({selectedCar.reviewCount})</span>
                </div>

                <div className="space-y-2 text-sm text-text-secondary mb-4">
                  <p>⚙️ {selectedCar.transmission}</p>
                  <p>👥 {selectedCar.seats} places</p>
                  <p>⛽ {selectedCar.fuel}</p>
                  <p className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-accent" />
                    {selectedCar.location.zone}
                  </p>
                </div>

                <div className="bg-bg-elevated rounded-lg p-4 border border-border mb-4">
                  <p className="text-accent text-xl font-bold">
                    {selectedCar.pricePerDay.toLocaleString("fr-DZ")} DZD
                    <span className="text-text-muted text-xs font-normal"> / jour</span>
                  </p>
                </div>

                <Link
                  href={`/cars/${selectedCar.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-bg-primary font-semibold rounded-lg hover:bg-accent-light transition-colors"
                >
                  {t.map_book}
                  <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
