import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/shared/config/i18n";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { glowClassName } from "@/shared/ui/text";
import styles from "./language-switcher.module.scss";

interface LanguageSwitcherProps {
    className?: string;
}

/** RU / EN toggle. Changes the language instantly, without reloading; the choice is saved. */
export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
    const { t, i18n } = useTranslation();
    const current = i18n.resolvedLanguage;

    return (
        <div
            role="group"
            aria-label={t("language.label")}
            className={cn(styles.switcher, className)}
        >
            {SUPPORTED_LANGUAGES.map((language) => {
                const isActive = current === language;
                return (
                    <Button
                        key={language}
                        variant="nav"
                        aria-pressed={isActive}
                        className={cn(
                            isActive ? glowClassName : styles.inactive,
                            isActive && styles.active,
                        )}
                        onClick={() => void i18n.changeLanguage(language)}
                    >
                        {t(`language.${language}`)}
                    </Button>
                );
            })}
        </div>
    );
};
