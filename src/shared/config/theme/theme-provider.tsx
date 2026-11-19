import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
    DARK_SCHEME_QUERY,
    applyTheme,
    readStoredThemeMode,
    resolveTheme,
    storeThemeMode,
    systemPrefersDark,
    type ThemeMode,
} from "./theme";
import { ThemeContext } from "./theme-context";

/**
 * Holds the theme mode, saves it and applies the resolved theme to <html data-theme>.
 * In "system" mode it follows OS changes live. The first paint is handled by the
 * inline script in index.html, so there is no flash before React starts.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [mode, setModeState] = useState<ThemeMode>(readStoredThemeMode);
    const [prefersDark, setPrefersDark] = useState(systemPrefersDark);

    useEffect(() => {
        const media = window.matchMedia(DARK_SCHEME_QUERY);
        const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, []);

    const resolvedTheme = resolveTheme(mode, prefersDark);

    useEffect(() => {
        applyTheme(resolvedTheme);
    }, [resolvedTheme]);

    const setMode = useCallback((next: ThemeMode) => {
        storeThemeMode(next);
        setModeState(next);
    }, []);

    const value = useMemo(() => ({ mode, resolvedTheme, setMode }), [mode, resolvedTheme, setMode]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
