import { useState } from "react";
import { LandingHero } from "@/widgets/landing-hero";
import { PlatformPreview } from "@/widgets/platform-preview";
import { DEFAULT_PLATFORM, type PlatformId } from "@/shared/config/platforms";
import styles from "./landing-main.module.scss";

export const LandingMain = () => {
    // Shared by the switcher (left) and the preview (right).
    const [platform, setPlatform] = useState<PlatformId>(DEFAULT_PLATFORM);

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <LandingHero selectedPlatform={platform} onSelectPlatform={setPlatform} />
                <PlatformPreview platform={platform} />
            </div>
        </main>
    );
};
