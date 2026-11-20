import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeContent } from "@/entities/content";
import { sessionTestOptions, TEST_USER } from "@/entities/session";
import { apiFailure, mockApi, renderWithProviders } from "@/shared/config/tests";
import { AddContentButton } from "./add-content-button";

afterEach(() => vi.unstubAllGlobals());

const GENRES = [
    { slug: "mystery", name: "Mystery" },
    { slug: "sci-fi", name: "Science Fiction" },
];

const open = async () => {
    await userEvent.click(screen.getByRole("button", { name: "Добавить вручную" }));
    return screen.getByRole("dialog", { name: "Новая запись" });
};

describe("AddContentButton", () => {
    it("creates the item and puts it into the library with the chosen status", async () => {
        const api = mockApi({
            "GET /api/genres": () => ({ body: GENRES }),
            "POST /api/content": ({ body }) => ({
                status: 201,
                body: makeContent({ id: 42, ...(body as object) }),
            }),
            "POST /api/library": () => ({ status: 201, body: { id: 7, status: "watching" } }),
        });
        renderWithProviders(
            <AddContentButton defaultStatus="watching" />,
            "/",
            sessionTestOptions(TEST_USER),
        );
        const dialog = await open();

        await userEvent.selectOptions(within(dialog).getByLabelText("Тип"), "series");
        expect(within(dialog).queryByLabelText("Длительность, мин")).toBeNull();
        await userEvent.type(within(dialog).getByLabelText("Название"), " Dark ");
        await userEvent.type(within(dialog).getByLabelText("Серий"), "26");
        await userEvent.type(within(dialog).getByLabelText("Минут в серии"), "55");
        await userEvent.click(await within(dialog).findByRole("button", { name: "Детектив" }));
        expect(within(dialog).getByRole("button", { name: "Смотрю" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        await userEvent.click(
            within(dialog).getByRole("button", { name: "Добавить в библиотеку" }),
        );

        await vi.waitFor(() => expect(api.calls("POST /api/library")).toHaveLength(1));
        expect(api.calls("POST /api/content")[0]?.body).toMatchObject({
            type: "series",
            title: "Dark",
            episodeCount: 26,
            episodeRuntimeMinutes: 55,
            runtimeMinutes: null,
            genres: ["mystery"],
        });
        expect(api.calls("POST /api/library")[0]?.body).toEqual({
            contentId: 42,
            status: "watching",
        });
        expect(await screen.findByText("«Dark» добавлено в библиотеку")).toBeInTheDocument();
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("validates before sending and shows API field errors", async () => {
        const api = mockApi({
            "GET /api/genres": () => ({ body: GENRES }),
            "POST /api/content": () => ({
                ...apiFailure(422, "VALIDATION_ERROR"),
                body: {
                    success: false,
                    message: "Validation failed",
                    error: { code: "VALIDATION_ERROR", fields: { title: "Too long" } },
                },
            }),
        });
        renderWithProviders(<AddContentButton />, "/", sessionTestOptions(TEST_USER));
        const dialog = await open();

        await userEvent.click(
            within(dialog).getByRole("button", { name: "Добавить в библиотеку" }),
        );
        expect(within(dialog).getByText("Обязательное поле")).toBeInTheDocument();
        expect(api.calls("POST /api/content")).toHaveLength(0);

        await userEvent.type(within(dialog).getByLabelText("Название"), "Dune");
        await userEvent.type(within(dialog).getByLabelText("Ссылка на постер"), "not a link");
        expect(within(dialog).getByText(/Ссылка должна начинаться/)).toBeInTheDocument();
        await userEvent.clear(within(dialog).getByLabelText("Ссылка на постер"));

        await userEvent.click(
            within(dialog).getByRole("button", { name: "Добавить в библиотеку" }),
        );
        expect(await within(dialog).findByText("Проверьте это поле")).toBeInTheDocument();
    });
});
