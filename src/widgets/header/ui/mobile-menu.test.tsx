import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";
import { sessionTestOptions } from "@/entities/session";
import { renderWithProviders } from "@/shared/config/tests";
import { Header } from "./header";

const renderHeader = () =>
    renderWithProviders(
        <>
            <Header />
            <Routes>
                <Route path="*" element={<p>page</p>} />
            </Routes>
        </>,
        "/",
        sessionTestOptions(null),
    );

const burger = () => screen.getByRole("button", { name: /меню/ });
const mobileNav = () => screen.queryByRole("navigation", { name: "Мобильная навигация" });

describe("Header mobile menu", () => {
    it("is closed by default", () => {
        renderHeader();
        expect(burger()).toHaveAttribute("aria-expanded", "false");
        expect(burger()).toHaveAccessibleName("Открыть меню");
        expect(mobileNav()).toBeNull();
    });

    it("opens with the navigation links and locks page scroll", async () => {
        renderHeader();
        await userEvent.click(burger());

        expect(burger()).toHaveAttribute("aria-expanded", "true");
        expect(burger()).toHaveAccessibleName("Закрыть меню");
        const nav = mobileNav();
        expect(nav).not.toBeNull();
        expect(within(nav as HTMLElement).getAllByRole("link")).toHaveLength(4);
        const panel = document.getElementById(burger().getAttribute("aria-controls") ?? "");
        expect(panel).toContainElement(nav);
        expect(document.body.style.overflow).toBe("hidden");
    });

    it("closes with the burger, Escape and a click outside", async () => {
        renderHeader();

        await userEvent.click(burger());
        await userEvent.click(burger());
        expect(mobileNav()).toBeNull();

        await userEvent.click(burger());
        await userEvent.keyboard("{Escape}");
        expect(mobileNav()).toBeNull();

        await userEvent.click(burger());
        await userEvent.click(screen.getByTestId("menu-backdrop"));
        expect(mobileNav()).toBeNull();
        expect(document.body.style.overflow).toBe("");
    });

    it("closes after navigating through a link", async () => {
        renderHeader();
        await userEvent.click(burger());
        const libraryLink = within(mobileNav() as HTMLElement).getByRole("link", {
            name: "Моя библиотека",
        });
        expect(libraryLink).toHaveAttribute("href", ROUTES.library);

        await userEvent.click(libraryLink);

        expect(mobileNav()).toBeNull();
        expect(burger()).toHaveAttribute("aria-expanded", "false");
    });
});
