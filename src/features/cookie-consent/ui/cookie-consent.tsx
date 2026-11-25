import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import styles from "./cookie-consent.module.scss";

const STORAGE_KEY = "nightreel.cookies";
const ACCEPTED = "accepted";

const wasAccepted = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) === ACCEPTED;
    } catch {
        return false;
    }
};

/**
 * Notice about cookies, shown until the visitor accepts it. The site only uses necessary
 * cookies (the session) and local storage for settings, so there is nothing to opt out of.
 */
export const CookieConsent = () => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(() => !wasAccepted());
    if (!visible) return null;

    const accept = () => {
        try {
            localStorage.setItem(STORAGE_KEY, ACCEPTED);
        } catch {
            // Storage is unavailable (private mode): the notice comes back next visit.
        }
        setVisible(false);
    };

    return (
        <section className={styles.banner} role="region" aria-label={t("cookies.label")}>
            <p className={styles.text}>
                {t("cookies.text")}{" "}
                <Link to={ROUTES.privacy} className={styles.link}>
                    {t("footer.privacy")}
                </Link>
            </p>
            <Button size="md" onClick={accept}>
                {t("cookies.accept")}
            </Button>
        </section>
    );
};
