import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState, ErrorState } from "./empty-state";
import { Loader } from "./loader";
import { Skeleton } from "./skeleton";

describe("Loader", () => {
    it("announces loading to screen readers in the chosen size", () => {
        render(<Loader size="lg" label="Loading films" />);
        const loader = screen.getByRole("status", { name: "Loading films" });
        expect(loader).toHaveClass("loader", "lg");
    });
});

describe("Skeleton", () => {
    it("renders the requested number of hidden placeholders", () => {
        render(<Skeleton variant="title" count={3} />);
        const items = screen.getAllByTestId("skeleton");
        expect(items).toHaveLength(3);
        items.forEach((item) => {
            expect(item).toHaveAttribute("aria-hidden", "true");
            expect(item).toHaveClass("title");
        });
    });
});

describe("EmptyState", () => {
    it("shows title, description and action", () => {
        render(
            <EmptyState
                title="Library is empty"
                description="Add your first film"
                action={<button>Find a film</button>}
            />,
        );
        expect(screen.getByRole("heading", { name: "Library is empty" })).toBeInTheDocument();
        expect(screen.getByText("Add your first film")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Find a film" })).toBeInTheDocument();
        expect(screen.queryByRole("alert")).toBeNull();
    });
});

describe("ErrorState", () => {
    it("is announced as an alert with a default title", () => {
        render(<ErrorState />);
        expect(screen.getByRole("alert")).toHaveTextContent("Что-то пошло не так");
        expect(screen.queryByRole("button")).toBeNull();
    });

    it("calls onRetry from the retry button", async () => {
        const onRetry = vi.fn();
        render(<ErrorState onRetry={onRetry} retryLabel="Retry" />);
        await userEvent.click(screen.getByRole("button", { name: "Retry" }));
        expect(onRetry).toHaveBeenCalledTimes(1);
    });
});
