import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { MdChatBubbleOutline, MdDeleteOutline, MdFavorite, MdFavoriteBorder } from "react-icons/md";
import {
    COMMENT_MAX,
    socialApi,
    socialKeys,
    updateSocialInCache,
    useActivityComments,
    type Activity,
    type ActivityComment,
} from "@/entities/activity";
import { useRequireSession, useSession } from "@/entities/session";
import { formatRelativeTime } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { Loader } from "@/shared/ui/loader";
import { Textarea } from "@/shared/ui/textarea";
import { useToast } from "@/shared/ui/toast";
import styles from "./activity-social.module.scss";

const nameOf = (user: ActivityComment["user"]) => user.displayName || user.username;

/**
 * Heart and comments under a feed event: the two newest comments are always shown,
 * "More" opens the whole thread with a form to write one.
 */
export const ActivitySocial = ({ activity }: { activity: Activity }) => {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const queryClient = useQueryClient();
    const requireSession = useRequireSession();
    const { user } = useSession();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const { social } = activity;
    const thread = useActivityComments(activity.id, open);

    const like = useMutation({
        mutationFn: () =>
            social.liked ? socialApi.unlike(activity.id) : socialApi.like(activity.id),
        // The heart answers at once; the server's numbers replace the guess.
        onMutate: () =>
            updateSocialInCache(queryClient, activity.id, (s) => ({
                ...s,
                liked: !s.liked,
                likes: s.likes + (s.liked ? -1 : 1),
            })),
        onSuccess: ({ likes, liked }) =>
            updateSocialInCache(queryClient, activity.id, (s) => ({ ...s, likes, liked })),
        onError: (error) => {
            void queryClient.invalidateQueries({ queryKey: ["activity"] });
            toast.apiError(error);
        },
    });

    const refreshThread = () =>
        void queryClient.invalidateQueries({ queryKey: socialKeys.comments(activity.id) });

    const add = useMutation({
        mutationFn: (value: string) => socialApi.addComment(activity.id, value),
        onSuccess: (comment) => {
            setText("");
            updateSocialInCache(queryClient, activity.id, (s) => ({
                ...s,
                comments: s.comments + 1,
                latestComments: [...s.latestComments, comment].slice(-2),
            }));
            refreshThread();
        },
        onError: (error) => toast.apiError(error),
    });

    const remove = useMutation({
        mutationFn: (comment: ActivityComment) => socialApi.deleteComment(comment.id),
        onSuccess: (_, comment) => {
            updateSocialInCache(queryClient, activity.id, (s) => ({
                ...s,
                comments: Math.max(0, s.comments - 1),
                latestComments: s.latestComments.filter((c) => c.id !== comment.id),
            }));
            refreshThread();
        },
        onError: (error) => toast.apiError(error),
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const value = text.trim();
        if (value) add.mutate(value);
    };

    const comments = open
        ? (thread.data?.pages.flatMap((page) => page.items) ?? social.latestComments)
        : social.latestComments;
    const hidden = social.comments - social.latestComments.length;

    const renderComment = (comment: ActivityComment) => (
        <li key={comment.id} className={styles.comment}>
            <span className={styles.author}>{nameOf(comment.user)}</span>{" "}
            <span className={styles.text}>{comment.text}</span>
            <span className={styles.meta}>
                {formatRelativeTime(comment.createdAt, i18n.language)}
                {user && (user.id === comment.user.id || user.id === activity.user.id) && (
                    <button
                        type="button"
                        className={styles.iconButton}
                        aria-label={t("social.deleteComment")}
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(comment)}
                    >
                        <MdDeleteOutline />
                    </button>
                )}
            </span>
        </li>
    );

    return (
        <div className={styles.social}>
            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.action}
                    aria-pressed={social.liked}
                    aria-label={social.liked ? t("social.unlike") : t("social.like")}
                    disabled={like.isPending}
                    onClick={requireSession(() => like.mutate())}
                >
                    {social.liked ? <MdFavorite className={styles.liked} /> : <MdFavoriteBorder />}
                    <span>{social.likes}</span>
                </button>
                <button
                    type="button"
                    className={styles.action}
                    aria-expanded={open}
                    aria-label={t("social.comments", { count: social.comments })}
                    onClick={() => setOpen((value) => !value)}
                >
                    <MdChatBubbleOutline />
                    <span>{social.comments}</span>
                </button>
            </div>

            {comments.length > 0 && (
                <ul className={styles.comments}>{comments.map(renderComment)}</ul>
            )}
            {open && thread.isFetching && <Loader />}
            {open && thread.hasNextPage && (
                <Button
                    size="md"
                    variant="secondary"
                    disabled={thread.isFetchingNextPage}
                    onClick={() => void thread.fetchNextPage()}
                >
                    {t("activity.more")}
                </Button>
            )}

            {!open && hidden > 0 && (
                <button type="button" className={styles.more} onClick={() => setOpen(true)}>
                    {t("social.showAll", { count: social.comments })}
                </button>
            )}
            {!open && hidden <= 0 && (
                <button type="button" className={styles.more} onClick={() => setOpen(true)}>
                    {t("social.details")}
                </button>
            )}

            {open &&
                (user ? (
                    <form className={styles.form} onSubmit={submit}>
                        <Textarea
                            label={t("social.newComment")}
                            value={text}
                            maxLength={COMMENT_MAX}
                            rows={2}
                            onChange={(event) => setText(event.target.value)}
                        />
                        <Button
                            type="submit"
                            size="md"
                            disabled={add.isPending || text.trim() === ""}
                        >
                            {t("social.send")}
                        </Button>
                    </form>
                ) : (
                    <p className={styles.meta}>{t("social.signInToComment")}</p>
                ))}
        </div>
    );
};
