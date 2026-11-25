import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/entities/session";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { useUpdateNotifications } from "../model/use-update-notifications";

/**
 * Asks a signed-in user once whether to send notifications (accounts created before the
 * sign-up checkbox existed). Any answer is stored, so the question never comes back;
 * closing the dialog only hides it for this visit.
 */
export const NotificationConsentPrompt = () => {
    const { t } = useTranslation();
    const { user, status } = useSession();
    const [dismissed, setDismissed] = useState(false);
    const update = useUpdateNotifications();
    const open = status === "authenticated" && user?.notifications.consent === null && !dismissed;
    const answer = (notificationsConsent: boolean) => update.mutate({ notificationsConsent });

    return (
        <Modal
            open={open}
            onClose={() => setDismissed(true)}
            title={t("notifications.promptTitle")}
            footer={
                <>
                    <Button
                        size="md"
                        variant="secondary"
                        disabled={update.isPending}
                        onClick={() => answer(false)}
                    >
                        {t("notifications.promptNo")}
                    </Button>
                    <Button size="md" disabled={update.isPending} onClick={() => answer(true)}>
                        {t("notifications.promptYes")}
                    </Button>
                </>
            }
        >
            <p>{t("notifications.promptText")}</p>
        </Modal>
    );
};
