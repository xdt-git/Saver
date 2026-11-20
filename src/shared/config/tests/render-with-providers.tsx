import type { ReactElement } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createQueryClient } from "@/shared/config/query";
import { ThemeProvider } from "@/shared/config/theme";
import { ToastProvider } from "@/shared/ui/toast";

/**
 * Renders a component with the same providers as the app: a fresh query cache per call
 * (no retries, so failed requests settle at once), theme, toasts and a router at `path`.
 */
export const renderWithProviders = (ui: ReactElement, path = "/") => {
    const queryClient = createQueryClient();
    queryClient.setDefaultOptions({ queries: { retry: false }, mutations: { retry: false } });

    return {
        queryClient,
        ...render(
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <ToastProvider>
                        <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
                    </ToastProvider>
                </ThemeProvider>
            </QueryClientProvider>,
        ),
    };
};
