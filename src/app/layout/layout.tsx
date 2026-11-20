import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";
import { SettingsDock } from "@/widgets/settings-dock";
import { ROUTES } from "@/shared/config/routes";
import { lazyNamed } from "@/shared/lib";
import { PageLoader } from "@/shared/ui/loader";
import { GuestRoutes, ProtectedRoutes } from "../routing";
import styles from "./layout.module.scss";

// Every page is its own chunk, loaded when its route opens.
const LandingPage = lazyNamed(() => import("@/pages/landing"), "LandingPage");
const DiscoverPage = lazyNamed(() => import("@/pages/discover"), "DiscoverPage");
const ContentDetailsPage = lazyNamed(() => import("@/pages/content-details"), "ContentDetailsPage");
const LibraryPage = lazyNamed(() => import("@/pages/library"), "LibraryPage");
const CollectionPage = lazyNamed(() => import("@/pages/collection"), "CollectionPage");
const ProfilePage = lazyNamed(() => import("@/pages/profile"), "ProfilePage");
const FeedPage = lazyNamed(() => import("@/pages/feed"), "FeedPage");
const LoginPage = lazyNamed(() => import("@/pages/login"), "LoginPage");
const RegisterPage = lazyNamed(() => import("@/pages/register"), "RegisterPage");
const NotFoundPage = lazyNamed(() => import("@/pages/not-found"), "NotFoundPage");
// Component showcase, development only: the import is removed from production builds.
const UiKitPage = import.meta.env.DEV
    ? lazyNamed(() => import("@/pages/ui-kit"), "UiKitPage")
    : null;

export const Layout = () => {
    return (
        <div className={styles.app}>
            <Header />

            <div className={styles.page}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path={ROUTES.home} element={<LandingPage />} />
                        <Route path={ROUTES.discover} element={<DiscoverPage />} />
                        <Route path={ROUTES.contentDetails} element={<ContentDetailsPage />} />
                        <Route path={ROUTES.profile} element={<ProfilePage />} />
                        <Route element={<ProtectedRoutes />}>
                            <Route path={ROUTES.library} element={<LibraryPage />} />
                            <Route path={ROUTES.collection} element={<CollectionPage />} />
                            <Route path={ROUTES.feed} element={<FeedPage />} />
                        </Route>
                        <Route element={<GuestRoutes />}>
                            <Route path={ROUTES.login} element={<LoginPage />} />
                            <Route path={ROUTES.register} element={<RegisterPage />} />
                        </Route>
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
