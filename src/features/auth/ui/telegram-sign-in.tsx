import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { sessionApi, useSession, type TelegramLoginPayload } from "@/entities/session";
import { useToast } from "@/shared/ui/toast";
import styles from "./auth-card.module.scss";

const WIDGET_SRC = "https://telegram.org/js/telegram-widget.js?22";
/** The widget calls a global function by name with the signed-in Telegram user. */
const CALLBACK = "nightreelTelegramAuth";

declare global {
    interface Window {
        [CALLBACK]?: (user: TelegramLoginPayload) => void;
    }
}

interface TelegramSignInProps {
    /** The bot's username (the widget needs it, and the site domain set in @BotFather). */
    bot: string;
}

/**
 * "Log in with Telegram": Telegram's own widget (an iframe). What it returns is signed
 * with the bot token, so the API checks it and signs in the linked account or makes one.
 */
export const TelegramSignIn = ({ bot }: TelegramSignInProps) => {
    const toast = useToast();
    const { signIn } = useSession();
    const container = useRef<HTMLDivElement>(null);

    const { mutate } = useMutation({
        mutationFn: sessionApi.telegram,
        onSuccess: signIn,
        onError: (error) => toast.apiError(error),
    });

    useEffect(() => {
        const parent = container.current;
        if (!parent) return;
        window[CALLBACK] = (user) => mutate(user);
        const script = document.createElement("script");
        script.src = WIDGET_SRC;
        script.async = true;
        script.dataset.telegramLogin = bot;
        script.dataset.size = "large";
        script.dataset.radius = "20";
        script.dataset.onauth = `window.${CALLBACK}(user)`;
        script.dataset.requestAccess = "write";
        parent.replaceChildren(script);
        return () => {
            parent.replaceChildren();
            delete window[CALLBACK];
        };
    }, [bot, mutate]);

    return <div ref={container} className={styles.telegram} />;
};
