import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@/shared/config/theme";

/** Renders a component with the app providers (theme, router starting at `path`). */
export const renderWithProviders = (ui: ReactElement, path = "/") =>
    render(
        <ThemeProvider>
            <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
        </ThemeProvider>,
    );
