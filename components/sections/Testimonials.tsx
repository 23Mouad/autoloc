"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { useI18n } from "@/lib/I18nProvider";

export default function Testimonials() {
  const { t } = useI18n();

  return (
    <section className="py-20 md:py-28 bg-bg-secondary relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="mb-4">{t.testimonials_title}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-bg-elevated/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-accent/30 transition-all duration-300"
            >
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={15} className={j < review.rating ? "text-accent fill-accent" : "text-border"} />
                ))}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-5 italic">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
                  {review.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-text-primary text-sm font-medium">{review.name}</p>
                  <p className="text-text-muted text-xs">{review.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
