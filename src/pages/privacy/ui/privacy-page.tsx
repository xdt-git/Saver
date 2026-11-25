import { useTranslation } from "react-i18next";
import { ContentPage } from "@/shared/ui/content-page";
import styles from "./privacy-page.module.scss";

/** Section keys under privacy.sections.<key>.{title,text} in the translations. */
const SECTIONS = ["data", "google", "use", "cookies", "sharing", "rights", "contact"] as const;

/** Privacy policy: what we store, why, and how to have it removed. */
export const PrivacyPage = () => {
    const { t } = useTranslation();

    return (
        <ContentPage title={t("privacy.title")} narrow>
            <article className={styles.policy}>
                <p className={styles.updated}>{t("privacy.updated")}</p>
                <p>{t("privacy.intro")}</p>
                {SECTIONS.map((key) => (
                    <section key={key}>
                        <h2 className={styles.heading}>{t(`privacy.sections.${key}.title`)}</h2>
                        <p>{t(`privacy.sections.${key}.text`)}</p>
                    </section>
                ))}
            </article>
        </ContentPage>
    );
};
