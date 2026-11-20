import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserLink, useFollowList, type FollowListKind } from "@/entities/user";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { Loader } from "@/shared/ui/loader";
import { Modal } from "@/shared/ui/modal";
import { Pagination } from "@/shared/ui/pagination";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import styles from "./profile.module.scss";

interface FollowListsDialogProps {
    userId: number;
    /** Which tab is open; null when the dialog is closed. */
    kind: FollowListKind | null;
    onKindChange: (kind: FollowListKind) => void;
    onClose: () => void;
}

/** Followers and following of a user, newest first, with paging. */
export const FollowListsDialog = ({
    userId,
    kind,
    onKindChange,
    onClose,
}: FollowListsDialogProps) => {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    useEffect(() => setPage(1), [kind]);
    const list = useFollowList(userId, kind ?? "followers", page, kind !== null);

    const body = () => {
        if (list.isPending) return <Loader />;
        if (list.isError) return <ErrorState onRetry={() => void list.refetch()} />;
        if (list.data.total === 0) {
            return <EmptyState title={t(`profile.empty.${kind ?? "followers"}`)} />;
        }
        return (
            <>
                <ul className={styles.userList}>
                    {list.data.items.map((user) => (
                        <li key={user.id}>
                            <UserLink user={user} onNavigate={onClose} />
                        </li>
                    ))}
                </ul>
                <Pagination
                    page={list.data.page}
                    totalPages={list.data.totalPages}
                    onChange={setPage}
                    disabled={list.isPlaceholderData}
                />
            </>
        );
    };

    return (
        <Modal open={kind !== null} onClose={onClose} title={t("profile.connections")}>
            <div className={styles.dialogBody}>
                <SegmentedControl
                    ariaLabel={t("profile.connections")}
                    value={kind ?? undefined}
                    onChange={onKindChange}
                    options={[
                        { value: "followers", label: t("profile.followers") },
                        { value: "following", label: t("profile.following") },
                    ]}
                />
                {body()}
            </div>
        </Modal>
    );
};
