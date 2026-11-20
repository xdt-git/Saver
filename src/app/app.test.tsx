import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { apiFailure, mockApi } from "@/shared/config/tests";
import App from "./App";

afterEach(() => vi.unstubAllGlobals());

// The real composition (providers, router, session check), as main.tsx renders it.
describe("App", () => {
    it("starts as a guest when there is no session and shows the landing page", async () => {
        const api = mockApi({
            "GET /api/auth/me": () => apiFailure(401, "UNAUTHORIZED"),
            "POST /api/auth/refresh": () => apiFailure(401, "UNAUTHORIZED"),
        });
        render(<App />);

        expect(await screen.findByRole("heading", { name: /Universal Saver/ })).toBeInTheDocument();
        expect(await screen.findByRole("link", { name: "Войти" })).toHaveAttribute(
            "href",
            "/login",
        );
        expect(api.calls("GET /api/auth/me")).toHaveLength(1);
    });

    it("keeps working when the API is unreachable", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
        render(<App />);
        expect(await screen.findByRole("heading", { name: /Universal Saver/ })).toBeInTheDocument();
    });
});
