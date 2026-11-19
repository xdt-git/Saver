import blueFilm from "@/shared/assets/blue_film.webp";
import blueSeries from "@/shared/assets/blue_series.webp";
import blueAnime from "@/shared/assets/blue_anime.webp";
import blueMult from "@/shared/assets/blue_mult.webp";
import blueGame from "@/shared/assets/blue_game.webp";
import pinkFilm from "@/shared/assets/pink_film.webp";
import pinkSeries from "@/shared/assets/pink_series.webp";
import pinkAnime from "@/shared/assets/pink_anime.webp";
import pinkMult from "@/shared/assets/pink_mult.webp";
import pinkGame from "@/shared/assets/pink_game.webp";
import { CategoryCard } from "@/entities/category";
import "@/shared/styles/global.scss";

export const CategoryItems = () => {
    // TODO
    // this is a temporary imitation of the database
    const dataBase = {
        film: {
            imgBlue: blueFilm,
            imgPink: pinkFilm,
            altBlue: "Blue Img for Film",
            altPink: "Pink Img for Film",
            description:
                "Сохрани любимые фильмы и возвращайся к ним, когда захочешь! Все твои впечатления — в одном месте.",
        },
        Series: {
            imgBlue: blueSeries,
            imgPink: pinkSeries,
            altBlue: "Blue Img for Series",
            altPink: "Pink Img for Series",
            description:
                "Залипли на сериал? Сохраняйте его в вашей коллекции и возвращайтесь за новыми впечатлениями!",
        },
        Anime: {
            imgBlue: blueAnime,
            imgPink: pinkAnime,
            altBlue: "Blue Img for Anime",
            altPink: "Pink Img for Anime",
            description:
                "Наслаждаетесь аниме? Сохраняйте в коллекцию и исследуйте новые горизонты!",
        },
        Cartoon: {
            imgBlue: blueMult,
            imgPink: pinkMult,
            altBlue: "Blue Img for Cartoon",
            altPink: "Pink Img for Cartoon",
            description:
                "Сохраняйте любимые мультфильмы и создавайте свою уникальную коллекцию!",
        },
        Game: {
            imgBlue: blueGame,
            imgPink: pinkGame,
            altBlue: "Blue Img for Game",
            altPink: "Pink Img for Game",
            description:
                "Сохраняйте свои любимые игры и получайте максимум удовольствия!",
        },
    };

    return (
        <section className="column">
            {Object.keys(dataBase).map((key) => (
                <CategoryCard
                    key={key}
                    imgBlue={dataBase[key].imgBlue}
                    // imgPink={dataBase[key].imgPink}
                    altBlue={dataBase[key].altBlue}
                    // altPink={dataBase[key].altPink}
                    description={dataBase[key].description}
                />
            ))}
        </section>
    );
};
