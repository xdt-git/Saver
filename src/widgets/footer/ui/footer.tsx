import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { glowClassName } from "@/shared/ui/text";
import { AboutDialog } from "./about-dialog";
import { ContactsDialog } from "./contacts-dialog";
import styles from "./footer.module.scss";

type Dialog = "about" | "contacts" | null;

/** Site footer: tagline, About and Contacts dialogs, copyright. */
export const Footer = () => {
    const { t } = useTranslation();
    const [openDialog, setOpenDialog] = useState<Dialog>(null);
    const close = () => setOpenDialog(null);

    return (
        <footer className={styles.footer}>
            <span>{t("footer.tagline")}</span>
            <div className={styles.links}>
                <Button
                    variant="nav"
                    className={glowClassName}
                    onClick={() => setOpenDialog("about")}
                >
                    {t("footer.about")}
                </Button>
                <Button
                    variant="nav"
                    className={glowClassName}
                    onClick={() => setOpenDialog("contacts")}
                >
                    {t("footer.contacts")}
                </Button>
            </div>
            <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>

            <AboutDialog open={openDialog === "about"} onClose={close} />
            <ContactsDialog open={openDialog === "contacts"} onClose={close} />
        </footer>
    );
};
