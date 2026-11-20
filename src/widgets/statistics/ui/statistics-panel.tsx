import { useTranslation } from "react-i18next";
import { MdInsights, MdLock } from "react-icons/md";
import { Link } from "react-router-dom";
import { useContentLabels, type ContentItem } from "@/entities/content";
import { useStatistics, type Statistics } from "@/entities/statistics";
import { isApiError } from "@/shared/api";
import { CONTENT_TYPES } from "@/shared/config/content";
import { contentPath } from "@/shared/config/routes";
import { BarList, ColumnChart, StatTile } from "@/shared/ui/charts";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import styles from "./statistics.module.scss";

type Stats = Statistics<ContentItem>;

/** "2026-11" → short and full month names in the current language (UTC, like the API). */
const monthNames = (month: string, language: string) => {
    const date = new Date(`${month}-01T00:00:00Z`);
    const format = (options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(language, { timeZone: "UTC", ...options }).format(date);
    return {
        short: format({ month: "short" }),
        full: format({ month: "long", year: "numeric" }),
    };
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {children}
    </section>
);

const Summary = ({ stats }: { stats: Stats }) => {
    const { t } = useTranslation();
    const hours = Math.floor(stats.watchTime.minutes / 60);
    const minutes = stats.watchTime.minutes % 60;
    const missing = stats.watchTime.itemsWithoutDuration;

    return (
        <div className={styles.tiles}>
            <StatTile
                label={t("stats.completed")}
                value={String(stats.completed.total)}
                note={t("stats.inLibrary", { count: stats.library.total })}
            />
            <StatTile
                label={t("stats.watchTime")}
                value={t("stats.duration", { hours, minutes })}
                // Real durations only: say what is not counted instead of guessing.
                note={missing > 0 ? t("stats.withoutDuration", { count: missing }) : undefined}
            />
            <StatTile
                label={t("stats.averageRating")}
                value={
                    stats.ratings.average === null ? "—" : `★ ${stats.ratings.average.toFixed(1)}`
                }
                note={t("stats.ratingsCount", { count: stats.ratings.count })}
            />
            <StatTile
                label={t("stats.activity")}
                value={String(stats.activity.last7Days)}
                note={t("stats.activity30", { count: stats.activity.last30Days })}
            />
        </div>
    );
};

const Charts = ({ stats }: { stats: Stats }) => {
    const { t, i18n } = useTranslation();
    const labels = useContentLabels();

    const byType = CONTENT_TYPES.map((type) => ({
        key: type,
        label: labels.type(type),
        value: stats.completed.byType[type],
    }))
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value);

    return (
        <div className={styles.charts}>
            <Section title={t("stats.byMonth")}>
                <ColumnChart
                    label={t("stats.byMonth")}
                    valueHeader={t("stats.completed")}
                    tableLabel={t("stats.asTable")}
                    formatValue={(value) => t("stats.completedValue", { count: value })}
                    items={stats.monthly.map(({ month, completed }) => {
                        const names = monthNames(month, i18n.language);
                        return {
                            key: month,
                            label: names.short,
                            fullLabel: names.full,
                            value: completed,
                        };
                    })}
                />
            </Section>
            {byType.length > 0 && (
                <Section title={t("stats.byCategory")}>
                    <BarList label={t("stats.byCategory")} items={byType} />
                </Section>
            )}
            {stats.favoriteGenres.length > 0 && (
                <Section title={t("stats.byGenre")}>
                    <BarList
                        label={t("stats.byGenre")}
                        items={stats.favoriteGenres.map((genre) => ({
                            key: genre.slug,
                            label: labels.genre(genre),
                            value: genre.count,
                        }))}
                    />
                </Section>
            )}
            {stats.topContent.length > 0 && (
                <Section title={t("stats.top")}>
                    <ol className={styles.top}>
                        {stats.topContent.map(({ value, content }) => (
                            <li key={content.id} className={styles.topRow}>
                                <Link to={contentPath(content.id)} className={styles.topTitle}>
                                    {content.title}
                                </Link>
                                <span className={styles.topValue}>★ {value}</span>
                            </li>
                        ))}
                    </ol>
                </Section>
            )}
        </div>
    );
};

/** Profile statistics: headline numbers, then charts. Private profiles: owner only. */
export const StatisticsPanel = ({ userId }: { userId: number }) => {
    const { t } = useTranslation();
    const stats = useStatistics<ContentItem>(userId);

    if (stats.isPending) {
        return (
            <div className={styles.tiles} aria-busy="true">
                <Skeleton variant="image" count={4} className={styles.tileSkeleton} />
            </div>
        );
    }
    if (stats.isError) {
        if (isApiError(stats.error) && stats.error.code === "FORBIDDEN") {
            return <EmptyState icon={<MdLock />} title={t("profile.privateTitle")} />;
        }
        return <ErrorState onRetry={() => void stats.refetch()} />;
    }
    if (stats.data.library.total === 0) {
        return (
            <EmptyState
                icon={<MdInsights />}
                title={t("stats.emptyTitle")}
                description={t("stats.emptyText")}
            />
        );
    }

    return (
        <div className={styles.panel}>
            <Summary stats={stats.data} />
            <Charts stats={stats.data} />
        </div>
    );
};
