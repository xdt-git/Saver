import { Header } from "@/widgets/header";
import { LandingPage } from "@/pages/landing";
import { LibraryPage } from "@/pages/library";
import { NotFoundPage } from "@/pages/not-found";
import { Route, Routes } from "react-router-dom";

export const Layout = () => {
    return (
        <>
            <Header />

            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/Save" element={<LibraryPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    );
};
