import "@/shared/config/i18n";
import { BrowserRouter } from "react-router-dom";
import { Layout } from "./layout/layout";
import { AppProviders } from "./providers/app-providers";
import "./styles/index.scss";

function App() {
    return (
        <AppProviders>
            <BrowserRouter>
                <Layout />
            </BrowserRouter>
        </AppProviders>
    );
}

export default App;
