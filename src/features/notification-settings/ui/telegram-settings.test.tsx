import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { sessionKeys, sessionTestOptions, TEST_USER, type SessionUser } from "@/entities/session";
import { renderWithProviders } from "@/shared/config/tests";
import { TelegramSettings } from "./telegram-settings";

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

/** The session user with the bot turned on in the API. */
const withBot = (user: SessionUser, telegram: string | null = "NightReelBot") => {
    const base = sessionTestOptions(user);
    return {
        ...base,
        setup: (queryClient: Parameters<NonNullable<typeof base.setup>>[0]) => {
            base.setup?.(queryClient);
            queryClient.setQueryData(sessionKeys.providers(), { google: null, telegram });
        },
    };
};

describe("TelegramSettings", () => {
    it("stays hidden while the bot is off", () => {
        renderWithProviders(<TelegramSettings />, "/", withBot(TEST_USER, null));
        expect(screen.queryByText("Telegram-бот")).not.toBeInTheDocument();
    });

    it("asks the API for the bot link to connect", async () => {
        const assign = vi.fn();
        vi.stubGlobal("location", { ...window.location, assign });
        fetchMock.mockResolvedValueOnce(
            json(200, { success: true, data: { url: "https://t.me/NightReelBot?start=link_x" } }),
        );
        renderWithProviders(<TelegramSettings />, "/", withBot(TEST_USER));

        await userEvent.click(screen.getByRole("button", { name: "Подключить Telegram" }));
        expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/telegram/link-code");
        await vi.waitFor(() =>
            expect(assign).toHaveBeenCalledWith("https://t.me/NightReelBot?start=link_x"),
        );
    });

    it("shows the linked account and disconnects it", async () => {
        const linked = { ...TEST_USER, telegram: { username: "neo_tg" } };
        fetchMock.mockResolvedValueOnce(json(200, { success: true, data: TEST_USER }));
        const { queryClient } = renderWithProviders(<TelegramSettings />, "/", withBot(linked));

        expect(screen.getByText("Подключён Telegram @neo_tg.")).toBeInTheDocument();
        expect(screen.getByLabelText("Дублировать уведомления в Telegram")).toBeChecked();
        await userEvent.click(screen.getByRole("button", { name: "Отключить" }));
        expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("DELETE");
        await vi.waitFor(() =>
            expect(queryClient.getQueryData<SessionUser>(sessionKeys.me())?.telegram).toBeNull(),
        );
    });

    it("keeps accounts made in Telegram linked", () => {
        const telegramOnly = {
            ...TEST_USER,
            email: null,
            hasPassword: false,
            telegram: { username: "neo_tg" },
        };
        renderWithProviders(<TelegramSettings />, "/", withBot(telegramOnly));
        expect(screen.queryByRole("button", { name: "Отключить" })).not.toBeInTheDocument();
    });
});
