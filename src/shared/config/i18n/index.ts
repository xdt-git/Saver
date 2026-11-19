import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import ru from "./locales/ru/translation.json";

export const SUPPORTED_LANGUAGES = ["ru", "en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** Used when the browser language is not supported. */
export const FALLBACK_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "saver.language";

export const resources = {
    ru: { translation: ru },
    en: { translation: en },
} as const;

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        supportedLngs: SUPPORTED_LANGUAGES,
        fallbackLng: FALLBACK_LANGUAGE,
        // "ru-RU" and "en-GB" resolve to "ru" and "en".
        nonExplicitSupportedLngs: true,
        load: "languageOnly",
        detection: {
            // The saved choice wins, then the browser / OS language.
            order: ["localStorage", "navigator"],
            lookupLocalStorage: LANGUAGE_STORAGE_KEY,
            caches: ["localStorage"],
        },
        // React already escapes values.
        interpolation: { escapeValue: false },
    });

const syncDocumentLanguage = (language: string) => {
    document.documentElement.lang = language;
};
syncDocumentLanguage(i18n.resolvedLanguage ?? FALLBACK_LANGUAGE);
i18n.on("languageChanged", syncDocumentLanguage);

export { i18n };
