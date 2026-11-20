import { useTranslation } from "react-i18next";
import { Input, type InputProps } from "@/shared/ui/input";
import type { ValidationKey } from "../model/validation";

interface AuthFieldProps extends Omit<InputProps, "error"> {
    /** Validation result for this field, translated here. */
    errorKey?: ValidationKey;
}

/** Input whose error comes as a translation key (auth.validation.*). */
export const AuthField = ({ errorKey, ...props }: AuthFieldProps) => {
    const { t } = useTranslation();
    return <Input error={errorKey && t(`auth.validation.${errorKey}`)} {...props} />;
};
