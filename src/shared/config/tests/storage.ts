import type { JSDOM } from "jsdom";

// Node 22+ ships an experimental global localStorage that is undefined without a file flag
// and shadows the jsdom one. Use jsdom's storage so tests behave like a browser.
// Must run before any module that touches storage (e.g. the i18n language detector).
declare const jsdom: JSDOM;
for (const name of ["localStorage", "sessionStorage"] as const) {
    if (!globalThis[name]) {
        Object.defineProperty(globalThis, name, {
            value: jsdom.window[name],
            configurable: true,
        });
    }
}
