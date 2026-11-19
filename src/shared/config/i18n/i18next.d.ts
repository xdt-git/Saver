import "i18next";
import type ru from "./locales/ru/translation.json";

// Type-safe translation keys: t("nav.home") is checked at compile time.
declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: "translation";
        resources: { translation: typeof ru };
    }
}
