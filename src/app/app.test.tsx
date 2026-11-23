import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { mockApi } from "@/shared/config/tests";
import App from "./App";

afterEach(() => vi.unstubAllGlobals());

// The real composition (providers, router, session check), as main.tsx renders it.
describe("App", () => {
    it("starts as a guest when there is no session and shows the landing page", async () => {
        const api = mockApi({
            "GET /api/auth/session": () => ({ body: { user: null, canRefresh: false } }),
        });
        render(<App />);

        expect(await screen.findByRole("heading", { name: /NightReel/ })).toBeInTheDocument();
        expect(await screen.findByRole("link", { name: "Войти" })).toHaveAttribute(
            "href",
            "/login",
        );
        expect(api.calls("GET /api/auth/session")).toHaveLength(1);
    });

    it("keeps working when the API is unreachable", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
        render(<App />);
        expect(await screen.findByRole("heading", { name: /NightReel/ })).toBeInTheDocument();
    });
});
