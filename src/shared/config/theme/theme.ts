export const THEME_MODES = ["system", "light", "dark"] as const;

/** What the user picked. "system" follows the OS setting. */
export type ThemeMode = (typeof THEME_MODES)[number];
/** The theme actually applied to the page. */
export type ResolvedTheme = Exclude<ThemeMode, "system">;

export const DEFAULT_THEME_MODE: ThemeMode = "system";
// Keep in sync with the inline script in index.html (a test checks it).
export const THEME_STORAGE_KEY = "saver.theme";
export const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

const isThemeMode = (value: unknown): value is ThemeMode =>
    THEME_MODES.includes(value as ThemeMode);

export const readStoredThemeMode = (): ThemeMode => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        return isThemeMode(stored) ? stored : DEFAULT_THEME_MODE;
    } catch {
        return DEFAULT_THEME_MODE;
    }
};

export const storeThemeMode = (mode: ThemeMode) => {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
        // Storage can be unavailable (private mode); the theme still works for this visit.
    }
};

export const systemPrefersDark = () => window.matchMedia(DARK_SCHEME_QUERY).matches;

export const resolveTheme = (mode: ThemeMode, prefersDark: boolean): ResolvedTheme =>
    mode === "system" ? (prefersDark ? "dark" : "light") : mode;

export const applyTheme = (theme: ResolvedTheme) => {
    document.documentElement.dataset.theme = theme;
};
