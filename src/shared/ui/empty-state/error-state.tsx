import { useTranslation } from "react-i18next";
import { MdErrorOutline } from "react-icons/md";
import { Button } from "../button";
import { EmptyState } from "./empty-state";

export interface ErrorStateProps {
    /** Defaults to the translated "Something went wrong". */
    title?: string;
    description?: string;
    /** When set, shows a retry button that calls it. */
    onRetry?: () => void;
    /** Defaults to the translated "Try again". */
    retryLabel?: string;
    className?: string;
}

/** Error message with an optional retry action. Built on EmptyState, no duplicated layout. */
export const ErrorState = ({
    title,
    description,
    onRetry,
    retryLabel,
    className,
}: ErrorStateProps) => {
    const { t } = useTranslation();

    return (
        <EmptyState
            tone="error"
            icon={<MdErrorOutline />}
            title={title ?? t("common.somethingWentWrong")}
            description={description}
            className={className}
            action={
                onRetry && (
                    <Button size="md" onClick={onRetry}>
                        {retryLabel ?? t("common.retry")}
                    </Button>
                )
            }
        />
    );
};
