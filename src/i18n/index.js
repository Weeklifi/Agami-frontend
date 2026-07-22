import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import bn from "./bn";
import en from "./en";

const saved = localStorage.getItem("lang") || "bn";

i18n.use(initReactI18next).init({
  resources: { bn, en },
  lng: saved,
  fallbackLng: "bn",
  interpolation: { escapeValue: false },
});

export default i18n;