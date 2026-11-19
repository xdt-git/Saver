import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/** Renders a component inside a router that starts at the given path. */
export const renderWithRouter = (ui: ReactElement, path = "/") =>
    render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
