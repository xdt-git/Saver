import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";
import { SettingsDock } from "@/widgets/settings-dock";
import { VerifyEmailBanner } from "@/features/auth";
import { CookieConsent } from "@/features/cookie-consent";
import { NotificationConsentPrompt } from "@/features/notification-settings";
import { NEWS_FOLLOWING_PATH, ROUTES } from "@/shared/config/routes";
import { lazyNamed } from "@/shared/lib";
import { BackgroundLines } from "@/shared/ui/background-lines";
import { PageLoader } from "@/shared/ui/loader";
import { GuestRoutes, ProtectedRoutes } from "../routing";
import styles from "./layout.module.scss";

// Every page is its own chunk, loaded when its route opens.
const LandingPage = lazyNamed(() => import("@/pages/landing"), "LandingPage");
const DiscoverPage = lazyNamed(() => import("@/pages/discover"), "DiscoverPage");
const ContentDetailsPage = lazyNamed(() => import("@/pages/content-details"), "ContentDetailsPage");
const CollectionPage = lazyNamed(() => import("@/pages/collection"), "CollectionPage");
const ProfilePage = lazyNamed(() => import("@/pages/profile"), "ProfilePage");
const NewsPage = lazyNamed(() => import("@/pages/news"), "NewsPage");
const NotificationsPage = lazyNamed(() => import("@/pages/notifications"), "NotificationsPage");
const LoginPage = lazyNamed(() => import("@/pages/login"), "LoginPage");
const RegisterPage = lazyNamed(() => import("@/pages/register"), "RegisterPage");
const ForgotPasswordPage = lazyNamed(() => import("@/pages/forgot-password"), "ForgotPasswordPage");
const ResetPasswordPage = lazyNamed(() => import("@/pages/reset-password"), "ResetPasswordPage");
const VerifyEmailPage = lazyNamed(() => import("@/pages/verify-email"), "VerifyEmailPage");
const TelegramLinkPage = lazyNamed(() => import("@/pages/telegram-link"), "TelegramLinkPage");
const PrivacyPage = lazyNamed(() => import("@/pages/privacy"), "PrivacyPage");
const NotFoundPage = lazyNamed(() => import("@/pages/not-found"), "NotFoundPage");
// Component showcase, development only: the import is removed from production builds.
const UiKitPage = import.meta.env.DEV
    ? lazyNamed(() => import("@/pages/ui-kit"), "UiKitPage")
    : null;

export const Layout = () => {
    return (
        <div className={styles.app}>
            <BackgroundLines />
            <Header />
            <VerifyEmailBanner />

            <div className={styles.page}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path={ROUTES.home} element={<LandingPage />} />
                        <Route path={ROUTES.discover} element={<DiscoverPage />} />
                        <Route path={ROUTES.contentDetails} element={<ContentDetailsPage />} />
                        <Route path={ROUTES.profile} element={<ProfilePage />} />
                        <Route path={ROUTES.news} element={<NewsPage />} />
                        <Route path={ROUTES.privacy} element={<PrivacyPage />} />
                        {/* Email links work signed in or not. */}
                        <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
                        <Route path={ROUTES.verifyEmail} element={<VerifyEmailPage />} />
                        <Route element={<ProtectedRoutes />}>
                            <Route
                                path={ROUTES.legacyLibrary}
                                element={<Navigate to={ROUTES.collection} replace />}
                            />
                            <Route path={ROUTES.collection} element={<CollectionPage />} />
                            <Route path={ROUTES.notifications} element={<NotificationsPage />} />
                            <Route path={ROUTES.telegramLink} element={<TelegramLinkPage />} />
                            {/* The old feed address opens the news page on subscriptions. */}
                            <Route
                                path={ROUTES.feed}
                                element={<Navigate to={NEWS_FOLLOWING_PATH} replace />}
                            />
                        </Route>
                        <Route element={<GuestRoutes />}>
                            <Route path={ROUTES.login} element={<LoginPage />} />
                            <Route path={ROUTES.register} element={<RegisterPage />} />
                            <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
                        </Route>
                        {UiKitPage && <Route path={ROUTES.uiKit} element={<UiKitPage />} />}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </div>

            <Footer />
            <SettingsDock />
            <NotificationConsentPrompt />
            <CookieConsent />
        </div>
    );
};
