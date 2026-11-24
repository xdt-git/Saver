const loading = new Map<string, Promise<void>>();

/** Adds an external script once; later calls wait for the same load. */
export const loadScript = (src: string): Promise<void> => {
    const known = loading.get(src);
    if (known) return known;
    const promise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            loading.delete(src);
            script.remove();
            reject(new Error(`Failed to load ${src}`));
        };
        document.head.appendChild(script);
    });
    loading.set(src, promise);
    return promise;
};
