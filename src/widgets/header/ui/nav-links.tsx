import { useTranslation } from "react-i18next";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { glowClassName } from "@/shared/ui/text";

const navItems = [
    { labelKey: "nav.home", to: ROUTES.home },
    { labelKey: "nav.random", to: ROUTES.discover },
    { labelKey: "nav.library", to: ROUTES.library },
    { labelKey: "nav.news", to: ROUTES.news },
] as const;

interface NavLinksProps {
    className?: string;
    /** Accessible name of this navigation (desktop and mobile navs differ). */
    ariaLabel: string;
    onNavigate?: () => void;
}

/** Main navigation links; shared by the desktop header and the mobile menu. */
export const NavLinks = ({ className, ariaLabel, onNavigate }: NavLinksProps) => {
    const { t } = useTranslation();

    return (
        <nav className={className} aria-label={ariaLabel}>
            {navItems.map((item) => (
                <Button
                    key={item.to}
                    to={item.to}
                    variant="nav"
                    className={glowClassName}
                    onClick={onNavigate}
                >
                    {t(item.labelKey)}
                </Button>
            ))}
        </nav>
    );
};
