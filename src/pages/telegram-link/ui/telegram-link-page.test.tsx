import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { sessionTestOptions, TEST_USER } from "@/entities/session";
import { renderWithProviders } from "@/shared/config/tests";
import { TelegramLinkPage } from "./telegram-link-page";

const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("TelegramLinkPage", () => {
    it("links the bot after the user confirms", async () => {
        const linked = { ...TEST_USER, telegram: { username: "neo_tg" } };
        fetchMock.mockResolvedValueOnce(json(200, { success: true, data: linked }));
        renderWithProviders(
            <TelegramLinkPage />,
            "/telegram/link?code=abcdefghijklmnopqrstuvwxyz",
            sessionTestOptions(TEST_USER),
        );

        expect(screen.getByText(/к аккаунту @neo\?/)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Привязать" }));
        expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
            code: "abcdefghijklmnopqrstuvwxyz",
        });
        expect(await screen.findByText(/Telegram привязан/)).toBeInTheDocument();
    });

    it("explains a missing or used code", async () => {
        renderWithProviders(<TelegramLinkPage />, "/telegram/link", sessionTestOptions(TEST_USER));
        expect(screen.getByText(/Ссылка устарела/)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Привязать" })).not.toBeInTheDocument();
    });
});
