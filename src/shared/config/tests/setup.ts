import "./storage";
import "@testing-library/jest-dom/vitest";
import { i18n } from "@/shared/config/i18n";
import { installMatchMedia, resetMatchMedia } from "./match-media";

installMatchMedia();

beforeEach(async () => {
    localStorage.clear();
    resetMatchMedia();
    delete document.documentElement.dataset.theme;
    // Tests assert Russian texts; jsdom reports an English browser language.
    await i18n.changeLanguage("ru");
});
