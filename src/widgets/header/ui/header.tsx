import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdClose, MdMenu } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import logo from "@/shared/assets/logo.svg";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import styles from "./header.module.scss";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { NotificationBell } from "./notification-bell";
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
            {/* The logo leads to the "Our products" page. */}
            <Link to={ROUTES.home} className={styles.logoLink} aria-label={t("nav.home")}>
                <img
                    alt={t("header.logoAlt")}
                    src={logo}
                    width={64}
                    height={64}
                    className={styles.logo}
                />
            </Link>
            <NavLinks className={styles.nav} ariaLabel={t("header.mainNav")} />
            <div className={styles.actions}>
                <NotificationBell />
                <ProfileMenu />
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
