import previewMobile from "@/shared/assets/preview_mobile.png";
import previewWeb from "@/shared/assets/all_web.webp";
import desktopIcon from "@/shared/assets/desktop.webp";
import mobileIcon from "@/shared/assets/mobile.webp";
import previewDesktop from "@/shared/assets/preview_desktop.png";
import previewTelegram from "@/shared/assets/preview_telegram.png";
import telegramIcon from "@/shared/assets/telegram.webp";
import webIcon from "@/shared/assets/web.webp";
import { ROUTES } from "./routes";

export type PlatformId = "telegram" | "mobile" | "desktop" | "web";

/**
 * What the Start button does for a platform. Only real targets: a platform that is not
 * available yet shows an apology message instead of linking anywhere.
 */
export type PlatformAction = { kind: "route"; to: string } | { kind: "unavailable" };

export interface Platform {
    id: PlatformId;
    icon: string;
    /** Screenshot for the right-hand preview. */
    preview: string;
    action: PlatformAction;
    /** Translation key (landing.actions.*) of the Start button text. */
    actionLabel: "start" | "openBot" | "download";
}

// Order matches the existing landing design.
export const PLATFORMS: readonly Platform[] = [
    // TODO: link the bot when it is published.
    {
        id: "telegram",
        icon: telegramIcon,
        preview: previewTelegram,
        action: { kind: "unavailable" },
        actionLabel: "openBot",
    },
    // TODO: link the mobile app when it is released.
    {
        id: "mobile",
        icon: mobileIcon,
        preview: previewMobile,
        action: { kind: "unavailable" },
        actionLabel: "start",
    },
    // TODO: link the download when the desktop app is released.
    {
        id: "desktop",
        icon: desktopIcon,
        preview: previewDesktop,
        action: { kind: "unavailable" },
        actionLabel: "download",
    },
    {
        id: "web",
        icon: webIcon,
        preview: previewWeb,
        action: { kind: "route", to: ROUTES.collection },
        actionLabel: "start",
    },
];

export const DEFAULT_PLATFORM: PlatformId = "web";

export const getPlatform = (id: PlatformId): Platform =>
    PLATFORMS.find((platform) => platform.id === id) ??
    (PLATFORMS[PLATFORMS.length - 1] as Platform);
