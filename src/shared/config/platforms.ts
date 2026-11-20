import previewMobile from "@/shared/assets/all_mobile.webp";
import previewWeb from "@/shared/assets/all_web.webp";
import desktopIcon from "@/shared/assets/desktop.webp";
import mobileIcon from "@/shared/assets/mobile.webp";
import telegramIcon from "@/shared/assets/telegram.webp";
import webIcon from "@/shared/assets/web.webp";
import { ROUTES } from "./routes";

export type PlatformId = "telegram" | "mobile" | "desktop" | "web";

/**
 * What the Start button does for a platform. Only real targets: a platform without a
 * published app or bot is "unavailable" and the button says "Soon" instead of linking anywhere.
 */
export type PlatformAction = { kind: "route"; to: string } | { kind: "unavailable" };

export interface Platform {
    id: PlatformId;
    icon: string;
    /** Screenshot for the right-hand preview; missing until a design exists. */
    preview?: string;
    action: PlatformAction;
    /** Translation key (landing.actions.*) of the Start button text when available. */
    actionLabel: "start" | "openBot" | "download";
}

// Order matches the existing landing design.
export const PLATFORMS: readonly Platform[] = [
    // TODO: add the bot link when the Telegram bot is published.
    { id: "telegram", icon: telegramIcon, action: { kind: "unavailable" }, actionLabel: "openBot" },
    // The web app is responsive, so the mobile version is the same app.
    {
        id: "mobile",
        icon: mobileIcon,
        preview: previewMobile,
        action: { kind: "route", to: ROUTES.library },
        actionLabel: "start",
    },
    // TODO: add the download link when the desktop app is released.
    { id: "desktop", icon: desktopIcon, action: { kind: "unavailable" }, actionLabel: "download" },
    {
        id: "web",
        icon: webIcon,
        preview: previewWeb,
        action: { kind: "route", to: ROUTES.library },
        actionLabel: "start",
    },
];

export const DEFAULT_PLATFORM: PlatformId = "web";

export const getPlatform = (id: PlatformId): Platform =>
    PLATFORMS.find((platform) => platform.id === id) ??
    (PLATFORMS[PLATFORMS.length - 1] as Platform);
