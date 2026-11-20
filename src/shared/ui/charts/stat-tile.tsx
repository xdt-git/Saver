import styles from "./charts.module.scss";

export interface StatTileProps {
    /** Sentence case, no trailing colon. */
    label: string;
    value: string;
    /** A short note under the value, e.g. what is not counted. */
    note?: string;
}

/** One headline number: label, value, optional note. Not a chart: a single value needs no plot. */
export const StatTile = ({ label, value, note }: StatTileProps) => (
    <div className={styles.tile}>
        <span className={styles.tileLabel}>{label}</span>
        <span className={styles.tileValue}>{value}</span>
        {note && <span className={styles.tileNote}>{note}</span>}
    </div>
);
