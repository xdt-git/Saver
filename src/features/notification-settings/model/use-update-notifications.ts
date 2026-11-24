import { useMutation } from "@tanstack/react-query";
import { useSession, type SessionUser } from "@/entities/session";
import { userApi, type ProfilePatch } from "@/entities/user";
import { useToast } from "@/shared/ui/toast";

type NotificationPatch = Pick<
    ProfilePatch,
    "notificationsConsent" | "notifyFollowing" | "notifyLikes" | "notifyComments"
>;

/** Saves notification settings (PATCH /users/me) and puts the answer into the session. */
export const useUpdateNotifications = (onSaved?: () => void) => {
    const { signIn } = useSession();
    const toast = useToast();
    return useMutation({
        mutationFn: (patch: NotificationPatch) => userApi.updateMe<SessionUser>(patch),
        onSuccess: (user) => {
            signIn(user);
            onSaved?.();
        },
        onError: (error) => toast.apiError(error),
    });
};
