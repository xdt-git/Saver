import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createQueryClient } from "@/shared/config/query";
import { ThemeProvider } from "@/shared/config/theme";

// One client for the whole app lifetime: it holds the request cache.
const queryClient = createQueryClient();

/** Global providers: server-state cache and theme. Router is added in App. */
export const AppProviders = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
);
