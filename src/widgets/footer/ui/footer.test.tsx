import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PERSONAL_CONTACTS, PROJECT_LINKS } from "@/shared/config/contacts";
import { renderWithProviders } from "@/shared/config/tests";
import { Footer } from "./footer";

describe("Footer", () => {
    it("shows the tagline and the current year", () => {
        renderWithProviders(<Footer />);
        expect(screen.getByRole("contentinfo")).toHaveTextContent(
            "Трекер фильмов, сериалов, аниме и игр",
        );
        expect(screen.getByText(`© ${new Date().getFullYear()} NightReel`)).toBeInTheDocument();
    });

    it("opens and closes the About dialog with the project texts", async () => {
        renderWithProviders(<Footer />);
        await userEvent.click(screen.getByRole("button", { name: "О проекте" }));

        const dialog = screen.getByRole("dialog", { name: "О проекте" });
        expect(dialog).toHaveTextContent(/учебная практика/);
        expect(within(dialog).getByRole("heading", { name: "Наши продукты" })).toBeInTheDocument();

        await userEvent.click(within(dialog).getByRole("button", { name: "Закрыть" }));
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("shows the author's Telegram and the project link", async () => {
        renderWithProviders(<Footer />);
        await userEvent.click(screen.getByRole("button", { name: "Контакты" }));

        const dialog = screen.getByRole("dialog", { name: "Контакты" });
        const links = within(dialog).getAllByRole("link");
        expect(links).toHaveLength(PERSONAL_CONTACTS.length + PROJECT_LINKS.length);
        for (const link of links) {
            expect(link.getAttribute("href")).toMatch(/^(https:\/\/|mailto:)/);
        }

        const github = within(dialog).getByRole("link", { name: /github\.com\/xdt-git/ });
        expect(github).toHaveAttribute("href", "https://github.com/xdt-git");
        expect(github).toHaveAttribute("target", "_blank");
        expect(github).toHaveAttribute("rel", "noopener noreferrer");

        const telegram = within(dialog).getByRole("link", { name: /@dabeiteex/ });
        expect(telegram).toHaveAttribute("href", "https://t.me/dabeiteex");
        expect(telegram).toHaveAttribute("rel", "noopener noreferrer");
        // The "coming later" note is shown only while there are no personal contacts.
        expect(dialog).not.toHaveTextContent("Личные контакты автора появятся позже.");
    });
});
