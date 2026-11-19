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
