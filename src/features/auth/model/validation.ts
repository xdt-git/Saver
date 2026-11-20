import type { LoginPayload, RegisterPayload } from "@/entities/session";

/**
 * Client-side rules, the same as the API's (saver-api: src/validators/auth.validators.ts),
 * so most mistakes are shown before a request is sent. The API checks everything again.
 */
export const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX_BYTES = 72;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Translation keys under auth.validation.* */
export type ValidationKey =
    | "required"
    | "email"
    | "username"
    | "passwordLength"
    | "passwordTooLong"
    | "passwordStrength"
    | "passwordsMismatch"
    | "emailTaken"
    | "usernameTaken"
    | "invalid";

export type FieldErrors<T> = Partial<Record<keyof T, ValidationKey>>;

const passwordProblem = (password: string): ValidationKey | undefined => {
    if (!password) return "required";
    if (password.length < PASSWORD_MIN) return "passwordLength";
    if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) return "passwordTooLong";
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
        return "passwordStrength";
    }
    return undefined;
};

/** Trims and lowercases what the API normalizes the same way. */
export const normalizeRegister = (values: RegisterPayload): RegisterPayload => ({
    ...values,
    email: values.email.trim().toLowerCase(),
    username: values.username.trim().toLowerCase(),
});

export const validateRegister = (raw: RegisterPayload): FieldErrors<RegisterPayload> => {
    const values = normalizeRegister(raw);
    const errors: FieldErrors<RegisterPayload> = {};
    if (!values.email) errors.email = "required";
    else if (!EMAIL_PATTERN.test(values.email)) errors.email = "email";
    if (!values.username) errors.username = "required";
    else if (!USERNAME_PATTERN.test(values.username)) errors.username = "username";
    const password = passwordProblem(values.password);
    if (password) errors.password = password;
    if (!values.confirmPassword) errors.confirmPassword = "required";
    else if (values.confirmPassword !== values.password)
        errors.confirmPassword = "passwordsMismatch";
    return errors;
};

export const validateLogin = (values: LoginPayload): FieldErrors<LoginPayload> => {
    const errors: FieldErrors<LoginPayload> = {};
    if (!values.login.trim()) errors.login = "required";
    if (!values.password) errors.password = "required";
    return errors;
};

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;
