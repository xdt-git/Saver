import "@/shared/config/i18n";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/shared/config/theme";
import { Layout } from "./layout/layout";
import "./styles/index.scss";

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
