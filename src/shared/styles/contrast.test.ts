import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(__dirname, "tokens.scss"), "utf8");

/** Body of the first rule block that starts with `selector`. */
const block = (selector: string) => {
    const open = css.indexOf("{", css.indexOf(selector));
    let depth = 0;
    for (let i = open; i < css.length; i++) {
        if (css[i] === "{") depth++;
        if (css[i] === "}" && --depth === 0) return css.slice(open, i);
    }
    return "";
};

const hexVars = (text: string) =>
    Object.fromEntries(
        [...text.matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1], m[2]]),
    ) as Record<string, string>;

const luminance = (hex: string) => {
    const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
    return (hi + 0.05) / (lo + 0.05);
};

const dark = hexVars(block(":root {"));
const light = { ...dark, ...hexVars(block(':root[data-theme="light"]')) };

/** WCAG 2.1: 4.5 for text, 3 for UI marks (icons, borders of state, chart bars). */
const RULES: [string, number][] = [
    ["--color-text", 4.5],
    ["--color-text-muted", 4.5],
    ["--color-text-faint", 4.5],
    ["--color-error", 4.5],
    ["--color-success", 3],
    ["--color-warning", 3],
    ["--color-primary", 3],
    ["--color-accent", 3],
];
const SURFACES = ["--color-bg", "--color-surface", "--color-surface-raised"];

describe.each([
    ["dark", dark],
    ["light", light],
])("%s theme contrast", (_name, theme) => {
    it.each(RULES)("%s reaches %s:1 on every surface", (token, min) => {
        const failing = SURFACES.filter((surface) => {
            const [fg, bg] = [theme[token], theme[surface]];
            return !fg || !bg || contrast(fg, bg) < min;
        });
        expect(failing).toEqual([]);
    });
});
