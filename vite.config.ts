/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    // In development the API runs on :3000; proxying /api keeps requests same-origin,
    // so auth cookies work without CORS.
    server: {
        proxy: { "/api": "http://localhost:3000" },
    },
    build: {
        rollupOptions: {
            output: {
                // Libraries change rarely: their own chunks stay cached across releases.
                manualChunks: {
                    react: ["react", "react-dom", "scheduler"],
                    router: ["react-router-dom", "react-router", "@remix-run/router"],
                    query: ["@tanstack/react-query", "@tanstack/query-core"],
                    i18n: ["i18next", "react-i18next", "i18next-browser-languagedetector"],
                },
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: { api: "modern-compiler" },
        },
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/shared/config/tests/setup.ts"],
        css: { modules: { classNameStrategy: "non-scoped" } },
        coverage: {
            provider: "v8",
            reporter: ["text-summary", "json-summary"],
            include: ["src/**/*.{ts,tsx}"],
            // Tests, test helpers, re-export files and the dev-only showcase are not product code.
            exclude: [
                "src/**/*.test.*",
                "src/**/index.ts",
                "src/**/testing.ts",
                "src/**/*.d.ts",
                "src/shared/config/tests/**",
                "src/pages/ui-kit/**",
                "src/main.tsx",
            ],
        },
    },
});
