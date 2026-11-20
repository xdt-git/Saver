import "./storage";
import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";
import { i18n } from "@/shared/config/i18n";
import { installMatchMedia, resetMatchMedia } from "./match-media";

installMatchMedia();

// Lazy pages load their chunk first; under a full parallel run that can exceed the 1 s default.
configure({ asyncUtilTimeout: 3000 });

beforeEach(async () => {
    localStorage.clear();
    resetMatchMedia();
    delete document.documentElement.dataset.theme;
    // Tests assert Russian texts; jsdom reports an English browser language.
    await i18n.changeLanguage("ru");
});
