import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdClose, MdMenu } from "react-icons/md";
import { useLocation } from "react-router-dom";
import logo from "@/shared/assets/logo.svg";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { glowClassName } from "@/shared/ui/text";
import styles from "./header.module.scss";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { ProfileMenu } from "./profile-menu";

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
                <img
                    alt={t("header.logoAlt")}
                    src={logo}
                    width={64}
                    height={64}
                    className={styles.logo}
                />
            </div>
            <NavLinks className={styles.nav} ariaLabel={t("header.mainNav")} />
            <div className={styles.actions}>
                <ProfileMenu />
                <Button
                    variant="icon"
                    className={cn(styles.burger, glowClassName)}
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
