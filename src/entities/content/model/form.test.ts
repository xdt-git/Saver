import { makeContent } from "../testing";
import { toContentPayload, toFormValues, validateContentForm } from "./form";

describe("content form", () => {
    it("starts empty or from an item", () => {
        expect(toFormValues()).toMatchObject({ type: "film", title: "", genres: [] });
        expect(toFormValues(makeContent())).toMatchObject({
            title: "Dune",
            releaseYear: "2021",
            runtimeMinutes: "155",
            genres: ["sci-fi"],
        });
    });

    it("checks the same rules as the API", () => {
        const values = {
            ...toFormValues(),
            type: "anime" as const,
            title: " ",
            releaseYear: "1500",
            posterUrl: "ftp://x",
            runtimeMinutes: "0",
            episodeCount: "2.5",
            genres: Array.from({ length: 11 }, (_, i) => `g${i}`),
        };
        expect(validateContentForm(values)).toEqual({
            title: "required",
            releaseYear: "year",
            posterUrl: "url",
            runtimeMinutes: "positive",
            episodeCount: "positive",
            genres: "tooMany",
        });
    });

    it("ignores duration fields that do not apply to the type", () => {
        const values = {
            ...toFormValues(),
            title: "Dark",
            type: "series" as const,
            runtimeMinutes: "-1",
        };
        expect(validateContentForm(values)).toEqual({});
    });

    it("builds a trimmed payload with real durations only", () => {
        const payload = toContentPayload({
            ...toFormValues(),
            type: "series",
            title: "  Dark ",
            releaseYear: "2017",
            runtimeMinutes: "55",
            episodeCount: "26",
            episodeRuntimeMinutes: "55",
            description: "  ",
        });
        expect(payload).toEqual({
            type: "series",
            title: "Dark",
            originalTitle: null,
            releaseYear: 2017,
            description: null,
            posterUrl: null,
            runtimeMinutes: null,
            episodeCount: 26,
            episodeRuntimeMinutes: 55,
            genres: [],
        });
    });
});
