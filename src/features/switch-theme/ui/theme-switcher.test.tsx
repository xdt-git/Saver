import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { i18n } from "@/shared/config/i18n";
import { renderWithProviders } from "@/shared/config/tests";
import { THEME_STORAGE_KEY } from "@/shared/config/theme";
import { ThemeSwitcher } from "./theme-switcher";

describe("ThemeSwitcher", () => {
    it("offers system, light and dark with dark selected by default", () => {
        renderWithProviders(<ThemeSwitcher />);
        expect(screen.getByRole("group", { name: "Тема оформления" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Как в системе" })).toHaveAttribute(
            "aria-pressed",
            "false",
        );
        expect(screen.getByRole("button", { name: "Светлая" })).toHaveAttribute(
            "aria-pressed",
            "false",
        );
        expect(screen.getByRole("button", { name: "Тёмная" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    it("switches the theme and saves it", async () => {
        renderWithProviders(<ThemeSwitcher />);
        await userEvent.click(screen.getByRole("button", { name: "Светлая" }));
        expect(document.documentElement.dataset.theme).toBe("light");
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
        expect(screen.getByRole("button", { name: "Светлая" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    it("keeps the theme when the language changes", async () => {
        renderWithProviders(<ThemeSwitcher />);
        await userEvent.click(screen.getByRole("button", { name: "Светлая" }));
        await i18n.changeLanguage("en");
        expect(document.documentElement.dataset.theme).toBe("light");
        expect(await screen.findByRole("button", { name: "Light" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });
});
