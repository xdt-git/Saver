import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Header } from "@/widgets/header";
import { LandingPage } from "@/pages/landing";
import { LibraryPage } from "@/pages/library";
import { NotFoundPage } from "@/pages/not-found";
import { Loader } from "@/shared/ui/loader";

// Component showcase, available only in development: the import is removed from production builds.
const UiKitPage = import.meta.env.DEV
    ? lazy(() => import("@/pages/ui-kit").then((module) => ({ default: module.UiKitPage })))
    : null;

export const Layout = () => {
    return (
        <>
            <Header />

            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/Save" element={<LibraryPage />} />
                {UiKitPage && (
                    <Route
                        path="/ui-kit"
                        element={
                            <Suspense fallback={<Loader />}>
                                <UiKitPage />
                            </Suspense>
                        }
                    />
                )}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    );
};
