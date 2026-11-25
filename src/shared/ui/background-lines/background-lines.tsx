import { useId } from "react";
import styles from "./background-lines.module.scss";

interface Ribbon {
    d: string;
    width: number;
    blur: number;
    opacity: number;
    /** Gradient from the first color to the second, along the ribbon. */
    from: "primary" | "accent";
}

/**
 * Neon ribbons in a 1920×1080 frame stretched to the screen: one sweeps across the top,
 * one rises from the bottom left, a thin strand curls down the right side. Each is a wide
 * soft glow with a crisp line along its middle, so the curves read as lines.
 */
const RIBBONS: Ribbon[] = [
    {
        d: "M -140 300 C 240 120, 520 560, 880 400 S 1400 60, 1720 250 S 2060 520, 2100 430",
        width: 64,
        blur: 90,
        opacity: 0.9,
        from: "primary",
    },
    {
        d: "M 80 1200 C 200 900, 540 860, 780 960 S 1240 1130, 1460 880 S 1780 600, 2060 690",
        width: 110,
        blur: 130,
        opacity: 0.6,
        from: "accent",
    },
    {
        d: "M 1400 -100 C 1300 170, 1580 300, 1540 540 S 1720 840, 1980 880",
        width: 26,
        blur: 48,
        opacity: 0.8,
        from: "accent",
    },
];

/** Slight softness of the crisp middle line (a glowing tube, not a vector stroke). */
const CORE_BLUR = 3;

/** Decorative background of every page; sits behind the content and ignores the pointer. */
export const BackgroundLines = () => {
    const id = useId().replace(/:/g, "");

    return (
        <svg
            className={styles.lines}
            viewBox="0 0 1920 1080"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                {RIBBONS.map((ribbon, index) => (
                    <g key={index}>
                        <linearGradient id={`${id}-g${index}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" className={styles[ribbon.from]} />
                            <stop
                                offset="1"
                                className={styles[ribbon.from === "primary" ? "accent" : "primary"]}
                            />
                        </linearGradient>
                        {/* A region far wider than the frame, so the blur is never cut off. */}
                        <filter
                            id={`${id}-c${index}`}
                            filterUnits="userSpaceOnUse"
                            x="-2000"
                            y="-2000"
                            width="6000"
                            height="5000"
                        >
                            <feGaussianBlur stdDeviation={CORE_BLUR} />
                        </filter>
                        <filter
                            id={`${id}-f${index}`}
                            filterUnits="userSpaceOnUse"
                            x="-2000"
                            y="-2000"
                            width="6000"
                            height="5000"
                        >
                            <feGaussianBlur stdDeviation={ribbon.blur} />
                        </filter>
                    </g>
                ))}
            </defs>
            {RIBBONS.map((ribbon, index) => (
                <g key={index}>
                    <path
                        d={ribbon.d}
                        fill="none"
                        stroke={`url(#${id}-g${index})`}
                        strokeWidth={ribbon.width}
                        strokeLinecap="round"
                        strokeOpacity={ribbon.opacity}
                        filter={`url(#${id}-f${index})`}
                    />
                    <path
                        d={ribbon.d}
                        fill="none"
                        stroke={`url(#${id}-g${index})`}
                        strokeWidth={Math.max(3, ribbon.width / 10)}
                        strokeLinecap="round"
                        filter={`url(#${id}-c${index})`}
                    />
                </g>
            ))}
        </svg>
    );
};
