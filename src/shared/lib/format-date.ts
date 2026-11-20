const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 365 * 24 * 3600],
    ["month", 30 * 24 * 3600],
    ["week", 7 * 24 * 3600],
    ["day", 24 * 3600],
    ["hour", 3600],
    ["minute", 60],
];

/** "5 minutes ago", "yesterday", "this minute" in the given language. */
export const formatRelativeTime = (iso: string, language: string, now = Date.now()) => {
    const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
    const format = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
    for (const [unit, size] of UNITS) {
        if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
    }
    return format.format(0, "minute");
};

/** A calendar date in the given language, e.g. 20.11.2026 or 11/20/2026. */
export const formatDate = (iso: string, language: string) =>
    new Date(iso).toLocaleDateString(language);
