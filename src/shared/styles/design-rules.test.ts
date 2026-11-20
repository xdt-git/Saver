import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = join(__dirname, "..", "..");

const listFiles = (dir: string, ext: string): string[] =>
    readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return listFiles(path, ext);
        return path.endsWith(ext) ? [path] : [];
    });

// Raw values that must come from design tokens instead: hex colors, rgb()/hsl(), named colors, px and rem sizes.
const RAW_VALUE =
    /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?)\(|\b(white|black|aliceblue)\b|\b\d*\.?\d+(px|rem)\b/i;

describe("Design rules", () => {
    it("defines every token group in tokens.scss", () => {
        const tokens = readFileSync(join(__dirname, "tokens.scss"), "utf8");
        for (const prefix of [
            "--color-",
            "--gradient-",
            "--glow-",
            "--font-",
            "--space-",
            "--radius-",
            "--size-",
            "--duration-",
        ]) {
            expect(tokens, `missing ${prefix}* tokens`).toContain(prefix);
        }
    });

    it("uses only design tokens in component styles (no raw colors or sizes)", () => {
        const offenders = listFiles(SRC, ".module.scss").flatMap((file) =>
            readFileSync(file, "utf8")
                .split("\n")
                .map((line, i) => ({ line: line.replace(/\/\/.*$/, ""), i }))
                .filter(({ line }) => RAW_VALUE.test(line))
                .map(({ line, i }) => `${relative(SRC, file)}:${i + 1}: ${line.trim()}`),
        );
        expect(offenders).toEqual([]);
    });

    it("does not use inline styles in components", () => {
        const offenders = listFiles(SRC, ".tsx")
            .filter((file) => !file.endsWith(".test.tsx"))
            .filter((file) => /\bstyle=\{/.test(readFileSync(file, "utf8")))
            .map((file) => relative(SRC, file));
        expect(offenders).toEqual([]);
    });
});

describe("Interaction states", () => {
    const read = (path: string) => readFileSync(join(SRC, path), "utf8");
    const globalStyles = read("app/styles/index.scss");
    const buttonStyles = read("shared/ui/button/button.module.scss");
    const controlStyles = read("shared/ui/form-field/form-field.module.scss");

    it("has one global keyboard focus style and one reduced-motion rule", () => {
        expect(globalStyles).toMatch(/:focus-visible\s*\{/);
        expect(globalStyles).toContain("prefers-reduced-motion: reduce");
    });

    it("does not repeat the reduced-motion rule in components", () => {
        const offenders = listFiles(SRC, ".module.scss")
            .filter((file) => readFileSync(file, "utf8").includes("prefers-reduced-motion"))
            .map((file) => relative(SRC, file));
        expect(offenders).toEqual([]);
    });

    it.each(["primary", "secondary", "icon"])("gives the %s button a hover state", (variant) => {
        const block = buttonStyles.split(`.${variant} {`)[1] ?? "";
        expect(block.split("\n}")[0]).toContain("&:hover:not(:disabled)");
    });

    it("gives buttons pressed and disabled states", () => {
        expect(buttonStyles).toContain("&:active:not(:disabled)");
        expect(buttonStyles).toContain("&:disabled");
    });

    it("gives form controls hover, focus and disabled states", () => {
        expect(controlStyles).toContain("&:hover:not(:disabled)");
        expect(controlStyles).toContain("&:focus-visible");
        expect(controlStyles).toContain("&:disabled");
    });

    it("takes the disabled opacity only from the token", () => {
        const offenders = listFiles(SRC, ".module.scss").flatMap((file) =>
            readFileSync(file, "utf8")
                .split("\n")
                .filter((line) => /opacity:\s*0\.5/.test(line))
                .map((line) => `${relative(SRC, file)}: ${line.trim()}`),
        );
        expect(offenders).toEqual([]);
    });
});
