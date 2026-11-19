import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const reactRules = {
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
    ...reactHooks.configs.recommended.rules,
    "react/jsx-no-target-blank": "off",
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
};

const reactPlugins = {
    react,
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
};

/**
 * Feature-Sliced Design import rules.
 * A layer may import only from the layers below it, never from its own layer's other slices,
 * and only through a slice's public API (its index file), not from its internals.
 */
const LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"];
const SLICED_LAYERS = ["pages", "widgets", "features", "entities"];

const fsdRulesFor = (layer) => {
    const index = LAYERS.indexOf(layer);
    const upperLayers = LAYERS.slice(0, index);
    const patterns = [];

    if (upperLayers.length > 0) {
        patterns.push({
            regex: `^@/(${upperLayers.join("|")})(/|$)`,
            message: `FSD: the "${layer}" layer cannot import from upper layers (${upperLayers.join(", ")}).`,
        });
    }
    if (SLICED_LAYERS.includes(layer)) {
        patterns.push({
            regex: `^@/${layer}/`,
            message: `FSD: slices of the "${layer}" layer cannot import each other. Use relative imports inside your own slice.`,
        });
    }
    const lowerSliced = SLICED_LAYERS.filter((l) => LAYERS.indexOf(l) > index);
    if (lowerSliced.length > 0) {
        patterns.push({
            regex: `^@/(${lowerSliced.join("|")})/[^/]+/.+`,
            message:
                'FSD: import a slice through its public API (e.g. "@/widgets/header"), not its internal files.',
        });
    }
    return { "no-restricted-imports": ["error", { patterns }] };
};

const fsdConfigs = LAYERS.map((layer) => ({
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: fsdRulesFor(layer),
}));

export default tseslint.config(
    { ignores: ["dist"] },
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },
        settings: { react: { version: "18.3" } },
        plugins: reactPlugins,
        rules: {
            ...js.configs.recommended.rules,
            ...reactRules,
        },
    },
    {
        files: ["**/*.{ts,tsx}"],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        settings: { react: { version: "18.3" } },
        plugins: reactPlugins,
        rules: {
            ...reactRules,
            // TypeScript checks prop types, so runtime PropTypes are not needed in .tsx files.
            "react/prop-types": "off",
        },
    },
    ...fsdConfigs,
);
