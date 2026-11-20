import { useTranslation } from "react-i18next";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useTheme, type ResolvedTheme } from "@/shared/config/theme";
import { ExpandablePicker } from "@/shared/ui/expandable-picker";

const icons: Record<ResolvedTheme, JSX.Element> = {
    light: <MdLightMode />,
    dark: <MdDarkMode />,
};

// The UI offers dark and light only (product decision); "system" stays supported in the model.
const THEME_OPTIONS: ResolvedTheme[] = ["dark", "light"];

interface ThemeSwitcherProps {
    className?: string;
}

/** Round button with the current theme icon; opens into Dark / Light. The choice is saved. */
export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
    const { t } = useTranslation();
    const { resolvedTheme, setMode } = useTheme();

    const options = THEME_OPTIONS.map((value) => ({
        value,
        label: t(`theme.${value}`),
        icon: icons[value],
    }));

    return (
        <ExpandablePicker<ResolvedTheme>
            icon={icons[resolvedTheme]}
            label={t("theme.label")}
            options={options}
            value={resolvedTheme}
            onChange={setMode}
            className={className}
        />
    );
};
