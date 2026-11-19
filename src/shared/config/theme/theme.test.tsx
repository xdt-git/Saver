import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, render, screen } from "@testing-library/react";
import { setSystemPrefersDark } from "@/shared/config/tests";
import { DEFAULT_THEME_MODE, THEME_STORAGE_KEY, resolveTheme, useTheme } from "./index";
import { ThemeProvider } from "./theme-provider";

const Probe = () => {
    const { mode, resolvedTheme, setMode } = useTheme();
    return (
        <>
            <p>
                {mode}/{resolvedTheme}
            </p>
            <button onClick={() => setMode("light")}>light</button>
            <button onClick={() => setMode("system")}>system</button>
        </>
    );
};

const renderProbe = () =>
    render(
        <ThemeProvider>
            <Probe />
        </ThemeProvider>,
    );

describe("resolveTheme", () => {
    it("returns the explicit mode or follows the system", () => {
        expect(resolveTheme("light", true)).toBe("light");
        expect(resolveTheme("dark", false)).toBe("dark");
        expect(resolveTheme("system", true)).toBe("dark");
        expect(resolveTheme("system", false)).toBe("light");
    });
});

describe("ThemeProvider", () => {
    it("defaults to the dark neon theme", () => {
        renderProbe();
        expect(DEFAULT_THEME_MODE).toBe("dark");
        expect(screen.getByText("dark/dark")).toBeInTheDocument();
        expect(document.documentElement.dataset.theme).toBe("dark");
    });

    it("applies and saves the chosen mode", () => {
        renderProbe();
        act(() => screen.getByRole("button", { name: "light" }).click());
        expect(document.documentElement.dataset.theme).toBe("light");
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    });

    it("restores the saved mode and ignores invalid values", () => {
        localStorage.setItem(THEME_STORAGE_KEY, "light");
        const { unmount } = renderProbe();
        expect(screen.getByText("light/light")).toBeInTheDocument();
        unmount();

        localStorage.setItem(THEME_STORAGE_KEY, "purple");
        renderProbe();
        expect(screen.getByText("dark/dark")).toBeInTheDocument();
    });

    it("follows OS theme changes live in system mode", () => {
        renderProbe();
        act(() => screen.getByRole("button", { name: "system" }).click());
        expect(document.documentElement.dataset.theme).toBe("dark");

        act(() => setSystemPrefersDark(false));
        expect(document.documentElement.dataset.theme).toBe("light");
        expect(screen.getByText("system/light")).toBeInTheDocument();
    });

    it("keeps index.html's no-flash script in sync with the theme constants", () => {
        const html = readFileSync(join(__dirname, "..", "..", "..", "..", "index.html"), "utf8");
        expect(html).toContain(`localStorage.getItem("${THEME_STORAGE_KEY}")`);
        expect(html).toContain(`var mode = "${DEFAULT_THEME_MODE}"`);
    });
});
