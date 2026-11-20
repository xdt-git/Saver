import { lazy, type ComponentType } from "react";

/**
 * React.lazy for named exports: lazyNamed(() => import("@/pages/landing"), "LandingPage").
 * Each page becomes its own chunk that loads only when the route is opened.
 */
export const lazyNamed = <Module, Name extends keyof Module>(
    loader: () => Promise<Module>,
    name: Name,
) =>
    lazy(async () => {
        const module = await loader();
        return { default: module[name] as ComponentType };
    });
