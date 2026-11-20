import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaUser } from "react-icons/fa";
import { MdClose, MdMenu } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { LanguageSwitcher } from "@/features/switch-language";
import { ThemeSwitcher } from "@/features/switch-theme";
import logo from "@/shared/assets/logo.webp";
import { Button } from "@/shared/ui/button";
import { Text } from "@/shared/ui/text";
import styles from "./header.module.scss";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

export const Header = () => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const menuId = useId();
    const [isMenuOpen, setMenuOpen] = useState(false);

    // Any navigation (links, back button) closes the mobile menu.
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    return (
        <header className={styles.header}>
            {/* Rendered first so its backdrop stays under the header items. */}
            <MobileMenu id={menuId} open={isMenuOpen} onClose={() => setMenuOpen(false)} />
            <div>
                <img alt={t("header.logoAlt")} src={logo} />
            </div>
            <NavLinks className={styles.nav} ariaLabel={t("header.mainNav")} />
            <div className={styles.actions}>
                <div className={styles.switchers}>
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
                <Text as="div" glow aria-label={t("header.profile")}>
                    <FaUser className={styles.profileIcon} />
                </Text>
                <Button
                    variant="icon"
                    className={styles.burger}
                    aria-label={isMenuOpen ? t("header.closeMenu") : t("header.openMenu")}
                    aria-expanded={isMenuOpen}
                    aria-controls={menuId}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    {isMenuOpen ? <MdClose /> : <MdMenu />}
                </Button>
            </div>
        </header>
    );
};
