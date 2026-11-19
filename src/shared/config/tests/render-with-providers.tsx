import type { ReactElement } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createQueryClient } from "@/shared/config/query";
import { ThemeProvider } from "@/shared/config/theme";

/**
 * Renders a component with the app providers: a fresh query cache per call (no retries,
 * so failed requests settle at once), theme, and a router starting at `path`.
 */
export const renderWithProviders = (ui: ReactElement, path = "/") => {
    const queryClient = createQueryClient();
    queryClient.setDefaultOptions({ queries: { retry: false }, mutations: { retry: false } });

    return {
        queryClient,
        ...render(
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
                </ThemeProvider>
            </QueryClientProvider>,
        ),
    };
};
