import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/features/switch-language";
import { ThemeSwitcher } from "@/features/switch-theme";
import styles from "./settings-dock.module.scss";

/** Floating language and theme controls, available on every page and screen size. */
export const SettingsDock = () => {
    const { t } = useTranslation();

    return (
        <aside className={styles.dock} aria-label={t("settings.label")}>
            <LanguageSwitcher />
            <ThemeSwitcher />
        </aside>
    );
};
