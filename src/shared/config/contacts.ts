import type { IconType } from "react-icons";
import { FaGithub, FaTelegramPlane } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export type ContactKind = "github" | "telegram" | "email";

export interface Contact {
    kind: ContactKind;
    /** Text shown next to the icon, e.g. "@username" or the e-mail address. */
    label: string;
    href: string;
}

export const CONTACT_ICONS: Record<ContactKind, IconType> = {
    github: FaGithub,
    telegram: FaTelegramPlane,
    email: MdEmail,
};

/**
 * Real contacts only — never placeholders. Personal contacts of the author are not added yet:
 * when they are, add entries here (e.g. { kind: "telegram", label: "@name", href: "https://t.me/name" })
 * and the "coming soon" note in the Contacts dialog disappears automatically.
 */
export const PERSONAL_CONTACTS: Contact[] = [
    { kind: "telegram", label: "@dabeiteex", href: "https://t.me/dabeiteex" },
];

/** Project links that always exist. */
export const PROJECT_LINKS: Contact[] = [
    { kind: "github", label: "github.com/xdt-git", href: "https://github.com/xdt-git" },
];
