"use client";

import { motion } from "framer-motion";
import { Car, CalendarDays, Truck } from "lucide-react";
import { useI18n } from "@/lib/I18nProvider";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const icons = [Car, CalendarDays, Truck];

export default function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    { number: "1", icon: icons[0], title: t.how_step1_title, description: t.how_step1_desc },
    { number: "2", icon: icons[1], title: t.how_step2_title, description: t.how_step2_desc },
    { number: "3", icon: icons[2], title: t.how_step3_title, description: t.how_step3_desc },
  ];

  return (
    <section className="py-20 md:py-28 bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          {t.how_title}
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
        >
          {steps.map((step) => (
            <motion.div key={step.number} variants={item} className="flex flex-col items-center">
              <span
                className="text-6xl md:text-7xl font-bold text-accent/20 mb-4"
                style={{ fontFamily: "var(--font-playfair), serif", fontStyle: "italic" }}
              >
                {step.number}
              </span>
              <div className="w-14 h-14 rounded-full border border-accent/30 flex items-center justify-center mb-4 text-accent">
                <step.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{step.title}</h3>
              <p className="text-text-secondary text-sm max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
