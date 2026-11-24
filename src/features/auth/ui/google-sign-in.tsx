import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { sessionApi, sessionKeys, useSession } from "@/entities/session";
import { loadScript } from "@/shared/lib";
import { useToast } from "@/shared/ui/toast";
import styles from "./auth-card.module.scss";

const GSI_SRC = "https://accounts.google.com/gsi/client";
const BUTTON_MAX_WIDTH = 400;

/** The part of Google Identity Services the button needs. */
interface GoogleIdentityServices {
    accounts: {
        id: {
            initialize: (options: {
                client_id: string;
                callback: (response: { credential: string }) => void;
                ux_mode?: "popup";
            }) => void;
            renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
    };
}

declare global {
    interface Window {
        google?: GoogleIdentityServices;
    }
}

interface GoogleSignInProps {
    /** The sign-up checkbox; sent with the token so a new account keeps the answer. */
    notificationsConsent?: boolean;
}

/**
 * "Continue with Google": Google's own button (popup). Its ID token goes to the API, which
 * signs in the linked account, links one with the same email, or creates a new account.
 * Hidden while the API has no Google client id or Google's script cannot load.
 */
export const GoogleSignIn = ({ notificationsConsent }: GoogleSignInProps) => {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const { signIn } = useSession();
    const container = useRef<HTMLDivElement>(null);
    const consent = useRef(notificationsConsent);
    consent.current = notificationsConsent;
    const [failed, setFailed] = useState(false);

    const { data: providers } = useQuery({
        queryKey: sessionKeys.providers(),
        queryFn: ({ signal }) => sessionApi.providers(signal),
        staleTime: Infinity,
    });
    const clientId = providers?.google ?? null;

    const mutation = useMutation({
        mutationFn: (credential: string) =>
            sessionApi.google({ credential, notificationsConsent: consent.current }),
        onSuccess: signIn,
        onError: (error) => toast.apiError(error),
    });
    const { mutate } = mutation;

    useEffect(() => {
        if (!clientId) return;
        let active = true;
        loadScript(GSI_SRC)
            .then(() => {
                const parent = container.current;
                if (!active || !parent || !window.google) return;
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: ({ credential }) => mutate(credential),
                    ux_mode: "popup",
                });
                parent.replaceChildren();
                window.google.accounts.id.renderButton(parent, {
                    theme: "filled_black",
                    size: "large",
                    shape: "pill",
                    text: "continue_with",
                    locale: i18n.language,
                    width: Math.min(parent.clientWidth || BUTTON_MAX_WIDTH, BUTTON_MAX_WIDTH),
                });
            })
            .catch(() => active && setFailed(true));
        return () => {
            active = false;
        };
    }, [clientId, i18n.language, mutate]);

    if (!clientId || failed) return null;

    return (
        <div className={styles.alternative} aria-busy={mutation.isPending}>
            <span className={styles.divider}>{t("auth.or")}</span>
            <div ref={container} className={styles.google} />
        </div>
    );
};
