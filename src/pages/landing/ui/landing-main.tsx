import { LandingHero } from "@/widgets/landing-hero";
import { PlatformPreview } from "@/widgets/platform-preview";
import { Footer } from "@/widgets/footer";
import styles from "./landing-main.module.scss";

export const LandingMain = () => {
    return (
        <>
            <main className={styles.main}>
                <div className={styles.container}>
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
