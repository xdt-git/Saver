import { screen } from "@testing-library/react";
import { sessionKeys, sessionTestOptions } from "@/entities/session";
import { renderWithProviders } from "@/shared/config/tests";
import { LoginForm } from "./login-form";

const withGoogle = (google: string | null) => {
    const base = sessionTestOptions(null);
    return {
        ...base,
        setup: (queryClient: Parameters<NonNullable<typeof base.setup>>[0]) => {
            base.setup?.(queryClient);
            queryClient.setQueryData(sessionKeys.providers(), { google });
        },
    };
};

describe("GoogleSignIn", () => {
    it("offers Google under the form when the API has a client id", () => {
        renderWithProviders(<LoginForm />, "/", withGoogle("id.apps.googleusercontent.com"));
        expect(screen.getByText("или")).toBeInTheDocument();
        expect(
            document.querySelector('script[src="https://accounts.google.com/gsi/client"]'),
        ).not.toBeNull();
    });

    it("stays hidden without it", () => {
        renderWithProviders(<LoginForm />, "/", withGoogle(null));
        expect(screen.queryByText("или")).not.toBeInTheDocument();
    });
});
