"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { pt, en } from "@/locales";

export const defaultNS = "base";
export const resources = {
  pt,
  en,
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "pt",
  fallbackLng: "en",
  ns: ["shared", "auth", "blog", "about", "navigation", "contact", "home", "footer"],
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;


