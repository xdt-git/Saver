import { useTranslation } from "react-i18next";
import { CenteredPage } from "@/shared/ui/centered-page";
import { Text } from "@/shared/ui/text";

export const NotFoundPage = () => {
    const { t } = useTranslation();

    return (
        <CenteredPage>
            <Text as="h1" glow>
                {t("notFound.title")}
            </Text>
        </CenteredPage>
    );
};
