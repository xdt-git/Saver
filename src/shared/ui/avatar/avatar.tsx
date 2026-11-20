import { useState } from "react";
import { cn } from "@/shared/lib";
import styles from "./avatar.module.scss";

export type AvatarSize = "sm" | "lg";

export interface AvatarProps {
    /** Shown as initials when there is no image (or it fails to load). */
    name: string;
    src: string | null;
    size?: AvatarSize;
    className?: string;
}

const initials = (name: string) =>
    name
        .split(/[\s_.-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "?";

/** Round user picture with a neon edge; initials when there is no picture. */
export const Avatar = ({ name, src, size = "sm", className }: AvatarProps) => {
    const [broken, setBroken] = useState(false);
    const classes = cn(styles.avatar, styles[size], className);

    if (src && !broken) {
        return <img src={src} alt="" className={classes} onError={() => setBroken(true)} />;
    }
    return (
        <span className={cn(classes, styles.initials)} aria-hidden="true">
            {initials(name)}
        </span>
    );
};
