import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeActivity, type ActivityComment } from "@/entities/activity";
import { sessionTestOptions, TEST_USER } from "@/entities/session";
import { mockApi, renderWithProviders } from "@/shared/config/tests";
import { ActivitySocial } from "./activity-social";

afterEach(() => vi.unstubAllGlobals());

const comment = (id: number, text: string): ActivityComment => ({
    id,
    activityId: 1,
    text,
    createdAt: new Date().toISOString(),
    user: { id: 3, username: "smith", displayName: "Smith", avatarUrl: null },
});

const activity = makeActivity({
    social: {
        likes: 2,
        liked: false,
        comments: 3,
        latestComments: [comment(2, "Second"), comment(3, "Third")],
    },
});

describe("ActivitySocial", () => {
    it("shows the two newest comments and opens the whole thread with a form", async () => {
        const api = mockApi({
            "GET /api/activity/:id/comments": () => ({
                body: {
                    items: [comment(1, "First"), comment(2, "Second"), comment(3, "Third")],
                    nextCursor: null,
                },
            }),
            "POST /api/activity/:id/comments": ({ body }) => ({
                status: 201,
                body: comment(4, (body as { text: string }).text),
            }),
        });
        renderWithProviders(
            <ActivitySocial activity={activity} />,
            "/",
            sessionTestOptions(TEST_USER),
        );

        expect(screen.getByText("Second")).toBeInTheDocument();
        expect(screen.queryByText("First")).toBeNull();

        await userEvent.click(
            screen.getByRole("button", { name: "Подробнее · все 3 комментария" }),
        );
        expect(await screen.findByText("First")).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText("Ваш комментарий"), "  Nice  ");
        await userEvent.click(screen.getByRole("button", { name: "Отправить" }));
        await vi.waitFor(() =>
            expect(api.calls("POST /api/activity/:id/comments")[0]?.body).toEqual({ text: "Nice" }),
        );
    });

    it("likes with the heart", async () => {
        const api = mockApi({
            "PUT /api/activity/:id/like": () => ({ body: { likes: 3, liked: true } }),
        });
        renderWithProviders(
            <ActivitySocial activity={activity} />,
            "/",
            sessionTestOptions(TEST_USER),
        );

        const heart = screen.getByRole("button", { name: "Нравится" });
        expect(heart).toHaveAttribute("aria-pressed", "false");
        await userEvent.click(heart);
        await vi.waitFor(() => expect(api.calls("PUT /api/activity/:id/like")).toHaveLength(1));
    });

    it("sends guests to sign in instead of liking and hides the form", async () => {
        const api = mockApi({
            "GET /api/activity/:id/comments": () => ({ body: { items: [], nextCursor: null } }),
        });
        renderWithProviders(<ActivitySocial activity={activity} />, "/", sessionTestOptions(null));

        await userEvent.click(screen.getByRole("button", { name: "Нравится" }));
        expect(api.calls("PUT /api/activity/:id/like")).toHaveLength(0);
        await userEvent.click(
            screen.getByRole("button", { name: "Подробнее · все 3 комментария" }),
        );
        expect(await screen.findByText("Войдите, чтобы комментировать.")).toBeInTheDocument();
    });
});
