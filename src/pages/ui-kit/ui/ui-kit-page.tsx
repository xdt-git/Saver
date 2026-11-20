import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { MdMovieFilter } from "react-icons/md";
import { ApiError } from "@/shared/api";
import telegramImg from "@/shared/assets/telegram.webp";
import { Button } from "@/shared/ui/button";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { Loader } from "@/shared/ui/loader";
import { Modal } from "@/shared/ui/modal";
import { Select } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Text } from "@/shared/ui/text";
import { useToast } from "@/shared/ui/toast";
import styles from "./ui-kit-page.module.scss";

// Section titles are component names, so they are not translated.
const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className={styles.section}>
        <Text as="h2" glow className={styles.sectionTitle}>
            {title}
        </Text>
        <div className={styles.row}>{children}</div>
    </section>
);

/** Development-only showcase of every shared UI component and its states. */
export const UiKitPage = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [isModalOpen, setModalOpen] = useState(false);
    const [retries, setRetries] = useState(0);

    const genreOptions = [
        { value: "drama", label: t("uiKit.genres.drama") },
        { value: "comedy", label: t("uiKit.genres.comedy") },
        { value: "sci-fi", label: t("uiKit.genres.sciFi") },
    ];

    return (
        <main className={styles.page}>
            <Text as="h1" glow>
                {t("uiKit.title")}
            </Text>

            <Section title="Button">
                <Button>{t("uiKit.start")}</Button>
                <Button size="md">{t("common.save")}</Button>
                <Button variant="secondary">{t("common.cancel")}</Button>
                <Button size="md" disabled>
                    {t("uiKit.disabled")}
                </Button>
                <Button variant="icon" aria-label="Telegram">
                    <img src={telegramImg} alt="" width={64} height={64} />
                </Button>
                <Button to="/ui-kit" variant="nav">
                    {t("uiKit.navLink")}
                </Button>
            </Section>

            <Section title="Input">
                <Input label="Email" type="email" placeholder="you@example.com" />
                <Input label="Username" hint={t("uiKit.usernameHint")} defaultValue="saver" />
                <Input
                    label={t("uiKit.password")}
                    type="password"
                    error={t("uiKit.passwordError")}
                    defaultValue="123"
                />
                <Input label={t("uiKit.disabled")} disabled defaultValue={t("uiKit.readOnly")} />
            </Section>

            <Section title="Select">
                <Select
                    label={t("uiKit.genre")}
                    placeholder={t("uiKit.genrePlaceholder")}
                    options={genreOptions}
                />
                <Select
                    label={t("uiKit.genre")}
                    options={genreOptions}
                    error={t("uiKit.genreError")}
                    defaultValue="drama"
                />
            </Section>

            <Section title="Modal">
                <Button size="md" onClick={() => setModalOpen(true)}>
                    {t("uiKit.openModal")}
                </Button>
                <Modal
                    open={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    title={t("uiKit.modalTitle")}
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setModalOpen(false)}>
                                {t("common.cancel")}
                            </Button>
                            <Button size="md" onClick={() => setModalOpen(false)}>
                                {t("common.delete")}
                            </Button>
                        </>
                    }
                >
                    <Text as="p">{t("uiKit.modalText")}</Text>
                </Modal>
            </Section>

            <Section title="Loader">
                <Loader size="sm" />
                <Loader />
                <Loader size="lg" />
            </Section>

            <Section title="Skeleton">
                <div className={styles.skeletonCard}>
                    <Skeleton variant="image" />
                    <Skeleton variant="title" />
                    <Skeleton count={3} />
                    <Skeleton variant="button" />
                </div>
                <Skeleton variant="avatar" />
            </Section>

            <Section title="EmptyState / ErrorState">
                <div className={styles.panel}>
                    <EmptyState
                        icon={<MdMovieFilter />}
                        title={t("uiKit.emptyTitle")}
                        description={t("uiKit.emptyText")}
                        action={<Button size="md">{t("uiKit.findFilm")}</Button>}
                    />
                </div>
                <div className={styles.panel}>
                    <ErrorState
                        description={t("uiKit.errorText", { count: retries })}
                        onRetry={() => setRetries((n) => n + 1)}
                    />
                </div>
            </Section>

            <Section title="Toast">
                <Button size="md" onClick={() => toast.success(t("toast.messages.success"))}>
                    {t("toast.messages.success")}
                </Button>
                <Button size="md" onClick={() => toast.error(t("toast.messages.error"))}>
                    {t("toast.messages.error")}
                </Button>
                <Button size="md" onClick={() => toast.warning(t("toast.messages.warning"))}>
                    {t("toast.messages.warning")}
                </Button>
                <Button size="md" onClick={() => toast.info(t("toast.messages.info"))}>
                    {t("toast.messages.info")}
                </Button>
                <Button
                    size="md"
                    onClick={() =>
                        toast.apiError(new ApiError({ status: 0, code: "NETWORK_ERROR" }))
                    }
                >
                    {t("uiKit.apiErrorToast")}
                </Button>
                <Button
                    variant="secondary"
                    onClick={() =>
                        toast.info(t("uiKit.undoToast"), {
                            label: t("uiKit.undo"),
                            onClick: () => toast.success(t("toast.messages.success")),
                        })
                    }
                >
                    {t("uiKit.withAction")}
                </Button>
            </Section>
        </main>
    );
};
