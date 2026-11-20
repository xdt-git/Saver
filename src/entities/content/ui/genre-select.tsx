import { useTranslation } from "react-i18next";
import { Select } from "@/shared/ui/select";
import { useContentLabels } from "../lib/labels";
import { useGenres } from "../model/queries";

interface GenreSelectProps {
    value: string | undefined;
    onChange: (slug: string | undefined) => void;
    fieldClassName?: string;
}

/** "Any genre" or one genre from the API, with translated names. */
export const GenreSelect = ({ value, onChange, fieldClassName }: GenreSelectProps) => {
    const { t } = useTranslation();
    const labels = useContentLabels();
    const genres = useGenres();

    return (
        <Select
            fieldClassName={fieldClassName}
            label={t("discover.genre")}
            placeholder={t("discover.anyGenre")}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value || undefined)}
            options={(genres.data ?? []).map((genre) => ({
                value: genre.slug,
                label: labels.genre(genre),
            }))}
        />
    );
};
