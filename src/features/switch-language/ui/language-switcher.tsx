import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type Language } from "@/shared/config/i18n";
import { SegmentedControl } from "@/shared/ui/segmented-control";

interface LanguageSwitcherProps {
    className?: string;
}

/** RU / EN toggle. Changes the language instantly, without reloading; the choice is saved. */
export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
    const { t, i18n } = useTranslation();

    const options = SUPPORTED_LANGUAGES.map((language) => ({
        value: language,
        label: t(`language.${language}`),
    }));

    return (
        <SegmentedControl<Language>
            options={options}
            value={i18n.resolvedLanguage as Language | undefined}
            onChange={(language) => void i18n.changeLanguage(language)}
            ariaLabel={t("language.label")}
            className={className}
        />
    );
};
