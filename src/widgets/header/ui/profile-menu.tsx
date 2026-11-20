import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import { useClickOutside, useEscapeKey } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { glowClassName } from "@/shared/ui/text";
import { useToast } from "@/shared/ui/toast";
import styles from "./header.module.scss";

/**
 * Profile icon in the header: a link to the login page for guests,
 * a menu with the username and "Sign out" for signed-in users.
 */
export const ProfileMenu = () => {
    const { t } = useTranslation();
    const { user, status, signOut } = useSession();
    const toast = useToast();
    const navigate = useNavigate();
    const menuId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    useClickOutside(rootRef, open, close);
    useEscapeKey(open, close);

    if (status !== "authenticated" || !user) {
        return (
            <Button
                to={ROUTES.login}
                variant="icon"
                className={glowClassName}
                aria-label={t("header.signIn")}
                aria-disabled={status === "loading" || undefined}
            >
                <FaUser className={styles.profileIcon} />
            </Button>
        );
    }

    const onSignOut = async () => {
        close();
        // Leave a protected page first, otherwise its guard sends the user to the login page.
        navigate(ROUTES.home);
        try {
            await signOut();
            toast.success(t("auth.signedOut"));
        } catch (error) {
            toast.apiError(error);
        }
    };

    return (
        <div ref={rootRef} className={styles.profile}>
            <Button
                variant="icon"
                className={glowClassName}
                aria-label={t("header.profileMenu", { username: user.username })}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={menuId}
                onClick={() => setOpen((value) => !value)}
            >
                <FaUser className={styles.profileIcon} />
            </Button>
            {open && (
                <div id={menuId} role="menu" className={styles.profileMenu}>
                    <span className={styles.profileName}>{user.displayName ?? user.username}</span>
                    <span className={styles.profileHandle}>@{user.username}</span>
                    <Button
                        role="menuitem"
                        variant="secondary"
                        className={styles.profileAction}
                        onClick={onSignOut}
                    >
                        {t("header.signOut")}
                    </Button>
                </div>
            )}
        </div>
    );
};
