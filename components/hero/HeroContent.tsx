"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/I18nProvider";

export default function HeroContent() {
  const { t } = useI18n();

  return (
    <div className="absolute inset-0 z-10 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-4 items-center min-h-[80vh]">

          {/* Left Column — Stats */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="col-span-12 md:col-span-2 flex flex-row md:flex-col gap-6 md:gap-10 justify-center md:justify-start"
          >
            <div>
              <p className="text-4xl md:text-5xl font-bold text-text-primary" style={{ fontFamily: "var(--font-space)", letterSpacing: "-0.02em" }}>
                {t.hero_stat_vehicles}
              </p>
              <p className="text-text-secondary text-xs mt-1 uppercase tracking-wider">
                {t.hero_stat_vehicles_label}
              </p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-text-primary" style={{ fontFamily: "var(--font-space)", letterSpacing: "-0.02em" }}>
                {t.hero_stat_clients}
              </p>
              <p className="text-text-secondary text-xs mt-1 uppercase tracking-wider">
                {t.hero_stat_clients_label}
              </p>
            </div>
          </motion.div>

          {/* Center — Headline + Car Image */}
          <div className="col-span-12 md:col-span-7 relative flex flex-col items-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-black mb-4 z-10 relative leading-[1.05]"
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                fontStyle: "italic",
                letterSpacing: "-0.02em",
              }}
            >
              {t.hero_title_1}
              <br />
              <span className="text-text-primary">{t.hero_title_2}</span>
            </motion.h1>

            {/* Car Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative w-full max-w-2xl -mt-8 md:-mt-16 z-20"
            >
              <Image
                src="/carInMainPage.png"
                alt="Premium luxury car for rent"
                width={900}
                height={500}
                className="w-full h-auto object-contain drop-shadow-2xl"
                priority
              />
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mt-2 z-30 pointer-events-auto"
            >
              <Link
                href="/cars"
                className="inline-block px-8 py-3 bg-accent text-bg-primary text-sm font-semibold rounded-full hover:bg-accent-light transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-accent/20"
              >
                {t.hero_cta}
              </Link>
            </motion.div>
          </div>

          {/* Right Column — Description */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="col-span-12 md:col-span-3 hidden md:block"
          >
            <p className="text-text-secondary text-sm leading-relaxed">
              {t.hero_description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 right-8 pointer-events-auto hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1 text-text-muted"
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </div>
  );
}
