import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdPersonSearch } from "react-icons/md";
import { FollowButton } from "@/features/follow-user";
import { useSession } from "@/entities/session";
import { UserLink, useUserSearch } from "@/entities/user";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { filterFieldClassNames as fields } from "@/shared/ui/listing";
import { Loader } from "@/shared/ui/loader";
import { SearchInput } from "@/shared/ui/search-input";
import styles from "./people-search.module.scss";

/** Find people by name or @username and follow them right from the list. */
export const PeopleSearch = () => {
    const { t } = useTranslation();
    const { user } = useSession();
    const [query, setQuery] = useState("");
    const search = useUserSearch(query);

    const results = () => {
        if (!query.trim()) return null;
        if (search.isPending) return <Loader />;
        if (search.isError) return <ErrorState onRetry={() => void search.refetch()} />;
        if (search.data.length === 0) {
            return <EmptyState icon={<MdPersonSearch />} title={t("news.nobody")} />;
        }
        return (
            <ul className={styles.list} aria-busy={search.isFetching}>
                {search.data.map((person) => (
                    <li key={person.id} className={styles.row}>
                        <UserLink user={person} className={styles.person} />
                        <span className={styles.followers}>
                            {t("news.followers", { count: person.followersCount })}
                        </span>
                        {person.id !== user?.id && <FollowButton profile={person} />}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <section className={styles.panel} aria-labelledby="people-search-title">
            <h2 id="people-search-title" className={styles.heading}>
                {t("news.peopleTitle")}
            </h2>
            <SearchInput
                fieldClassName={fields.search}
                label={t("news.peopleSearch")}
                placeholder={t("news.peoplePlaceholder")}
                value={query}
                onSearch={setQuery}
            />
            {results()}
        </section>
    );
};
