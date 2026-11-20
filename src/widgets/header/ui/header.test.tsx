import { screen, within } from "@testing-library/react";
import { ROUTES } from "@/shared/config/routes";
import { renderWithProviders } from "@/shared/config/tests";
import { Header } from "./header";

describe("Header", () => {
    it("shows the logo", () => {
        renderWithProviders(<Header />);
        expect(screen.getByAltText("Логотип Universal Saver")).toBeInTheDocument();
    });

    it("has three navigation links with correct targets", () => {
        renderWithProviders(<Header />);
        const links = within(screen.getByRole("navigation")).getAllByRole("link");

        expect(links.map((link) => link.getAttribute("href"))).toEqual([
            ROUTES.home,
            ROUTES.discover,
            ROUTES.library,
        ]);
        expect(links.map((link) => link.textContent)).toEqual([
            "Начальная страница",
            "Случайный контент",
            "Основная страница",
        ]);
    });

    it("leaves language and theme to the settings dock", () => {
        renderWithProviders(<Header />);
        expect(screen.queryByRole("button", { name: "Язык интерфейса" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Тема оформления" })).toBeNull();
    });
});
