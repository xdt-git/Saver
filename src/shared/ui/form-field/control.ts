import styles from "./form-field.module.scss";

/** Shared class names of form controls (input, select, textarea). */
export const controlClassNames = {
    control: styles.control,
    invalid: styles.controlInvalid,
};

/** Ids of the hint and error elements, for aria-describedby on the control. */
export const describedBy = (id: string, hint?: string, error?: string) =>
    [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
