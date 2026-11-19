// jsdom has no matchMedia. This mock answers "(prefers-color-scheme: dark)" and lets tests
// switch the simulated OS theme with setSystemPrefersDark(), notifying listeners like a browser.
type Listener = (event: MediaQueryListEvent) => void;

let prefersDark = true;
const listeners = new Set<Listener>();

const createMediaQueryList = (query: string): MediaQueryList => {
    const matches = () => (query.includes("prefers-color-scheme: dark") ? prefersDark : false);
    return {
        media: query,
        get matches() {
            return matches();
        },
        onchange: null,
        addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
        removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
        addListener: (listener: Listener) => listeners.add(listener),
        removeListener: (listener: Listener) => listeners.delete(listener),
        dispatchEvent: () => true,
    } as unknown as MediaQueryList;
};

export const installMatchMedia = () => {
    Object.defineProperty(window, "matchMedia", {
        configurable: true,
        value: createMediaQueryList,
    });
};

export const setSystemPrefersDark = (value: boolean) => {
    prefersDark = value;
    listeners.forEach((listener) => listener({ matches: value } as MediaQueryListEvent));
};

export const resetMatchMedia = () => {
    prefersDark = true;
    listeners.clear();
};
