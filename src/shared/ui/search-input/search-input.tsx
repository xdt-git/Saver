import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/shared/lib";
import { Input, type InputProps } from "../input";

export interface SearchInputProps extends Omit<InputProps, "value" | "onChange" | "type"> {
    /** Current search text from the outside (e.g. the URL). */
    value: string;
    /** Called once typing has stopped, with the new text. */
    onSearch: (value: string) => void;
    /** Delay in ms; defaults to the shared debounce delay. */
    delay?: number;
}

/**
 * Search box that answers at once on screen but reports the text only after typing stops,
 * so a request is not sent on every key. Follows outside changes (reset, back button).
 */
export const SearchInput = ({ value, onSearch, delay, ...rest }: SearchInputProps) => {
    const [text, setText] = useState(value);
    const debounced = useDebouncedValue(text, delay);
    // Latest props without re-running the effect below on every render.
    const latest = useRef({ value, onSearch });
    latest.current = { value, onSearch };

    useEffect(() => setText(value), [value]);
    useEffect(() => {
        if (debounced !== latest.current.value) latest.current.onSearch(debounced);
    }, [debounced]);

    return (
        <Input
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            {...rest}
        />
    );
};
