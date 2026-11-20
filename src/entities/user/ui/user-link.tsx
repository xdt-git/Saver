import { Link } from "react-router-dom";
import { profilePath } from "@/shared/config/routes";
import { cn } from "@/shared/lib";
import { Avatar } from "@/shared/ui/avatar";
import { displayNameOf, type UserSummary } from "../model/types";
import styles from "./user-link.module.scss";

interface UserLinkProps {
    user: UserSummary;
    /** Hide the @username line (compact rows in the feed). */
    compact?: boolean;
    onNavigate?: () => void;
    className?: string;
}

/** Avatar, name and @username, linking to the profile. */
export const UserLink = ({ user, compact = false, onNavigate, className }: UserLinkProps) => (
    <Link to={profilePath(user.id)} className={cn(styles.link, className)} onClick={onNavigate}>
        <Avatar name={displayNameOf(user)} src={user.avatarUrl} />
        <span className={styles.names}>
            <span className={styles.name}>{displayNameOf(user)}</span>
            {!compact && <span className={styles.handle}>@{user.username}</span>}
        </span>
    </Link>
);
