import { screen, within } from "@testing-library/react";
import { ROUTES } from "@/shared/config/routes";
import { sessionTestOptions } from "@/entities/session";
import { renderWithProviders } from "@/shared/config/tests";
import { Header } from "./header";

describe("Header", () => {
    it("shows the logo", () => {
        renderWithProviders(<Header />, "/", sessionTestOptions(null));
        expect(screen.getByAltText("Логотип Universal Saver")).toBeInTheDocument();
    });

    it("has four navigation links with correct targets", () => {
        renderWithProviders(<Header />, "/", sessionTestOptions(null));
        const links = within(screen.getByRole("navigation")).getAllByRole("link");

        expect(links.map((link) => link.getAttribute("href"))).toEqual([
            ROUTES.home,
            ROUTES.discover,
            ROUTES.library,
            ROUTES.news,
        ]);
        expect(links.map((link) => link.textContent)).toEqual([
            "Начальная страница",
            "Случайный контент",
            "Основная страница",
            "Новости",
        ]);
    });

    it("leaves language and theme to the settings dock", () => {
        renderWithProviders(<Header />, "/", sessionTestOptions(null));
        expect(screen.queryByRole("button", { name: "Язык интерфейса" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Тема оформления" })).toBeNull();
    });
});
