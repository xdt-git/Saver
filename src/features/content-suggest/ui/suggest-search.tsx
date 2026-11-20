import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    ContentPoster,
    useContentLabels,
    useContentSuggest,
    useTmdbImport,
    type ContentItem,
    type TmdbResult,
} from "@/entities/content";
import { currentLanguage } from "@/shared/config/i18n";
import { contentPath } from "@/shared/config/routes";
import { cn, useDebouncedValue } from "@/shared/lib";
import { SearchInput, type SearchInputProps } from "@/shared/ui/search-input";
import { useToast } from "@/shared/ui/toast";
import styles from "./suggest-search.module.scss";

/** Suggestions answer faster than the catalog search below them. */
const SUGGEST_DELAY_MS = 200;

type Option =
    | { kind: "local"; key: string; item: Omit<ContentItem, "viewer"> }
    | { kind: "external"; key: string; hit: TmdbResult };

type SuggestSearchProps = Omit<SearchInputProps, "onTextChange">;

/** Arrow keys walk the options and back to the text itself (-1). */
const step = (current: number, by: number, count: number) =>
    ((current + 1 + by + count + 1) % (count + 1)) - 1;

/**
 * The catalog search box with suggestions while typing (typing "naru" suggests "Naruto"): our titles,
 * and TMDB titles to import when we have few. Arrows move, Enter opens, Escape closes;
 * the typed text still filters the catalog as usual.
 */
export const SuggestSearch = ({ value, onSearch, fieldClassName, ...rest }: SuggestSearchProps) => {
    const { t } = useTranslation();
    const labels = useContentLabels();
    const navigate = useNavigate();
    const toast = useToast();
    const importer = useTmdbImport();
    const listId = useId();
    const [text, setText] = useState(value);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const query = useDebouncedValue(text, SUGGEST_DELAY_MS);
    const language = currentLanguage();
    const { data } = useContentSuggest(query, language);

    useEffect(() => setText(value), [value]);
    useEffect(() => setActive(-1), [data]);

    const options: Option[] = text.trim()
        ? [
              ...(data?.items ?? []).map(
                  (item): Option => ({ kind: "local", key: `c${item.id}`, item }),
              ),
              ...(data?.external ?? []).map(
                  (hit): Option => ({
                      kind: "external",
                      key: `t${hit.mediaType}${hit.tmdbId}`,
                      hit,
                  }),
              ),
          ]
        : [];
    const expanded = open && options.length > 0;
    const activeOption = expanded && active < options.length ? active : -1;
    const optionId = (index: number) => `${listId}-${index}`;

    const pick = (option: Option) => {
        setOpen(false);
        if (option.kind === "local") {
            navigate(contentPath(option.item.id));
            return;
        }
        importer.mutate(option.hit, {
            onSuccess: (item) => {
                toast.success(t("tmdb.imported", { title: item.title }));
                navigate(contentPath(item.id));
            },
            onError: (error) => toast.apiError(error),
        });
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        const arrow = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
        if (event.key === "Escape") {
            setOpen(false);
        } else if (arrow !== 0) {
            event.preventDefault();
            if (expanded) setActive((current) => step(current, arrow, options.length));
            else setOpen(true);
        } else if (event.key === "Enter" && activeOption >= 0) {
            event.preventDefault();
            pick(options[activeOption] as Option);
        }
    };

    return (
        // The layout class goes on the wrapper: it is the item of the filter row.
        <div className={cn(styles.combo, fieldClassName)}>
            <SearchInput
                {...rest}
                fieldClassName={styles.field}
                value={value}
                onSearch={onSearch}
                onTextChange={(next) => {
                    setText(next);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={onKeyDown}
                role="combobox"
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={expanded}
                aria-controls={listId}
                aria-activedescendant={activeOption >= 0 ? optionId(activeOption) : undefined}
            />
            {expanded && (
                <ul
                    id={listId}
                    role="listbox"
                    className={styles.list}
                    aria-label={t("suggest.label")}
                >
                    {options.map((option, index) => {
                        const entry = option.kind === "local" ? option.item : option.hit;
                        const imdb =
                            option.kind === "local"
                                ? (option.item.externalRatings.imdb?.rating ?? null)
                                : null;
                        const meta = [
                            labels.type(entry.type),
                            entry.releaseYear,
                            option.kind === "external" && t("suggest.fromTmdb"),
                        ]
                            .filter(Boolean)
                            .join(" · ");
                        return (
                            <li
                                key={option.key}
                                id={optionId(index)}
                                role="option"
                                aria-selected={index === activeOption}
                                className={styles.option}
                                // Keeps focus in the input, so blur does not close the list first.
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => pick(option)}
                                onMouseEnter={() => setActive(index)}
                            >
                                <ContentPoster item={entry} className={styles.poster} />
                                <span className={styles.text}>
                                    <span className={styles.title}>{entry.title}</span>
                                    <span className={styles.meta}>{meta}</span>
                                </span>
                                {imdb !== null && (
                                    <span className={styles.score}>IMDb ★ {imdb.toFixed(1)}</span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};
