import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { MdLock } from "react-icons/md";
import { displayNameOf, type FollowListKind, type PublicProfile } from "@/entities/user";
import { formatDate } from "@/shared/lib";
import { Avatar } from "@/shared/ui/avatar";
import { Text } from "@/shared/ui/text";
import { FollowListsDialog } from "./follow-lists-dialog";
import styles from "./profile.module.scss";

interface ProfileHeaderProps {
    profile: PublicProfile;
    /** Follow or Edit button, decided by the page. */
    actions?: ReactNode;
}

/** Avatar, names, bio, join date, privacy mark and follower counters (open the lists). */
export const ProfileHeader = ({ profile, actions }: ProfileHeaderProps) => {
    const { t, i18n } = useTranslation();
    const [list, setList] = useState<FollowListKind | null>(null);
    const name = displayNameOf(profile);

    const counter = (kind: FollowListKind, count: number) => (
        <button type="button" className={styles.counter} onClick={() => setList(kind)}>
            <span className={styles.count}>{count}</span> {t(`profile.${kind}`)}
        </button>
    );

    return (
        <section className={styles.header} aria-label={t("profile.title", { name })}>
            <Avatar name={name} src={profile.avatarUrl} size="lg" />
            <div className={styles.info}>
                <Text as="h1" glow className={styles.name}>
                    {name}
                </Text>
                <p className={styles.handle}>
                    @{profile.username}
                    {profile.isPrivate && (
                        <span className={styles.private}>
                            <MdLock aria-hidden="true" /> {t("profile.privateBadge")}
                        </span>
                    )}
                </p>
                {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
                <p className={styles.joined}>
                    {t("profile.joined", { date: formatDate(profile.createdAt, i18n.language) })}
                </p>
                <div className={styles.counters}>
                    {counter("followers", profile.followersCount)}
                    {counter("following", profile.followingCount)}
                </div>
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
            <FollowListsDialog
                userId={profile.id}
                kind={list}
                onKindChange={setList}
                onClose={() => setList(null)}
            />
        </section>
    );
};
