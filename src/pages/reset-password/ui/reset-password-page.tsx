import { useSearchParams } from "react-router-dom";
import { ResetPasswordForm } from "@/features/auth";
import { CenteredPage } from "@/shared/ui/centered-page";

/** Opened from the reset email: /reset-password?token=... */
export const ResetPasswordPage = () => {
    const token = useSearchParams()[0].get("token") ?? "";
    return (
        <CenteredPage>
            <ResetPasswordForm token={token} />
        </CenteredPage>
    );
};
