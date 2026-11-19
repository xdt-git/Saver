import "./storage";
import "@testing-library/jest-dom/vitest";
import { i18n } from "@/shared/config/i18n";

// Tests assert Russian texts; jsdom reports an English browser language.
beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage("ru");
});
