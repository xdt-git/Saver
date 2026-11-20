import { screen, within } from "@testing-library/react";
import { renderWithProviders } from "@/shared/config/tests";
import { SettingsDock } from "./settings-dock";

describe("SettingsDock", () => {
    it("holds the language and theme buttons", () => {
        renderWithProviders(<SettingsDock />);
        const dock = screen.getByRole("complementary", { name: "Настройки" });
        expect(within(dock).getByRole("button", { name: "Язык интерфейса" })).toBeInTheDocument();
        expect(within(dock).getByRole("button", { name: "Тема оформления" })).toBeInTheDocument();
    });
});
