import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import translationam from "../public/locales/am/translation.json";
import translationen from "../public/locales/en/translation.json";

i18n
  .use(HttpApi) // Load translations from public/locales
  .use(LanguageDetector) // Detect language
  .use(initReactI18next) // Use react-i18next
  .init({
    supportedLngs: ["en", "am"], // Supported languages
    fallbackLng: "en", // Default language
    debug: false, // Show logs in the console (disable in production)
    resources: {
      en: {
        translation: translationen,
      },
      am: {
        translation: translationam,
      },
    },
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

export default i18n;
