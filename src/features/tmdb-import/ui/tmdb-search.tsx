import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ContentPoster, useContentLabels } from "@/entities/content";
import { useSession } from "@/entities/session";
import { isApiError } from "@/shared/api";
import { contentPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { filterFieldClassNames as fields } from "@/shared/ui/listing";
import { Loader } from "@/shared/ui/loader";
import { Pagination } from "@/shared/ui/pagination";
import { SearchInput } from "@/shared/ui/search-input";
import { useToast } from "@/shared/ui/toast";
import { useTmdbImport, useTmdbSearch, useTmdbStatus, type TmdbResult } from "../api/tmdb-api";
import styles from "./tmdb-search.module.scss";

interface TmdbSearchProps {
    /** The catalog search text: TMDB is searched with it until the user types another. */
    initialQuery: string;
}

/**
 * "Not here? Find it in TMDB": searches TMDB through our API and imports the chosen
 * item into the catalog, then opens it. Hidden for guests and when TMDB is not configured.
 */
export const TmdbSearch = ({ initialQuery }: TmdbSearchProps) => {
    const { t, i18n } = useTranslation();
    const labels = useContentLabels();
    const toast = useToast();
    const navigate = useNavigate();
    const { status } = useSession();
    const tmdbStatus = useTmdbStatus();
    const [query, setQuery] = useState(initialQuery);
    const [page, setPage] = useState(1);
    useEffect(() => setQuery(initialQuery), [initialQuery]);
    useEffect(() => setPage(1), [query]);

    const available = status === "authenticated" && tmdbStatus.data?.enabled === true;
    const search = useTmdbSearch(
        query,
        i18n.language.startsWith("en") ? "en" : "ru",
        page,
        available,
    );
    const importer = useTmdbImport();

    if (!available) return null;

    const open = (hit: TmdbResult) => {
        if (hit.contentId !== null) {
            navigate(contentPath(hit.contentId));
            return;
        }
        importer.mutate(hit, {
            onSuccess: (item) => {
                toast.success(t("tmdb.imported", { title: item.title }));
                navigate(contentPath(item.id));
            },
            onError: (error) => toast.apiError(error),
        });
    };

    const results = () => {
        if (!query.trim()) return <p className={styles.hint}>{t("tmdb.hint")}</p>;
        if (search.isPending) return <Loader />;
        if (search.isError) {
            const down = isApiError(search.error) && search.error.code === "SERVICE_UNAVAILABLE";
            return down ? (
                <EmptyState title={t("tmdb.unavailable")} />
            ) : (
                <ErrorState onRetry={() => void search.refetch()} />
            );
        }
        if (search.data.items.length === 0) return <EmptyState title={t("tmdb.nothing")} />;
        return (
            <>
                <ul className={styles.list}>
                    {search.data.items.map((hit) => (
                        <li key={`${hit.mediaType}:${hit.tmdbId}`} className={styles.row}>
                            <ContentPoster item={hit} className={styles.poster} />
                            <div className={styles.info}>
                                <span className={styles.title}>{hit.title}</span>
                                <span className={styles.meta}>
                                    {[labels.type(hit.type), hit.releaseYear, hit.originalTitle]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </span>
                                {hit.overview && (
                                    <span className={styles.overview}>{hit.overview}</span>
                                )}
                            </div>
                            <Button
                                size="md"
                                variant={hit.contentId === null ? "primary" : "secondary"}
                                disabled={importer.isPending}
                                onClick={() => open(hit)}
                                aria-label={
                                    hit.contentId === null
                                        ? t("tmdb.addLabel", { title: hit.title })
                                        : t("tmdb.openLabel", { title: hit.title })
                                }
                            >
                                {hit.contentId === null ? t("tmdb.add") : t("tmdb.open")}
                            </Button>
                        </li>
                    ))}
                </ul>
                <Pagination
                    page={search.data.page}
                    totalPages={search.data.totalPages}
                    onChange={setPage}
                    disabled={search.isFetching}
                />
            </>
        );
    };

    return (
        <section className={styles.panel} aria-labelledby="tmdb-title">
            <h2 id="tmdb-title" className={styles.heading}>
                {t("tmdb.title")}
            </h2>
            <SearchInput
                fieldClassName={fields.search}
                label={t("tmdb.search")}
                placeholder={t("discover.searchPlaceholder")}
                value={query}
                onSearch={setQuery}
            />
            {results()}
            <p className={styles.attribution}>{t("tmdb.attribution")}</p>
        </section>
    );
};
