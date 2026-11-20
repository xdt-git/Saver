import { Fragment, type ComponentType, type ReactElement, type ReactNode } from "react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createQueryClient } from "@/shared/config/query";
import { ThemeProvider } from "@/shared/config/theme";
import { ToastProvider } from "@/shared/ui/toast";

export interface RenderOptions {
    /**
     * Extra provider from a higher layer (e.g. the session's AuthProvider), placed inside
     * the toasts and around the router. Shared code cannot import it directly (FSD).
     */
    wrapper?: ComponentType<{ children: ReactNode }>;
    /** Runs before rendering, e.g. to seed the query cache. */
    setup?: (queryClient: QueryClient) => void;
}

/**
 * Renders a component with the same providers as the app: a fresh query cache per call
 * (no retries, so failed requests settle at once), theme, toasts and a router at `path`.
 */
export const renderWithProviders = (
    ui: ReactElement,
    path = "/",
    { wrapper: Wrapper = Fragment, setup }: RenderOptions = {},
) => {
    const queryClient = createQueryClient();
    queryClient.setDefaultOptions({ queries: { retry: false }, mutations: { retry: false } });
    setup?.(queryClient);

    return {
        queryClient,
        ...render(
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <ToastProvider>
                        <Wrapper>
                            <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
                        </Wrapper>
                    </ToastProvider>
                </ThemeProvider>
            </QueryClientProvider>,
        ),
    };
};
