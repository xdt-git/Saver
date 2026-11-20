import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuthProvider } from "@/entities/session";
import { createQueryClient } from "@/shared/config/query";
import { ThemeProvider } from "@/shared/config/theme";
import { ToastProvider } from "@/shared/ui/toast";

// One client for the whole app lifetime: it holds the request cache.
const queryClient = createQueryClient();

/** Global providers: server-state cache, theme, toasts and the session. Router is added in App. */
export const AppProviders = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <ToastProvider>
                <AuthProvider>{children}</AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    </QueryClientProvider>
);
