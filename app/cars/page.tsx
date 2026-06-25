"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import CarFilters from "@/components/cars/CarFilters";
import CarGrid from "@/components/cars/CarGrid";
import { useI18n } from "@/lib/I18nProvider";

export default function CarsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl mb-2">{t.cars_page_title}</h1>
          <p className="text-text-secondary">{t.cars_page_subtitle}</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Mobile filter toggle */}
        <button
          onClick={() => setFiltersOpen(true)}
          className="md:hidden flex items-center gap-2 px-4 py-2 mb-4 text-sm text-text-secondary border border-border rounded-lg hover:border-accent transition-colors"
        >
          <SlidersHorizontal size={14} />
          {t.cars_filters_btn}
        </button>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <div className="hidden md:block w-72 shrink-0">
            <div className="sticky top-24">
              <CarFilters />
            </div>
          </div>

          {/* Car Grid */}
          <div className="flex-1 min-w-0">
            <CarGrid />
          </div>
        </div>
      </div>

      {/* Mobile filters bottom sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl md:hidden"
            >
              <div className="bg-bg-secondary p-1">
                <div className="w-10 h-1 bg-border rounded-full mx-auto mb-2" />
                <CarFilters onClose={() => setFiltersOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
