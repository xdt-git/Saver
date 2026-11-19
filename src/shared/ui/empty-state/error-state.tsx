import { MdErrorOutline } from "react-icons/md";
import { Button } from "../button";
import { EmptyState } from "./empty-state";

export interface ErrorStateProps {
    title?: string;
    description?: string;
    /** When set, shows a retry button that calls it. */
    onRetry?: () => void;
    retryLabel?: string;
    className?: string;
}

/** Error message with an optional retry action. Built on EmptyState, no duplicated layout. */
export const ErrorState = ({
    title = "Что-то пошло не так",
    description,
    onRetry,
    retryLabel = "Повторить",
    className,
}: ErrorStateProps) => (
    <EmptyState
        tone="error"
        icon={<MdErrorOutline />}
        title={title}
        description={description}
        className={className}
        action={
            onRetry && (
                <Button size="md" onClick={onRetry}>
                    {retryLabel}
                </Button>
            )
        }
    />
);
