import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/shared/config/tests";
import type { Activity } from "../api/activity-api";
import { ActivityItem } from "./activity-item";

const event = (overrides: Partial<Activity>): Activity => ({
    id: 1,
    type: "status_changed",
    payload: { from: "planned", to: "watching" },
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    user: { id: 2, username: "trinity", displayName: null, avatarUrl: null },
    content: { id: 1, title: "Dark", type: "series", posterUrl: null },
    ...overrides,
});

describe("ActivityItem", () => {
    it("describes a status change with both statuses and a relative time", () => {
        renderWithProviders(<ActivityItem activity={event({})} author={<span>trinity</span>} />);
        expect(screen.getByText(/меняет статус: В планах → Смотрю/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Dark" })).toHaveAttribute("href", "/content/1");
        expect(screen.getByText("3 часа назад")).toBeInTheDocument();
    });

    it("still reads well when the item was deleted", () => {
        renderWithProviders(
            <ActivityItem
                activity={event({ type: "rated", payload: { value: 7 }, content: null })}
                author={<span>trinity</span>}
            />,
        );
        expect(screen.getByText("ставит оценку 7")).toBeInTheDocument();
        expect(screen.queryByRole("link")).toBeNull();
    });
});
