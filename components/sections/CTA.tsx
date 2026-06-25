"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/I18nProvider";

export default function CTA() {
  const { t } = useI18n();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-elevated to-bg-primary" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(193,233,48,0.3) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl mb-6"
        >
          {t.cta_title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-text-secondary text-lg mb-8 max-w-lg mx-auto"
        >
          {t.cta_subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/cars"
            className="inline-block px-10 py-4 bg-accent text-bg-primary font-semibold rounded-lg text-lg hover:bg-accent-light transition-all duration-200 hover:-translate-y-1 shadow-lg shadow-accent/20"
          >
            {t.cta_btn}
          </Link>
          <p className="text-text-muted text-xs mt-4">
            {t.cta_phone}: +213 38 42 15 67
          </p>
        </motion.div>
      </div>
    </section>
  );
}
