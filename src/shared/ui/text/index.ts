import styles from "./text.module.scss";

export { Text } from "./text";
export type { TextProps, TextTag } from "./text";

/** Glow class for elements that are not <Text> but must glow as a whole (e.g. a nav link with its underline). */
export const glowClassName = styles.glow;
