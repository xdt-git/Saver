import type { SessionUser } from "@/entities/session";
import { apiClient } from "@/shared/api";

/** Linking the signed-in account with the NightReel Telegram bot. */
export const telegramApi = {
    /** A t.me link that opens the bot with a one-time code (works for 15 minutes). */
    botLink: () => apiClient.post<{ url: string }>("/telegram/link-code"),
    /** Confirms the link the bot sent: the bot's lists join this account. */
    link: (code: string) => apiClient.post<SessionUser>("/telegram/link", { code }),
    unlink: () => apiClient.delete<SessionUser>("/telegram/link"),
};
