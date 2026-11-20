import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { i18n } from "@/shared/config/i18n";
import { renderWithProviders } from "@/shared/config/tests";
import { THEME_STORAGE_KEY } from "@/shared/config/theme";
import { ThemeSwitcher } from "./theme-switcher";

const open = () => userEvent.click(screen.getByRole("button", { name: "Тема оформления" }));

describe("ThemeSwitcher", () => {
    it("opens into Dark and Light only, with dark selected by default", async () => {
        renderWithProviders(<ThemeSwitcher />);
        await open();

        expect(screen.getByRole("button", { name: "Тёмная" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByRole("button", { name: "Светлая" })).toHaveAttribute(
            "aria-pressed",
            "false",
        );
        expect(screen.queryByRole("button", { name: "Как в системе" })).toBeNull();
    });

    it("switches the theme, saves it and collapses", async () => {
        renderWithProviders(<ThemeSwitcher />);
        await open();
        await userEvent.click(screen.getByRole("button", { name: "Светлая" }));

        expect(document.documentElement.dataset.theme).toBe("light");
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
        expect(screen.getByRole("button", { name: "Тема оформления" })).toHaveAttribute(
            "aria-expanded",
            "false",
        );
    });

    it("keeps the theme when the language changes", async () => {
        renderWithProviders(<ThemeSwitcher />);
        await open();
        await userEvent.click(screen.getByRole("button", { name: "Светлая" }));
        await i18n.changeLanguage("en");

        expect(document.documentElement.dataset.theme).toBe("light");
        await userEvent.click(await screen.findByRole("button", { name: "Color theme" }));
        expect(screen.getByRole("button", { name: "Light" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });
});
