import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { activityKeys } from "@/entities/activity";
import { useRequireSession } from "@/entities/session";
import { userApi, userKeys, type PublicProfile } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/ui/toast";

/** Follow / unfollow another user; guests are sent to sign in and come back. */
export const FollowButton = ({ profile }: { profile: PublicProfile }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const queryClient = useQueryClient();
    const requireSession = useRequireSession();
    const following = profile.isFollowing === true;

    const mutation = useMutation({
        mutationFn: () => (following ? userApi.unfollow(profile.id) : userApi.follow(profile.id)),
        onSuccess: () => {
            queryClient.setQueryData<PublicProfile>(
                userKeys.profile(profile.id),
                (current) =>
                    current && {
                        ...current,
                        isFollowing: !following,
                        followersCount: current.followersCount + (following ? -1 : 1),
                    },
            );
            // Lists, counters elsewhere and the feed change with a follow.
            void queryClient.invalidateQueries({ queryKey: userKeys.all });
            void queryClient.invalidateQueries({ queryKey: activityKeys.all });
        },
        onError: (error) => toast.apiError(error),
    });

    return (
        <Button
            size="md"
            variant={following ? "secondary" : "primary"}
            aria-pressed={following}
            disabled={mutation.isPending}
            onClick={requireSession(() => mutation.mutate())}
        >
            {following ? t("profile.unfollow") : t("profile.follow")}
        </Button>
    );
};
