import { useTranslation } from "react-i18next";
import { FaUser } from "react-icons/fa";
import { LanguageSwitcher } from "@/features/switch-language";
import { ThemeSwitcher } from "@/features/switch-theme";
import logo from "@/shared/assets/logo.webp";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { Text, glowClassName } from "@/shared/ui/text";
import styles from "./header.module.scss";

const navItems = [
    { labelKey: "nav.home", to: ROUTES.home },
    { labelKey: "nav.random", to: ROUTES.discover },
    { labelKey: "nav.library", to: ROUTES.library },
] as const;

export const Header = () => {
    const { t } = useTranslation();

    return (
        <header className={styles.header}>
            <div>
                <img alt={t("header.logoAlt")} src={logo} />
            </div>
            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <Button key={item.to} to={item.to} variant="nav" className={glowClassName}>
                        {t(item.labelKey)}
                    </Button>
                ))}
            </nav>
            <div className={styles.actions}>
                <ThemeSwitcher />
                <LanguageSwitcher />
                <Text as="div" glow aria-label={t("header.profile")}>
                    <FaUser className={styles.profileIcon} />
                </Text>
            </div>
        </header>
    );
};
