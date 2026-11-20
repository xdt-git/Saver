import { useTranslation } from "react-i18next";
import {
    CONTACT_ICONS,
    PERSONAL_CONTACTS,
    PROJECT_LINKS,
    type Contact,
} from "@/shared/config/contacts";
import { Modal } from "@/shared/ui/modal";
import { Text } from "@/shared/ui/text";
import styles from "./footer.module.scss";

const ContactLink = ({ contact }: { contact: Contact }) => {
    const Icon = CONTACT_ICONS[contact.kind];
    const isExternal = contact.href.startsWith("http");

    return (
        <a
            href={contact.href}
            className={styles.contact}
            {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
        >
            <Icon className={styles.contactIcon} aria-hidden="true" />
            {contact.label}
        </a>
    );
};

const ContactList = ({ contacts }: { contacts: Contact[] }) => (
    <ul className={styles.contactList}>
        {contacts.map((contact) => (
            <li key={contact.href}>
                <ContactLink contact={contact} />
            </li>
        ))}
    </ul>
);

interface DialogProps {
    open: boolean;
    onClose: () => void;
}

/** Contacts dialog: shows the configured contacts only, never placeholder links. */
export const ContactsDialog = ({ open, onClose }: DialogProps) => {
    const { t } = useTranslation();

    return (
        <Modal open={open} onClose={onClose} title={t("footer.contacts")}>
            {PERSONAL_CONTACTS.length > 0 && <ContactList contacts={PERSONAL_CONTACTS} />}
            <Text as="h3" glow className={styles.subtitle}>
                {t("footer.projectLinks")}
            </Text>
            <ContactList contacts={PROJECT_LINKS} />
            {PERSONAL_CONTACTS.length === 0 && (
                <p className={styles.note}>{t("footer.contactsSoon")}</p>
            )}
        </Modal>
    );
};
