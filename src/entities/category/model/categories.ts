import blueAnime from "@/shared/assets/blue_anime.webp";
import blueFilm from "@/shared/assets/blue_film.webp";
import blueGame from "@/shared/assets/blue_game.webp";
import blueMult from "@/shared/assets/blue_mult.webp";
import blueSeries from "@/shared/assets/blue_series.webp";
import pinkAnime from "@/shared/assets/pink_anime.webp";
import pinkFilm from "@/shared/assets/pink_film.webp";
import pinkGame from "@/shared/assets/pink_game.webp";
import pinkMult from "@/shared/assets/pink_mult.webp";
import pinkSeries from "@/shared/assets/pink_series.webp";
import type { Category } from "./types";

// TODO: temporary static list until categories come from the API.
export const CATEGORIES: Category[] = [
    { id: "film", imgBlue: blueFilm, imgPink: pinkFilm },
    { id: "series", imgBlue: blueSeries, imgPink: pinkSeries },
    { id: "anime", imgBlue: blueAnime, imgPink: pinkAnime },
    { id: "cartoon", imgBlue: blueMult, imgPink: pinkMult },
    { id: "game", imgBlue: blueGame, imgPink: pinkGame },
];
