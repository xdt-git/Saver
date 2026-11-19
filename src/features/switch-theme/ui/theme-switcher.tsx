import { useTranslation } from "react-i18next";
import { MdBrightnessAuto, MdDarkMode, MdLightMode } from "react-icons/md";
import { THEME_MODES, useTheme, type ThemeMode } from "@/shared/config/theme";
import { SegmentedControl } from "@/shared/ui/segmented-control";

const icons: Record<ThemeMode, JSX.Element> = {
    system: <MdBrightnessAuto />,
    light: <MdLightMode />,
    dark: <MdDarkMode />,
};

interface ThemeSwitcherProps {
    className?: string;
}

/** System / light / dark toggle. The choice is saved and does not depend on the language. */
export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
    const { t } = useTranslation();
    const { mode, setMode } = useTheme();

    const options = THEME_MODES.map((value) => ({
        value,
        label: t(`theme.${value}`),
        icon: icons[value],
    }));

    return (
        <SegmentedControl<ThemeMode>
            options={options}
            value={mode}
            onChange={setMode}
            ariaLabel={t("theme.label")}
            className={className}
        />
    );
};
