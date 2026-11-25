import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PLATFORMS, getPlatform } from "@/shared/config/platforms";
import { ROUTES } from "@/shared/config/routes";
import { renderWithProviders } from "@/shared/config/tests";
import { LandingMain } from "./landing-main";

const renderLanding = () => renderWithProviders(<LandingMain />);

const platformButton = (name: string) =>
    within(screen.getByRole("group", { name: "Выбор платформы" })).getByRole("button", { name });

describe("Landing platform switcher", () => {
    it("starts with the web version selected and Start leading to the library", () => {
        renderLanding();
        expect(platformButton("Веб-версия")).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("link", { name: "Начать" })).toHaveAttribute(
            "href",
            ROUTES.collection,
        );
        expect(screen.getByAltText("Saver в браузере и на телефоне")).toHaveAttribute(
            "src",
            getPlatform("web").preview,
        );
    });

    it.each([
        ["Telegram", "telegram", "Открыть бота", "Telegram-бот Saver"],
        ["Мобильное приложение", "mobile", "Начать", "Saver на телефоне"],
        ["Приложение для ПК", "desktop", "Скачать", "Приложение Saver для ПК"],
    ] as const)(
        "%s: shows its own preview and apologizes instead of linking anywhere",
        async (label, id, action, alt) => {
            renderLanding();
            await userEvent.click(platformButton(label));

            expect(platformButton(label)).toHaveAttribute("aria-pressed", "true");
            expect(platformButton("Веб-версия")).toHaveAttribute("aria-pressed", "false");
            expect(screen.getByAltText(alt)).toHaveAttribute("src", getPlatform(id).preview);
            expect(screen.queryByRole("link", { name: action })).toBeNull();

            await userEvent.click(screen.getByRole("button", { name: action }));
            expect(await screen.findByRole("alert")).toHaveTextContent(
                "Просим прощения! К сожалению, данный сервис временно недоступен.",
            );
        },
    );
});

describe("Platform config", () => {
    it("has a unique id and preview per platform and only real route targets", () => {
        const ids = PLATFORMS.map((platform) => platform.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(new Set(PLATFORMS.map((platform) => platform.preview)).size).toBe(ids.length);
        const knownRoutes: string[] = Object.values(ROUTES);
        for (const platform of PLATFORMS) {
            if (platform.action.kind === "route") {
                expect(knownRoutes, platform.id).toContain(platform.action.to);
            }
        }
    });
});
