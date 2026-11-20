import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/features/switch-language";
import { ThemeSwitcher } from "@/features/switch-theme";
import { useEscapeKey, useScrollLock } from "@/shared/lib";
import styles from "./header.module.scss";
import { NavLinks } from "./nav-links";

interface MobileMenuProps {
    id: string;
    open: boolean;
    onClose: () => void;
}

/** Drop-down panel for small screens: navigation plus theme and language switchers. */
export const MobileMenu = ({ id, open, onClose }: MobileMenuProps) => {
    const { t } = useTranslation();
    useScrollLock(open);
    useEscapeKey(open, onClose);

    if (!open) return null;

    return (
        <>
            <div className={styles.backdrop} data-testid="menu-backdrop" onClick={onClose} />
            <div id={id} className={styles.panel}>
                <NavLinks
                    className={styles.mobileNav}
                    ariaLabel={t("header.mobileNav")}
                    onNavigate={onClose}
                />
                <div className={styles.panelSwitchers}>
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
            </div>
        </>
    );
};
