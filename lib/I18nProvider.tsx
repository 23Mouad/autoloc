"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, Translations, dictionaries } from "@/lib/i18n";

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (l: Locale) => void;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  t: dictionaries.en,
  setLocale: () => {},
  dir: "ltr",
});

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || "en";
  const code = lang.toLowerCase().split("-")[0];
  if (code === "ar") return "ar";
  if (code === "fr") return "fr";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("autoloc-locale") as Locale | null;
    if (saved && dictionaries[saved]) {
      setLocaleState(saved);
    } else {
      // Auto-detect from browser language
      const detected = detectBrowserLocale();
      setLocaleState(detected);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("autoloc-locale", l);
  };

  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return (
    <I18nContext.Provider value={{ locale, t: dictionaries[locale], setLocale, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
