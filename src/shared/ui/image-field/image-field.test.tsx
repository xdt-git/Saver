import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { ApiError } from "@/shared/api";
import { renderWithProviders } from "@/shared/config/tests";
import { ImageField } from "./image-field";

const UPLOADED = "/api/uploads/avatars/0123456789abcdef0123456789abcdef.webp";

const Harness = ({ onUpload }: { onUpload: (file: File) => Promise<{ url: string }> }) => {
    const [value, setValue] = useState("");
    return (
        <>
            <ImageField
                label="Аватар"
                shape="avatar"
                value={value}
                onChange={setValue}
                onUpload={onUpload}
            />
            <output data-testid="value">{value}</output>
        </>
    );
};

const file = (type: string, bytes = 10) => new File([new Uint8Array(bytes)], "pic", { type });
const choose = (picked: File) =>
    fireEvent.change(screen.getByLabelText("Выбрать картинку"), { target: { files: [picked] } });

describe("ImageField", () => {
    it("uploads the chosen file and shows its preview", async () => {
        const onUpload = vi.fn(async () => ({ url: UPLOADED }));
        renderWithProviders(<Harness onUpload={onUpload} />);
        expect(screen.getByText("Нет картинки")).toBeInTheDocument();

        const picked = file("image/png");
        choose(picked);
        await vi.waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent(UPLOADED));
        expect(onUpload).toHaveBeenCalledWith(picked);
        expect(screen.getByRole("img", { name: "Предпросмотр картинки" })).toHaveAttribute(
            "src",
            UPLOADED,
        );

        await userEvent.click(screen.getByRole("button", { name: "Убрать" }));
        expect(screen.getByTestId("value")).toHaveTextContent("");
    });

    it("checks type and size before sending", () => {
        const onUpload = vi.fn(async () => ({ url: UPLOADED }));
        renderWithProviders(<Harness onUpload={onUpload} />);

        choose(file("image/svg+xml"));
        expect(screen.getByText("Подойдут JPEG, PNG или WebP")).toBeInTheDocument();
        choose(file("image/jpeg", 5 * 1024 * 1024 + 1));
        expect(screen.getByText("Файл больше 5 МБ")).toBeInTheDocument();
        expect(onUpload).not.toHaveBeenCalled();
    });

    it("explains a file the server refused, and keeps the link input", async () => {
        const onUpload = vi.fn(async () => {
            throw new ApiError({
                status: 422,
                code: "VALIDATION_ERROR",
                fields: { file: "The file is not the image it claims to be" },
            });
        });
        renderWithProviders(<Harness onUpload={onUpload} />);

        choose(file("image/png"));
        expect(
            await screen.findByText(
                "Этот файл не подходит: нужна настоящая картинка JPEG, PNG или WebP",
            ),
        ).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText("Аватар"), "https://img.test/a.png");
        expect(screen.getByTestId("value")).toHaveTextContent("https://img.test/a.png");
    });
});
