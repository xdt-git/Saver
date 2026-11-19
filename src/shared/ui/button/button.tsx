import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib";
import styles from "./button.module.scss";

export type ButtonVariant = "primary" | "icon" | "nav";

interface BaseProps {
    /** Visual style of the button. */
    variant?: ButtonVariant;
    className?: string;
    children: ReactNode;
}

type NativeButtonProps = BaseProps &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
        to?: undefined;
    };

type LinkButtonProps = BaseProps &
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | "href"> & {
        /** When set, the button is rendered as a router link to this path. */
        to: string;
    };

export type ButtonProps = NativeButtonProps | LinkButtonProps;

/**
 * Reusable button. Pass `to` to render a router link styled as a button
 * (instead of nesting a <button> inside a link, which is invalid HTML).
 */
export const Button = (props: ButtonProps) => {
    const { variant = "primary", className, children } = props;
    const classes = cn(styles.button, styles[variant], className);

    if (props.to !== undefined) {
        const { to, variant: _v, className: _c, children: _ch, ...linkProps } = props;
        return (
            <Link to={to} className={classes} {...linkProps}>
                {children}
            </Link>
        );
    }

    const {
        to: _to,
        variant: _v,
        className: _c,
        children: _ch,
        type = "button",
        ...buttonProps
    } = props;
    return (
        <button type={type} className={classes} {...buttonProps}>
            {children}
        </button>
    );
};
