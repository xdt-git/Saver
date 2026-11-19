import { screen, within } from "@testing-library/react";
import { renderWithRouter } from "@/shared/config/tests";
import { Header } from "./header";

describe("Header", () => {
    it("shows the logo", () => {
        renderWithRouter(<Header />);
        expect(screen.getByAltText("Company Logo")).toBeInTheDocument();
    });

    it("has three navigation links with correct targets", () => {
        renderWithRouter(<Header />);
        const links = within(screen.getByRole("navigation")).getAllByRole("link");

        expect(links.map((link) => link.getAttribute("href"))).toEqual(["/", "/discover", "/Save"]);
        expect(links.map((link) => link.textContent)).toEqual([
            "Начальная страница",
            "Случайный контент",
            "Основная страница",
        ]);
    });
});
