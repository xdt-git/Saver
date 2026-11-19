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
