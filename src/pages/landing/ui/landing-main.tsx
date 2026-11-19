import { LandingHero } from "@/widgets/landing-hero";
import { PlatformPreview } from "@/widgets/platform-preview";
import { Footer } from "@/widgets/footer";
import "./landing-main.scss";

export const LandingMain = () => {
    return (
        <>
            <main className="main">
                <div className="container">
                    <LandingHero />
                    <PlatformPreview />
                </div>
            </main>
            <footer>
                <Footer />
            </footer>
        </>
    );
};
