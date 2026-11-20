import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";
import { SettingsDock } from "@/widgets/settings-dock";
import { ROUTES } from "@/shared/config/routes";
import { lazyNamed } from "@/shared/lib";
import { Loader } from "@/shared/ui/loader";
import styles from "./layout.module.scss";

// Every page is its own chunk, loaded when its route opens.
const LandingPage = lazyNamed(() => import("@/pages/landing"), "LandingPage");
const LibraryPage = lazyNamed(() => import("@/pages/library"), "LibraryPage");
const NotFoundPage = lazyNamed(() => import("@/pages/not-found"), "NotFoundPage");
// Component showcase, development only: the import is removed from production builds.
const UiKitPage = import.meta.env.DEV
    ? lazyNamed(() => import("@/pages/ui-kit"), "UiKitPage")
    : null;

const PageLoader = () => (
    <div className={styles.pageLoader}>
        <Loader size="lg" />
    </div>
);

export const Layout = () => {
    return (
        <div className={styles.app}>
            <Header />

            <div className={styles.page}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path={ROUTES.home} element={<LandingPage />} />
                        <Route path={ROUTES.library} element={<LibraryPage />} />
                        {UiKitPage && <Route path={ROUTES.uiKit} element={<UiKitPage />} />}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </div>

            <Footer />
            <SettingsDock />
        </div>
    );
};
