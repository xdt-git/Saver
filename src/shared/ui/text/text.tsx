import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib";
import styles from "./text.module.scss";

export type TextTag = "h1" | "h2" | "h3" | "p" | "span" | "div";

export interface TextProps extends HTMLAttributes<HTMLElement> {
    /** HTML tag to render. */
    as?: TextTag;
    /** Adds the neon glow style. */
    glow?: boolean;
}

/** Reusable text element: picks the tag through `as` and the look through props. */
export const Text = ({ as: Tag = "span", glow = false, className, ...rest }: TextProps) => (
    <Tag className={cn(glow && styles.glow, className)} {...rest} />
);
