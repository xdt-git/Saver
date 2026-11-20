import { useMutation } from "@tanstack/react-query";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useSession, type SessionUser } from "@/entities/session";
import { toSubmitErrors } from "./server-errors";
import { hasErrors, type FieldErrors } from "./validation";

interface UseAuthFormOptions<T extends { [K in keyof T]: string }> {
    initial: T;
    validate: (values: T) => FieldErrors<T>;
    submit: (values: T) => Promise<SessionUser>;
}

/**
 * State and submit flow shared by the login and register forms:
 * validate → request → store the user in the session (guards then redirect),
 * or show field and form errors. After the first submit, fields re-validate as you type.
 */
export const useAuthForm = <T extends { [K in keyof T]: string }>({
    initial,
    validate,
    submit,
}: UseAuthFormOptions<T>) => {
    const { signIn } = useSession();
    const [values, setValues] = useState(initial);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors<T>>({});
    const [formError, setFormError] = useState<string>();
    const [submitted, setSubmitted] = useState(false);

    const mutation = useMutation({
        mutationFn: submit,
        onSuccess: signIn,
        onError: (error) => {
            const result = toSubmitErrors<T>(error, Object.keys(initial) as (keyof T & string)[]);
            setFieldErrors(result.fields);
            setFormError(result.form);
        },
    });

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const next = { ...values, [event.target.name]: event.target.value };
        setValues(next);
        setFormError(undefined);
        if (submitted) setFieldErrors(validate(next));
    };

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        setSubmitted(true);
        const errors = validate(values);
        setFieldErrors(errors);
        setFormError(undefined);
        if (!hasErrors(errors)) mutation.mutate(values);
    };

    /** Props for an <Input> bound to one field. */
    const field = (name: keyof T & string) => ({
        name,
        value: values[name],
        onChange,
        errorKey: fieldErrors[name],
    });

    return { field, onSubmit, formError, isSubmitting: mutation.isPending };
};
