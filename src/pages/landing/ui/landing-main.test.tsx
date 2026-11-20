import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PLATFORMS, getPlatform } from "@/shared/config/platforms";
import { ROUTES } from "@/shared/config/routes";
import { renderWithProviders } from "@/shared/config/tests";
import { LandingMain } from "./landing-main";

const platformButton = (name: string) =>
    within(screen.getByRole("group", { name: "Выбор платформы" })).getByRole("button", { name });
const preview = () => screen.getByAltText("Universal Saver в браузере и на телефоне");

describe("Landing platform switcher", () => {
    it("starts with the web version selected and Start leading to the library", () => {
        renderWithProviders(<LandingMain />);
        expect(platformButton("Веб-версия")).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("link", { name: "Начать" })).toHaveAttribute(
            "href",
            ROUTES.library,
        );
        expect(preview()).toHaveAttribute("src", getPlatform("web").preview);
    });

    it("highlights only the chosen platform and switches the preview", async () => {
        renderWithProviders(<LandingMain />);
        await userEvent.click(platformButton("Мобильное приложение"));

        expect(platformButton("Мобильное приложение")).toHaveAttribute("aria-pressed", "true");
        expect(platformButton("Веб-версия")).toHaveAttribute("aria-pressed", "false");
        expect(preview()).toHaveAttribute("src", getPlatform("mobile").preview);
        expect(screen.getByRole("link", { name: "Начать" })).toHaveAttribute(
            "href",
            ROUTES.library,
        );
    });

    it.each([
        ["Telegram", "telegram"],
        ["Приложение для ПК", "desktop"],
    ] as const)("marks %s as coming soon without any link", async (label, id) => {
        renderWithProviders(<LandingMain />);
        await userEvent.click(platformButton(label));

        expect(screen.queryByRole("link", { name: /Начать|Открыть бота|Скачать/ })).toBeNull();
        expect(screen.getByRole("button", { name: "Скоро" })).toBeDisabled();
        // No design for this platform yet: the general overview is shown.
        expect(getPlatform(id).preview).toBeUndefined();
        expect(preview()).toHaveAttribute("src", getPlatform("web").preview);
    });
});

describe("Platform config", () => {
    it("has a unique id per platform and only real route targets", () => {
        const ids = PLATFORMS.map((platform) => platform.id);
        expect(new Set(ids).size).toBe(ids.length);
        const knownRoutes: string[] = Object.values(ROUTES);
        for (const platform of PLATFORMS) {
            if (platform.action.kind === "route") {
                expect(knownRoutes, platform.id).toContain(platform.action.to);
            }
        }
    });
});
