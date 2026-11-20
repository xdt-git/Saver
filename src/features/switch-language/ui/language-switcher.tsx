import { useTranslation } from "react-i18next";
import { MdLanguage } from "react-icons/md";
import { SUPPORTED_LANGUAGES, type Language } from "@/shared/config/i18n";
import { ExpandablePicker } from "@/shared/ui/expandable-picker";

interface LanguageSwitcherProps {
    className?: string;
}

/** Round globe button; opens into RU / EN. Changes the language instantly and saves it. */
export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
    const { t, i18n } = useTranslation();

    const options = SUPPORTED_LANGUAGES.map((language) => ({
        value: language,
        label: t(`language.${language}`),
    }));

    return (
        <ExpandablePicker<Language>
            icon={<MdLanguage />}
            label={t("language.label")}
            options={options}
            value={i18n.resolvedLanguage as Language | undefined}
            onChange={(language) => void i18n.changeLanguage(language)}
            className={className}
        />
    );
};
