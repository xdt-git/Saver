import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./modal";

const renderModal = (props: Partial<Parameters<typeof Modal>[0]> = {}) => {
    const onClose = vi.fn();
    render(
        <Modal open onClose={onClose} title="Delete entry?" {...props}>
            <p>Body text</p>
        </Modal>,
    );
    return { onClose };
};

describe("Modal", () => {
    it("renders nothing when closed", () => {
        renderModal({ open: false });
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("renders an accessible dialog named by its title and focuses it", () => {
        renderModal();
        const dialog = screen.getByRole("dialog", { name: "Delete entry?" });
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(dialog).toHaveFocus();
        expect(screen.getByText("Body text")).toBeInTheDocument();
    });

    it("closes on Escape, on the close button and on a click outside", async () => {
        const { onClose } = renderModal();
        await userEvent.keyboard("{Escape}");
        await userEvent.click(screen.getByRole("button", { name: "Закрыть" }));
        await userEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);
        expect(onClose).toHaveBeenCalledTimes(3);
    });

    it("does not close on a click inside the dialog", async () => {
        const { onClose } = renderModal();
        await userEvent.click(screen.getByText("Body text"));
        expect(onClose).not.toHaveBeenCalled();
    });

    it("locks page scroll while open and restores it after closing", () => {
        const onClose = vi.fn();
        const { rerender } = render(
            <Modal open onClose={onClose} title="T">
                x
            </Modal>,
        );
        expect(document.body.style.overflow).toBe("hidden");
        rerender(
            <Modal open={false} onClose={onClose} title="T">
                x
            </Modal>,
        );
        expect(document.body.style.overflow).toBe("");
    });

    it("renders footer actions", () => {
        renderModal({ footer: <button>Confirm</button> });
        expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    });
});
