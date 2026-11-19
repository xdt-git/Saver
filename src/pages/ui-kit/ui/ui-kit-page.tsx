import { useState, type ReactNode } from "react";
import { MdMovieFilter } from "react-icons/md";
import telegramImg from "@/shared/assets/telegram.webp";
import { Button } from "@/shared/ui/button";
import { EmptyState, ErrorState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { Loader } from "@/shared/ui/loader";
import { Modal } from "@/shared/ui/modal";
import { Select } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Text } from "@/shared/ui/text";
import styles from "./ui-kit-page.module.scss";

const genreOptions = [
    { value: "drama", label: "Драма" },
    { value: "comedy", label: "Комедия" },
    { value: "sci-fi", label: "Фантастика" },
];

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
    const [isModalOpen, setModalOpen] = useState(false);
    const [retries, setRetries] = useState(0);

    return (
        <main className={styles.page}>
            <Text as="h1" glow>
                UI kit
            </Text>

            <Section title="Button">
                <Button>Начать</Button>
                <Button size="md">Сохранить</Button>
                <Button variant="secondary">Отмена</Button>
                <Button size="md" disabled>
                    Недоступно
                </Button>
                <Button variant="icon" aria-label="Telegram">
                    <img src={telegramImg} alt="" width={64} height={64} />
                </Button>
                <Button to="/ui-kit" variant="nav">
                    Ссылка-навигация
                </Button>
            </Section>

            <Section title="Input">
                <Input label="Email" type="email" placeholder="you@example.com" />
                <Input label="Username" hint="От 3 до 20 символов" defaultValue="saver" />
                <Input
                    label="Пароль"
                    type="password"
                    error="Минимум 8 символов"
                    defaultValue="123"
                />
                <Input label="Недоступно" disabled defaultValue="Только чтение" />
            </Section>

            <Section title="Select">
                <Select label="Жанр" placeholder="Выберите жанр" options={genreOptions} />
                <Select
                    label="Жанр"
                    options={genreOptions}
                    error="Выберите хотя бы один жанр"
                    defaultValue="drama"
                />
            </Section>

            <Section title="Modal">
                <Button size="md" onClick={() => setModalOpen(true)}>
                    Открыть модалку
                </Button>
                <Modal
                    open={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    title="Удалить запись?"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setModalOpen(false)}>
                                Отмена
                            </Button>
                            <Button size="md" onClick={() => setModalOpen(false)}>
                                Удалить
                            </Button>
                        </>
                    }
                >
                    <Text as="p">«Интерстеллар» будет удалён из вашей библиотеки.</Text>
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
                        title="Библиотека пуста"
                        description="Добавьте первый фильм, чтобы начать."
                        action={<Button size="md">Найти фильм</Button>}
                    />
                </div>
                <div className={styles.panel}>
                    <ErrorState
                        description={`Не удалось загрузить данные. Попыток: ${retries}`}
                        onRetry={() => setRetries((n) => n + 1)}
                    />
                </div>
            </Section>
        </main>
    );
};
