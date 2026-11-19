import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import en from "./locales/en/translation.json";
import ru from "./locales/ru/translation.json";
import { i18n } from "./index";

const SRC = join(__dirname, "..", "..", "..");

const keysOf = (value: unknown, prefix = ""): string[] =>
    value && typeof value === "object"
        ? Object.entries(value).flatMap(([key, nested]) =>
              keysOf(nested, prefix ? `${prefix}.${key}` : key),
          )
        : [prefix];

const listFiles = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return listFiles(path);
        return /\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path) ? [path] : [];
    });

describe("i18n", () => {
    it("has the same keys in RU and EN", () => {
        expect(keysOf(en).sort()).toEqual(keysOf(ru).sort());
    });

    it("has no empty translations", () => {
        const empty = [...keysOf(ru), ...keysOf(en)].filter((key) => {
            const value = key
                .split(".")
                .reduce<unknown>((acc, part) => (acc as Record<string, unknown>)[part], ru);
            return value === "";
        });
        expect(empty).toEqual([]);
    });

    it("keeps user-facing Russian text out of components", () => {
        const offenders = listFiles(SRC).flatMap((file) =>
            readFileSync(file, "utf8")
                .split("\n")
                .map((line, i) => ({ line, i }))
                .filter(({ line }) => /[А-Яа-яЁё]/.test(line.replace(/\/\/.*$/, "")))
                .map(({ line, i }) => `${relative(SRC, file)}:${i + 1}: ${line.trim()}`),
        );
        expect(offenders).toEqual([]);
    });

    it("switches language without reloading and updates <html lang>", async () => {
        await i18n.changeLanguage("en");
        expect(i18n.t("nav.home")).toBe("Home");
        expect(document.documentElement.lang).toBe("en");

        await i18n.changeLanguage("ru");
        expect(i18n.t("nav.home")).toBe("Начальная страница");
        expect(document.documentElement.lang).toBe("ru");
    });

    it("falls back to English for an unsupported language", async () => {
        await i18n.changeLanguage("de");
        expect(i18n.resolvedLanguage).toBe("en");
        expect(i18n.t("common.save")).toBe("Save");
    });
});
