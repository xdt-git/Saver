import { useSearchParams } from "react-router-dom";
import { EmailVerification } from "@/features/auth";
import { CenteredPage } from "@/shared/ui/centered-page";

/** Opened from the verification email: /verify-email?token=... */
export const VerifyEmailPage = () => {
    const token = useSearchParams()[0].get("token") ?? "";
    return (
        <CenteredPage>
            <EmailVerification token={token} />
        </CenteredPage>
    );
};
