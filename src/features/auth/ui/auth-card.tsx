import type { FormEvent, ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { Text } from "@/shared/ui/text";
import styles from "./auth-card.module.scss";

interface AuthCardProps {
    title: string;
    submitLabel: string;
    isSubmitting: boolean;
    onSubmit: (event: FormEvent) => void;
    /** Error for the whole form, shown above the submit button. */
    formError?: string;
    /** Link to the other auth page under the form. */
    footer: ReactNode;
    children: ReactNode;
}

/** Shared frame of the login and register forms. */
export const AuthCard = ({
    title,
    submitLabel,
    isSubmitting,
    onSubmit,
    formError,
    footer,
    children,
}: AuthCardProps) => (
    <form className={styles.card} onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
        <Text as="h1" glow className={styles.title}>
            {title}
        </Text>
        <div className={styles.fields}>{children}</div>
        {formError && (
            <p role="alert" className={styles.formError}>
                {formError}
            </p>
        )}
        <Button type="submit" size="md" disabled={isSubmitting}>
            {submitLabel}
        </Button>
        <div className={styles.footer}>{footer}</div>
    </form>
);
