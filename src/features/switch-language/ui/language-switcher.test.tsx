import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslation } from "react-i18next";
import { LANGUAGE_STORAGE_KEY } from "@/shared/config/i18n";
import { LanguageSwitcher } from "./language-switcher";

const Greeting = () => {
    const { t } = useTranslation();
    return <p>{t("nav.home")}</p>;
};

describe("LanguageSwitcher", () => {
    it("is a globe button that opens into RU / EN with the current one pressed", async () => {
        render(<LanguageSwitcher />);
        await userEvent.click(screen.getByRole("button", { name: "Язык интерфейса" }));

        expect(screen.getByRole("button", { name: "RU" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "false");
    });

    it("re-renders texts in the new language, saves it and collapses", async () => {
        render(
            <>
                <LanguageSwitcher />
                <Greeting />
            </>,
        );
        expect(screen.getByText("Начальная страница")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Язык интерфейса" }));
        await userEvent.click(screen.getByRole("button", { name: "EN" }));

        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
        expect(screen.getByRole("button", { name: "Interface language" })).toHaveAttribute(
            "aria-expanded",
            "false",
        );
    });
});
