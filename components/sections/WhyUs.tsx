"use client";

import { motion } from "framer-motion";
import { Car, MapPin, CreditCard, Shield } from "lucide-react";
import { useI18n } from "@/lib/I18nProvider";

const icons = [Car, MapPin, CreditCard, Shield];

export default function WhyUs() {
  const { t } = useI18n();

  const props = [
    { icon: icons[0], title: t.why_1, description: t.why_1_desc },
    { icon: icons[1], title: t.why_2, description: t.why_2_desc },
    { icon: icons[2], title: t.why_3, description: t.why_3_desc },
    { icon: icons[3], title: t.why_4, description: t.why_4_desc },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="mb-4">{t.why_title}</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {props.map((prop, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-bg-secondary rounded-xl p-6 border border-border hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-accent transition-colors duration-300" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <prop.icon size={22} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary mb-1.5">{prop.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{prop.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
