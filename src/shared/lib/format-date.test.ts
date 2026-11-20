import { formatRelativeTime } from "./format-date";

const NOW = new Date("2026-06-10T12:00:00Z").getTime();
const ago = (seconds: number) => new Date(NOW - seconds * 1000).toISOString();

describe("formatRelativeTime", () => {
    it.each([
        [ago(10), "en", "this minute"],
        [ago(5 * 60), "en", "5 minutes ago"],
        [ago(3 * 3600), "en", "3 hours ago"],
        [ago(24 * 3600), "en", "yesterday"],
        [ago(24 * 3600), "ru", "вчера"],
        [ago(40 * 24 * 3600), "en", "last month"],
    ])("%s in %s → %s", (iso, language, expected) => {
        expect(formatRelativeTime(iso, language, NOW)).toBe(expected);
    });
});
