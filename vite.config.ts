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
    },
});
